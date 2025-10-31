import React, { useState, useEffect } from 'react';

const TaskAnalytics = ({ tasks }) => {
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'all'
  const [selectedMetric, setSelectedMetric] = useState('completion'); // 'completion', 'priority', 'category'

  // Calculate analytics data
  const calculateAnalytics = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let filteredTasks = tasks;
    
    // Filter tasks based on time range
    if (timeRange === 'week') {
      filteredTasks = tasks.filter(task => new Date(task.createdAt) >= oneWeekAgo);
    } else if (timeRange === 'month') {
      filteredTasks = tasks.filter(task => new Date(task.createdAt) >= oneMonthAgo);
    }

    // Basic stats
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = filteredTasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress').length;
    
    // Priority distribution
    const priorityData = {
      high: filteredTasks.filter(task => task.priority === 'high').length,
      medium: filteredTasks.filter(task => task.priority === 'medium').length,
      low: filteredTasks.filter(task => task.priority === 'low').length,
    };

    // Category distribution
    const categoryData = {
      work: filteredTasks.filter(task => task.category === 'work').length,
      personal: filteredTasks.filter(task => task.category === 'personal').length,
      shopping: filteredTasks.filter(task => task.category === 'shopping').length,
      health: filteredTasks.filter(task => task.category === 'health').length,
      learning: filteredTasks.filter(task => task.category === 'learning').length,
      other: filteredTasks.filter(task => task.category === 'other').length,
    };

    // Due date analysis
    const overdueTasks = filteredTasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      return new Date(task.dueDate) < now;
    }).length;

    const dueThisWeek = filteredTasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }).length;

    // Completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Productivity score (simple calculation)
    const productivityScore = calculateProductivityScore(filteredTasks);

    // Task creation trend (last 7 days)
    const creationTrend = calculateCreationTrend(filteredTasks);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      priorityData,
      categoryData,
      overdueTasks,
      dueThisWeek,
      completionRate,
      productivityScore,
      creationTrend,
      filteredTasks
    };
  };

  const calculateProductivityScore = (tasks) => {
    if (tasks.length === 0) return 0;
    
    let score = 0;
    const totalWeight = tasks.length * 100;
    let earnedWeight = 0;

    tasks.forEach(task => {
      let taskScore = 0;
      
      // Status weight
      if (task.status === 'completed') taskScore += 70;
      else if (task.status === 'in-progress') taskScore += 30;
      else taskScore += 10;

      // Priority weight
      if (task.priority === 'high') taskScore += 20;
      else if (task.priority === 'medium') taskScore += 10;

      // Timeliness weight (if due date exists)
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        if (task.status === 'completed' && dueDate >= now) {
          taskScore += 10; // Completed on time
        }
      }

      earnedWeight += Math.min(taskScore, 100);
    });

    return Math.round((earnedWeight / totalWeight) * 100);
  };

  const calculateCreationTrend = (tasks) => {
    const trend = [];
    const now = new Date();
    
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const tasksOnDay = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      }).length;
      
      trend.push({ date: dateStr, count: tasksOnDay });
    }
    
    return trend;
  };

  const analytics = calculateAnalytics();

  // Chart rendering functions
  const renderCompletionChart = () => {
    const data = [
      { label: 'Completed', value: analytics.completedTasks, color: 'bg-green-500' },
      { label: 'In Progress', value: analytics.inProgressTasks, color: 'bg-orange-500' },
      { label: 'Pending', value: analytics.pendingTasks, color: 'bg-yellow-500' },
    ];

    const total = analytics.totalTasks || 1;

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{item.value}</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${(item.value / total) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-10 text-right">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPriorityChart = () => {
    const data = [
      { label: 'High', value: analytics.priorityData.high, color: 'bg-red-500', icon: '🔴' },
      { label: 'Medium', value: analytics.priorityData.medium, color: 'bg-yellow-500', icon: '🟡' },
      { label: 'Low', value: analytics.priorityData.low, color: 'bg-green-500', icon: '🟢' },
    ];

    const total = analytics.totalTasks || 1;

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{item.value}</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${(item.value / total) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-10 text-right">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCategoryChart = () => {
    const data = [
      { label: 'Work', value: analytics.categoryData.work, color: 'bg-blue-500', icon: '💼' },
      { label: 'Personal', value: analytics.categoryData.personal, color: 'bg-green-500', icon: '👤' },
      { label: 'Learning', value: analytics.categoryData.learning, color: 'bg-purple-500', icon: '📚' },
      { label: 'Health', value: analytics.categoryData.health, color: 'bg-red-500', icon: '🏥' },
      { label: 'Shopping', value: analytics.categoryData.shopping, color: 'bg-orange-500', icon: '🛒' },
      { label: 'Other', value: analytics.categoryData.other, color: 'bg-gray-500', icon: '📦' },
    ].filter(item => item.value > 0);

    const total = analytics.totalTasks || 1;

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{item.value}</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${(item.value / total) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-10 text-right">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrendChart = () => {
    return (
      <div className="flex items-end justify-between h-32 space-x-1">
        {analytics.creationTrend.map((day, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-1">
            <div className="text-xs text-gray-500">{day.date}</div>
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-blue-700"
              style={{ height: `${(day.count / Math.max(...analytics.creationTrend.map(d => d.count))) * 80}%` }}
            ></div>
            <div className="text-xs font-medium text-gray-700">{day.count}</div>
          </div>
        ))}
      </div>
    );
  };

  const getProductivityLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const productivityLevel = getProductivityLevel(analytics.productivityScore);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="text-3xl mr-3">📈</span>
            Task Analytics Dashboard
          </h3>
          <p className="text-gray-600 mt-1">
            Deep insights into your task management performance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
          >
            <option value="completion">Completion Rate</option>
            <option value="priority">Priority Distribution</option>
            <option value="category">Category Analysis</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalTasks}</div>
          <div className="text-sm text-blue-800 font-medium">Total Tasks</div>
          <div className="text-xs text-blue-600 mt-1">{timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'All Time'}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{analytics.completionRate.toFixed(1)}%</div>
          <div className="text-sm text-green-800 font-medium">Completion Rate</div>
          <div className="text-xs text-green-600 mt-1">
            {analytics.completedTasks} of {analytics.totalTasks} done
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{analytics.overdueTasks}</div>
          <div className="text-sm text-orange-800 font-medium">Overdue</div>
          <div className="text-xs text-orange-600 mt-1">Need attention</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{analytics.productivityScore}</div>
          <div className="text-sm text-purple-800 font-medium">Productivity Score</div>
          <div className={`text-xs ${productivityLevel.color} mt-1`}>{productivityLevel.level}</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Selected Metric Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-lg mr-2">
              {selectedMetric === 'completion' ? '📊' : selectedMetric === 'priority' ? '🎯' : '🗂️'}
            </span>
            {selectedMetric === 'completion' && 'Task Completion Analysis'}
            {selectedMetric === 'priority' && 'Priority Distribution'}
            {selectedMetric === 'category' && 'Category Breakdown'}
          </h4>
          <div className="h-64 overflow-y-auto">
            {selectedMetric === 'completion' && renderCompletionChart()}
            {selectedMetric === 'priority' && renderPriorityChart()}
            {selectedMetric === 'category' && renderCategoryChart()}
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-lg mr-2">📅</span>
            Task Creation Trend (Last 7 Days)
          </h4>
          <div className="h-64">
            {renderTrendChart()}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500 rounded-lg text-white">
              <span className="text-lg">⏳</span>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-800">{analytics.pendingTasks}</div>
              <div className="text-sm text-yellow-700">Pending Tasks</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg text-white">
              <span className="text-lg">🚀</span>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-800">{analytics.inProgressTasks}</div>
              <div className="text-sm text-blue-700">In Progress</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500 rounded-lg text-white">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <div className="text-lg font-bold text-red-800">{analytics.dueThisWeek}</div>
              <div className="text-sm text-red-700">Due This Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
        <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
          <span className="text-lg mr-2">💡</span>
          Productivity Tips
        </h4>
        <div className="text-sm text-indigo-700 space-y-1">
          {analytics.overdueTasks > 0 && (
            <p>• You have {analytics.overdueTasks} overdue tasks. Consider addressing them first.</p>
          )}
          {analytics.pendingTasks > analytics.inProgressTasks && (
            <p>• You have more pending tasks than in-progress. Try starting some new tasks!</p>
          )}
          {analytics.completionRate < 50 && (
            <p>• Your completion rate is below 50%. Focus on completing existing tasks before adding new ones.</p>
          )}
          {analytics.productivityScore >= 80 && (
            <p>• Great job! Your productivity score is excellent. Keep up the good work!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;