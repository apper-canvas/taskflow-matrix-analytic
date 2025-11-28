import { createBrowserRouter } from "react-router-dom"
import { lazy, Suspense } from "react"
import Layout from "@/components/organisms/Layout"

// Lazy load all page components
const Dashboard = lazy(() => import("@/components/pages/Dashboard"))
const MyTasks = lazy(() => import("@/components/pages/MyTasks"))
const Today = lazy(() => import("@/components/pages/Today"))
const Upcoming = lazy(() => import("@/components/pages/Upcoming"))
const Completed = lazy(() => import("@/components/pages/Completed"))
const Projects = lazy(() => import("@/components/pages/Projects"))
const Calendar = lazy(() => import("@/components/pages/Calendar"))
const Teams = lazy(() => import("@/components/pages/Teams"))
const Settings = lazy(() => import("@/components/pages/Settings"))
const NotFound = lazy(() => import("@/components/pages/NotFound"))

// Suspense wrapper with loading fallback
const SuspenseWrapper = ({ children }) => (
  <Suspense 
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</div>
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
)

// Define main routes
const mainRoutes = [
  {
    path: "",
    index: true,
    element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>
  },
  {
    path: "tasks",
    element: <SuspenseWrapper><MyTasks /></SuspenseWrapper>
  },
  {
    path: "today",
    element: <SuspenseWrapper><Today /></SuspenseWrapper>
  },
  {
    path: "upcoming",
    element: <SuspenseWrapper><Upcoming /></SuspenseWrapper>
  },
  {
    path: "completed",
    element: <SuspenseWrapper><Completed /></SuspenseWrapper>
  },
  {
    path: "projects",
    element: <SuspenseWrapper><Projects /></SuspenseWrapper>
  },
  {
    path: "calendar",
    element: <SuspenseWrapper><Calendar /></SuspenseWrapper>
  },
  {
    path: "teams",
    element: <SuspenseWrapper><Teams /></SuspenseWrapper>
  },
  {
    path: "settings",
    element: <SuspenseWrapper><Settings /></SuspenseWrapper>
  },
  {
    path: "*",
    element: <SuspenseWrapper><NotFound /></SuspenseWrapper>
  }
]

// Create router configuration
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: mainRoutes
  }
]

export const router = createBrowserRouter(routes)