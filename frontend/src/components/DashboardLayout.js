import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Briefcase, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Parser', path: '/dashboard/resume', icon: FileText },
    { name: 'Custom Prompts', path: '/dashboard/prompts', icon: MessageSquare },
    { name: 'Applications', path: '/dashboard/applications', icon: Briefcase },
  ];

  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link to={item.path} onClick={() => setSidebarOpen(false)}>
        <motion.div
          whileHover={{ x: 4 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{item.name}</span>
        </motion.div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">Job Hunt Hub</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="mobile-menu-toggle"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 lg:z-30 flex flex-col"
          >
            {/* Logo */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-xl text-slate-900">Job Hunt Hub</h1>
                  <p className="text-xs text-slate-500">Track your journey</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="w-full justify-start gap-2"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
