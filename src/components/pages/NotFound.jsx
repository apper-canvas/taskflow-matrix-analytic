import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* 404 Illustration */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="text-9xl font-bold text-primary-200 dark:text-primary-900 select-none">
              404
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute top-4 right-8"
            >
              <ApperIcon name="AlertTriangle" className="h-16 w-16 text-warning-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                <ApperIcon name="Home" className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            
            <Button variant="secondary" onClick={() => window.history.back()}>
              <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Or try one of these popular pages:
            </p>
            
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tasks">
                  <ApperIcon name="CheckSquare" className="h-3 w-3 mr-1" />
                  My Tasks
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <Link to="/today">
                  <ApperIcon name="Calendar" className="h-3 w-3 mr-1" />
                  Today
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <Link to="/projects">
                  <ApperIcon name="Folder" className="h-3 w-3 mr-1" />
                  Projects
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <Link to="/teams">
                  <ApperIcon name="Users" className="h-3 w-3 mr-1" />
                  Teams
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-xs text-gray-500 dark:text-gray-400"
        >
          <p>Need help? Contact our support team.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound