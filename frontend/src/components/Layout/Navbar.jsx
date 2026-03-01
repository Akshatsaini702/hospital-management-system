import { FiMenu, FiSearch, FiBell, FiChevronRight } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const routeNames = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/patients/new': 'Add Patient',
  '/doctors': 'Doctors',
  '/doctors/new': 'Add Doctor',
  '/appointments': 'Appointments',
  '/appointments/new': 'New Appointment',
  '/departments': 'Departments',
  '/departments/new': 'Add Department',
  '/services': 'Services',
  '/services/new': 'Add Service',
  '/payments': 'Payments',
  '/payments/new': 'New Invoice',
  '/account': 'Account Security',
  '/browse-services': 'Medical Services',
  '/browse-doctors': 'Our Doctors',
  '/my-bookings': 'My Bookings',
  '/all-bookings': 'All Bookings',
};

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (location.pathname.includes('/edit/')) {
      const base = location.pathname.split('/')[1];
      return `Edit ${base.charAt(0).toUpperCase() + base.slice(1, -1)}`;
    }
    return routeNames[location.pathname] || 'Page';
  };

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return [{ label: 'Dashboard', path: '/' }];

    const crumbs = [{ label: 'Home', path: '/' }];
    let path = '';
    parts.forEach((part, i) => {
      path += `/${part}`;
      if (part !== 'edit' && !part.match(/^[a-f0-9]{24}$/)) {
        crumbs.push({
          label: part.charAt(0).toUpperCase() + part.slice(1),
          path: path,
        });
      }
    });
    return crumbs;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 shadow-sm shadow-slate-100/50">
      <div className="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <FiMenu size={20} />
          </button>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 truncate">{getPageTitle()}</h2>
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 truncate">
              {getBreadcrumbs().map((crumb, i) => (
                <span key={i} className="flex items-center gap-1 truncate">
                  {i > 0 && <FiChevronRight size={10} />}
                  <span className={`truncate ${i === getBreadcrumbs().length - 1 ? 'text-blue-600 font-medium' : ''}`}>
                    {crumb.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Search bar - desktop */}
          <div className="hidden lg:flex items-center bg-slate-100/80 rounded-xl px-3 py-2 gap-2 w-56 xl:w-64 border border-slate-200/50">
            <FiSearch className="text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <FiBell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block min-w-0">
              <p className="text-sm font-medium text-slate-700 leading-tight truncate max-w-28 lg:max-w-36">{user?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</p>
              <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
