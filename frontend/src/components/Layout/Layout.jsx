import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { FiLinkedin } from 'react-icons/fi';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>

        <footer className="px-6 py-4 border-t border-slate-200/60 text-center">
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Mediflix+ Hospital Management System. All rights reserved.</p>
          <p className="text-xs text-slate-400 mt-1">Designed by <span className="font-semibold text-blue-500">Akshat</span></p>
        </footer>
      </div>

      {/* LinkedIn floating button */}
      <a
        href="https://www.linkedin.com/in/akshatsaini05/"
        target="_blank"
        rel="noopener noreferrer"
        title="Connect on LinkedIn"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#0A66C2] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 hover:bg-[#004182] hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 ease-out"
      >
        <FiLinkedin size={22} />
      </a>
    </div>
  );
}
