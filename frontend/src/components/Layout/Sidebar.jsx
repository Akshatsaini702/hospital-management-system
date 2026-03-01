import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiUserPlus, FiCalendar, FiLayers,
  FiLogOut, FiChevronLeft, FiActivity, FiHeart, FiShield,
  FiTag, FiCreditCard, FiBookOpen, FiUser
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const adminMenu = [
  { path: '/', icon: FiGrid, label: 'Dashboard' },
  { path: '/patients', icon: FiUsers, label: 'Patients' },
  { path: '/doctors', icon: FiUserPlus, label: 'Doctors' },
  { path: '/appointments', icon: FiCalendar, label: 'Appointments' },
  { path: '/departments', icon: FiLayers, label: 'Departments' },
  { path: '/services', icon: FiTag, label: 'Services' },
  { path: '/payments', icon: FiCreditCard, label: 'Payments' },
  { path: '/all-bookings', icon: FiBookOpen, label: 'All Bookings' },
  { path: '/account', icon: FiShield, label: 'Account Security' },
];

const receptionistMenu = [
  { path: '/', icon: FiGrid, label: 'Dashboard' },
  { path: '/patients', icon: FiUsers, label: 'Patients' },
  { path: '/doctors', icon: FiUserPlus, label: 'Doctors' },
  { path: '/appointments', icon: FiCalendar, label: 'Appointments' },
  { path: '/departments', icon: FiLayers, label: 'Departments' },
  { path: '/services', icon: FiTag, label: 'Services' },
  { path: '/payments', icon: FiCreditCard, label: 'Payments' },
  { path: '/all-bookings', icon: FiBookOpen, label: 'All Bookings' },
  { path: '/account', icon: FiShield, label: 'Account Security' },
];

const patientMenu = [
  { path: '/', icon: FiGrid, label: 'Dashboard' },
  { path: '/browse-services', icon: FiTag, label: 'Medical Services' },
  { path: '/browse-doctors', icon: FiUser, label: 'Consult a Doctor' },
  { path: '/my-bookings', icon: FiCalendar, label: 'My Bookings' },
  { path: '/account', icon: FiShield, label: 'Account Security' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout, user } = useAuth();

  const getMenuItems = () => {
    if (user?.role === 'patient') return patientMenu;
    if (user?.role === 'receptionist') return receptionistMenu;
    return adminMenu;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-0 lg:w-20'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-hidden shadow-2xl`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 h-16 border-b border-slate-700/50 flex-shrink-0 ${!isOpen && 'lg:justify-center lg:px-0'}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
            <FiHeart className="text-white text-lg" />
          </div>
          {isOpen && (
            <div className="animate-fadeIn">
              <h1 className="text-white font-bold text-lg tracking-tight">Mediflix+</h1>
              <p className="text-slate-400 text-[10px] -mt-0.5 font-medium">Hospital Management</p>
            </div>
          )}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors lg:hidden"
            >
              <FiChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }
                ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`
              }
            >
              <item.icon size={20} className="flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-slate-700/50 flex-shrink-0">
          {isOpen && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</p>
                <p className="text-slate-400 text-xs truncate capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200
              ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <FiLogOut size={20} className="flex-shrink-0" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
