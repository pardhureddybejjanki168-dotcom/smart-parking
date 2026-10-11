import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ParkingSquare,
  Car,
  Activity,
  History,
  Calendar,
  BarChart2,
  Shield,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/slots', label: 'Slots', icon: ParkingSquare },
    { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
    { to: '/admin/sessions', label: 'Active Sessions', icon: Activity },
    { to: '/admin/history', label: 'All History', icon: History },
    { to: '/admin/reservations', label: 'Reservations', icon: Calendar },
    { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
    { to: '/admin/audit', label: 'Audit Logs', icon: Shield },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getBreadcrumbTitle = () => {
    const current = navLinks.find((link) => location.pathname === link.to);
    return current ? current.label : 'Admin Portal';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-navy-800 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-navy-800 bg-navy-900">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-purple-600 rounded-lg text-white shadow">
              <ParkingSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-tight">ParkSmart</span>
              <span className="text-[10px] tracking-wider text-purple-400 font-extrabold uppercase">Admin Portal</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isRoot = item.to === '/admin';
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={isRoot}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 shrink-0 text-slate-300" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Bottom */}
        <div className="p-4 border-t border-navy-800 bg-navy-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center font-bold text-sm">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-purple-900/80 text-purple-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-purple-700/50">
                  ADMIN
                </span>
                <span className="text-xs text-slate-400 truncate">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center text-sm font-medium text-slate-700">
              <span className="bg-purple-100 text-purple-700 font-bold text-xs px-2 py-0.5 rounded mr-2">ADMIN</span>
              <span className="text-navy-700 font-semibold">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-sm font-medium hidden md:block">{user?.fullName}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/admin/settings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Settings & Config
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
