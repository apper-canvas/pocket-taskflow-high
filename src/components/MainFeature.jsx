import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('dueDate')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  })

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const taskData = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate,
      priority: formData.priority,
      completed: editingTask ? editingTask.completed : false,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (editingTask) {
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? taskData : task
      ))
      toast.success('Task updated successfully')
    } else {
      setTasks(prev => [...prev, taskData])
      toast.success('Task created successfully')
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium'
    })
    setEditingTask(null)
    setShowModal(false)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority
    })
    setShowModal(true)
  }

  const handleDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    toast.success('Task deleted successfully')
  }

  const toggleComplete = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
        : task
    ))
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(task => !task.completed)
        break
      case 'completed':
        filtered = filtered.filter(task => task.completed)
        break
      case 'overdue':
        filtered = filtered.filter(task => 
          !task.completed && task.dueDate && isPast(new Date(task.dueDate))
        )
        break
      default:
        break
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return 0
      }
    })

    return filtered
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(task => task.completed).length
    const overdue = tasks.filter(task => 
      !task.completed && task.dueDate && isPast(new Date(task.dueDate))
    ).length
    
    return { total, completed, overdue, pending: total - completed }
  }

  const getDueDateText = (dueDate) => {
    if (!dueDate) return null
    
    const date = new Date(dueDate)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isPast(date)) return 'Overdue'
    return format(date, 'MMM dd')
  }

  const getDueDateColor = (dueDate, completed) => {
    if (completed) return 'text-green-600'
    if (!dueDate) return 'text-surface-500'
    
    const date = new Date(dueDate)
    if (isPast(date)) return 'text-red-600'
    if (isToday(date)) return 'text-amber-600'
    return 'text-surface-600'
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'AlertCircle'
      case 'medium': return 'Circle'
      case 'low': return 'Minus'
      default: return 'Circle'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-amber-500'
      case 'low': return 'text-green-500'
      default: return 'text-surface-500'
    }
  }

  const stats = getTaskStats()
  const filteredTasks = getFilteredTasks()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Quick Stats */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
              Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-surface-600 dark:text-surface-400">Total</span>
                <span className="font-semibold text-surface-900 dark:text-white">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-600 dark:text-surface-400">Pending</span>
                <span className="font-semibold text-amber-600">{stats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-600 dark:text-surface-400">Completed</span>
                <span className="font-semibold text-green-600">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-600 dark:text-surface-400">Overdue</span>
                <span className="font-semibold text-red-600">{stats.overdue}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-surface-600 dark:text-surface-400 mb-2">
                <span>Progress</span>
                <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' 
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
              Filters
            </h3>
            <div className="space-y-2">
              {[
                { key: 'all', label: 'All Tasks', icon: 'List' },
                { key: 'active', label: 'Active', icon: 'Clock' },
                { key: 'completed', label: 'Completed', icon: 'CheckCircle' },
                { key: 'overdue', label: 'Overdue', icon: 'AlertTriangle' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`sidebar-item w-full ${activeFilter === filter.key ? 'active' : ''}`}
                >
                  <ApperIcon name={filter.icon} className="h-4 w-4" />
                  <span className="text-sm font-medium">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="relative">
                <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 pr-4"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input w-auto min-w-[120px]"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="created">Created</option>
              </select>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <ApperIcon name="Plus" className="h-4 w-4" />
                <span className="hidden sm:inline">New Task</span>
              </motion.button>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="mx-auto w-24 h-24 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mb-4">
                    <ApperIcon name="ListTodo" className="h-8 w-8 text-surface-400" />
                  </div>
                  <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
                    {searchTerm || activeFilter !== 'all' ? 'No tasks found' : 'No tasks yet'}
                  </h3>
                  <p className="text-surface-600 dark:text-surface-400 mb-6">
                    {searchTerm || activeFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Create your first task to get started'
                    }
                  </p>
                  {!searchTerm && activeFilter === 'all' && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="btn-primary"
                    >
                      Create Task
                    </button>
                  )}
                </motion.div>
              ) : (
                filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`task-card ${task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : 'priority-low'} ${task.completed ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleComplete(task.id)}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                        }`}
                      >
                        {task.completed && (
                          <ApperIcon name="Check" className="h-3 w-3 text-white" />
                        )}
                      </motion.button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-surface-900 dark:text-white ${task.completed ? 'line-through' : ''}`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className={`text-sm text-surface-600 dark:text-surface-400 mt-1 ${task.completed ? 'line-through' : ''}`}>
                                {task.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <ApperIcon 
                              name={getPriorityIcon(task.priority)} 
                              className={`h-4 w-4 ${getPriorityColor(task.priority)}`} 
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(task)}
                              className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded"
                            >
                              <ApperIcon name="Edit2" className="h-4 w-4 text-surface-500" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(task.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded"
                            >
                              <ApperIcon name="Trash2" className="h-4 w-4 text-red-500" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          {task.dueDate && (
                            <span className={`text-xs font-medium ${getDueDateColor(task.dueDate, task.completed)}`}>
                              <ApperIcon name="Calendar" className="inline h-3 w-3 mr-1" />
                              {getDueDateText(task.dueDate)}
                            </span>
                          )}
                          <span className="text-xs text-surface-500">
                            {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-surface-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="h-5 w-5 text-surface-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input resize-none"
                    rows="3"
                    placeholder="Add task description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature