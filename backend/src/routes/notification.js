const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  clearNotifications
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(authenticate());

// Get all notifications for the current user
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark a specific notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Clear all notifications (useful for testing)
router.delete('/clear', clearNotifications);

module.exports = router; 