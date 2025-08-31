import React from 'react';

const NavButton = ({ icon, label, page, currentPage, onNavigate }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => onNavigate(page)}
      className={`nav-btn flex-1 py-3 text-center transition-colors ${isActive
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-gray-500 dark:text-gray-400'}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="block text-xs">{label}</span>
    </button>
  );
};

export const BottomNav = ({ currentPage, onNavigate, onAddTransaction }) => {
  const navItems = [
    { icon: 'home', label: 'Home', page: 'home' },
    { icon: 'receipt_long', label: 'History', page: 'transactions' },
    { icon: 'analytics', label: 'Analytics', page: 'monthly-summary' },
    { icon: 'more_horiz', label: 'More', page: 'more' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 dark:bg-slate-800 dark:border-slate-700 flex justify-around max-w-lg mx-auto">
      <NavButton {...navItems[0]} currentPage={currentPage} onNavigate={onNavigate} />
      <NavButton {...navItems[1]} currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Floating Action Button for adding a new transaction */}
      <div className="w-16 h-16 flex justify-center items-center">
        <button onClick={onAddTransaction} className="fab nav-fab -mt-8 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <NavButton {...navItems[2]} currentPage={currentPage} onNavigate={onNavigate} />
      <NavButton {...navItems[3]} currentPage={currentPage} onNavigate={onNavigate} />
    </nav>
  );
};