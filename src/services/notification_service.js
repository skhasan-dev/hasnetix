import { Notification, Device } from '../models/index.js';
import { sendPushNotification } from '../utils/push_notification.js';
import { AppError } from '../utils/app_error.js';

// ─── Send Notification ───────────────────────────────────────────────────────

export async function sendNotificationService({
  userIds,
  title,
  subtitle = '',
  body,
  type,
}) {

  if (
    !Array.isArray(userIds) ||
    userIds.length === 0
  ) {

    throw new AppError(
      400,
      'userIds must be a non-empty array.'
    );
  }

  if (!title?.trim()) {

    throw new AppError(
      400,
      'title is required.'
    );
  }

  if (!type?.trim()) {

    throw new AppError(
      400,
      'type is required.'
    );
  }

  if (!body) {

    throw new AppError(
      400,
      'body is required.'
    );
  }

  //
  // GET USER DEVICES
  //

  const devices =
    await Device.find({
      userId: {
        $in: userIds,
      },
    });

  //
  // EXTRACT TOKENS
  //

  const fcmTokens =
    devices
      .map((device) => device.fcmToken)
      .filter(Boolean);

  //
  // STORE NOTIFICATIONS
  //

  const notifications =
    userIds.map((userId) => ({
      userId,
      title,
      subtitle,
      body,
      type,
    }));

  await Notification.insertMany(
    notifications
  );

  //
  // SEND PUSH
  //

  if (fcmTokens.length) {

    sendPushNotification({
      fcmTokens,

      notification: {
        title,
        body:
          typeof body === 'string'
            ? body
            : JSON.stringify(body),
      },

      data: {
        title,
        subtitle,
        type,
        body: JSON.stringify(body),
      },
    }).catch((e) =>
      console.error(
        '[FCM] notification error:',
        e
      )
    );
  }

  return {
    message:
      'Notification sent successfully.',
  };
}

// ─── Get User Notifications ──────────────────────────────────────────────────

export async function getUserNotificationsService({
  userId,
  page = 1,
  limit = 20,
}) {

  if (!userId) {

    throw new AppError(
      400,
      'userId is required.'
    );
  }

  //
  // SANITIZE PAGINATION
  //

  const currentPage =
    Math.max(Number(page), 1);

  const currentLimit =
    Math.max(Number(limit), 1);

  const skip =
    (currentPage - 1) *
    currentLimit;

  //
  // GET TOTAL COUNT
  //

  const totalNotifications =
    await Notification.countDocuments({
      userId,
    });

  //
  // GET PAGINATED DATA
  //

  const notifications =
    await Notification.find({
      userId,
    })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(currentLimit);

  //
  // PAGINATION META
  //

  const totalPages =
    Math.ceil(
      totalNotifications /
      currentLimit
    );

  return {
    notifications,

    pagination: {
      total:
        totalNotifications,

      page:
        currentPage,

      limit:
        currentLimit,

      totalPages,

      hasNextPage:
        currentPage < totalPages,

      hasPreviousPage:
        currentPage > 1,
    },
  };
}

// ─── Mark As Read ─────────────────────────────────────────────────────────────

export async function markNotificationAsReadService(
  notificationId
) {

  const notification =
    await Notification.findById(
      notificationId
    );

  if (!notification) {

    throw new AppError(
      404,
      'Notification not found.'
    );
  }

  notification.isRead = true;

  await notification.save();

  return notification;
}

// ─── Mark All As Read ────────────────────────────────────────────────────────

export async function markAllNotificationsAsReadService(
  userId
) {

  if (!userId) {

    throw new AppError(
      400,
      'userId is required.'
    );
  }

  await Notification.updateMany(
    {
      userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    }
  );

  return {
    message:
      'All notifications marked as read.',
  };
}

// ─── Delete Notification ─────────────────────────────────────────────────────

export async function deleteNotificationService(
  notificationId
) {

  const notification =
    await Notification.findById(
      notificationId
    );

  if (!notification) {

    throw new AppError(
      404,
      'Notification not found.'
    );
  }

  await notification.deleteOne();

  return {
    message:
      'Notification deleted successfully.',
  };
}