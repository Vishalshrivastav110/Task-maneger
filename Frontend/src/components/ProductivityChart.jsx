import React from 'react';

const ProductivityChart = ({ tasks }) => {
  // Calculate chart data
  const statusData = {
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const priorityData = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  const categoryData = {
    work: tasks.filter(t => t.category === 'work').length,
    personal: tasks.filter(t => t.category === 'personal').length,
    shopping: tasks.filter(t => t.category === 'shopping').length,
    health: tasks.filter(t => t.category === 'health').length,
    learning: tasks.filter(t => t.category === 'learning').length,
    other: tasks.filter(t => t.category === 'other').length,
  };

  const getPercentage = (value, total) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const ProgressBar = ({ value, total, color, label }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{value} ({getPercentage(value, total).toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${color}`}
          style={{ width: `${getPercentage(value, total)}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="text-2xl mr-2">📊</span>
        Productivity Analytics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-lg mr-2">📈</span>
            Task Status
          </h4>
          <ProgressBar value={statusData.pending} total={tasks.length} color="bg-yellow-500" label="⏳ Pending" />
          <ProgressBar value={statusData.inProgress} total={tasks.length} color="bg-orange-500" label="🚀 In Progress" />
          <ProgressBar value={statusData.completed} total={tasks.length} color="bg-green-500" label="✅ Completed" />
        </div>

        {/* Priority Distribution */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200/50">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-lg mr-2">🎯</span>
            Priority Levels
          </h4>
          <ProgressBar value={priorityData.high} total={tasks.length} color="bg-red-500" label="🔴 High Priority" />
          <ProgressBar value={priorityData.medium} total={tasks.length} color="bg-yellow-500" label="🟡 Medium Priority" />
          <ProgressBar value={priorityData.low} total={tasks.length} color="bg-green-500" label="🟢 Low Priority" />
        </div>

        {/* Category Distribution */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200/50">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-lg mr-2">🗂️</span>
            Categories
          </h4>
          <ProgressBar value={categoryData.work} total={tasks.length} color="bg-blue-500" label="💼 Work" />
          <ProgressBar value={categoryData.personal} total={tasks.length} color="bg-green-500" label="👤 Personal" />
          <ProgressBar value={categoryData.learning} total={tasks.length} color="bg-purple-500" label="📚 Learning" />
          <div className="text-xs text-gray-600 mt-2">
            +{categoryData.shopping + categoryData.health + categoryData.other} more categories
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{statusData.completed}</div>
          <div className="text-sm text-gray-600">Done</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{statusData.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{priorityData.high}</div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {tasks.length > 0 ? Math.round((statusData.completed / tasks.length) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityChart;