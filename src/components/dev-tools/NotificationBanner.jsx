import React from 'react';

function NotificationBanner({ notification }) {
  if (!notification) return null;

  return (
    <div className={`sidebar-notification ${notification.type}`}>
      <span>{notification.message}</span>
    </div>
  );
}

export default NotificationBanner;
