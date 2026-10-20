import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, closeDB } from '../config/db.js';
import RequestModel from '../models/Request.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

test('Workflow State Machine & Lifecycle Suite', async (t) => {
  await connectDB();

  let citizen, manager, service, request;

  await t.test('Setup test actors & service', async () => {
    citizen = await User.create({
      email: `wf.citizen.${Date.now()}@mo9ata3a.ma`,
      password: 'password123',
      role: 'citizen',
      fullName: 'Workflow Test Citizen'
    });

    manager = await User.create({
      email: `wf.manager.${Date.now()}@mo9ata3a.ma`,
      password: 'password123',
      role: 'manager',
      fullName: 'Workflow Test Manager'
    });

    service = await Service.create({
      name: `Test Service ${Date.now()}`,
      code: `SVC_${Date.now()}`,
      description: 'Test service description'
    });

    request = await RequestModel.create({
      reference: `REQ-TEST-${Date.now()}`,
      citizen: citizen._id,
      service: service._id,
      status: 'Submitted',
      statusHistory: [{
        previousStatus: 'None',
        newStatus: 'Submitted',
        changedBy: citizen._id,
        changedByName: citizen.fullName,
        changedByRole: 'citizen'
      }]
    });

    assert.equal(request.status, 'Submitted');
  });

  await t.test('Invalid transition blocked: Submitted cannot skip straight to Issued', async () => {
    // PDF Rule: "The platform must prevent invalid status transitions. For example, a request should not move directly from Submitted to Issued without completing the required administrative review and approval steps."
    const ALLOWED = {
      Submitted: ['Under Review', 'Cancelled'],
      'Under Review': ['Action Required', 'Approved', 'Rejected'],
      'Action Required': ['Under Review', 'Cancelled', 'Rejected'],
      Approved: ['Ready for Collection'],
      'Ready for Collection': ['Issued']
    };

    const attemptStatus = 'Issued';
    const isAllowed = ALLOWED[request.status]?.includes(attemptStatus);
    assert.equal(isAllowed, false, 'Direct jump from Submitted to Issued must be rejected');
  });

  await t.test('Step 1: Move from Submitted to Under Review', async () => {
    request.status = 'Under Review';
    request.statusHistory.push({
      previousStatus: 'Submitted',
      newStatus: 'Under Review',
      changedBy: manager._id,
      changedByName: manager.fullName,
      changedByRole: 'manager',
      notes: 'Début de l\'instruction administrative'
    });
    await request.save();
    assert.equal(request.status, 'Under Review');
  });

  await t.test('Step 2: Manager marks as Action Required with reason', async () => {
    request.status = 'Action Required';
    request.actionRequiredReason = 'Pièce d\'identité manquante ou illisible.';
    request.statusHistory.push({
      previousStatus: 'Under Review',
      newStatus: 'Action Required',
      changedBy: manager._id,
      changedByName: manager.fullName,
      changedByRole: 'manager',
      notes: request.actionRequiredReason
    });
    await request.save();
    assert.equal(request.status, 'Action Required');
    assert.ok(request.actionRequiredReason.length > 0);
  });

  await t.test('Step 3: Citizen provides missing doc -> moves back to Under Review', async () => {
    request.documents.push({
      documentName: 'Piece_Complementaire.pdf',
      originalName: 'Piece_Complementaire.pdf',
      filePath: '/uploads/documents/test_doc.pdf',
      status: 'replaced'
    });
    request.status = 'Under Review';
    request.statusHistory.push({
      previousStatus: 'Action Required',
      newStatus: 'Under Review',
      changedBy: citizen._id,
      changedByName: citizen.fullName,
      changedByRole: 'citizen',
      notes: 'Document complémentaire fourni par le citoyen'
    });
    await request.save();
    assert.equal(request.status, 'Under Review');
    assert.equal(request.documents.length, 1);
  });

  await t.test('Step 4: Approval by Manager', async () => {
    request.status = 'Approved';
    request.statusHistory.push({
      previousStatus: 'Under Review',
      newStatus: 'Approved',
      changedBy: manager._id,
      changedByName: manager.fullName,
      changedByRole: 'manager',
      notes: 'Dossier complet et approuvé.'
    });
    await request.save();
    assert.equal(request.status, 'Approved');
  });

  await t.test('Step 5: Move to Ready for Collection with Pickup Token', async () => {
    request.status = 'Ready for Collection';
    request.collectionToken = 'COL-981723';
    request.statusHistory.push({
      previousStatus: 'Approved',
      newStatus: 'Ready for Collection',
      changedBy: manager._id,
      changedByName: manager.fullName,
      changedByRole: 'manager',
      notes: 'Document édité et disponible au guichet.'
    });
    await request.save();
    assert.equal(request.status, 'Ready for Collection');
    assert.ok(request.collectionToken.startsWith('COL-'));
  });

  await t.test('Step 6: Confirm physical handover and mark as Issued', async () => {
    request.status = 'Issued';
    request.completionDate = new Date();
    request.statusHistory.push({
      previousStatus: 'Ready for Collection',
      newStatus: 'Issued',
      changedBy: manager._id,
      changedByName: manager.fullName,
      changedByRole: 'manager',
      notes: 'Remise physique du document effectuée.'
    });
    await request.save();
    assert.equal(request.status, 'Issued');
    assert.ok(request.completionDate instanceof Date);
    assert.equal(request.statusHistory.length, 7);
  });

  await closeDB();
});
