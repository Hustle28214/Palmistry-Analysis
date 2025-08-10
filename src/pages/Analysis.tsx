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
    // 动态生成更多样化的手型和特征
    const handTypeVariations = [
      { type: '方形手', traits: ['理性务实', '逻辑思维强', '组织能力出色', '责任心重', '执行力强'] },
      { type: '长方形手', traits: ['感性细腻', '艺术天赋', '直觉敏锐', '创造力丰富', '情感深度'] },
      { type: '圆锥形手', traits: ['灵活变通', '适应性强', '沟通技巧好', '社交活跃', '思维敏捷'] },
      { type: '尖形手', traits: ['敏感细致', '洞察力强', '想象力丰富', '精神追求高', '审美能力强'] },
      { type: '混合型手', traits: ['平衡发展', '多元能力', '适应性广', '综合素质高', '潜力巨大'] }
    ];
    
    const lifeLineVariations = [
      '生命线深长清晰，弧度优美，表示体质强健，生命力旺盛，人生轨迹稳定向上。',
      '生命线起点饱满，延伸流畅，显示精力充沛，抗压能力强，健康状况良好。',
      '生命线纹路清晰，走向稳定，预示身心健康，生活规律，长寿的征象明显。',
      '生命线形态良好，深度适中，表明生命活力充足，免疫力强，很少生病。'
    ];
    
    const heartLineVariations = [
      '感情线弯曲向上，线条流畅，表示情感丰富，表达能力强，在感情中比较主动积极。',
      '感情线深而清晰，走向稳定，显示感情专一，对爱情忠诚，重视精神层面的交流。',
      '感情线起点清晰，终点明确，预示感情生活和谐，善于处理人际关系，共情能力强。',
      '感情线纹理细腻，分支适度，表明情感细腻，善解人意，是理想的人生伴侣。'
    ];
    
    const headLineVariations = [
      '智慧线笔直清晰，长度适中，显示逻辑思维能力强，分析判断准确，决策果断。',
      '智慧线深而稳定，走向良好，表明学习能力出色，知识面广，善于创新思考。',
      '智慧线形态优美，纹路清晰，预示思维敏捷，理解力强，具有很好的洞察力。',
      '智慧线起点饱满，延伸自然，显示智力水平高，创造力强，善于解决复杂问题。'
    ];
    
    const fortuneVariations = [
      '整体运势呈稳步上升趋势，近期财运亨通，事业发展顺利，建议积极把握机遇。',
      '综合运势良好，各方面发展均衡，中年后运势特别旺盛，是大器晚成的类型。',
      '运势波动中有上升，贵人运强，容易得到他人帮助，适合团队合作发展。',
      '整体运势稳中有进，虽然发展较为平稳，但持续性强，是细水长流的好运势。'
    ];
    
    const healthVariations = [
      '身体状况整体良好，体质较强，但需注意工作与休息的平衡，避免过度疲劳。',
      '健康运势不错，免疫力强，很少生病，建议保持规律作息，适度运动。',
      '体质偏向健康，精力充沛，但要注意情绪管理，避免压力过大影响身心健康。',
      '身体机能良好，恢复能力强，建议注重预防保健，保持良好的生活习惯。'
    ];
    
    const careerVariations = [
      '事业发展前景广阔，适合从事管理、咨询、教育等需要综合能力的工作。',
      '职业运势稳定上升，有领导潜质，适合在团队中发挥组织协调作用。',
      '事业线清晰，发展路径明确，适合从事创意、技术、服务等专业性工作。',
      '工作能力强，适应性好，适合在变化较大的环境中发展，有创业潜质。'
    ];
    
    const loveVariations = [
      '感情运势温和上升，单身者有望遇到合适对象，已有伴侣的关系将更加稳固。',
      '爱情运势良好，感情生活和谐，善于经营关系，是值得信赖的人生伴侣。',
      '感情发展顺利，桃花运不错，但要注意选择合适的对象，重视精神契合。',
      '情感运势稳定，对感情认真负责，一旦确定关系会全心投入，婚姻生活幸福。'
    ];
    
    // 随机选择各种变化
    const selectedHandType = handTypeVariations[Math.floor(Math.random() * handTypeVariations.length)];
    const selectedPersonalities = selectedHandType.traits.slice(0, 3 + Math.floor(Math.random() * 3));
    
    return {
      id: Date.now().toString(),
      imageUrl: imageUrl,
      timestamp: Date.now(),
      result: {
        handType: selectedHandType.type,
        lifeLine: lifeLineVariations[Math.floor(Math.random() * lifeLineVariations.length)],
        heartLine: heartLineVariations[Math.floor(Math.random() * heartLineVariations.length)],
        headLine: headLineVariations[Math.floor(Math.random() * headLineVariations.length)],
        personality: selectedPersonalities,
        fortune: fortuneVariations[Math.floor(Math.random() * fortuneVariations.length)],
        health: healthVariations[Math.floor(Math.random() * healthVariations.length)],
        career: careerVariations[Math.floor(Math.random() * careerVariations.length)],
        love: loveVariations[Math.floor(Math.random() * loveVariations.length)]
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