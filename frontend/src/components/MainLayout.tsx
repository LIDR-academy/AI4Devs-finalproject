import type React from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className = "" }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header/Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className={`flex-1 ${className}`} role="main">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default MainLayout
