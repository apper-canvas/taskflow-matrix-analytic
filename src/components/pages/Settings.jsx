import React, { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import { useTheme } from "@/hooks/useTheme"

const SettingsSection = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card p-6 space-y-4"
  >
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
      <ApperIcon name={icon} className="h-5 w-5" />
      {title}
    </h2>
    {children}
  </motion.div>
)

const Settings = () => {
  const { isDark, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    notifications: {
      email: true,
      desktop: true,
      mobile: false
    },
    preferences: {
      defaultView: "dashboard",
      itemsPerPage: "25",
      dateFormat: "MM/dd/yyyy"
    }
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    toast.success("Settings saved successfully!")
  }

  const handleExportData = () => {
    toast.info("Data export functionality would be implemented here")
  }

  const handleImportData = () => {
    toast.info("Data import functionality would be implemented here")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your TaskFlow Pro experience and manage your preferences.
        </p>
      </motion.div>

      {/* Account Settings */}
      <SettingsSection title="Account" icon="User">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save Account Settings
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Appearance Settings */}
      <SettingsSection title="Appearance" icon="Palette">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Theme
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your preferred color scheme
              </p>
            </div>
            <Button
              onClick={toggleTheme}
              variant="secondary"
              icon={isDark ? "Sun" : "Moon"}
            >
              {isDark ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default View
            </label>
            <select
              value={formData.preferences.defaultView}
              onChange={(e) => handleNestedChange("preferences", "defaultView", e.target.value)}
              className="input-field"
            >
              <option value="dashboard">Dashboard</option>
              <option value="tasks">My Tasks</option>
              <option value="today">Today</option>
              <option value="projects">Projects</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      {/* Notification Settings */}
      <SettingsSection title="Notifications" icon="Bell">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive email updates about your tasks
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.email}
                onChange={(e) => handleNestedChange("notifications", "email", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Desktop Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show browser notifications for important updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.desktop}
                onChange={(e) => handleNestedChange("notifications", "desktop", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection title="Data Management" icon="Database">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Export Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Download all your tasks, projects, and settings as JSON
            </p>
            <Button onClick={handleExportData} variant="secondary" icon="Download">
              Export Data
            </Button>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Import Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Import data from a previous export or another task manager
            </p>
            <Button onClick={handleImportData} variant="secondary" icon="Upload">
              Import Data
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title="Preferences" icon="Settings">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Items per Page
              </label>
              <select
                value={formData.preferences.itemsPerPage}
                onChange={(e) => handleNestedChange("preferences", "itemsPerPage", e.target.value)}
                className="input-field"
              >
                <option value="10">10 items</option>
                <option value="25">25 items</option>
                <option value="50">50 items</option>
                <option value="100">100 items</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Format
              </label>
              <select
                value={formData.preferences.dateFormat}
                onChange={(e) => handleNestedChange("preferences", "dateFormat", e.target.value)}
                className="input-field"
              >
                <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                <option value="MMM d, yyyy">MMM d, yyyy</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About TaskFlow Pro" icon="Info">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Version Information
              </h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>Version: 1.0.0</p>
                <p>Built with: React 18 + Vite</p>
                <p>Last Updated: January 2024</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Support
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                  <ApperIcon name="ExternalLink" className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                  <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
                  Support Center
                </Button>
                <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                  <ApperIcon name="Github" className="h-4 w-4 mr-2" />
                  GitHub Repository
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}

export default Settings