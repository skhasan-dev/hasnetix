import { Router } from 'express';

import {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../controllers/notification_controller.js';

import { optionalAuth } from '../../middlewares/optional_auth_middleware.js';

const notificationRouter = Router();

// Send notification
notificationRouter.post(
  '/send',
  sendNotification
);

// Get paginated user notifications
notificationRouter.get(
  '/user/:userId',
  getUserNotifications
);

// Mark single notification as read
notificationRouter.patch(
  '/read/:notificationId',
  markNotificationAsRead
);

// Mark all notifications as read
notificationRouter.patch(
  '/read-all/:userId',
  markAllNotificationsAsRead
);

// Delete notification
notificationRouter.delete(
  '/:notificationId',
  deleteNotification
);

export default notificationRouter;