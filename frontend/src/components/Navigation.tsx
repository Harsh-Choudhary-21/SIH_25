import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Map, Lightbulb, TreePine } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/claims', icon: FileText, label: 'Claims Management' },
    { path: '/map', icon: Map, label: 'Interactive Map' },
    { path: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  ];

  return (
    <nav 
      className={`fixed left-0 top-0 h-full bg-green-800 text-white shadow-lg z-50 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center p-4 border-b border-green-700">
          <TreePine className="h-8 w-8 text-green-300 flex-shrink-0" />
          <div className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {isExpanded && (
              <>
                <h1 className="text-lg font-semibold whitespace-nowrap">Forest Rights Act Atlas</h1>
                <p className="text-xs text-green-200 whitespace-nowrap">WebGIS Management System</p>
              </>
            )}
          </div>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 py-6">
          <div className="space-y-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-green-700 text-white'
                        : 'text-green-100 hover:bg-green-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`ml-3 transition-opacity duration-300 whitespace-nowrap ${
                    isExpanded ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {isExpanded && item.label}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;