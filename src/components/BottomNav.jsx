import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NavButton = ({ icon, label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`nav-btn flex-1 py-3 text-center transition-colors ${
        isActive
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="block text-xs">{label}</span>
    </NavLink>
  );
};

export const BottomNav = ({ onAddTransaction }) => {
  const navItems = [
    { icon: 'home', label: 'Home', to: '/' },
    { icon: 'receipt_long', label: 'History', to: '/transactions' },
    { icon: 'analytics', label: 'Analytics', to: '/analytics' },
    { icon: 'more_horiz', label: 'More', to: '/more' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 dark:bg-slate-800 dark:border-slate-700 flex justify-around max-w-lg mx-auto">
      <NavButton {...navItems[0]} />
      <NavButton {...navItems[1]} />

      {/* Floating Action Button for adding a new transaction */}
      <div className="w-16 h-16 flex justify-center items-center">
        <button
          onClick={onAddTransaction}
          className="fab nav-fab -mt-8 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <NavButton {...navItems[2]} />
      <NavButton {...navItems[3]} />
    </nav>
  );
};
