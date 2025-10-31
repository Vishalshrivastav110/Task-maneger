import React, { useEffect } from 'react';

const CollaborationNotification = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`fixed top-20 right-4 border rounded-lg px-4 py-3 shadow-lg z-40 ${getNotificationStyles(notification.type)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Collaboration Update</span>
          <span>{notification.message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CollaborationNotification;