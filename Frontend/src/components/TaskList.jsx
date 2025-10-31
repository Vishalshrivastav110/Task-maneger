import React from 'react';

const TaskList = ({ tasks, onEdit, onDelete, onUpdate, onTaskClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'in-progress': return 'bg-orange-100 text-orange-800 border border-orange-200';
      default: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      default: return '🟢';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'shopping': return '🛒';
      case 'health': return '🏥';
      case 'learning': return '📚';
      case 'other': return '📦';
      default: return '📝';
    }
  };

  const getDueDateInfo = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { type: 'overdue', text: `Overdue ${Math.abs(daysDiff)}d`, color: 'bg-red-500' };
    } else if (daysDiff === 0) {
      return { type: 'today', text: 'Due Today', color: 'bg-orange-500' };
    } else if (daysDiff <= 3) {
      return { type: 'soon', text: `Due in ${daysDiff}d`, color: 'bg-yellow-500' };
    }
    
    return null;
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await onUpdate(taskId, { status: newStatus });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-600">Get started by creating your first task!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6">
      {tasks.map((task) => {
        const dueDateInfo = getDueDateInfo(task.dueDate);
        
        return (
          <div 
            key={task._id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => onTaskClick(task._id)}
          >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">{getCategoryIcon(task.category)}</span>
                  <h4 className="text-lg font-semibold text-gray-900 flex-1">{task.title}</h4>
                </div>
                
                {task.description && (
                  <p className="text-gray-600 mb-3 leading-relaxed line-clamp-2">{task.description}</p>
                )}
                
                {/* Project */}
                {task.project && task.project !== 'Inbox' && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span>{task.project}</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Edit task"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task._id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete task"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tags Section */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Status */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status === 'in-progress' ? '🚀' : task.status === 'completed' ? '✅' : '⏳'}
                <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
              </span>
              
              {/* Priority */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)}
                <span className="ml-1 capitalize">{task.priority}</span>
              </span>

              {/* Category */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {getCategoryIcon(task.category)}
                <span className="ml-1 capitalize">{task.category}</span>
              </span>

              {/* Due Date with Warning */}
              {task.dueDate && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  dueDateInfo ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-purple-100 text-purple-800'
                }`}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(task.dueDate)}
                  {dueDateInfo && (
                    <span className="ml-1 font-semibold">({dueDateInfo.text})</span>
                  )}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2 pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task._id, 'pending');
                }}
                disabled={task.status === 'pending'}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  task.status === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                <span>⏳</span>
                <span>Pending</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task._id, 'in-progress');
                }}
                disabled={task.status === 'in-progress'}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  task.status === 'in-progress'
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                }`}
              >
                <span>🚀</span>
                <span>In Progress</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task._id, 'completed');
                }}
                disabled={task.status === 'completed'}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  task.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                <span>✅</span>
                <span>Complete</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;