import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Calendar, UserCheck, Shield, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    await switchDemoRole(role);
    if (role === 'PATIENT') navigate('/');
    else if (role === 'DOCTOR') navigate('/doctor/dashboard');
    else if (role === 'ADMIN' || role === 'RECEPTIONIST') navigate('/admin/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-brand-600 font-bold text-xl">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="tracking-tight text-slate-900 font-extrabold">Med<span className="text-brand-600">Booking</span></span>
            </Link>

            {/* Quick Demo Role Switcher */}
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-200 text-xs">
              <span className="text-slate-500 mr-2 flex items-center font-medium">
                <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Active Persona:
              </span>
              <select
                value={user?.role || 'PATIENT'}
                onChange={handleRoleSwitch}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-md border-0 focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                <option value="PATIENT">Patient (Rahul Verma)</option>
                <option value="DOCTOR">Doctor (Dr. Rajesh Sharma)</option>
                <option value="RECEPTIONIST">Receptionist (Front Desk)</option>
                <option value="ADMIN">Admin (Clinic Management)</option>
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition ${
                location.pathname === '/' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Find Doctors
            </Link>

            {user?.role === 'PATIENT' && (
              <>
                <Link
                  to="/patient/appointments"
                  className={`text-sm font-medium transition flex items-center space-x-1 ${
                    location.pathname.startsWith('/patient/appointments') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Appointments</span>
                </Link>
                <Link
                  to="/patient/records"
                  className={`text-sm font-medium transition ${
                    location.pathname.startsWith('/patient/records') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Medical Records
                </Link>
              </>
            )}

            {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
              <Link
                to="/doctor/dashboard"
                className={`text-sm font-medium transition flex items-center space-x-1 ${
                  location.pathname.startsWith('/doctor') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Portal</span>
              </Link>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST') && (
              <Link
                to="/admin/dashboard"
                className={`text-sm font-medium transition flex items-center space-x-1 ${
                  location.pathname.startsWith('/admin') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Clinic Desk & Reports</span>
              </Link>
            )}
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-brand-600 font-medium tracking-wide uppercase">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-brand-600 px-3 py-1.5 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

