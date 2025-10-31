import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OnlineUsers = React.memo(({ onlineUsers = [] }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ Count Memoized
  const usersCount = useMemo(
    () => (Array.isArray(onlineUsers) ? onlineUsers.length : 0),
    [onlineUsers]
  );

  // ✅ Memoized Initials Function
  const getInitials = useCallback(
    (name = "") =>
      name
        .split(" ")
        .map((n) => n[0]?.toUpperCase())
        .join("")
        .slice(0, 2),
    []
  );

  // ✅ Close popup
  const closePopup = useCallback(() => setSelectedUser(null), []);

  if (usersCount === 0) {
    return (
      <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-gray-600 font-medium">0 online</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative select-none">
      {/* ✅ Top Bar */}
      <div className="flex items-center space-x-3 bg-green-50 px-3 py-2 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-700 font-medium">
            {usersCount} online
          </span>
        </div>

        {/* ✅ Avatars */}
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 4).map((user, index) => (
            <motion.button
              key={index}
              onClick={() =>
                setSelectedUser(
                  selectedUser?.name === user.name ? null : user
                )
              }
              whileHover={{ scale: 1.1 }}
              className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-green-100 flex items-center justify-center text-xs font-semibold text-green-700 shadow-sm"
              title={user.name}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user.name)
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></span>
            </motion.button>
          ))}

          {/* ✅ "+ more" avatar */}
          {usersCount > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-700 font-medium">
              +{usersCount - 4}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Popup + Blur with AnimatePresence */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              onClick={closePopup}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute mt-2 right-0 bg-white shadow-xl rounded-xl border border-gray-100 w-60 p-3 z-20"
            >
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(selectedUser.name)
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedUser.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedUser.role || "Member"}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-gray-100 pt-2">
                <p className="text-xs text-gray-500">ईमेल:</p>
                <p className="text-sm text-gray-700 truncate">
                  {selectedUser.email || "उपलब्ध नहीं"}
                </p>
              </div>

              <button
                onClick={closePopup}
                className="mt-3 w-full text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                बंद करें
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

export default OnlineUsers;
