import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import { teamService } from "@/services/api/teamService"

const TeamCard = ({ team, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"
      onClick={() => onClick(team)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {team.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {team.members.length} {team.members.length === 1 ? "member" : "members"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <ApperIcon name="Users" className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {team.projectIds?.length || 0} projects
          </span>
        </div>
      </div>

      {/* Team Members */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Members:</h4>
        <div className="space-y-1">
          {team.members.slice(0, 3).map((member) => (
            <div key={member.Id} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{member.name}</span>
              <Badge size="sm" variant="secondary">
                {member.role}
              </Badge>
            </div>
          ))}
          {team.members.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 ml-8">
              +{team.members.length - 3} more members
            </div>
          )}
        </div>
      </div>

      {/* Created Date */}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <ApperIcon name="Calendar" className="h-3 w-3" />
        Created {new Date(team.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  )
}

const Teams = () => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadTeams = async () => {
    try {
      setError("")
      setLoading(true)
      const data = await teamService.getAll()
      setTeams(data)
    } catch (err) {
      setError(err.message || "Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [])

  const handleTeamClick = (team) => {
    toast.info(`Team "${team.name}" details would be shown here`)
  }

  const handleCreateTeam = () => {
    toast.info("Create new team functionality would be implemented here")
  }

  if (loading) return <Loading />

  if (error) {
    return <ErrorView error={error} onRetry={loadTeams} />
  }

  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0)
  const totalProjects = teams.reduce((sum, team) => sum + (team.projectIds?.length || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Teams
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Collaborate with team members and manage projects together.
          </p>
        </div>
        
        <Button
          onClick={handleCreateTeam}
          icon="Plus"
        >
          Create Team
        </Button>
      </motion.div>

      {/* Team Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <ApperIcon name="Users" className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Teams</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{teams.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
              <ApperIcon name="UserCheck" className="w-8 h-8 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary-100 dark:bg-secondary-900 rounded-lg">
              <ApperIcon name="Folder" className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalProjects}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Teams Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {teams.length === 0 ? (
          <Empty
            title="No teams found"
            description="Create your first team to start collaborating with colleagues on projects."
            action={handleCreateTeam}
            actionLabel="Create Team"
            icon="Users"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team, index) => (
              <motion.div
                key={team.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
              >
                <TeamCard
                  team={team}
                  onClick={handleTeamClick}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Team Activity */}
      {teams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ApperIcon name="Activity" className="h-5 w-5" />
            Recent Team Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <ApperIcon name="UserPlus" className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <strong>Sarah Chen</strong> joined the Frontend Development Team
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
                <ApperIcon name="CheckCircle2" className="h-4 w-4 text-success-600 dark:text-success-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <strong>Frontend Development Team</strong> completed project milestone
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center">
                <ApperIcon name="Folder" className="h-4 w-4 text-warning-600 dark:text-warning-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  New project assigned to <strong>Backend & Infrastructure</strong>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Teams