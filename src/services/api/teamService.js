import teamsData from "@/services/mockData/teams.json"

let teams = [...teamsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const teamService = {
  async getAll() {
    await delay(300)
    return [...teams]
  },

  async getById(id) {
    await delay(200)
    const team = teams.find(t => t.Id === parseInt(id))
    if (!team) {
      throw new Error("Team not found")
    }
    return { ...team }
  },

  async create(teamData) {
    await delay(400)
    
    const maxId = Math.max(...teams.map(t => t.Id), 0)
    const newTeam = {
      ...teamData,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    }
    
    teams.push(newTeam)
    return { ...newTeam }
  },

  async update(id, updates) {
    await delay(350)
    
    const teamIndex = teams.findIndex(t => t.Id === parseInt(id))
    if (teamIndex === -1) {
      throw new Error("Team not found")
    }
    
    teams[teamIndex] = {
      ...teams[teamIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return { ...teams[teamIndex] }
  },

  async delete(id) {
    await delay(250)
    
    const teamIndex = teams.findIndex(t => t.Id === parseInt(id))
    if (teamIndex === -1) {
      throw new Error("Team not found")
    }
    
    const deletedTeam = teams.splice(teamIndex, 1)[0]
    return { ...deletedTeam }
  },

  async addMember(teamId, member) {
    await delay(300)
    
    const teamIndex = teams.findIndex(t => t.Id === parseInt(teamId))
    if (teamIndex === -1) {
      throw new Error("Team not found")
    }
    
    const maxMemberId = Math.max(...teams.flatMap(t => t.members.map(m => m.Id)), 0)
    const newMember = {
      ...member,
      Id: maxMemberId + 1
    }
    
    teams[teamIndex].members.push(newMember)
    return { ...teams[teamIndex] }
  },

  async removeMember(teamId, memberId) {
    await delay(250)
    
    const teamIndex = teams.findIndex(t => t.Id === parseInt(teamId))
    if (teamIndex === -1) {
      throw new Error("Team not found")
    }
    
    const memberIndex = teams[teamIndex].members.findIndex(m => m.Id === parseInt(memberId))
    if (memberIndex === -1) {
      throw new Error("Member not found")
    }
    
    teams[teamIndex].members.splice(memberIndex, 1)
    return { ...teams[teamIndex] }
  }
}