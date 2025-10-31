import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import OnlineUsers from './OnlineUsers';
import CollaborationNotification from './CollaborationNotification';
import ProductivityChart from './ProductivityChart';
import PomodoroTimer from './PomodoroTimer';
import TaskAnalytics from './TaskAnalytics';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // ✅ CORRECT: onlineUsers ko useSocket se access karo
  const { 
    socket, 
    isConnected, 
    onlineUsers,  // ✅ Yeh line important hai
    joinTask, 
    leaveTask, 
    emitTaskUpdate, 
    emitTaskCreate, 
    emitTaskDelete 
  } = useSocket();
  
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showCharts, setShowCharts] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    console.log('Dashboard mounted, fetching tasks...');
    fetchTasks();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('task-changed', (data) => {
      console.log('Task updated by another user:', data);
      setNotification({
        type: 'info',
        message: `Task updated by another user`,
        taskId: data.taskId
      });
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === data.taskId 
            ? { ...task, ...data.updatedData }
            : task
        )
      );
    });

    socket.on('new-task', (data) => {
      console.log('New task created by another user:', data);
      setNotification({
        type: 'success',
        message: `New task created by another user`,
        task: data.task
      });
      
      setTasks(prevTasks => [data.task, ...prevTasks]);
    });

    socket.on('task-removed', (data) => {
      console.log('Task deleted by another user:', data);
      setNotification({
        type: 'warning',
        message: `Task deleted by another user`,
        taskId: data.taskId
      });
      
      setTasks(prevTasks => prevTasks.filter(task => task._id !== data.taskId));
    });

    return () => {
      socket.off('task-changed');
      socket.off('new-task');
      socket.off('task-removed');
    };
  }, [socket]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching tasks from API...');
      
      const res = await axios.get(`${API_BASE_URL}/tasks`, { 
        headers: getAuthHeaders() 
      });
      
      console.log('Tasks API response:', res.data);
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('Creating task:', taskData);
      const res = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
        headers: getAuthHeaders()
      });
      console.log('Task created:', res.data);
      
      emitTaskCreate(res.data);
      fetchTasks();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      console.log('Updating task:', taskId, taskData);
      const res = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, taskData, {
        headers: getAuthHeaders()
      });
      console.log('Task updated:', res.data);
      
      emitTaskUpdate(taskId, taskData);
      fetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      console.log('Deleting task:', taskId);
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: getAuthHeaders()
      });
      console.log('Task deleted');
      
      emitTaskDelete(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTaskClick = (taskId) => {
    joinTask(taskId);
  };

  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearAllFilters = () => {
    setFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
  };

  // Advanced filtering
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.project?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filter === 'all' || task.status === filter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Calculate statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter(task => task.status === 'pending').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    overdue: tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      return new Date(task.dueDate) < new Date();
    }).length,
    highPriority: tasks.filter(task => task.priority === 'high').length,
    byCategory: {
      work: tasks.filter(task => task.category === 'work').length,
      personal: tasks.filter(task => task.category === 'personal').length,
      shopping: tasks.filter(task => task.category === 'shopping').length,
      health: tasks.filter(task => task.category === 'health').length,
      learning: tasks.filter(task => task.category === 'learning').length,
      other: tasks.filter(task => task.category === 'other').length,
    }
  };

  // Get active filters count
  const activeFiltersCount = [
    filter !== 'all',
    categoryFilter !== 'all', 
    priorityFilter !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Connection Status */}
      <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm font-semibold z-50 flex items-center space-x-2 shadow-lg ${
        isConnected ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
      }`}>
        <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-white' : 'bg-white'}`}></div>
        <span>{isConnected ? 'Live Connected' : 'Disconnected'}</span>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TaskFlow
                  </h1>
                  <p className="text-sm text-gray-600">Welcome back, {user?.name}! 👋</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* ✅ CORRECT: onlineUsers ko yahan pass karo */}
              <OnlineUsers onlineUsers={onlineUsers} />
              
              {/* Quick Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTimer(!showTimer)}
                  className={`p-2 rounded-lg transition-all duration-200 border ${
                    showTimer 
                      ? 'bg-orange-500 text-white border-orange-500' 
                      : 'text-orange-600 hover:bg-orange-50 border-orange-200'
                  }`}
                  title="Pomodoro Timer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className={`p-2 rounded-lg transition-all duration-200 border ${
                    showCharts 
                      ? 'bg-purple-500 text-white border-purple-500' 
                      : 'text-purple-600 hover:bg-purple-50 border-purple-200'
                  }`}
                  title="Productivity Charts"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>

                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className={`p-2 rounded-lg transition-all duration-200 border ${
                    showAnalytics 
                      ? 'bg-indigo-500 text-white border-indigo-500' 
                      : 'text-indigo-600 hover:bg-indigo-50 border-indigo-200'
                  }`}
                  title="Advanced Analytics"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
              </div>

              <button
                onClick={fetchTasks}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collaboration Notification */}
        {notification && (
          <CollaborationNotification 
            notification={notification}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Task Analytics */}
        {showAnalytics && (
          <div className="mb-8">
            <TaskAnalytics tasks={tasks} />
          </div>
        )}

        {/* Pomodoro Timer */}
        {showTimer && (
          <div className="mb-8">
            <PomodoroTimer />
          </div>
        )}

        {/* Productivity Charts */}
        {showCharts && (
          <div className="mb-8">
            <ProductivityChart tasks={tasks} />
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'Total Tasks', 
              value: stats.total, 
              icon: '📋',
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-500'
            },
            { 
              label: 'Pending', 
              value: stats.pending, 
              icon: '⏳',
              color: 'from-yellow-500 to-yellow-600',
              bgColor: 'bg-yellow-500'
            },
            { 
              label: 'In Progress', 
              value: stats.inProgress, 
              icon: '🚀',
              color: 'from-orange-500 to-orange-600',
              bgColor: 'bg-orange-500'
            },
            { 
              label: 'Completed', 
              value: stats.completed, 
              icon: '✅',
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-500'
            },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { 
              label: 'Overdue Tasks', 
              value: stats.overdue, 
              icon: '⚠️',
              color: 'from-red-500 to-red-600'
            },
            { 
              label: 'High Priority', 
              value: stats.highPriority, 
              icon: '🔴',
              color: 'from-purple-500 to-purple-600'
            },
            { 
              label: 'Categories', 
              value: Object.keys(stats.byCategory).length, 
              icon: '📊',
              color: 'from-indigo-500 to-indigo-600'
            },
          ].map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/60 p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Main Actions Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
            <p className="text-gray-600">
              {filteredTasks.length} of {tasks.length} tasks
              {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active)`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-300' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-300' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={exportTasks}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export</span>
            </button>

            {/* Add Task Button */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search Tasks
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by title, description, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                📊 Status
              </label>
              <select
                id="status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="in-progress">🚀 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                🗂️ Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              >
                <option value="all">All Categories</option>
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="shopping">🛒 Shopping</option>
                <option value="health">🏥 Health</option>
                <option value="learning">📚 Learning</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                🚦 Priority
              </label>
              <select
                id="priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              >
                <option value="all">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <span>Clear all filters</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-12 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-600 text-lg">Loading your tasks...</span>
            </div>
          </div>
        )}

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={(taskData) => handleUpdateTask(editingTask._id, taskData)}
            onCancel={() => setEditingTask(null)}
          />
        )}

        {/* Task List */}
        {!loading && (
          <TaskList
            tasks={filteredTasks}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
            onTaskClick={handleTaskClick}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;