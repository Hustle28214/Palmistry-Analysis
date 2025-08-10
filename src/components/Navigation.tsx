import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, History, Hand, Sun, Moon, BookOpen, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/camera', icon: Camera, label: '拍摄' },
    { path: '/hand-types', icon: BookOpen, label: '手型' },
    { path: '/history', icon: History, label: '历史' },
    { path: '/api-test', icon: Settings, label: 'API测试' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-900 dark:bg-gray-900 shadow-lg transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Hand className="w-8 h-8 text-yellow-400" />
            <span className="text-white font-bold text-lg">手相分析</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Items */}
            <div className="flex space-x-4">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors ${
                    location.pathname === path
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </Link>
              ))}
            </div>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-blue-800 dark:hover:bg-gray-800 transition-colors"
              title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;