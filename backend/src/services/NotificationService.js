// NotificationService Interface
class NotificationService {
  async sendNotification(userId, message, type, data = {}) {
    throw new Error('sendNotification method must be implemented');
  }

  async getNotifications(userId) {
    throw new Error('getNotifications method must be implemented');
  }

  async markAsRead(notificationId) {
    throw new Error('markAsRead method must be implemented');
  }

  async markAllAsRead(userId) {
    throw new Error('markAllAsRead method must be implemented');
  }
}

// Mock Implementation with Logging
class MockNotificationService extends NotificationService {
  constructor() {
    super();
    this.notifications = new Map(); // userId -> notifications[]
    this.notificationId = 1;
  }

  async sendNotification(userId, message, type, data = {}) {
    const notification = {
      id: this.notificationId++,
      userId,
      message,
      type,
      data,
      isRead: false,
      createdAt: new Date(),
      timestamp: Date.now()
    };

    // Store notification
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId).unshift(notification);

    // Log the notification (in real implementation, this would be a push notification)
    console.log('🔔 NOTIFICATION SENT:', {
      userId,
      message,
      type,
      timestamp: new Date().toISOString(),
      data
    });

    // In a real implementation, you would:
    // 1. Send push notification to user's device
    // 2. Send email notification
    // 3. Send SMS notification
    // 4. Store in database for persistence

    return notification;
  }

  async getNotifications(userId) {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  async markAsRead(notificationId) {
    for (const [userId, notifications] of this.notifications.entries()) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        console.log('✅ NOTIFICATION MARKED AS READ:', {
          notificationId,
          userId,
          message: notification.message
        });
        return notification;
      }
    }
    throw new Error('Notification not found');
  }

  async markAllAsRead(userId) {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach(notification => {
      notification.isRead = true;
    });
    
    console.log('✅ ALL NOTIFICATIONS MARKED AS READ:', {
      userId,
      count: userNotifications.length
    });
    
    return userNotifications;
  }

  async getUnreadCount(userId) {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(n => !n.isRead).length;
  }

  // Clear notifications (useful for testing)
  async clearNotifications(userId) {
    this.notifications.delete(userId);
    console.log('🗑️ NOTIFICATIONS CLEARED:', { userId });
  }
}

// Export singleton instance
const notificationService = new MockNotificationService();

module.exports = {
  NotificationService,
  MockNotificationService,
  notificationService
}; 