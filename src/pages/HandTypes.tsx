import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, BookOpen } from 'lucide-react';
import HandTypeGuide from '../components/HandTypeGuide';

const HandTypes: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(selectedType === typeId ? '' : typeId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">手型分类</h1>
              <p className="text-gray-600 dark:text-gray-300">学习识别不同的手型特征</p>
            </div>
          </div>
          
          <Link
            to="/camera"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>开始分析</span>
          </Link>
        </div>

        {/* Hand Type Guide */}
        <HandTypeGuide 
          selectedType={selectedType}
          onTypeSelect={handleTypeSelect}
        />

        {/* Learning Resources */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center mb-4">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">学习资源</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">手相学基础</h4>
              <p className="text-blue-700 dark:text-blue-200 text-sm mb-3">
                了解手相学的基本原理，包括手型分类、掌纹解读、手指特征等核心知识。
              </p>
              <div className="space-y-1 text-xs text-blue-600 dark:text-blue-300">
                <p>• 手型与性格的关系</p>
                <p>• 掌纹的基本含义</p>
                <p>• 手指长度的解读</p>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">实践技巧</h4>
              <p className="text-green-700 dark:text-green-200 text-sm mb-3">
                掌握手相分析的实用技巧，提高观察和判断的准确性。
              </p>
              <div className="space-y-1 text-xs text-green-600 dark:text-green-300">
                <p>• 观察手型的要点</p>
                <p>• 掌纹清晰度判断</p>
                <p>• 综合分析方法</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/camera"
            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Camera className="w-5 h-5" />
            <span>拍摄手相</span>
          </Link>
          
          <Link
            to="/history"
            className="flex-1 flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-3 px-6 rounded-lg transition-all"
          >
            <BookOpen className="w-5 h-5" />
            <span>查看历史</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HandTypes;