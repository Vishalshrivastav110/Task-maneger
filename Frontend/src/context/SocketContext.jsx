import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]); // ✅ Add this line
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server with ID:', newSocket.id);
        setIsConnected(true);
        
        // Notify others that user is online
        newSocket.emit('user-online', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // ✅ Add online users tracking
      newSocket.on('user-status-changed', (data) => {
        console.log('User status changed:', data);
        if (data.status === 'online') {
          setOnlineUsers(prev => {
            const newUsers = [...new Set([...prev, data.userId])];
            console.log('Online users updated:', newUsers);
            return newUsers;
          });
        } else {
          setOnlineUsers(prev => {
            const filteredUsers = prev.filter(id => id !== data.userId);
            console.log('Online users after disconnect:', filteredUsers);
            return filteredUsers;
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const value = {
    socket,
    isConnected,
    onlineUsers, // ✅ Add this to context value
    joinTask: (taskId) => {
      if (socket) {
        socket.emit('join-task', taskId);
      }
    },
    leaveTask: (taskId) => {
      if (socket) {
        socket.emit('leave-task', taskId);
      }
    },
    emitTaskUpdate: (taskId, updatedData) => {
      if (socket) {
        socket.emit('task-updated', {
          taskId,
          updatedBy: user?._id,
          updatedData,
          timestamp: new Date()
        });
      }
    },
    emitTaskCreate: (newTask) => {
      if (socket) {
        socket.emit('task-created', {
          task: newTask,
          createdBy: user?._id,
          timestamp: new Date()
        });
      }
    },
    emitTaskDelete: (taskId) => {
      if (socket) {
        socket.emit('task-deleted', {
          taskId,
          deletedBy: user?._id,
          timestamp: new Date()
        });
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};