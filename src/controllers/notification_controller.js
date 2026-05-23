import {
  sendNotificationService,
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
} from '../services/notification_service.js';

import { AppError } from '../utils/app_error.js';

// ─── Send Notification ───────────────────────────────────────────────────────

export async function sendNotification(
  req,
  res,
  next
) {

  try {

    const {
      userIds,
      title,
      subtitle,
      body,
      type,
    } = req.body;

    if (
      !Array.isArray(userIds) ||
      !userIds.length
    ) {

      return res.status(400).json({
        success: false,
        error:
          'userIds must be a non-empty array.',
      });
    }

    if (!title) {

      return res.status(400).json({
        success: false,
        error:
          'title is required.',
      });
    }

    if (!body) {

      return res.status(400).json({
        success: false,
        error:
          'body is required.',
      });
    }

    if (!type) {

      return res.status(400).json({
        success: false,
        error:
          'type is required.',
      });
    }

    const result =
      await sendNotificationService({
        userIds,
        title,
        subtitle,
        body,
        type,
      });

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    next(err);
  }
}

// ─── Get User Notifications ──────────────────────────────────────────────────

export async function getUserNotifications(
  req,
  res,
  next
) {

  try {

    const { userId } =
      req.params;

    const {
      page,
      limit,
    } = req.query;

    if (!userId) {

      throw new AppError(
        400,
        'userId is required.'
      );
    }

    const notifications =
      await getUserNotificationsService({
        userId,
        page,
        limit,
      });

    res.status(200).json({
      success: true,
      data: notifications,
    });

  } catch (err) {

    next(err);
  }
}

// ─── Mark Notification As Read ───────────────────────────────────────────────

export async function markNotificationAsRead(
  req,
  res,
  next
) {

  try {

    const {
      notificationId,
    } = req.params;

    if (!notificationId) {

      throw new AppError(
        400,
        'notificationId is required.'
      );
    }

    const notification =
      await markNotificationAsReadService(
        notificationId
      );

    res.status(200).json({
      success: true,
      data: notification,
    });

  } catch (err) {

    next(err);
  }
}

// ─── Mark All Notifications As Read ─────────────────────────────────────────

export async function markAllNotificationsAsRead(
  req,
  res,
  next
) {

  try {

    const { userId } =
      req.params;

    if (!userId) {

      throw new AppError(
        400,
        'userId is required.'
      );
    }

    const result =
      await markAllNotificationsAsReadService(
        userId
      );

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    next(err);
  }
}

// ─── Delete Notification ─────────────────────────────────────────────────────

export async function deleteNotification(
  req,
  res,
  next
) {

  try {

    const {
      notificationId,
    } = req.params;

    if (!notificationId) {

      throw new AppError(
        400,
        'notificationId is required.'
      );
    }

    const result =
      await deleteNotificationService(
        notificationId
      );

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    next(err);
  }
}