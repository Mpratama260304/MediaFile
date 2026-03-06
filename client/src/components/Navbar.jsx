import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiHome,
  HiCloudUpload,
  HiUser,
  HiCog,
  HiShieldCheck,
  HiMenu,
  HiX,
  HiLogout,
  HiLogin,
} from 'react-icons/hi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? 'text-primary-600 font-semibold' : 'text-gray-600 hover:text-primary-600';

  const navLinks = [
    { to: '/', label: 'Home', icon: <HiHome className="w-5 h-5" /> },
  ];

  if (user) {
    navLinks.push(
      { to: '/dashboard', label: 'My Files', icon: <HiHome className="w-5 h-5" /> },
      { to: '/upload', label: 'Upload', icon: <HiCloudUpload className="w-5 h-5" /> },
      { to: '/profile', label: 'Profile', icon: <HiUser className="w-5 h-5" /> },
      { to: '/settings', label: 'Settings', icon: <HiCog className="w-5 h-5" /> }
    );
    if (user.role === 'admin') {
      navLinks.push({ to: '/admin', label: 'Admin', icon: <HiShieldCheck className="w-5 h-5" /> });
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MediaFile</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 text-sm transition-colors ${isActive(link.to)}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Hi, <span className="font-medium">{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <HiLogout className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600">
                  <HiLogin className="w-5 h-5" />
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.to)}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600"
                >
                  <HiLogout className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600"
                  >
                    <HiLogin className="w-5 h-5" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary text-sm text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
