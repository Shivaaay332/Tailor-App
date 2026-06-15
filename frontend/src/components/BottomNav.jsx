import { NavLink } from 'react-router-dom';
import { Home, Users, Scissors, FileText } from 'lucide-react';

const BottomNav = () => {
  // Ye function check karta hai ki konsa tab active hai aur uska color badalta hai
  const navLinkClass = ({ isActive }) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${
      isActive ? 'text-primary font-bold' : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <div className="fixed bottom-0 w-full max-w-[480px] bg-white border-t border-gray-200 h-16 flex items-center justify-between px-2 pb-safe z-50">
      
      <NavLink to="/dashboard" className={navLinkClass}>
        <Home size={24} />
        <span className="text-[10px]">Home</span>
      </NavLink>

      <NavLink to="/customers" className={navLinkClass}>
        <Users size={24} />
        <span className="text-[10px]">Customers</span>
      </NavLink>

      {/* Center ka bada "+" button jaisa design */}
      <NavLink to="/add-order" className="relative -top-5 flex flex-col items-center justify-center">
        <div className="bg-primary text-white p-3 rounded-full shadow-lg border-4 border-white">
          <Scissors size={28} />
        </div>
      </NavLink>

      <NavLink to="/orders" className={navLinkClass}>
        <FileText size={24} />
        <span className="text-[10px]">Orders</span>
      </NavLink>

    </div>
  );
};

export default BottomNav;