const { notificationService } = require('../services/NotificationService');
const { 
  asyncHandler, 
  AuthorizationError,
  NotFoundError 
} = require('../utils/errorHandler');

// Get all notifications for the current user
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  console.log(`🔍 Fetching notifications for User ID: ${userId}`);
  
  const notifications = await notificationService.getNotifications(userId);
  const unreadCount = await notificationService.getUnreadCount(userId);

  console.log(`📊 Found ${notifications.length} notifications, ${unreadCount} unread for User ID: ${userId}`);

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      totalCount: notifications.length
    }
  });
});

// Mark a specific notification as read
exports.markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  try {
    const notification = await notificationService.markAsRead(parseInt(notificationId));
    
    // Verify the notification belongs to the user
    if (notification.userId !== userId) {
      throw new AuthorizationError('You can only mark your own notifications as read');
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    if (error.message === 'Notification not found') {
      throw new NotFoundError('Notification not found');
    }
    throw error;
  }
});

// Mark all notifications as read for the current user
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const notifications = await notificationService.markAllAsRead(userId);

  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: { 
      notifications,
      count: notifications.length
    }
  });
});

// Get unread notification count
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  console.log(`🔍 Fetching unread count for User ID: ${userId}`);

  const unreadCount = await notificationService.getUnreadCount(userId);

  console.log(`📊 Unread count for User ID ${userId}: ${unreadCount}`);

  res.json({
    success: true,
    data: { unreadCount }
  });
});

// Clear all notifications for the current user (useful for testing)
exports.clearNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await notificationService.clearNotifications(userId);

  res.json({
    success: true,
    message: 'All notifications cleared'
  });
}); 