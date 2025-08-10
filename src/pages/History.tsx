import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Download, Search, Calendar, MoreVertical } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { analyses, deleteAnalysis, clearHistory } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    if (!searchTerm) return true;
    const personality = Array.isArray(analysis.result.personality) 
      ? analysis.result.personality 
      : [];
    return (
      analysis.result.handType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      personality.some(trait => 
        trait.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const handleDelete = (id: string) => {
    deleteAnalysis(id);
    setShowDeleteConfirm(null);
    toast.success('记录已删除');
  };

  const handleClearAll = () => {
    clearHistory();
    setShowClearConfirm(false);
    toast.success('所有记录已清除');
  };

  const exportAllData = () => {
    if (analyses.length === 0) {
      toast.error('没有数据可导出');
      return;
    }

    const exportData = analyses.map(analysis => ({
      分析时间: new Date(analysis.timestamp).toLocaleString(),
      手型: analysis.result.handType,
      性格特点: Array.isArray(analysis.result.personality) 
        ? analysis.result.personality.join(', ') 
        : '未分析',
      生命线: analysis.result.lifeLine,
      感情线: analysis.result.heartLine,
      智慧线: analysis.result.headLine,
      运势: analysis.result.fortune,
      健康: analysis.result.health,
      事业: analysis.result.career,
      感情: analysis.result.love
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `手相分析历史_${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('数据已导出');
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">分析历史</h1>
            <div className="flex space-x-2">
              {analyses.length > 0 && (
                <>
                  <button
                    onClick={exportAllData}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="导出数据"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="清空历史"
                  >
                    <Trash2 className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {analyses.length > 0 && (
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索手型或性格特点..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {analyses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">暂无分析记录</h2>
            <p className="text-gray-600 text-center mb-6">
              您还没有进行过手相分析，
              <br />快去拍摄您的第一张手相照片吧！
            </p>
            <Link
              to="/camera"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              开始分析
            </Link>
          </div>
        ) : (
          /* History List */
          <div className="p-4">
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">没有找到匹配的记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnalyses.map((analysis) => (
                  <div key={analysis.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <Link to={`/result/${analysis.id}`} className="block">
                      <div className="flex p-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={analysis.imageUrl}
                            alt="Hand thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 ml-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {analysis.result.handType}
                              </h3>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {(Array.isArray(analysis.result.personality) 
                                  ? analysis.result.personality 
                                  : []
                                ).slice(0, 2).map((trait, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                  >
                                    {trait}
                                  </span>
                                ))}
                                {Array.isArray(analysis.result.personality) && analysis.result.personality.length > 2 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{analysis.result.personality.length - 2}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {formatDate(analysis.timestamp)}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setShowDeleteConfirm(analysis.id);
                                }}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">确定要删除这条分析记录吗？此操作无法撤销。</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">清空所有记录</h3>
              <p className="text-gray-600 mb-6">确定要清空所有分析记录吗？此操作无法撤销。</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  清空
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;