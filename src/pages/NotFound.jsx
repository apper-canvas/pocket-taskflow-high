import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center"
        >
          <ApperIcon name="AlertTriangle" className="h-12 w-12 text-white" />
        </motion.div>
        
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-4">
          404 - Page Not Found
        </h1>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. Let's get you back to managing your tasks.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center space-x-2 btn-primary"
        >
          <ApperIcon name="ArrowLeft" className="h-4 w-4" />
          <span>Back to TaskFlow</span>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound