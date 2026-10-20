import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCINSubmission } from '../services/validationService.js';
import { parseCINFrontText, parseCINBackText, assessImageQuality } from '../services/ocrService.js';
import { connectDB, closeDB } from '../config/db.js';
import CitizenProfile from '../models/CitizenProfile.js';
import User from '../models/User.js';

test('CIN OCR & Validation Engine Suite', async (t) => {
  await connectDB();

  await t.test('1. Rejection when one or both images are missing', async () => {
    const result = await validateCINSubmission({
      frontProvided: true,
      backProvided: false,
      frontQuality: { isQualitySufficient: true },
      backQuality: { isQualitySufficient: false }
    });

    assert.equal(result.success, false);
    assert.equal(result.outcome, 'Rejected: Missing Image');
    assert.equal(result.code, 'MISSING_IMAGE');
  });

  await t.test('2. Rejection when front image is poor quality or blurry', async () => {
    const result = await validateCINSubmission({
      frontProvided: true,
      backProvided: true,
      frontQuality: { isQualitySufficient: false, reason: 'Image trop sombre' },
      backQuality: { isQualitySufficient: true }
    });

    assert.equal(result.success, false);
    assert.equal(result.outcome, 'Rejected: Poor Quality');
    assert.equal(result.code, 'POOR_QUALITY_FRONT');
  });

  await t.test('3. Rejection when extraction is incomplete', async () => {
    const result = await validateCINSubmission({
      frontProvided: true,
      backProvided: true,
      frontQuality: { isQualitySufficient: true },
      backQuality: { isQualitySufficient: true },
      frontFields: { cin: 'BK123456', lastName: 'El Amrani' }, // missing firstName & dateOfBirth
      backFields: { address: 'Casablanca' }
    });

    assert.equal(result.success, false);
    assert.equal(result.outcome, 'Rejected: Incomplete Extraction');
    assert.ok(result.missingFields.includes('Prénom'));
  });

  await t.test('4. Rejection when CIN format is invalid according to Moroccan standards', async () => {
    const result = await validateCINSubmission({
      frontProvided: true,
      backProvided: true,
      frontQuality: { isQualitySufficient: true },
      backQuality: { isQualitySufficient: true },
      frontFields: {
        cin: '1234567890INVALID', // Invalid Moroccan format
        lastName: 'Benali',
        firstName: 'Karim',
        dateOfBirth: '10/05/1990'
      },
      backFields: {
        address: '10 Rue de Fes, Rabat',
        validUntil: '12/10/2030'
      }
    });

    assert.equal(result.success, false);
    assert.equal(result.outcome, 'Rejected: Invalid Information');
    assert.equal(result.code, 'INVALID_CIN_FORMAT');
  });

  await t.test('5. Rejection when CIN already exists in Citizen Registry (Duplicate CIN)', async () => {
    // Ensure test citizen exists with valid Moroccan CIN format
    const duplicateCIN = 'BK999999';
    await CitizenProfile.deleteMany({ cin: duplicateCIN });
    const dummyUser = await User.create({
      email: `dup.test.${Date.now()}@mo9ata3a.ma`,
      password: 'password123',
      fullName: 'Existing Citizen'
    });

    await CitizenProfile.create({
      user: dummyUser._id,
      cin: duplicateCIN,
      firstName: 'Existing',
      lastName: 'Citizen',
      dateOfBirth: '01/01/1990',
      address: 'Rabat',
      validUntil: '01/01/2030',
      cinFrontImage: '/uploads/cin/test.png',
      cinBackImage: '/uploads/cin/test.png'
    });

    const result = await validateCINSubmission({
      frontProvided: true,
      backProvided: true,
      frontQuality: { isQualitySufficient: true },
      backQuality: { isQualitySufficient: true },
      frontFields: {
        cin: duplicateCIN,
        lastName: 'Nouvel',
        firstName: 'Arrivant',
        dateOfBirth: '01/01/1992'
      },
      backFields: {
        address: 'Casablanca',
        validUntil: '01/01/2032'
      }
    });

    assert.equal(result.success, false);
    assert.equal(result.outcome, 'Rejected: Duplicate CIN');
    assert.equal(result.code, 'DUPLICATE_CIN');
  });

  await t.test('6. Acceptance when all required checks and Moroccan rules succeed', async () => {
    const validUniqueCIN = 'CD' + Math.floor(100000 + Math.random() * 899999);
    const result = await validateCINSubmission({
      frontProvided: true,
      backProvided: true,
      frontQuality: { isQualitySufficient: true, metrics: { sharpnessScore: 8 } },
      backQuality: { isQualitySufficient: true, metrics: { sharpnessScore: 8 } },
      frontFields: {
        cin: validUniqueCIN,
        lastName: 'ALAMI',
        firstName: 'Nabil',
        arabicFullName: 'نبيل العلمي',
        dateOfBirth: '18/09/1996',
        placeOfBirth: 'Tanger',
        gender: 'M',
        nationality: 'Marocaine'
      },
      backFields: {
        address: '42 Boulevard Mohammed VI, Tanger',
        validUntil: '20/12/2034',
        matchingCIN: validUniqueCIN
      },
      frontConfidence: 94,
      backConfidence: 91
    });

    assert.equal(result.success, true);
    assert.equal(result.outcome, 'Accepted');
    assert.equal(result.code, 'ACCEPTED');
    assert.equal(result.consolidatedData.cin, validUniqueCIN);
    assert.equal(result.consolidatedData.lastName, 'ALAMI');
  });

  await closeDB();
});
