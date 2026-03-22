import React, { useState, useEffect } from 'react';

function NotificationManager() {
  const [notification, setNotification] = useState(null);

  // Notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-hide after 3 seconds
  };

  return { notification, showNotification };
}

export default NotificationManager;