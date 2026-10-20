import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Creates an in-app notification for a user
 */
export async function createNotification({
  recipientId,
  title,
  message,
  type = 'system',
  requestId = null,
  requestReference = null
}) {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      relatedRequest: requestId,
      relatedRequestReference: requestReference
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
  }
}

/**
 * Notifies all administrative staff (Admins and Managers)
 */
export async function notifyStaff({
  title,
  message,
  type = 'system',
  requestId = null,
  requestReference = null
}) {
  try {
    const staffMembers = await User.find({
      role: { $in: ['admin', 'manager'] },
      isActive: true
    }).select('_id');

    const notifications = staffMembers.map(staff => ({
      recipient: staff._id,
      title,
      message,
      type,
      relatedRequest: requestId,
      relatedRequestReference: requestReference
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('[NotificationService] Error notifying staff:', error.message);
  }
}
