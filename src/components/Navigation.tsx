import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, History, Hand } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/camera', icon: Camera, label: '拍摄' },
    { path: '/history', icon: History, label: '历史' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-900 shadow-lg">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Hand className="w-8 h-8 text-yellow-400" />
            <span className="text-white font-bold text-lg">手相分析</span>
          </Link>
          
          <div className="flex space-x-6">
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;