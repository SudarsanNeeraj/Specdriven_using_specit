import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Calendar, UserCheck, Shield, LogOut, LogIn, Activity, FileText } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 text-blue-600 font-bold text-xl group">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors border border-blue-100">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <span className="tracking-tight text-slate-900 font-black text-xl">
                Med<span className="text-blue-600">Booking</span>
              </span>
            </Link>

            {/* Quick Demo Role Switcher */}
            <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-200 text-xs">
              <span className="text-slate-500 mr-2 flex items-center font-medium">
                <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Active Persona:
              </span>
              <select
                value={user?.role || 'PATIENT'}
                onChange={handleRoleSwitch}
                className="bg-slate-100/80 hover:bg-slate-200/70 text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
              >
                <option value="PATIENT">Patient (Rahul Verma)</option>
                <option value="DOCTOR">Doctor (Dr. Rajesh Sharma)</option>
                <option value="RECEPTIONIST">Receptionist (Front Desk)</option>
                <option value="ADMIN">Admin (Clinic Management)</option>
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === '/'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Find Doctors
            </Link>

            <Link
              to="/queue-board"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === '/queue-board'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Queue Board</span>
            </Link>

            {user?.role === 'PATIENT' && (
              <>
                <Link
                  to="/patient/appointments"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/patient/appointments')
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>My Appointments</span>
                </Link>
                <Link
                  to="/patient/timeline"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/patient/timeline')
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-teal-500" />
                  <span>Health Timeline</span>
                </Link>
                <Link
                  to="/patient/records"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/patient/records')
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Medical Records</span>
                </Link>
              </>
            )}

            {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
              <Link
                to="/doctor/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  location.pathname.startsWith('/doctor')
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                <span>Doctor Portal</span>
              </Link>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST') && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Clinic Desk & Reports</span>
              </Link>
            )}
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="text-[10px] text-blue-600 font-bold tracking-wide uppercase">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-xs transition"
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
