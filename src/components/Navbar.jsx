import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { IoLogOutOutline } from "react-icons/io5";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="h-16 flex items-center justify-between px-6 bg-[rgb(17,17,17)] border-b border-stone-50/10 sm:border-none" >
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - Mobile Only */}
        <button
          className="xl:hidden p-2 text-white hover:bg-[rgb(33,33,33)] rounded-lg transition-colors"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? (
            <RiCloseLine size={24} />
          ) : (
            <RiMenu3Line size={24} />
          )}
        </button>
        
        {/* App Name */}
        <div className="text-2xl font-bold text-white hover:cursor-default">GPTStir</div>
      </div>

      {/* User Profile */}
      <div className="relative" ref={dropdownRef}>
        <div 
          className="w-12 h-12 rounded-full bg-[rgb(33,33,33)] flex items-center justify-center text-white font-medium cursor-pointer hover:bg-[rgb(43,43,43)] transition-all duration-200"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        
        {dropdownOpen && (
          <div className="absolute right-0 top-[48px] w-48 bg-[rgb(23,23,23)] border border-stone-50/15 rounded-xl shadow-lg z-50">
            <div className="p-3 border-b border-stone-50/10">
              <div className="text-sm font-medium text-white">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </div>
            <div 
              className="flex items-center gap-2 p-3 text-[rgb(200,200,200)] hover:bg-[rgb(53,53,53)] cursor-pointer rounded-b-xl transition-all duration-200"
              onClick={logout}
            >
              <IoLogOutOutline size={18} />
              <span className="text-sm">Sign out</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar; 