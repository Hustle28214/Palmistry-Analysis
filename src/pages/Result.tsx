import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, Heart, Brain, Zap, TrendingUp, User, Eye, Lightbulb, Target, BookOpen, Users, Sparkles, Activity, Shield, Briefcase, MessageCircle, Clock, Star, Award, CheckCircle, Microscope, Hand, MapPin, Calendar, Compass, Baby, GraduationCap, Briefcase as BriefcaseIcon, Home, Users as UsersIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

const Result: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { analyses } = useStore();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  
  const analysis = analyses.find(a => a.id === id);

  if (!analysis) {
    return (
      <div className={`pt-16 min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <p className={`mb-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>未找到分析结果</p>
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
    // Create a comprehensive text report
    const result = analysis.result;
    const report = `
手相分析详细报告
==================

分析时间: ${new Date(analysis.timestamp).toLocaleString()}

=== 基础手相特征 ===
手型分类: ${result.basicFeatures?.handType || '未分析'}
手掌大小: ${result.basicFeatures?.handSize || '未分析'}
皮肤纹理: ${result.basicFeatures?.skinTexture || '未分析'}
手掌厚度: ${result.basicFeatures?.palmThickness || '未分析'}
手指长度: ${result.basicFeatures?.fingerLength || '未分析'}
指甲形状: ${result.basicFeatures?.nailShape || '未分析'}
拇指分析: ${result.basicFeatures?.thumbAnalysis || '未分析'}

=== 手掌纹线分析 ===
生命线:
  描述: ${result.palmLines?.lifeLine?.description || '未分析'}
  健康含义: ${result.palmLines?.lifeLine?.healthImplications || '未分析'}
  精力水平: ${result.palmLines?.lifeLine?.energyLevel || '未分析'}
  人生阶段: ${result.palmLines?.lifeLine?.lifeStages || '未分析'}

感情线:
  描述: ${result.palmLines?.heartLine?.description || '未分析'}
  情感风格: ${result.palmLines?.heartLine?.emotionalStyle || '未分析'}
  关系模式: ${result.palmLines?.heartLine?.relationshipPattern || '未分析'}
  共情能力: ${result.palmLines?.heartLine?.empathyLevel || '未分析'}

智慧线:
  描述: ${result.palmLines?.headLine?.description || '未分析'}
  思维风格: ${result.palmLines?.headLine?.thinkingStyle || '未分析'}
  决策能力: ${result.palmLines?.headLine?.decisionMaking || '未分析'}
  学习风格: ${result.palmLines?.headLine?.learningStyle || '未分析'}
  创造力: ${result.palmLines?.headLine?.creativity || '未分析'}

事业线: ${result.palmLines?.fateLine || '未分析'}
婚姻线: ${result.palmLines?.marriageLine || '未分析'}
其他纹线: ${result.palmLines?.otherLines || '未分析'}

=== 心理特征分析 ===
MBTI预测: ${result.psychologicalProfile?.mbtiPrediction || '未分析'}
认知风格: ${result.psychologicalProfile?.cognitiveStyle || '未分析'}
情绪模式: ${result.psychologicalProfile?.emotionalPattern || '未分析'}
行为倾向: ${result.psychologicalProfile?.behaviorTendency || '未分析'}
压力反应: ${result.psychologicalProfile?.stressResponse || '未分析'}
社交风格: ${result.psychologicalProfile?.socialStyle || '未分析'}
动机驱动: ${result.psychologicalProfile?.motivationDrivers || '未分析'}
潜意识特征: ${result.psychologicalProfile?.unconsciousTraits || '未分析'}

=== 详细分析 ===
核心优势: ${result.detailedAnalysis?.strengths?.join(', ') || '未分析'}
面临挑战: ${result.detailedAnalysis?.challenges?.join(', ') || '未分析'}
性格特质: ${result.detailedAnalysis?.personalityTraits?.join(', ') || '未分析'}
沟通风格: ${result.detailedAnalysis?.communicationStyle || '未分析'}
领导潜质: ${result.detailedAnalysis?.leadershipPotential || '未分析'}
适应能力: ${result.detailedAnalysis?.adaptability || '未分析'}

=== 实用建议 ===
职业指导:
  适合领域: ${result.practicalAdvice?.careerGuidance?.suitableFields?.join(', ') || '未分析'}
  工作风格: ${result.practicalAdvice?.careerGuidance?.workStyle || '未分析'}
  发展路径: ${result.practicalAdvice?.careerGuidance?.developmentPath || '未分析'}
  技能提升: ${result.practicalAdvice?.careerGuidance?.skillsToImprove?.join(', ') || '未分析'}

人际关系:
  恋爱风格: ${result.practicalAdvice?.relationshipAdvice?.loveStyle || '未分析'}
  沟通建议: ${result.practicalAdvice?.relationshipAdvice?.communicationTips || '未分析'}
  冲突解决: ${result.practicalAdvice?.relationshipAdvice?.conflictResolution || '未分析'}

个人发展:
  学习建议: ${result.practicalAdvice?.personalDevelopment?.learningRecommendations || '未分析'}
  时间管理: ${result.practicalAdvice?.personalDevelopment?.timeManagement || '未分析'}
  压力管理: ${result.practicalAdvice?.personalDevelopment?.stressManagement || '未分析'}
  健康建议: ${result.practicalAdvice?.personalDevelopment?.healthTips || '未分析'}

行动计划:
  短期建议: ${result.practicalAdvice?.actionPlan?.shortTerm?.join(', ') || '未分析'}
  长期目标: ${result.practicalAdvice?.actionPlan?.longTerm?.join(', ') || '未分析'}
  日常实践: ${result.practicalAdvice?.actionPlan?.dailyPractices?.join(', ') || '未分析'}

=== 人生经历推测 ===
职业经历: ${result.lifeExperiences?.careerHistory || '未分析'}
教育背景: ${result.lifeExperiences?.educationalBackground || '未分析'}
重大事件: ${result.lifeExperiences?.majorLifeEvents || '未分析'}
兴趣爱好: ${result.lifeExperiences?.hobbiesAndInterests || '未分析'}
旅行经历: ${result.lifeExperiences?.travelExperiences || '未分析'}
感情经历: ${result.lifeExperiences?.relationshipHistory || '未分析'}
健康挑战: ${result.lifeExperiences?.healthChallenges || '未分析'}
个人成长: ${result.lifeExperiences?.personalGrowth || '未分析'}

=== 免责声明 ===
本分析结果基于传统手相学理论结合现代心理学、行为科学和神经科学理论，
采用AI技术进行综合分析，仅供娱乐和自我认知参考。
每个人的命运和发展掌握在自己手中，请理性对待分析结果，
将其作为自我了解和个人成长的参考工具。
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `手相分析详细报告_${new Date(analysis.timestamp).toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('详细报告已下载');
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
    <div className={`pt-16 min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className={`shadow-sm ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate('/history')}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`w-6 h-6 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`} />
            </button>
            <h1 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>分析结果</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Share2 className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </button>
              <button
                onClick={handleDownload}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Download className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Date */}
        <div className={`p-4 border-b ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            分析时间：{formatDate(analysis.timestamp)}
          </p>
        </div>

        {/* Hand Image */}
        <div className={`p-4 border-b ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg">
            <img
              src={analysis.imageUrl}
              alt="Hand analysis"
              className="w-full h-full object-cover"
            />
            {/* Feature overlay could be added here */}
          </div>
        </div>

        {/* MBTI & Hand Type */}
        <div className={`p-6 border-b ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            {/* MBTI Type */}
            {analysis.result.mbtiType && (
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>{analysis.result.mbtiType}</h2>
                <p className={`mb-4 max-w-md mx-auto leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {analysis.result.mbtiDescription}
                </p>
              </div>
            )}
            
            {/* Hand Type */}
            <div className={`pt-6 ${
              theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-200'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <Zap className={`w-8 h-8 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>手型：{analysis.result.handType}</h3>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {analysis.result.personality.map((trait, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      theme === 'dark' 
                        ? 'bg-blue-900 text-blue-300' 
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`border-b ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: '概览', icon: Eye },
              { id: 'detailed', label: '详细分析', icon: Sparkles },
              { id: 'psychology', label: '心理特征', icon: Brain },
              { id: 'advice', label: '实用建议', icon: Lightbulb },
              { id: 'experiences', label: '人生经历', icon: Compass }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? `text-blue-600 border-b-2 border-blue-600 ${
                          theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
                        }`
                      : `${
                          theme === 'dark' 
                            ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-6 text-center ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>手相线条分析</h3>
              
              <div className="space-y-6">
                {/* Life Line */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>生命线</h4>
                    <p className={`leading-relaxed ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{analysis.result.lifeLine}</p>
                  </div>
                </div>

                {/* Heart Line */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>感情线</h4>
                    <p className={`leading-relaxed ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{analysis.result.heartLine}</p>
                  </div>
                </div>

                {/* Head Line */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>智慧线</h4>
                    <p className={`leading-relaxed ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{analysis.result.headLine}</p>
                  </div>
                </div>
              </div>

              {/* Basic Fortune Analysis */}
              <div className="mt-8">
                <h3 className={`text-xl font-bold mb-6 text-center ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>运势概览</h3>
                <div className="grid gap-4">
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="w-5 h-5 text-yellow-600 mr-2" />
                      <h4 className="font-semibold text-yellow-800">运势分析</h4>
                    </div>
                    <p className="text-yellow-700 leading-relaxed">{analysis.result.fortune}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="flex items-center mb-3">
                      <Heart className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-green-800">健康状况</h4>
                    </div>
                    <p className="text-green-700 leading-relaxed">{analysis.result.health}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="flex items-center mb-3">
                      <Zap className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-blue-800">事业发展</h4>
                    </div>
                    <p className="text-blue-700 leading-relaxed">{analysis.result.career}</p>
                  </div>

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
          )}

          {/* Detailed Analysis Tab */}
          {activeTab === 'detailed' && analysis.result.detailedAnalysis && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">详细手相分析</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Star className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">核心优势</h4>
                  </div>
                  <div className="space-y-2">
                    {analysis.result.detailedAnalysis.strengths?.map((strength, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-700">{strength}</span>
                      </div>
                    )) || <p className="text-green-700">分析中...</p>}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Shield className="w-5 h-5 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-orange-800">面临挑战</h4>
                  </div>
                  <div className="space-y-2">
                    {analysis.result.detailedAnalysis.challenges?.map((challenge, index) => (
                      <div key={index} className="flex items-center">
                        <Activity className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-orange-700">{challenge}</span>
                      </div>
                    )) || <p className="text-orange-700">分析中...</p>}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-800">性格特质</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.result.detailedAnalysis.personalityTraits?.map((trait, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        {trait}
                      </span>
                    )) || <p className="text-blue-700">分析中...</p>}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <MessageCircle className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-purple-800">沟通风格</h4>
                  </div>
                  <p className="text-purple-700 leading-relaxed">{analysis.result.detailedAnalysis.communicationStyle || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Award className="w-5 h-5 text-indigo-600 mr-2" />
                    <h4 className="font-semibold text-indigo-800">领导潜质</h4>
                  </div>
                  <p className="text-indigo-700 leading-relaxed">{analysis.result.detailedAnalysis.leadershipPotential || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Zap className="w-5 h-5 text-teal-600 mr-2" />
                    <h4 className="font-semibold text-teal-800">适应能力</h4>
                  </div>
                  <p className="text-teal-700 leading-relaxed">{analysis.result.detailedAnalysis.adaptability || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Hand className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">手部纹理</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{analysis.result.detailedAnalysis.handTexture || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Activity className="w-5 h-5 text-cyan-600 mr-2" />
                    <h4 className="font-semibold text-cyan-800">手指灵活度</h4>
                  </div>
                  <p className="text-cyan-700 leading-relaxed">{analysis.result.detailedAnalysis.fingerFlexibility || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-rose-50 to-rose-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Heart className="w-5 h-5 text-rose-600 mr-2" />
                    <h4 className="font-semibold text-rose-800">手掌温度</h4>
                  </div>
                  <p className="text-rose-700 leading-relaxed">{analysis.result.detailedAnalysis.palmTemperature || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
                    <h4 className="font-semibold text-emerald-800">血管分布</h4>
                  </div>
                  <p className="text-emerald-700 leading-relaxed">{analysis.result.detailedAnalysis?.bloodVessels || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Shield className="w-5 h-5 text-amber-600 mr-2" />
                    <h4 className="font-semibold text-amber-800">肌肉发达程度</h4>
                  </div>
                  <p className="text-amber-700 leading-relaxed">{analysis.result.detailedAnalysis.muscleDevelopment || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-lime-50 to-lime-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Sparkles className="w-5 h-5 text-lime-600 mr-2" />
                    <h4 className="font-semibold text-lime-800">皮肤弹性</h4>
                  </div>
                  <p className="text-lime-700 leading-relaxed">{analysis.result.detailedAnalysis.skinElasticity || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-violet-50 to-violet-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Star className="w-5 h-5 text-violet-600 mr-2" />
                    <h4 className="font-semibold text-violet-800">指甲健康</h4>
                  </div>
                  <p className="text-violet-700 leading-relaxed">{analysis.result.detailedAnalysis.nailHealth || '分析中...'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Psychology Tab */}
          {activeTab === 'psychology' && analysis.result.psychologicalProfile && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">心理特征分析</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Brain className="w-5 h-5 text-indigo-600 mr-2" />
                    <h4 className="font-semibold text-indigo-800">MBTI预测</h4>
                  </div>
                  <p className="text-indigo-700 leading-relaxed">{analysis.result.psychologicalProfile.mbtiPrediction || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Eye className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-purple-800">认知风格</h4>
                  </div>
                  <p className="text-purple-700 leading-relaxed">{analysis.result.psychologicalProfile.cognitiveStyle || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Heart className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-800">情绪模式</h4>
                  </div>
                  <p className="text-blue-700 leading-relaxed">{analysis.result.psychologicalProfile.emotionalPattern || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Users className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">行为倾向</h4>
                  </div>
                  <p className="text-green-700 leading-relaxed">{analysis.result.psychologicalProfile.behaviorTendency || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Activity className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-semibold text-red-800">压力反应</h4>
                  </div>
                  <p className="text-red-700 leading-relaxed">{analysis.result.psychologicalProfile.stressResponse || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <MessageCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="font-semibold text-yellow-800">社交风格</h4>
                  </div>
                  <p className="text-yellow-700 leading-relaxed">{analysis.result.psychologicalProfile.socialStyle || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Zap className="w-5 h-5 text-teal-600 mr-2" />
                    <h4 className="font-semibold text-teal-800">动机驱动</h4>
                  </div>
                  <p className="text-teal-700 leading-relaxed">{analysis.result.psychologicalProfile.motivationDrivers || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Lightbulb className="w-5 h-5 text-pink-600 mr-2" />
                    <h4 className="font-semibold text-pink-800">潜意识特征</h4>
                  </div>
                  <p className="text-pink-700 leading-relaxed">{analysis.result.psychologicalProfile.unconsciousTraits || '分析中...'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Advice Tab */}
          {activeTab === 'advice' && analysis.result.practicalAdvice && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">实用建议</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-800">职业指导</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-blue-700 mb-1">适合领域</h5>
                      <div className="flex flex-wrap gap-2">
                        {analysis.result.practicalAdvice.careerGuidance?.suitableFields?.map((field, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm">{field}</span>
                        )) || <span className="text-blue-700 text-sm">分析中...</span>}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-blue-700 mb-1">工作风格</h5>
                      <p className="text-blue-700 text-sm">{analysis.result.practicalAdvice.careerGuidance?.workStyle || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-blue-700 mb-1">发展路径</h5>
                      <p className="text-blue-700 text-sm">{analysis.result.practicalAdvice.careerGuidance?.developmentPath || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-blue-700 mb-1">行业推荐</h5>
                      <p className="text-blue-700 text-sm">{analysis.result.practicalAdvice.careerGuidance?.industryRecommendations || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-blue-700 mb-1">领导风格</h5>
                      <p className="text-blue-700 text-sm">{analysis.result.practicalAdvice.careerGuidance?.leadershipStyle || '分析中...'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Heart className="w-5 h-5 text-pink-600 mr-2" />
                    <h4 className="font-semibold text-pink-800">人际关系</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-pink-700 mb-1">恋爱风格</h5>
                      <p className="text-pink-700 text-sm">{analysis.result.practicalAdvice.relationshipAdvice?.loveStyle || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-pink-700 mb-1">沟通建议</h5>
                      <p className="text-pink-700 text-sm">{analysis.result.practicalAdvice.relationshipAdvice?.communicationTips || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-pink-700 mb-1">冲突解决</h5>
                      <p className="text-pink-700 text-sm">{analysis.result.practicalAdvice.relationshipAdvice?.conflictResolution || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-pink-700 mb-1">伴侣匹配</h5>
                      <p className="text-pink-700 text-sm">{analysis.result.practicalAdvice.relationshipAdvice?.partnerCompatibility || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-pink-700 mb-1">家庭关系</h5>
                      <p className="text-pink-700 text-sm">{analysis.result.practicalAdvice.relationshipAdvice?.familyRelations || '分析中...'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <BookOpen className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">个人发展</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-1">学习建议</h5>
                      <p className="text-green-700 text-sm">{analysis.result.practicalAdvice.personalDevelopment?.learningRecommendations || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-1">时间管理</h5>
                      <p className="text-green-700 text-sm">{analysis.result.practicalAdvice.personalDevelopment?.timeManagement || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-1">压力管理</h5>
                      <p className="text-green-700 text-sm">{analysis.result.practicalAdvice.personalDevelopment?.stressManagement || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-1">健康建议</h5>
                      <p className="text-green-700 text-sm">{analysis.result.practicalAdvice.personalDevelopment?.healthTips || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-1">情商提升</h5>
                      <p className="text-green-700 text-sm">{analysis.result.practicalAdvice.personalDevelopment?.emotionalIntelligence || '分析中...'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-1">创造力开发</h5>
                      <p className="text-green-700 text-sm">{analysis.result.practicalAdvice.personalDevelopment?.creativityDevelopment || '分析中...'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Target className="w-5 h-5 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-orange-800">行动计划</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-orange-700 mb-1">短期建议</h5>
                      <ul className="text-orange-700 text-sm space-y-1">
                        {analysis.result.practicalAdvice.actionPlan?.shortTerm?.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-3 h-3 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        )) || <li className="text-orange-700">分析中...</li>}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-orange-700 mb-1">长期目标</h5>
                      <ul className="text-orange-700 text-sm space-y-1">
                        {analysis.result.practicalAdvice.actionPlan?.longTerm?.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Star className="w-3 h-3 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        )) || <li className="text-orange-700">分析中...</li>}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-orange-700 mb-1">日常实践</h5>
                      <ul className="text-orange-700 text-sm space-y-1">
                        {analysis.result.practicalAdvice.actionPlan?.dailyPractices?.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Clock className="w-3 h-3 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        )) || <li className="text-orange-700">分析中...</li>}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-orange-700 mb-1">每周目标</h5>
                      <ul className="text-orange-700 text-sm space-y-1">
                        {analysis.result.practicalAdvice.actionPlan?.weeklyGoals?.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Calendar className="w-3 h-3 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        )) || <li className="text-orange-700">分析中...</li>}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-orange-700 mb-1">每月目标</h5>
                      <ul className="text-orange-700 text-sm space-y-1">
                        {analysis.result.practicalAdvice.actionPlan?.monthlyTargets?.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Target className="w-3 h-3 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        )) || <li className="text-orange-700">分析中...</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Life Experiences Tab */}
          {activeTab === 'experiences' && analysis.result.lifeExperiences && (
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-6 text-center ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>人生经历推测</h3>
              <p className={`text-sm text-center mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>基于手相特征推测您可能的人生经历和背景</p>
              
              {/* Life Stages Timeline */}
              {analysis.result.lifeStages && (
                <div className="mb-8">
                  <div className="text-center mb-6">
                    <h4 className={`text-lg font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>人生阶段时间轴</h4>
                    <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-2">
                      <Sparkles className="w-4 h-4 mr-1" />
                      <span>Beta 版本</span>
                    </div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>基于手掌纹路特征推测各人生阶段可能发生的重要事件</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Childhood (0-12) */}
                    <div className={`p-4 rounded-xl border ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-pink-900/20 to-pink-800/20 border-pink-700/30' 
                        : 'bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200'
                    }`}>
                      <div className="flex items-center mb-3">
                        <Baby className={`w-5 h-5 mr-2 ${
                          theme === 'dark' ? 'text-pink-400' : 'text-pink-600'
                        }`} />
                        <h5 className={`font-semibold ${
                          theme === 'dark' ? 'text-pink-300' : 'text-pink-800'
                        }`}>童年期 (0-12岁)</h5>
                      </div>
                      <div className={`leading-relaxed ${
                        theme === 'dark' ? 'text-pink-200' : 'text-pink-700'
                      }`}>
                        <p className="mb-2 text-sm">
                          {analysis.result.lifeStages?.childhood?.personalityDevelopment || 
                          '根据生命线起点的清晰度和深度，推测您的童年时期身体健康状况良好，家庭环境相对稳定。'}
                        </p>
                        {analysis.result.lifeStages?.childhood?.keyEvents && analysis.result.lifeStages.childhood.keyEvents.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium mb-1 text-xs">关键事件：</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {analysis.result.lifeStages.childhood.keyEvents.slice(0, 2).map((event, index) => (
                                <li key={index}>{event}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Adolescence (13-18) */}
                    <div className={`p-4 rounded-xl border ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-blue-900/20 to-blue-800/20 border-blue-700/30' 
                        : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
                    }`}>
                      <div className="flex items-center mb-3">
                        <GraduationCap className={`w-5 h-5 mr-2 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                        <h5 className={`font-semibold ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                        }`}>青少年期 (13-18岁)</h5>
                      </div>
                      <div className={`leading-relaxed ${
                        theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        <p className="mb-2 text-sm">
                          {analysis.result.lifeStages?.adolescence?.personalityDevelopment || 
                          '智慧线的走向和深度反映出您在青少年时期学习能力较强，思维活跃。'}
                        </p>
                        {analysis.result.lifeStages?.adolescence?.keyEvents && analysis.result.lifeStages.adolescence.keyEvents.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium mb-1 text-xs">关键事件：</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {analysis.result.lifeStages.adolescence.keyEvents.slice(0, 2).map((event, index) => (
                                <li key={index}>{event}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Young Adult (19-30) */}
                    <div className={`p-4 rounded-xl border ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-700/30' 
                        : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                    }`}>
                      <div className="flex items-center mb-3">
                        <BriefcaseIcon className={`w-5 h-5 mr-2 ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`} />
                        <h5 className={`font-semibold ${
                          theme === 'dark' ? 'text-green-300' : 'text-green-800'
                        }`}>青年期 (19-30岁)</h5>
                      </div>
                      <div className={`leading-relaxed ${
                        theme === 'dark' ? 'text-green-200' : 'text-green-700'
                      }`}>
                        <p className="mb-2 text-sm">
                          {analysis.result.lifeStages?.youngAdult?.personalityDevelopment || 
                          '事业线的起始位置和走向显示您在青年时期开始建立自己的职业道路。'}
                        </p>
                        {analysis.result.lifeStages?.youngAdult?.keyEvents && analysis.result.lifeStages.youngAdult.keyEvents.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium mb-1 text-xs">关键事件：</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {analysis.result.lifeStages.youngAdult.keyEvents.slice(0, 2).map((event, index) => (
                                <li key={index}>{event}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle Age (31-50) */}
                    <div className={`p-4 rounded-xl border ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-purple-900/20 to-purple-800/20 border-purple-700/30' 
                        : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
                    }`}>
                      <div className="flex items-center mb-3">
                        <Users className={`w-5 h-5 mr-2 ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        <h5 className={`font-semibold ${
                          theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
                        }`}>中年期 (31-50岁)</h5>
                      </div>
                      <div className={`leading-relaxed ${
                        theme === 'dark' ? 'text-purple-200' : 'text-purple-700'
                      }`}>
                        <p className="mb-2 text-sm">
                          {analysis.result.lifeStages?.middleAge?.personalityDevelopment || 
                          '生命线中段的特征显示您在中年时期生活相对稳定，可能在事业上达到了一定高度。'}
                        </p>
                        {analysis.result.lifeStages?.middleAge?.keyEvents && analysis.result.lifeStages.middleAge.keyEvents.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium mb-1 text-xs">关键事件：</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {analysis.result.lifeStages.middleAge.keyEvents.slice(0, 2).map((event, index) => (
                                <li key={index}>{event}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mature Age (51+) */}
                    <div className={`p-4 rounded-xl border ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-amber-900/20 to-amber-800/20 border-amber-700/30' 
                        : 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
                    }`}>
                      <div className="flex items-center mb-3">
                        <Home className={`w-5 h-5 mr-2 ${
                          theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                        }`} />
                        <h5 className={`font-semibold ${
                          theme === 'dark' ? 'text-amber-300' : 'text-amber-800'
                        }`}>成熟期 (51岁以后)</h5>
                      </div>
                      <div className={`leading-relaxed ${
                        theme === 'dark' ? 'text-amber-200' : 'text-amber-700'
                      }`}>
                        <p className="mb-2 text-sm">
                          {analysis.result.lifeStages?.matureAge?.personalityDevelopment || 
                          '生命线末端的走向预示着您在成熟期将享受相对平静的生活。'}
                        </p>
                        {analysis.result.lifeStages?.matureAge?.keyEvents && analysis.result.lifeStages.matureAge.keyEvents.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium mb-1 text-xs">关键事件：</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {analysis.result.lifeStages.matureAge.keyEvents.slice(0, 2).map((event, index) => (
                                <li key={index}>{event}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-6 p-4 rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-700/30' 
                      : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      <Shield className={`w-4 h-4 mr-2 ${
                        theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                      }`} />
                      <h5 className={`font-medium text-sm ${
                        theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                      }`}>人生阶段推测说明</h5>
                    </div>
                    <p className={`text-xs leading-relaxed ${
                      theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
                    }`}>
                      此功能为Beta测试版本，人生阶段事件推测基于传统手相学理论和统计学分析，结合手掌纹路、线条深浅、手型特征等多维度信息进行推测。
                      请注意这些推测具有很强的主观性和不确定性，仅供娱乐和自我反思参考。
                    </p>
                  </div>
                </div>
              )}
              
              {/* Life Experiences Cards */}
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h4 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}>人生经历详情</h4>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-800">职业经历</h4>
                  </div>
                  <p className="text-blue-700 leading-relaxed">{analysis.result.lifeExperiences.careerHistory || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <BookOpen className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">教育背景</h4>
                  </div>
                  <p className="text-green-700 leading-relaxed">{analysis.result.lifeExperiences.educationalBackground || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-purple-800">重大事件</h4>
                  </div>
                  <p className="text-purple-700 leading-relaxed">{analysis.result.lifeExperiences.majorLifeEvents || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Star className="w-5 h-5 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-orange-800">兴趣爱好</h4>
                  </div>
                  <p className="text-orange-700 leading-relaxed">{analysis.result.lifeExperiences.hobbiesAndInterests || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-teal-600 mr-2" />
                    <h4 className="font-semibold text-teal-800">旅行经历</h4>
                  </div>
                  <p className="text-teal-700 leading-relaxed">{analysis.result.lifeExperiences.travelExperiences || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Heart className="w-5 h-5 text-pink-600 mr-2" />
                    <h4 className="font-semibold text-pink-800">感情经历</h4>
                  </div>
                  <p className="text-pink-700 leading-relaxed">{analysis.result.lifeExperiences.relationshipHistory || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Activity className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-semibold text-red-800">健康挑战</h4>
                  </div>
                  <p className="text-red-700 leading-relaxed">{analysis.result.lifeExperiences.healthChallenges || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
                    <h4 className="font-semibold text-indigo-800">个人成长</h4>
                  </div>
                  <p className="text-indigo-700 leading-relaxed">{analysis.result.lifeExperiences.personalGrowth || '分析中...'}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                  <div className="flex items-center mb-3">
                    <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="font-semibold text-yellow-800">推测说明</h4>
                  </div>
                  <p className="text-yellow-700 leading-relaxed text-sm">
                    以上人生经历推测基于传统手相学理论和现代心理学研究，通过分析手掌纹理、线条特征、手型结构等信息进行合理推测。
                    这些推测仅供参考和娱乐，不应作为绝对准确的人生判断依据。每个人的人生轨迹都是独特的，最终由个人选择和努力决定。
                  </p>
                </div>
              </div>
            </div>
          )}


        </div>

        {/* Actions */}
        <div className={`p-6 border-t ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex space-x-4">
            <Link
              to="/camera"
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>重新分析</span>
            </Link>
            <Link
              to="/history"
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold transition-all ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>查看历史</span>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className={`p-6 border-t ${
          theme === 'dark' 
            ? 'bg-yellow-900/20 border-yellow-700/30' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`text-sm text-center leading-relaxed ${
            theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
          }`}>
            <strong>免责声明：</strong>本分析结果基于传统手相学理论，仅供娱乐参考。
            每个人的命运掌握在自己手中，请理性对待分析结果。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Result;