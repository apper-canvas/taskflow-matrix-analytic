import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import Header from "@/components/organisms/Header"
import Sidebar from "@/components/organisms/Sidebar"
import { useMobile } from "@/hooks/useMobile"

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <Sidebar 
        isOpen={true}
        isMobile={false}
      />

      {/* Mobile Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        isMobile={true}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuToggle={handleMenuToggle}
          showMenuButton={isMobile}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout