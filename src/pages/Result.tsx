import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, RotateCcw, Heart, Brain, Zap, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

const Result: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { analyses } = useStore();
  
  const analysis = analyses.find(a => a.id === id);

  if (!analysis) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到分析结果</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '我的手相分析结果',
          text: '快来看看我的手相分析结果！',
          url: window.location.href
        });
      } catch (error) {
        console.error('分享失败:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('链接已复制到剪贴板');
    }
  };

  const handleDownload = () => {
    // Create a simple text report
    const report = `
手相分析报告
=============

分析时间: ${new Date(analysis.timestamp).toLocaleString()}
手型: ${analysis.result.handType}

生命线: ${analysis.result.lifeLine}

感情线: ${analysis.result.heartLine}

智慧线: ${analysis.result.headLine}

性格特点: ${analysis.result.personality.join(', ')}

运势: ${analysis.result.fortune}

健康: ${analysis.result.health}

事业: ${analysis.result.career}

感情: ${analysis.result.love}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `手相分析报告_${new Date(analysis.timestamp).toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('报告已下载');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate('/history')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">分析结果</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Date */}
        <div className="p-4 bg-white border-b">
          <p className="text-sm text-gray-500 text-center">
            分析时间：{formatDate(analysis.timestamp)}
          </p>
        </div>

        {/* Hand Image */}
        <div className="p-4 bg-white border-b">
          <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg">
            <img
              src={analysis.imageUrl}
              alt="Hand analysis"
              className="w-full h-full object-cover"
            />
            {/* Feature overlay could be added here */}
          </div>
        </div>

        {/* Hand Type */}
        <div className="p-6 bg-white border-b">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">您的手型：{analysis.result.handType}</h2>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {analysis.result.personality.map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Palm Lines Analysis */}
        <div className="bg-white border-b">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">手相线条分析</h3>
            
            <div className="space-y-6">
              {/* Life Line */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2">生命线</h4>
                  <p className="text-gray-600 leading-relaxed">{analysis.result.lifeLine}</p>
                </div>
              </div>

              {/* Heart Line */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2">感情线</h4>
                  <p className="text-gray-600 leading-relaxed">{analysis.result.heartLine}</p>
                </div>
              </div>

              {/* Head Line */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2">智慧线</h4>
                  <p className="text-gray-600 leading-relaxed">{analysis.result.headLine}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">详细解读</h3>
            
            <div className="grid gap-6">
              {/* Fortune */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-5 h-5 text-yellow-600 mr-2" />
                  <h4 className="font-semibold text-yellow-800">运势分析</h4>
                </div>
                <p className="text-yellow-700 leading-relaxed">{analysis.result.fortune}</p>
              </div>

              {/* Health */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <div className="flex items-center mb-3">
                  <Heart className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">健康状况</h4>
                </div>
                <p className="text-green-700 leading-relaxed">{analysis.result.health}</p>
              </div>

              {/* Career */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="flex items-center mb-3">
                  <Zap className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-800">事业发展</h4>
                </div>
                <p className="text-blue-700 leading-relaxed">{analysis.result.career}</p>
              </div>

              {/* Love */}
              <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
                <div className="flex items-center mb-3">
                  <Heart className="w-5 h-5 text-pink-600 mr-2" />
                  <h4 className="font-semibold text-pink-800">感情运势</h4>
                </div>
                <p className="text-pink-700 leading-relaxed">{analysis.result.love}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-white border-t">
          <div className="flex space-x-4">
            <Link
              to="/camera"
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              <span>重新分析</span>
            </Link>
            <Link
              to="/history"
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              <span>查看历史</span>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-6 bg-yellow-50 border-t border-yellow-200">
          <p className="text-sm text-yellow-800 text-center leading-relaxed">
            <strong>免责声明：</strong>本分析结果基于传统手相学理论，仅供娱乐参考。
            每个人的命运掌握在自己手中，请理性对待分析结果。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Result;