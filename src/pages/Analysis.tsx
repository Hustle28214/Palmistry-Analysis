import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PalmAnalysis } from '../store/useStore';
import { analyzePalmImage, preprocessImage, validateAnalysisResult } from '../api/palmAnalysis';
import { toast } from 'sonner';

const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const { currentImage, setAnalyzing, addAnalysis } = useStore();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const analysisSteps = [
    { label: '图像预处理', description: '优化图像质量，增强手部轮廓' },
    { label: '特征识别', description: '识别生命线、智慧线、感情线' },
    { label: '手型分析', description: '分析手型特征和手指比例' },
    { label: 'AI解读', description: '生成个性化手相分析报告' },
    { label: '完成分析', description: '分析结果已生成' }
  ];

  // 调用图像处理大模型API进行手相分析
  const analyzeHandImage = async (imageUrl: string): Promise<PalmAnalysis> => {
    try {
      // 预处理图像
      const processedImage = preprocessImage(imageUrl);
      
      // 调用API进行分析
      const apiResult = await analyzePalmImage(processedImage);
      
      // 验证结果完整性
      const validatedResult = validateAnalysisResult(apiResult);
      
      return {
        id: Date.now().toString(),
        imageUrl: imageUrl,
        timestamp: Date.now(),
        result: validatedResult
      };
    } catch (error) {
      console.error('手相分析API调用失败:', error);
      toast.error(`分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
      // 如果API调用失败，返回模拟数据作为备选方案
      return generateFallbackAnalysis(imageUrl);
    }
  };

  // 备选方案：生成模拟分析结果
  const generateFallbackAnalysis = (imageUrl: string): PalmAnalysis => {
    const handTypes = ['方形手', '长方形手', '圆锥形手', '尖形手'];
    const personalities = ['理性思维', '创造力强', '情感丰富', '直觉敏锐', '领导能力'];
    
    return {
      id: Date.now().toString(),
      imageUrl: imageUrl,
      timestamp: Date.now(),
      result: {
        handType: handTypes[Math.floor(Math.random() * handTypes.length)],
        lifeLine: '您的生命线清晰深长，表示身体健康，生命力旺盛。线条稳定，预示着稳定的生活状态。',
        heartLine: '感情线弯曲向上，表示您是一个感情丰富、善于表达的人，在感情方面比较主动。',
        headLine: '智慧线长度适中且清晰，显示您思维敏捷，分析能力强，善于解决问题。',
        personality: personalities.slice(0, 3),
        fortune: '整体运势呈上升趋势，近期会有不错的机遇出现，建议把握时机。',
        health: '身体状况良好，但需要注意休息，避免过度劳累。建议保持规律的作息时间。',
        career: '事业发展稳定，有贵人相助。适合从事需要创造力和沟通能力的工作。',
        love: '感情运势不错，单身者有机会遇到心仪对象，已有伴侣的关系会更加稳定。'
      }
    };
  };

  useEffect(() => {
    if (!currentImage) {
      navigate('/camera');
      return;
    }

    setAnalyzing(true);

    // 执行分析的异步函数
    const performAnalysis = async () => {
      try {
        const analysis = await analyzeHandImage(currentImage);
        addAnalysis(analysis);
        toast.success('手相分析完成！');
        
        // Navigate to result page after a short delay
        setTimeout(() => {
          navigate(`/result/${analysis.id}`);
        }, 1500);
      } catch (error) {
        console.error('分析失败:', error);
        const fallbackAnalysis = generateFallbackAnalysis(currentImage);
        addAnalysis(fallbackAnalysis);
        toast.warning('使用离线模式完成分析');
        
        // Navigate to result page after a short delay
        setTimeout(() => {
          navigate(`/result/${fallbackAnalysis.id}`);
        }, 1500);
      }
    };

    let currentStepRef = 0;

    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5;
        
        // Update current step based on progress
        if (newProgress >= 20 && currentStepRef < 1) {
          currentStepRef = 1;
          setCurrentStep(1);
        } else if (newProgress >= 40 && currentStepRef < 2) {
          currentStepRef = 2;
          setCurrentStep(2);
        } else if (newProgress >= 60 && currentStepRef < 3) {
          currentStepRef = 3;
          setCurrentStep(3);
        } else if (newProgress >= 80 && currentStepRef < 4) {
          currentStepRef = 4;
          setCurrentStep(4);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setAnalysisComplete(true);
          setAnalyzing(false);
          
          // 执行分析
          performAnalysis();
          
          return 100;
        }
        
        return newProgress;
      });
    }, 800);

    return () => {
      clearInterval(interval);
      setAnalyzing(false);
    };
  }, [currentImage, navigate, setAnalyzing, addAnalysis]);

  if (!currentImage) {
    return null;
  }

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white">
          <button
            onClick={() => navigate('/camera')}
            className="p-2 rounded-full hover:bg-blue-800 transition-colors"
            disabled={!analysisComplete}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">AI分析中</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Captured Image */}
        <div className="mx-4 mb-6">
          <div className="relative aspect-square bg-black rounded-2xl overflow-hidden">
            <img
              src={currentImage}
              alt="Hand to analyze"
              className="w-full h-full object-cover"
            />
            {!analysisComplete && (
              <div className="absolute inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">AI正在分析中...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="mx-4 mb-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">分析进度</span>
              <span className="text-yellow-400 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-blue-800 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Analysis Steps */}
          <div className="space-y-4">
            {analysisSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep || analysisComplete;
              const isCurrent = index === currentStep && !analysisComplete;
              
              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                    isActive || isCompleted
                      ? 'bg-blue-800 bg-opacity-50'
                      : 'bg-blue-900 bg-opacity-30'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : isCurrent ? (
                      <div className="w-5 h-5 border-2 border-yellow-400 rounded-full animate-spin border-t-transparent"></div>
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      isCompleted ? 'text-green-400' : 
                      isCurrent ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      isActive || isCompleted ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        <div className="mx-4 mb-6 p-4 bg-blue-800 bg-opacity-50 rounded-xl text-center">
          {analysisComplete ? (
            <div className="text-green-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">分析完成！</p>
              <p className="text-sm text-blue-100 mt-1">正在跳转到结果页面...</p>
            </div>
          ) : (
            <div className="text-white">
              <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p className="font-semibold">AI正在深度分析您的手相</p>
              <p className="text-sm text-blue-100 mt-1">
                预计还需 {Math.max(1, Math.ceil((100 - progress) / 20))} 秒
              </p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mx-4 p-4 bg-yellow-400 bg-opacity-10 rounded-xl">
          <h3 className="text-yellow-400 font-semibold mb-2">分析提示：</h3>
          <ul className="text-yellow-100 text-sm space-y-1">
            <li>• 我们的AI模型基于传统手相学理论</li>
            <li>• 分析结果仅供娱乐参考</li>
            <li>• 每个人的命运掌握在自己手中</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analysis;