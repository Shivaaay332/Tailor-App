import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Scissors, IndianRupee, Settings as SettingsIcon } from 'lucide-react';

const Layout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Orders', path: '/orders', icon: Scissors },
    { name: 'Payments', path: '/payments', icon: IndianRupee },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20 hide-scrollbar">
        <Outlet />
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 transition-colors duration-300">
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-xl min-w-[60px] transition-all duration-200 ${
                  isActive 
                    ? 'text-primary scale-110' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`
              }
            >
              <item.icon size={22} strokeWidth={2.5} className="mb-1" />
              <span className="text-[10px] font-bold">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Layout;