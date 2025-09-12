import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Map, Lightbulb, TreePine, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navigation: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/claims', icon: FileText, label: 'Claims Management' },
    { path: '/map', icon: Map, label: 'Interactive Map' },
    { path: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  ];

  return (
    <nav
      className={`fixed left-0 top-0 h-full bg-green-800 dark:bg-gray-800 text-white shadow-lg z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'
        }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center p-4 border-b border-green-700 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 144 144" fill="none">
            <path d="M29.8017 119.689C25.967 115.855 22.9631 111.423 20.79 106.395C18.617 101.368 17.5304 96.1694 17.5304 90.8007C17.5304 85.432 18.5531 80.1272 20.5983 74.8863C22.6435 69.6455 25.967 64.7241 30.5687 60.1224C33.5513 57.1398 37.237 54.5833 41.6257 52.4528C46.0144 50.3224 51.2126 48.6394 57.2204 47.4037C63.2283 46.1681 70.0883 45.4224 77.8004 45.1668C85.5126 44.9111 94.1409 45.2094 103.685 46.0615C104.367 55.0946 104.58 63.4033 104.324 70.9876C104.069 78.572 103.366 85.4107 102.215 91.5037C101.065 97.5968 99.4457 102.923 97.3578 107.482C95.27 112.041 92.6922 115.855 89.6244 118.922C85.1078 123.439 80.3144 126.741 75.2439 128.829C70.1735 130.917 64.9965 131.961 59.7131 131.961C54.1739 131.961 48.7626 130.874 43.4791 128.701C38.1957 126.528 33.6365 123.524 29.8017 119.689ZM44.1183 117.644C46.5896 119.093 49.1248 120.137 51.7239 120.776C54.3231 121.415 56.9861 121.735 59.7131 121.735C63.6331 121.735 67.5104 120.946 71.3452 119.37C75.18 117.793 78.8444 115.258 82.3383 111.764C83.8722 110.23 85.4274 108.078 87.0039 105.309C88.5804 102.539 89.9439 98.9176 91.0944 94.4437C92.2448 89.9698 93.1183 84.5585 93.7148 78.2098C94.3113 71.8611 94.3965 64.2981 93.9704 55.5207C89.7948 55.3502 85.0865 55.2863 79.8457 55.3289C74.6048 55.3715 69.3852 55.7763 64.187 56.5433C58.9887 57.3102 54.0461 58.5459 49.3591 60.2502C44.6722 61.9546 40.8374 64.2981 37.8548 67.2807C34.02 71.1155 31.3783 74.9076 29.9296 78.6572C28.4809 82.4068 27.7565 86.0285 27.7565 89.5224C27.7565 94.5502 28.7152 98.9602 30.6326 102.752C32.55 106.545 34.2331 109.208 35.6817 110.742C39.2609 103.924 43.9904 97.3837 49.8704 91.1202C55.7504 84.8568 62.6104 79.7224 70.4504 75.7172C64.3148 81.0859 58.9674 87.1576 54.4083 93.9324C49.8491 100.707 46.4191 108.611 44.1183 117.644Z" fill="#1F892C" />
          </svg>
          <div className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {isExpanded && (
              <>
                <h1 className="text-lg font-semibold whitespace-nowrap">Forest Rights Act Atlas</h1>
                <p className="text-xs text-green-200 dark:text-gray-300 whitespace-nowrap">WebGIS Management System</p>
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
                    `flex items-center px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${isActive
                      ? 'bg-green-700 dark:bg-gray-700 text-white'
                      : 'text-green-100 dark:text-gray-300 hover:bg-green-700 dark:hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`ml-3 transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'
                    }`}>
                    {isExpanded && item.label}
                  </span>

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-3 border-t border-green-700 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-3 py-3 rounded-md text-sm font-medium text-green-100 dark:text-gray-300 hover:bg-green-700 dark:hover:bg-gray-700 hover:text-white transition-all duration-200 group"
          >
            {isDark ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
            <span className={`ml-3 transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'
              }`}>
              {isExpanded && (isDark ? 'Light Mode' : 'Dark Mode')}
            </span>

            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </div>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;