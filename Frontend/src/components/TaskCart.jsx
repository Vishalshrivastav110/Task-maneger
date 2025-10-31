import React, { useMemo } from "react";



const TaskCard = ({ task, onEdit, onDelete, onUpdate }) => {
  // Subtasks progress calculation
  const { completedCount, totalCount, progressPercent } = useMemo(() => {
    const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
    const total = subs.length;
    const completed = subs.filter((s) => s.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completedCount: completed, totalCount: total, progressPercent: pct };
  }, [task.subtasks]);

  // helper: initials for avatar-like small icon (if needed)
  const getInitials = (s = "") =>
    s
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);

  // status color classes
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
  };

  // priority classes
  const priorityClasses = {
    high: "bg-red-100 text-red-800",
    medium: "bg-blue-100 text-blue-800",
    low: "bg-gray-100 text-gray-800",
  };

  // status animation / glow
  const statusAnimClass =
    task.status === "in-progress"
      ? "animate-pulse/50" // tailwind v3.3+ supports animation opacity control like animate-pulse/50; if not, animate-pulse works
      : task.status === "completed"
      ? "ring-2 ring-green-200 shadow-sm"
      : "";

  // Date helpers
  const isOverdue = (d) => d && new Date(d) < new Date();
  const isDueSoon = (d) =>
    d && new Date(d) < new Date(Date.now() + 24 * 60 * 60 * 1000) && !isOverdue(d);

  // Update status helper
  const handleStatusChange = (taskId, newStatus) => {
    if (typeof onUpdate === "function") onUpdate(taskId, { status: newStatus });
  };

  return (
    <article
      className={`bg-white rounded-2xl border border-gray-200 p-5 transition-transform transform hover:-translate-y-1 hover:shadow-xl duration-200`}
      aria-labelledby={`task-${task._id}-title`}
    >
      {/* Header: title + due badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            id={`task-${task._id}-title`}
            className="text-base md:text-lg font-semibold text-gray-900 truncate"
            title={task.title}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-3">
              {task.description}
            </p>
          )}
        </div>

        {/* Due date badge with tooltip (group) */}
        <div className="flex-shrink-0 ml-2">
          {task.dueDate && (
            <div className="relative group">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isOverdue(task.dueDate)
                    ? "bg-red-100 text-red-800"
                    : isDueSoon(task.dueDate)
                    ? "bg-orange-100 text-orange-800"
                    : "bg-purple-100 text-purple-800"
                }`}
                aria-label={`Due ${new Date(task.dueDate).toLocaleDateString()}`}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>

              {/* Tooltip (appears on hover) */}
              <div className="absolute right-0 mt-2 hidden group-hover:block w-48 bg-white border border-gray-200 rounded-md shadow-md p-3 text-xs text-gray-600 z-30">
                <div className="text-sm font-medium text-gray-800">
                  Due: {new Date(task.dueDate).toLocaleString()}
                </div>
                <div className="mt-1">
                  {isOverdue(task.dueDate) ? (
                    <span className="text-red-600 font-medium">Overdue</span>
                  ) : isDueSoon(task.dueDate) ? (
                    <span className="text-orange-600 font-medium">Due soon</span>
                  ) : (
                    <span className="text-gray-600">On schedule</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status, Priority and small icon row */}
      <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          {/* Status badge with subtle animation/glow */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClasses[task.status] || statusClasses.pending} ${statusAnimClass}`}
          >
            {/* status icon */}
            {task.status === "completed" ? (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
              </svg>
            ) : task.status === "in-progress" ? (
              <svg className="w-4 h-4 mr-1 animate-spin-slow" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="60" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM11 6h2v6h-2zM11 14h2v2h-2z" />
              </svg>
            )}
            <span className="capitalize">{task.status.replace("-", " ")}</span>
          </span>

          {/* Priority with tooltip */}
          <div className="relative group">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityClasses[task.priority] || priorityClasses.low}`}
            >
              {/* priority icon */}
              {task.priority === "high" ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6L2 8h6l2-6z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                </svg>
              )}
              <span className="capitalize">{task.priority}</span>
            </span>

            <div className="absolute left-0 mt-2 hidden group-hover:block w-36 bg-white border border-gray-200 rounded-md shadow p-2 text-xs text-gray-600 z-30">
              Priority: <span className="font-medium">{task.priority}</span>
            </div>
          </div>
        </div>

        {/* small meta area: subtasks count or avatar initials */}
        <div className="flex items-center gap-3">
          {totalCount > 0 ? (
            <div className="text-xs text-gray-500">
              {completedCount}/{totalCount} subtasks
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                {getInitials(task.title || "T")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtasks progress bar */}
      {totalCount > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Progress</div>
            <div className="text-xs text-gray-500">{progressPercent}%</div>
          </div>

          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${task.status === "completed" ? "bg-green-500" : "bg-gradient-to-r from-yellow-400 to-orange-400"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtask list (compact) */}
      {totalCount > 0 && (
        <ul className="mt-3 text-sm text-gray-700 space-y-1 max-h-36 overflow-auto pr-2">
          {task.subtasks.map((s, i) => (
            <li key={i} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!s.completed}
                onChange={() =>
                  onUpdate(task._id, {
                    subtasks: task.subtasks.map((st, idx) =>
                      idx === i ? { ...st, completed: !st.completed } : st
                    ),
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                aria-label={`Toggle subtask ${s.title}`}
              />
              <span className={`truncate ${s.completed ? "line-through text-gray-400" : ""}`}>
                {s.title}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleStatusChange(task._id, "pending")}
          disabled={task.status === "pending"}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
            task.status === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
          }`}
        >
          Pending
        </button>

        <button
          onClick={() => handleStatusChange(task._id, "in-progress")}
          disabled={task.status === "in-progress"}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
            task.status === "in-progress"
              ? "bg-orange-500 text-white"
              : "bg-orange-50 text-orange-700 hover:bg-orange-100"
          }`}
        >
          In Progress
        </button>

        <button
          onClick={() => handleStatusChange(task._id, "completed")}
          disabled={task.status === "completed"}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
            task.status === "completed"
              ? "bg-green-600 text-white"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          Complete
        </button>

        <button
          onClick={() => onEdit && onEdit(task)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          title="Edit task"
        >
          ✏️
        </button>

        <button
          onClick={() => onDelete && onDelete(task._id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </article>
  );
};

export default TaskCard;
