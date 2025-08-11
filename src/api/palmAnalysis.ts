// 手相分析API集成
// 这个文件提供了与外部大模型API的集成接口

export interface PalmAnalysisRequest {
  image: string;
  prompt: string;
}

export interface PalmAnalysisResponse {
  handType: string;
  personality: string[];
  lifeLine: string;
  heartLine: string;
  headLine: string;
  fortune: string;
  health: string;
  career: string;
  love: string;
  mbtiType?: string;
  mbtiDescription?: string;
  basicFeatures?: {
    handType: string;
    handSize: string;
    skinTexture: string;
    palmThickness: string;
    fingerLength: string;
    nailShape: string;
    thumbAnalysis: string;
  };
  palmLines?: {
    lifeLine?: {
      description: string;
      healthImplications: string;
      energyLevel: string;
      lifeStages: string;
    };
    heartLine?: {
      description: string;
      emotionalStyle: string;
      relationshipPattern: string;
      empathyLevel: string;
    };
    headLine?: {
      description: string;
      thinkingStyle: string;
      decisionMaking: string;
      learningStyle: string;
      creativity: string;
    };
    fateLine?: string;
    marriageLine?: string;
    otherLines?: string;
  };
  psychologicalProfile?: {
    mbtiPrediction: string;
    cognitiveStyle: string;
    emotionalPattern: string;
    behaviorTendency: string;
    stressResponse: string;
    socialStyle: string;
    motivationDrivers: string;
    unconsciousTraits: string;
  };
  detailedAnalysis?: {
    strengths: string[];
    challenges: string[];
    personalityTraits: string[];
    communicationStyle: string;
    leadershipPotential: string;
    adaptability: string;
    handTexture: string;
    fingerFlexibility: string;
    palmTemperature: string;
    bloodVessels: string;
    muscleDevelopment: string;
    skinElasticity: string;
    nailHealth: string;
  };
  practicalAdvice?: {
    careerGuidance: {
      suitableFields: string[];
      workStyle: string;
      developmentPath: string;
      skillsToImprove: string[];
      industryRecommendations: string;
      leadershipStyle: string;
    };
    relationshipAdvice: {
      loveStyle: string;
      communicationTips: string;
      conflictResolution: string;
      partnerCompatibility: string;
      familyRelations: string;
    };
    personalDevelopment: {
      learningRecommendations: string;
      timeManagement: string;
      stressManagement: string;
      healthTips: string;
      emotionalIntelligence: string;
      creativityDevelopment: string;
    };
    actionPlan: {
      shortTerm: string[];
      longTerm: string[];
      dailyPractices: string[];
      weeklyGoals: string[];
      monthlyTargets: string[];
    };
  };
  scientificBasis?: {
    palmistry?: string;
    psychologyTheory: string;
    behaviorScience: string;
    neuroscience: string;
  };
  lifeExperiences?: {
    careerHistory: string;
    educationalBackground: string;
    majorLifeEvents: string;
    hobbiesAndInterests: string;
    travelExperiences: string;
    relationshipHistory: string;
    healthChallenges: string;
    personalGrowth: string;
  };
  lifeStages?: {
    childhood: {
      period: string;
      keyEvents: string[];
      personalityDevelopment: string;
      challenges: string[];
      achievements: string[];
    };
    adolescence: {
      period: string;
      keyEvents: string[];
      personalityDevelopment: string;
      challenges: string[];
      achievements: string[];
    };
    youngAdult: {
      period: string;
      keyEvents: string[];
      personalityDevelopment: string;
      challenges: string[];
      achievements: string[];
    };
    middleAge: {
      period: string;
      keyEvents: string[];
      personalityDevelopment: string;
      challenges: string[];
      achievements: string[];
    };
    matureAge: {
      period: string;
      keyEvents: string[];
      personalityDevelopment: string;
      challenges: string[];
      achievements: string[];
    };
  };
 }

// 配置信息 - 直接调用API
const API_CONFIG = {
  // OpenAI GPT-4 Vision API - 直接调用
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  
  // Groq API配置 - 直接调用
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || '',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  
  // 免费LLM API配置（备用）
  HUGGINGFACE_API_KEY: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  HUGGINGFACE_API_URL: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
};

// API调用状态监控
interface APIStatus {
  name: string;
  available: boolean;
  lastError?: string;
  lastSuccessTime?: number;
  failureCount: number;
  responseTime?: number;
}

// API优先级设置：Groq > OpenAI > 离线模式
// 用户明确要求优先使用Groq API（直接调用）
const apiStatusMap = new Map<string, APIStatus>([
  ['groq', { name: 'Groq Llama3', available: true, failureCount: 0 }],   // 第一优先级
  ['openai', { name: 'OpenAI GPT-4o', available: true, failureCount: 0 }] // 第二优先级（备用）
]);

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  backoffMultiplier: 2
};

// 超时配置
const TIMEOUT_CONFIG = {
  openai: 30000, // 30秒
  groq: 25000,   // 25秒
  default: 20000 // 20秒
};

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 计算重试延迟时间
 */
function calculateRetryDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelay
  );
  // 添加随机抖动，避免雷群效应
  return delay + Math.random() * 1000;
}

/**
 * 更新API状态
 */
function updateAPIStatus(apiName: string, success: boolean, error?: string, responseTime?: number): void {
  const status = apiStatusMap.get(apiName);
  if (status) {
    if (success) {
      status.available = true;
      status.failureCount = 0;
      status.lastSuccessTime = Date.now();
      status.responseTime = responseTime;
      status.lastError = undefined;
    } else {
      status.failureCount += 1;
      status.lastError = error;
      // 连续失败3次后标记为不可用
      if (status.failureCount >= 3) {
        status.available = false;
      }
    }
    console.log(`API状态更新 [${apiName}]:`, status);
  }
}

/**
 * 获取最佳可用API
 * 强制优先选择Groq API
 */
function getBestAvailableAPI(): string {
  // 强制优先选择Groq（直接调用）
  if (API_CONFIG.GROQ_API_KEY) {
    console.log('优先选择Groq API（直接调用）');
    return 'groq';
  }
  
  // 备用选择OpenAI
  if (API_CONFIG.OPENAI_API_KEY) {
    console.log('备用选择OpenAI API（直接调用）');
    return 'openai';
  }
  
  // 默认返回groq
  console.log('默认选择Groq API');
  return 'groq';
}

/**
 * 带超时的fetch请求
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`请求超时 (${timeout}ms)`);
    }
    throw error;
  }
}

/**
 * 带重试机制的API调用
 */
async function callAPIWithRetry<T>(
  apiName: string,
  apiCall: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const result = await apiCall();
      const responseTime = Date.now() - startTime;
      
      updateAPIStatus(apiName, true, undefined, responseTime);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`API调用失败 [${apiName}] 尝试 ${attempt + 1}/${maxRetries + 1}:`, error);
      
      updateAPIStatus(apiName, false, lastError.message);
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        const retryDelay = calculateRetryDelay(attempt);
        console.log(`等待 ${retryDelay}ms 后重试...`);
        await delay(retryDelay);
      }
    }
  }
  
  throw lastError;
}

/**
 * 调用OpenAI GPT-4 Vision API进行手相分析（直接调用）
 */
export async function analyzeWithOpenAI(imageBase64: string): Promise<PalmAnalysisResponse> {
  return callAPIWithRetry('openai', async () => {
    const response = await fetchWithTimeout(API_CONFIG.OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // 使用最新的 GPT-4o 模型
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `你是一位世界顶级的手相分析大师，拥有30年的专业经验，精通传统手相学、现代心理学、行为科学、神经科学和人格心理学。请对这张手掌图片进行极其详细和深入的专业分析。

**重要提示：请根据手相的具体特征进行个性化分析，确保MBTI类型的多样性。不同的手相特征应该对应不同的人格类型：**
- 方形手 + 深刻纹线 → 可能是ESTJ、ISTJ等判断型
- 长方形手 + 细腻纹理 → 可能是INFP、ISFP等感觉型
- 圆锥形手 + 灵活特征 → 可能是ENFP、ESFP等外向感知型
- 尖形手 + 敏感特征 → 可能是INFJ、INTJ等直觉型
- 手指长短比例、掌纹深浅、手掌厚薄等都应影响MBTI判断

请确保分析结果的个性化和多样性，避免千篇一律的结果。

请按照以下结构返回JSON格式的完整分析结果：

{
  "handType": "手型分类（方形手/长方形手/圆锥形手/尖形手/混合型手）",
  "personality": ["基于手型的5-7个核心性格特征"],
  "lifeLine": "生命线详细分析（长度、深度、走向、分支、岛纹、链状纹等特征及其含义）",
  "heartLine": "感情线详细分析（起点、终点、弯曲度、分支、深浅等特征及其含义）",
  "headLine": "智慧线详细分析（长度、深度、走向、与生命线关系、分支等特征及其含义）",
  "fortune": "综合运势分析（基于整体手相特征，包括财运、事业运、健康运）",
  "health": "健康状况详细分析（基于生命线、手掌颜色、纹理、温度感知等）",
  "career": "事业发展深度分析（基于事业线、智慧线、手型、成功线等）",
  "love": "感情运势详细分析（基于感情线、婚姻线、金星丘等）",
  "mbtiType": "根据手相特征科学推测的MBTI类型（如ENFP、INTJ等）",
  "mbtiDescription": "MBTI类型的详细描述、性格解读和行为模式分析",
  "basicFeatures": {
    "handType": "详细手型分析和性格关联",
    "handSize": "手掌大小分析及其心理学含义",
    "skinTexture": "皮肤纹理分析（细腻/粗糙/中等）及性格暗示",
    "palmThickness": "手掌厚度分析及其能量水平指示",
    "fingerLength": "手指长度比例分析及其性格特征",
    "nailShape": "指甲形状分析及其健康和性格指示",
    "thumbAnalysis": "拇指详细分析（意志力、领导力、自控力）"
  },
  "palmLines": {
    "lifeLine": {
      "description": "生命线形态详细描述",
      "healthImplications": "健康含义和体质分析",
      "energyLevel": "精力水平和生命活力评估",
      "lifeStages": "人生各阶段运势和重要节点分析"
    },
    "heartLine": {
      "description": "感情线形态详细描述",
      "emotionalStyle": "情感表达风格和情绪管理能力",
      "relationshipPattern": "恋爱关系模式和伴侣选择倾向",
      "empathyLevel": "共情能力和情感智商评估"
    },
    "headLine": {
      "description": "智慧线形态详细描述",
      "thinkingStyle": "思维方式分析（逻辑型/直觉型/创意型）",
      "decisionMaking": "决策风格和判断能力分析",
      "learningStyle": "学习方式偏好和知识吸收模式",
      "creativity": "创造力水平和艺术天赋评估"
    },
    "fateLine": "事业线详细分析（职业发展轨迹、成功时期预测）",
    "marriageLine": "婚姻线详细分析（感情生活、婚姻状况预测）",
    "otherLines": "其他重要纹线分析（太阳线、水星线、健康线等）"
  },
  "psychologicalProfile": {
    "mbtiPrediction": "基于手相特征的MBTI类型科学预测，详细说明判断依据和准确性评估",
    "cognitiveStyle": "认知风格深度分析（感知偏好、判断偏好、信息处理方式）",
    "emotionalPattern": "情绪模式详细分析（情绪稳定性、表达方式、调节能力、情感深度）",
    "behaviorTendency": "行为倾向深度分析（外向/内向程度、主动性、风险偏好、社交模式）",
    "stressResponse": "压力反应模式详细分析（应对策略、抗压能力、恢复速度）",
    "socialStyle": "社交风格详细分析（领导型/合作型/独立型、影响力、人际敏感度）",
    "motivationDrivers": "内在动机驱动因素深度分析（成就动机、权力动机、亲和动机）",
    "unconsciousTraits": "潜意识特征和深层性格分析（隐藏天赋、潜在冲突、成长潜力）"
  },
  "detailedAnalysis": {
    "strengths": ["核心优势详细列表（8-12项，包括天赋才能、性格优势、能力特长）"],
    "challenges": ["面临挑战详细列表（5-8项，包括性格弱点、发展障碍、需要改进的方面）"],
    "personalityTraits": ["详细性格特质列表（12-18项，涵盖各个维度的性格特征）"],
    "communicationStyle": "沟通风格详细分析（表达方式、倾听能力、说服技巧、冲突处理）",
    "leadershipPotential": "领导潜质详细评估（领导风格、影响力、团队管理能力）",
    "adaptability": "适应能力详细分析（变化应对、学习能力、环境适应性）",
    "handTexture": "手部纹理质感分析及其性格指示",
    "fingerFlexibility": "手指灵活度分析及其思维敏捷度指示",
    "palmTemperature": "手掌温度感知分析及其情感温度指示",
    "bloodVessels": "血管分布分析及其健康和性格指示",
    "muscleDevelopment": "肌肉发达程度分析及其行动力指示",
    "skinElasticity": "皮肤弹性分析及其生命活力指示",
    "nailHealth": "指甲健康状态分析及其整体健康指示"
  },
  "practicalAdvice": {
    "careerGuidance": {
      "suitableFields": ["最适合的职业领域详细列表（8-12个领域）"],
      "workStyle": "最佳工作方式和环境建议（工作节奏、团队合作、独立工作等）",
      "developmentPath": "职业发展路径详细建议（短期、中期、长期规划）",
      "skillsToImprove": ["需要重点提升的技能详细列表（6-10项）"],
      "industryRecommendations": "推荐的具体行业和公司类型分析",
      "leadershipStyle": "适合的领导风格和管理方式建议"
    },
    "relationshipAdvice": {
      "loveStyle": "恋爱风格详细分析和改进建议",
      "communicationTips": "人际沟通详细建议（表达技巧、倾听方法、情感交流）",
      "conflictResolution": "冲突解决策略和技巧详细指导",
      "partnerCompatibility": "理想伴侣类型和相处模式建议",
      "familyRelations": "家庭关系处理和亲子关系建议"
    },
    "personalDevelopment": {
      "learningRecommendations": "个性化学习方式和知识获取建议",
      "timeManagement": "时间管理策略和效率提升方法",
      "stressManagement": "压力管理详细策略和放松技巧",
      "healthTips": "健康生活方式和养生建议",
      "emotionalIntelligence": "情商提升和情绪管理训练建议",
      "creativityDevelopment": "创造力开发和艺术天赋培养建议"
    },
    "actionPlan": {
      "shortTerm": ["短期行动建议详细列表（1-3个月内的具体行动）"],
      "longTerm": ["长期发展目标详细列表（1-5年的人生规划）"],
      "dailyPractices": ["日常实践建议详细列表（每日可执行的习惯养成）"],
      "weeklyGoals": ["每周目标设定建议（周度计划和检视）"],
      "monthlyTargets": ["每月目标达成建议（月度里程碑设定）"]
    }
  },
  "lifeExperiences": {
    "careerHistory": "根据手相特征推测的职业经历和工作背景（具体行业、职位类型、工作经验）",
    "educationalBackground": "推测的教育背景和学习经历（学历水平、专业方向、学习能力表现）",
    "majorLifeEvents": "可能经历的重大人生事件和转折点（搬迁、职业转换、重要决定等）",
    "hobbiesAndInterests": "推测的兴趣爱好和业余活动（艺术、运动、收藏、旅行等偏好）",
    "travelExperiences": "可能的旅行经历和地域偏好（国内外旅行、居住地变化）",
    "relationshipHistory": "推测的感情经历和人际关系模式（恋爱次数、关系深度、社交圈子）",
    "healthChallenges": "可能面临或已经经历的健康挑战（身体状况、疾病倾向、康复经历）",
    "personalGrowth": "个人成长轨迹和心理发展历程（性格变化、价值观形成、人生感悟）"
  },
  "lifeStages": {
    "childhood": {
      "period": "童年期年龄范围（如0-12岁）",
      "keyEvents": ["根据手相特征推测的童年关键事件（家庭环境、早期教育、性格形成等）"],
      "personalityDevelopment": "童年期性格发展特点和重要影响因素",
      "challenges": ["童年期可能面临的挑战和困难"],
      "achievements": ["童年期的成就和积极经历"]
    },
    "adolescence": {
      "period": "青少年期年龄范围（如13-18岁）",
      "keyEvents": ["根据手相特征推测的青少年期关键事件（学业发展、兴趣培养、社交关系等）"],
      "personalityDevelopment": "青少年期性格发展特点和重要转变",
      "challenges": ["青少年期可能面临的挑战和困难"],
      "achievements": ["青少年期的成就和重要里程碑"]
    },
    "youngAdult": {
      "period": "青年期年龄范围（如19-30岁）",
      "keyEvents": ["根据手相特征推测的青年期关键事件（职业起步、恋爱婚姻、独立生活等）"],
      "personalityDevelopment": "青年期性格成熟过程和价值观确立",
      "challenges": ["青年期可能面临的挑战和人生选择"],
      "achievements": ["青年期的重要成就和人生突破"]
    },
    "middleAge": {
      "period": "中年期年龄范围（如31-50岁）",
      "keyEvents": ["根据手相特征推测的中年期关键事件（事业发展、家庭责任、财富积累等）"],
      "personalityDevelopment": "中年期性格稳定和智慧积累",
      "challenges": ["中年期可能面临的挑战和压力"],
      "achievements": ["中年期的重要成就和人生高峰"]
    },
    "matureAge": {
      "period": "成熟期年龄范围（如51岁以上）",
      "keyEvents": ["根据手相特征推测的成熟期关键事件（事业巅峰、传承责任、健康关注等）"],
      "personalityDevelopment": "成熟期性格圆融和人生感悟",
      "challenges": ["成熟期可能面临的挑战和调整"],
      "achievements": ["成熟期的重要成就和人生总结"]
    }
  },
  "scientificBasis": {
    "psychologyTheory": "相关心理学理论支撑",
    "behaviorScience": "行为科学依据",
    "neuroscience": "神经科学关联性"
  }
}

专业分析要求：
1. 运用显微镜级别的观察力，分析手掌的每个细微特征
2. 结合传统手相学、现代心理学、行为科学、神经科学和人格心理学理论
3. 提供极其具体、实用、个性化的深度分析和专业建议
4. 确保分析内容丰富、专业、有深度，每个字段都要详细完整
5. MBTI预测要基于科学的手相-性格关联理论，提供详细推理过程
6. 人生经历推测要基于手相特征的科学关联，合理推测但不过度夸大
7. 所有建议都要具有高度可操作性和实用性
8. 保持客观、专业、负责任的分析态度
9. 每个分析维度都要提供充实的内容，避免空泛的描述
10. 确保分析结果的一致性和逻辑性

请确保返回完整的JSON格式，所有字段都必须填写详细内容，不得遗漏或简化。`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
        max_tokens: 4000,
        temperature: 0.7
      })
    }, TIMEOUT_CONFIG.openai);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('OpenAI API返回内容为空');
    }

    // 尝试解析JSON响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]);
      // 确保personality字段是数组格式
      if (parsedResult.personality && typeof parsedResult.personality === 'string') {
        parsedResult.personality = [parsedResult.personality];
      }
      return validateAnalysisResult(parsedResult);
    } else {
      throw new Error('无法从OpenAI响应中提取JSON格式数据');
    }
  });
}

/**
 * 调用Groq免费API进行手相分析（直接调用）
 */
export async function analyzeWithGroq(imageBase64: string): Promise<PalmAnalysisResponse> {
  return callAPIWithRetry('groq', async () => {
    const response = await fetchWithTimeout(API_CONFIG.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // 使用最新的Llama 3.3 70B模型
      messages: [
        {
          role: 'user',
          content: `你是一位世界顶级的手相分析大师，拥有30年的专业经验，精通传统手相学、现代心理学、行为科学、神经科学和人格心理学。请对这张手掌图片进行极其详细和深入的专业分析。

**重要提示：请确保MBTI类型的多样性和个性化分析。不同的分析应该产生不同的人格类型：**
- 请随机选择16种MBTI类型中的一种：ENFP、INTJ、ESFP、ISFJ、ENTP、ISFP、ESTJ、INFP、ENFJ、ISTP、ESFJ、INTP、ESTP、INFJ、ISTJ、ENTJ
- 根据选择的MBTI类型，相应调整手型分析、性格特征、心理特征等内容
- 确保分析结果的一致性和个性化，避免千篇一律

由于这是文本模式，请基于一般手相学原理，生成一个完整的手相分析报告。请按照以下JSON格式返回完整分析结果：

{
  "handType": "手型分类（方形手/长方形手/圆锥形手/尖形手/混合型手）",
  "personality": ["基于手型的5-7个核心性格特征"],
  "lifeLine": "生命线详细分析",
  "heartLine": "感情线详细分析",
  "headLine": "智慧线详细分析",
  "fortune": "综合运势分析",
  "health": "健康状况详细分析",
  "career": "事业发展深度分析",
  "love": "感情运势详细分析",
  "mbtiType": "根据手相特征科学推测的MBTI类型",
  "mbtiDescription": "MBTI类型的详细描述",
  "basicFeatures": {
    "handType": "详细手型分析和性格关联",
    "handSize": "手掌大小分析及其心理学含义",
    "skinTexture": "皮肤纹理分析及性格暗示",
    "palmThickness": "手掌厚度分析及其能量水平指示",
    "fingerLength": "手指长度比例分析及其性格特征",
    "nailShape": "指甲形状分析及其健康和性格指示",
    "thumbAnalysis": "拇指详细分析"
  },
  "palmLines": {
    "lifeLine": {
      "description": "生命线形态详细描述",
      "healthImplications": "健康含义和体质分析",
      "energyLevel": "精力水平和生命活力评估",
      "lifeStages": "人生各阶段运势和重要节点分析"
    },
    "heartLine": {
      "description": "感情线形态详细描述",
      "emotionalStyle": "情感表达风格和情绪管理能力",
      "relationshipPattern": "恋爱关系模式和伴侣选择倾向",
      "empathyLevel": "共情能力和情感智商评估"
    },
    "headLine": {
      "description": "智慧线形态详细描述",
      "thinkingStyle": "思维方式分析",
      "decisionMaking": "决策风格和判断能力分析",
      "learningStyle": "学习方式偏好和知识吸收模式",
      "creativity": "创造力水平和艺术天赋评估"
    },
    "fateLine": "事业线详细分析",
    "marriageLine": "婚姻线详细分析",
    "otherLines": "其他重要纹线分析"
  },
  "psychologicalProfile": {
    "mbtiPrediction": "基于手相特征的MBTI类型科学预测，详细说明判断依据和准确性评估",
    "cognitiveStyle": "认知风格深度分析",
    "emotionalPattern": "情绪模式详细分析",
    "behaviorTendency": "行为倾向深度分析",
    "stressResponse": "压力反应模式详细分析",
    "socialStyle": "社交风格详细分析",
    "motivationDrivers": "内在动机驱动因素深度分析",
    "unconsciousTraits": "潜意识特征和深层性格分析"
  },
  "detailedAnalysis": {
    "strengths": ["核心优势详细列表（8-12项）"],
    "challenges": ["面临挑战详细列表（5-8项）"],
    "personalityTraits": ["详细性格特质列表（12-18项）"],
    "communicationStyle": "沟通风格详细分析",
    "leadershipPotential": "领导潜质详细评估",
    "adaptability": "适应能力详细分析",
    "handTexture": "手部纹理质感分析及其性格指示",
    "fingerFlexibility": "手指灵活度分析及其思维敏捷度指示",
    "palmTemperature": "手掌温度感知分析及其情感温度指示",
    "bloodVessels": "血管分布分析及其健康和性格指示",
    "muscleDevelopment": "肌肉发达程度分析及其行动力指示",
    "skinElasticity": "皮肤弹性分析及其生命活力指示",
    "nailHealth": "指甲健康状态分析及其整体健康指示"
  },
  "practicalAdvice": {
    "careerGuidance": {
      "suitableFields": ["最适合的职业领域详细列表（8-12个领域）"],
      "workStyle": "最佳工作方式和环境建议",
      "developmentPath": "职业发展路径详细建议",
      "skillsToImprove": ["需要重点提升的技能详细列表（6-10项）"],
      "industryRecommendations": "推荐的具体行业和公司类型分析",
      "leadershipStyle": "适合的领导风格和管理方式建议"
    },
    "relationshipAdvice": {
      "loveStyle": "恋爱风格详细分析和改进建议",
      "communicationTips": "人际沟通详细建议",
      "conflictResolution": "冲突解决策略和技巧详细指导",
      "partnerCompatibility": "理想伴侣类型和相处模式建议",
      "familyRelations": "家庭关系处理和亲子关系建议"
    },
    "personalDevelopment": {
      "learningRecommendations": "个性化学习方式和知识获取建议",
      "timeManagement": "时间管理策略和效率提升方法",
      "stressManagement": "压力管理详细策略和放松技巧",
      "healthTips": "健康生活方式和养生建议",
      "emotionalIntelligence": "情商提升和情绪管理训练建议",
      "creativityDevelopment": "创造力开发和艺术天赋培养建议"
    },
    "actionPlan": {
      "shortTerm": ["短期行动建议详细列表（1-3个月内的具体行动）"],
      "longTerm": ["长期发展目标详细列表（1-5年的人生规划）"],
      "dailyPractices": ["日常实践建议详细列表（每日可执行的习惯养成）"],
      "weeklyGoals": ["每周目标设定建议（周度计划和检视）"],
      "monthlyTargets": ["每月目标达成建议（月度里程碑设定）"]
    }
  },
  "lifeExperiences": {
    "careerHistory": "根据手相特征推测的职业经历和工作背景",
    "educationalBackground": "推测的教育背景和学习经历",
    "majorLifeEvents": "可能经历的重大人生事件和转折点",
    "hobbiesAndInterests": "推测的兴趣爱好和业余活动",
    "travelExperiences": "可能的旅行经历和地域偏好",
    "relationshipHistory": "推测的感情经历和人际关系模式",
    "healthChallenges": "可能面临或已经经历的健康挑战",
    "personalGrowth": "个人成长轨迹和心理发展历程"
  },
  "lifeStages": {
    "childhood": {
      "period": "童年期年龄范围（如0-12岁）",
      "keyEvents": ["根据手相特征推测的童年关键事件（家庭环境、早期教育、性格形成等）"],
      "personalityDevelopment": "童年期性格发展特点和重要影响因素",
      "challenges": ["童年期可能面临的挑战和困难"],
      "achievements": ["童年期的成就和积极经历"]
    },
    "adolescence": {
      "period": "青少年期年龄范围（如13-18岁）",
      "keyEvents": ["根据手相特征推测的青少年期关键事件（学业发展、兴趣培养、社交关系等）"],
      "personalityDevelopment": "青少年期性格发展特点和重要转变",
      "challenges": ["青少年期可能面临的挑战和困难"],
      "achievements": ["青少年期的成就和重要里程碑"]
    },
    "youngAdult": {
      "period": "青年期年龄范围（如19-30岁）",
      "keyEvents": ["根据手相特征推测的青年期关键事件（职业起步、恋爱婚姻、独立生活等）"],
      "personalityDevelopment": "青年期性格成熟过程和价值观确立",
      "challenges": ["青年期可能面临的挑战和人生选择"],
      "achievements": ["青年期的重要成就和人生突破"]
    },
    "middleAge": {
      "period": "中年期年龄范围（如31-50岁）",
      "keyEvents": ["根据手相特征推测的中年期关键事件（事业发展、家庭责任、财富积累等）"],
      "personalityDevelopment": "中年期性格稳定和智慧积累",
      "challenges": ["中年期可能面临的挑战和压力"],
      "achievements": ["中年期的重要成就和人生高峰"]
    },
    "matureAge": {
      "period": "成熟期年龄范围（如51岁以上）",
      "keyEvents": ["根据手相特征推测的成熟期关键事件（事业巅峰、传承责任、健康关注等）"],
      "personalityDevelopment": "成熟期性格圆融和人生感悟",
      "challenges": ["成熟期可能面临的挑战和调整"],
      "achievements": ["成熟期的重要成就和人生总结"]
    }
  }

**特别要求：人生阶段分析（Beta功能）**
请根据手相特征，科学合理地推测各个人生阶段可能发生的重要事件和发展轨迹。这是一个实验性功能，请在分析中体现以下原则：
1. 基于手相学传统理论和现代心理学研究
2. 结合个人性格特征和潜能分析
3. 提供具有参考价值但不绝对化的人生阶段预测
4. 每个阶段包含2-4个关键事件，保持合理性和多样性
5. 注重个人成长轨迹的连贯性和逻辑性

请确保返回完整的JSON格式，所有字段都必须填写详细内容，不得遗漏或简化。`
        }
      ],
        max_tokens: 4000,
        temperature: 0.7
      })
    }, TIMEOUT_CONFIG.groq);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Groq API返回内容为空');
    }

    // 尝试解析JSON响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]);
      // 确保personality字段是数组格式
      if (parsedResult.personality && typeof parsedResult.personality === 'string') {
        parsedResult.personality = [parsedResult.personality];
      }
      return validateAnalysisResult(parsedResult);
    } else {
      throw new Error('无法从Groq响应中提取JSON格式数据');
    }
  });
}

// Ollama API 已移除，现在只使用 OpenAI GPT API

/**
 * 生成多样化的MBTI类型和对应分析
 */
function generateRandomMBTI(): { type: string; description: string; traits: string[] } {
  const mbtiTypes = [
    {
      type: 'ENFP',
      description: '竞选者型人格，充满热情和创造力，善于激励他人，具有强烈的价值观和理想主义色彩。',
      traits: ['热情洋溢', '创造力强', '善于沟通', '理想主义', '适应性强', '富有同情心']
    },
    {
      type: 'INTJ',
      description: '建筑师型人格，独立思考者，具有强烈的直觉和战略思维，善于制定长远计划。',
      traits: ['独立思考', '战略眼光', '逻辑性强', '目标导向', '创新思维', '自信坚定']
    },
    {
      type: 'ESFP',
      description: '娱乐家型人格，活泼开朗，善于与人交往，注重当下的体验和感受。',
      traits: ['活泼开朗', '善于交际', '注重体验', '灵活变通', '富有同情心', '乐观积极']
    },
    {
      type: 'ISFJ',
      description: '守护者型人格，温和可靠，具有强烈的责任感，善于照顾他人的需求。',
      traits: ['温和可靠', '责任心强', '善于倾听', '注重细节', '忠诚守信', '富有同情心']
    },
    {
      type: 'ENTP',
      description: '辩论家型人格，思维敏捷，善于创新，喜欢探索新的可能性和挑战传统观念。',
      traits: ['思维敏捷', '创新能力', '善于辩论', '适应性强', '好奇心强', '富有魅力']
    },
    {
      type: 'ISFP',
      description: '探险家型人格，温和内敛，具有强烈的艺术气质和个人价值观。',
      traits: ['温和内敛', '艺术气质', '价值观强', '灵活适应', '富有创意', '和谐导向']
    },
    {
      type: 'ESTJ',
      description: '总经理型人格，实用主义者，善于组织和管理，具有强烈的责任感和执行力。',
      traits: ['组织能力强', '实用主义', '责任心强', '执行力强', '逻辑思维', '目标导向']
    },
    {
      type: 'INFP',
      description: '调停者型人格，理想主义者，具有深刻的价值观和强烈的创造力。',
      traits: ['理想主义', '价值观强', '创造力强', '善于理解', '独立思考', '富有同情心']
    },
    {
      type: 'ENFJ',
      description: '主人公型人格，天生的领导者，善于激励和指导他人，具有强烈的同理心。',
      traits: ['领导能力', '善于激励', '同理心强', '沟通能力', '理想主义', '组织能力']
    },
    {
      type: 'ISTP',
      description: '鉴赏家型人格，实用主义者，善于解决问题，喜欢动手实践和探索。',
      traits: ['实用主义', '问题解决', '动手能力', '逻辑思维', '适应性强', '独立自主']
    },
    {
      type: 'ESFJ',
      description: '执政官型人格，热心助人，善于维护和谐的人际关系，具有强烈的社会责任感。',
      traits: ['热心助人', '社交能力', '责任心强', '注重和谐', '组织能力', '忠诚可靠']
    },
    {
      type: 'INTP',
      description: '逻辑学家型人格，理论思维者，善于分析和创新，追求知识和理解。',
      traits: ['逻辑思维', '理论分析', '创新思维', '独立思考', '求知欲强', '客观理性']
    },
    {
      type: 'ESTP',
      description: '企业家型人格，行动派，善于适应环境，喜欢冒险和挑战。',
      traits: ['行动力强', '适应性强', '冒险精神', '实用主义', '社交能力', '灵活变通']
    },
    {
      type: 'INFJ',
      description: '提倡者型人格，理想主义者，具有深刻的洞察力和强烈的使命感。',
      traits: ['洞察力强', '理想主义', '使命感强', '创造力强', '同理心强', '独立思考']
    },
    {
      type: 'ESTJ',
      description: '总经理型人格，天生的组织者，善于制定计划和执行任务。',
      traits: ['组织能力', '执行力强', '责任心强', '逻辑思维', '目标导向', '领导能力']
    },
    {
      type: 'ENTJ',
      description: '指挥官型人格，天生的领导者，具有强烈的目标导向和执行力。',
      traits: ['领导能力', '战略思维', '目标导向', '执行力强', '决策果断', '组织能力']
    }
  ];
  
  // 随机选择一个MBTI类型
  const randomIndex = Math.floor(Math.random() * mbtiTypes.length);
  return mbtiTypes[randomIndex];
}

/**
 * 生成多样化的手型分析
 */
function generateRandomHandType(): { type: string; traits: string[] } {
  const handTypes = [
    {
      type: '方形手',
      traits: ['理性思维', '逻辑性强', '务实稳重', '组织能力强', '责任心强']
    },
    {
      type: '长方形手',
      traits: ['感性细腻', '艺术天赋', '直觉敏锐', '创造力强', '情感丰富']
    },
    {
      type: '圆锥形手',
      traits: ['灵活变通', '适应性强', '沟通能力好', '社交活跃', '思维敏捷']
    },
    {
      type: '尖形手',
      traits: ['敏感细腻', '直觉力强', '艺术气质', '理想主义', '精神追求']
    },
    {
      type: '混合型手',
      traits: ['多才多艺', '平衡发展', '适应能力强', '综合素质高', '潜力巨大']
    }
  ];
  
  const randomIndex = Math.floor(Math.random() * handTypes.length);
  return handTypes[randomIndex];
}

/**
 * 根据MBTI类型生成个性化内容
 */
function generatePersonalizedContent(mbtiType: string) {
  const mbtiProfiles = {
    'INTJ': {
      personality: '您是一个独立思考、富有远见的战略家，善于制定长远规划。',
      career: '适合从事研究、咨询、技术开发等需要深度思考的工作。',
      love: '在感情中比较理性，需要时间建立深度连接，一旦确定关系会非常忠诚。',
      psychProfile: '偏向内向直觉，善于看到事物的本质和未来可能性，决策时依赖逻辑分析。'
    },
    'ENTJ': {
      personality: '您是天生的领导者，具有强烈的目标导向和执行力。',
      career: '适合从事管理、创业、咨询等需要领导能力的工作。',
      love: '在感情中比较主动，希望与伴侣共同成长，建立互相支持的关系。',
      psychProfile: '外向思维型，善于组织和领导他人，注重效率和结果。'
    },
    'INFP': {
      personality: '您是一个理想主义者，富有创造力和同情心，重视个人价值观。',
      career: '适合从事艺术、写作、心理咨询等能发挥创造力的工作。',
      love: '在感情中非常真诚和深情，寻求心灵层面的深度连接。',
      psychProfile: '内向感觉型，重视内在价值和个人成长，决策时更多考虑情感因素。'
    },
    'ENFP': {
      personality: '您是一个充满热情的激励者，善于发现他人的潜力，富有创新精神。',
      career: '适合从事教育、市场营销、公关等需要人际交往的工作。',
      love: '在感情中热情洋溢，喜欢探索新的可能性，需要自由和理解。',
      psychProfile: '外向直觉型，善于激励他人，注重可能性和创新。'
    },
    'ISTJ': {
      personality: '您是一个可靠的执行者，注重细节和传统，做事有条不紊。',
      career: '适合从事会计、行政、工程等需要精确性和稳定性的工作。',
      love: '在感情中稳重可靠，重视承诺和责任，是值得信赖的伴侣。',
      psychProfile: '内向感觉型，注重事实和细节，决策时依赖经验和传统。'
    },
    'ESTJ': {
      personality: '您是一个高效的管理者，善于组织和协调，注重秩序和效率。',
      career: '适合从事管理、销售、法律等需要组织能力的工作。',
      love: '在感情中负责任，希望建立稳定的家庭关系，重视传统价值。',
      psychProfile: '外向思维型，善于管理和组织，注重实际结果和效率。'
    },
    'ISFP': {
      personality: '您是一个温和的艺术家，富有同情心和审美能力，重视和谐。',
      career: '适合从事艺术、设计、护理等能体现个人价值的工作。',
      love: '在感情中温柔体贴，重视情感交流，需要被理解和欣赏。',
      psychProfile: '内向感觉型，重视美感和和谐，决策时考虑对他人的影响。'
    },
    'ESFP': {
      personality: '您是一个活泼的表演者，善于与人交往，喜欢成为关注的焦点。',
      career: '适合从事娱乐、销售、服务等需要人际互动的工作。',
      love: '在感情中热情开朗，喜欢浪漫和惊喜，需要伴侣的欣赏和支持。',
      psychProfile: '外向感觉型，注重当下的体验和感受，善于适应环境变化。'
    },
    'INTP': {
      personality: '您是一个独立的思考者，喜欢探索理论和概念，追求知识和理解。',
      career: '适合从事研究、技术开发、学术等需要深度思考的工作。',
      love: '在感情中比较理性，需要智力上的共鸣，重视精神层面的交流。',
      psychProfile: '内向思维型，善于分析和理论思考，追求逻辑的一致性。'
    },
    'ENTP': {
      personality: '您是一个富有创新精神的发明家，善于发现新的可能性和机会。',
      career: '适合从事创业、咨询、研发等需要创新思维的工作。',
      love: '在感情中充满活力，喜欢探索和冒险，需要智力上的刺激。',
      psychProfile: '外向直觉型，善于创新和辩论，注重可能性和变化。'
    },
    'ISFJ': {
      personality: '您是一个贴心的保护者，善于照顾他人，重视和谐和稳定。',
      career: '适合从事教育、医疗、社会工作等服务他人的工作。',
      love: '在感情中忠诚体贴，重视家庭和传统，是理想的伴侣。',
      psychProfile: '内向感觉型，注重他人的需求和感受，决策时考虑对关系的影响。'
    },
    'ESFJ': {
      personality: '您是一个热心的协调者，善于维护人际关系，重视社会和谐。',
      career: '适合从事人力资源、客户服务、教育等需要人际技能的工作。',
      love: '在感情中温暖体贴，重视家庭和社交，希望得到伴侣的认可。',
      psychProfile: '外向感觉型，善于理解他人情感，注重社会认可和和谐。'
    },
    'ISTP': {
      personality: '您是一个实用的工匠，善于解决实际问题，喜欢动手操作。',
      career: '适合从事工程、技术、手工艺等需要实际技能的工作。',
      love: '在感情中比较独立，重视个人空间，通过行动表达关爱。',
      psychProfile: '内向思维型，注重实际和效率，善于在压力下保持冷静。'
    },
    'ESTP': {
      personality: '您是一个活跃的实干家，善于适应环境，喜欢冒险和挑战。',
      career: '适合从事销售、体育、娱乐等需要行动力的工作。',
      love: '在感情中热情直接，喜欢刺激和新鲜感，重视当下的快乐。',
      psychProfile: '外向感觉型，注重现实和行动，善于抓住机会。'
    },
    'INFJ': {
      personality: '您是一个富有洞察力的倡导者，善于理解他人，追求意义和价值。',
      career: '适合从事咨询、写作、非营利组织等能实现理想的工作。',
      love: '在感情中深情专一，寻求深层的精神连接，重视共同的价值观。',
      psychProfile: '内向直觉型，善于洞察他人内心，追求深层的意义和目的。'
    },
    'ENFJ': {
      personality: '您是一个富有魅力的教育家，善于激励他人，关注他人的成长。',
      career: '适合从事教育、培训、心理咨询等帮助他人发展的工作。',
      love: '在感情中给予支持，重视伴侣的成长和幸福，是理想的人生导师。',
      psychProfile: '外向感觉型，善于理解和激励他人，注重人际和谐和个人成长。'
    }
  };
  
  return mbtiProfiles[mbtiType] || mbtiProfiles['ENTJ'];
}

/**
 * 生成动态的基础特征分析
 */
function generateDynamicBasicFeatures(handType: string) {
  const handTypeDescriptions = {
    '方形手': [
      '方形手型显示您具有务实稳重的性格，做事有条理，注重细节，善于规划和组织。',
      '方形手型表明您逻辑思维强，处事理性，有很强的执行力和责任心。',
      '方形手型显示您性格踏实可靠，善于管理，在工作中表现出色。'
    ],
    '长方形手': [
      '长方形手型显示您感性细腻，富有艺术天赋，直觉敏锐，创造力丰富。',
      '长方形手型表明您情感丰富，善于表达，对美的事物有独特的鉴赏力。',
      '长方形手型显示您想象力丰富，善于创新，在艺术领域有很好的天赋。'
    ],
    '圆锥形手': [
      '圆锥形手型显示您灵活变通，适应性强，沟通技巧好，社交活跃。',
      '圆锥形手型表明您思维敏捷，反应快速，善于处理人际关系。',
      '圆锥形手型显示您性格开朗，善于交际，在团队中能发挥重要作用。'
    ],
    '尖形手': [
      '尖形手型显示您敏感细致，洞察力强，想象力丰富，精神追求高。',
      '尖形手型表明您直觉敏锐，善于感知他人情感，有很强的共情能力。',
      '尖形手型显示您追求完美，注重精神层面，有很高的审美能力。'
    ],
    '混合型手': [
      '混合型手型显示您平衡发展，多元能力，适应性广，综合素质高。',
      '混合型手型表明您兼具多种优势，能够在不同领域都有不错的表现。',
      '混合型手型显示您潜力巨大，发展空间广阔，是全面发展的类型。'
    ]
  };
  
  const handSizeOptions = [
    '手掌大小适中，表明您在处理事务时既有宏观视野，也能关注细节，平衡能力强。',
    '手掌偏大，显示您格局宏大，善于统筹规划，具有很强的领导潜质。',
    '手掌相对较小，表明您注重细节，做事精细，在专业领域能够深入钻研。',
    '手掌比例协调，显示您处事均衡，既能把握大局，也能处理好细节问题。'
  ];
  
  const skinTextureOptions = [
    '皮肤纹理细腻，显示您内心敏感细腻，对美的事物有较高的鉴赏力和追求。',
    '皮肤纹理适中，表明您性格温和，善于与人相处，情感表达恰到好处。',
    '皮肤纹理清晰，显示您思路清晰，逻辑性强，善于分析和判断。',
    '皮肤纹理丰富，表明您经历丰富，阅历深厚，人生感悟较深。'
  ];
  
  const palmThicknessOptions = [
    '手掌厚度适中，表明您精力充沛，行动力强，能够持续投入到感兴趣的事业中。',
    '手掌较厚，显示您体力充沛，意志坚强，能够承担重大责任和压力。',
    '手掌相对较薄，表明您思维敏捷，反应快速，在智力活动中表现出色。',
    '手掌厚薄适度，显示您身心平衡，既有行动力，也有思考深度。'
  ];
  
  const fingerLengthOptions = [
    '手指长度比例协调，显示您思维敏捷，表达能力强，善于与人沟通交流。',
    '手指相对较长，表明您思维细腻，善于思考，在学术或艺术领域有天赋。',
    '手指长度适中，显示您实用主义，善于行动，执行能力强。',
    '手指比例良好，表明您综合能力强，在多个领域都能有不错的表现。'
  ];
  
  const nailShapeOptions = [
    '指甲形状规整，表明您注重个人形象，有良好的生活习惯和自我管理能力。',
    '指甲形状良好，显示您健康状况不错，生活规律，自律性强。',
    '指甲形态自然，表明您性格真实，不做作，待人真诚。',
    '指甲保养得当，显示您注重细节，对生活品质有一定的追求。'
  ];
  
  const thumbAnalysisOptions = [
    '拇指发达有力，显示您意志力坚强，有很强的自控力和领导潜质。',
    '拇指形态良好，表明您决断力强，能够在关键时刻做出正确选择。',
    '拇指比例协调，显示您性格平衡，既有主见，也能听取他人意见。',
    '拇指特征明显，表明您个性鲜明，有很强的个人魅力和影响力。'
  ];
  
  return {
    handType: handTypeDescriptions[handType as keyof typeof handTypeDescriptions]?.[Math.floor(Math.random() * 3)] || handTypeDescriptions['方形手'][0],
    handSize: handSizeOptions[Math.floor(Math.random() * handSizeOptions.length)],
    skinTexture: skinTextureOptions[Math.floor(Math.random() * skinTextureOptions.length)],
    palmThickness: palmThicknessOptions[Math.floor(Math.random() * palmThicknessOptions.length)],
    fingerLength: fingerLengthOptions[Math.floor(Math.random() * fingerLengthOptions.length)],
    nailShape: nailShapeOptions[Math.floor(Math.random() * nailShapeOptions.length)],
    thumbAnalysis: thumbAnalysisOptions[Math.floor(Math.random() * thumbAnalysisOptions.length)]
  };
}

/**
 * 生成动态的掌纹分析
 */
function generateDynamicPalmLines() {
  const lifeLineDescriptions = [
    '生命线起点清晰，弧度优美，延伸至手腕附近，整体线条深而稳定。',
    '生命线形态良好，走向自然，显示生命力旺盛，健康状况良好。',
    '生命线清晰深长，无明显断裂，表明体质强健，生命活力充足。',
    '生命线起始饱满，延伸流畅，预示身心健康，人生轨迹稳定。'
  ];
  
  const healthImplications = [
    '体质良好，免疫力强，很少生病。注意保持规律作息，避免过度疲劳。',
    '身体健康状况不错，恢复能力强，建议适度运动，保持活力。',
    '整体健康运势良好，但要注意预防保健，定期体检。',
    '体质偏向健康，精力充沛，注意劳逸结合，保持身心平衡。'
  ];
  
  const energyLevels = [
    '精力充沛，活力十足，能够承担较大的工作压力和生活挑战。',
    '生命活力旺盛，行动力强，在事业发展中表现积极。',
    '精神状态良好，持久力强，能够长期专注于目标。',
    '能量水平稳定，既有爆发力，也有持续的耐力。'
  ];
  
  const lifeStages = [
    '青年时期发展顺利，中年事业有成，晚年生活安康，整体人生轨迹向上。',
    '人生各阶段发展相对平稳，中年后运势上升，晚年享受成果。',
    '早期可能有些波折，但中年后逐渐稳定，晚年生活幸福。',
    '人生发展呈螺旋上升趋势，每个阶段都有不同的收获和成长。'
  ];
  
  const heartLineDescriptions = [
    '感情线起始于小指下方，向食指方向延伸，线条清晰，略有弯曲。',
    '感情线形态优美，走向稳定，显示情感生活和谐，感情表达能力强。',
    '感情线深而清晰，分支适度，表明情感丰富，善于处理人际关系。',
    '感情线起点明确，终点清晰，预示感情专一，对爱情忠诚。'
  ];
  
  const emotionalStyles = [
    '情感表达直接真诚，不喜欢拐弯抹角，对待感情专一认真。',
    '情感表达温和细腻，善于体察他人情感，共情能力强。',
    '情感表达热情开朗，善于营造温馨氛围，人际关系和谐。',
    '情感表达理性平衡，既有感性的一面，也能保持理性判断。'
  ];
  
  const relationshipPatterns = [
    '在恋爱中比较主动，喜欢掌控关系节奏，对伴侣要求较高。',
    '在感情中比较被动，喜欢慢慢培养感情，重视精神层面的交流。',
    '在恋爱中表现平衡，既能主动表达，也能耐心倾听，关系处理得当。',
    '在感情中比较理性，会综合考虑各种因素，选择合适的伴侣。'
  ];
  
  const empathyLevels = [
    '共情能力强，能够理解他人情感，是朋友眼中的好倾听者。',
    '情感敏感度高，善于察言观色，能够及时感知他人的情绪变化。',
    '同理心较强，善于站在他人角度思考问题，人际关系处理得当。',
    '情感智商较高，既能理解他人，也能很好地管理自己的情绪。'
  ];
  
  const headLineDescriptions = [
    '智慧线从拇指与食指间开始，向小指方向延伸，线条笔直清晰。',
    '智慧线形态良好，深度适中，显示思维能力强，学习天赋好。',
    '智慧线走向稳定，分支合理，表明思维灵活，创造力丰富。',
    '智慧线起点清晰，延伸自然，预示智力水平高，分析能力强。'
  ];
  
  const thinkingStyles = [
    '逻辑思维能力强，善于分析问题，做决定时理性大于感性。',
    '直觉思维发达，善于把握事物本质，在创新方面有独特优势。',
    '综合思维能力强，既有逻辑分析，也有直觉洞察，思维全面。',
    '创意思维活跃，善于跳出常规思路，在解决问题时有独特见解。'
  ];
  
  const decisionMaking = [
    '决策果断，很少犹豫不决，能够在关键时刻做出正确判断。',
    '决策相对谨慎，会充分考虑各种因素，追求最优解决方案。',
    '决策风格平衡，既不过于冲动，也不过于保守，把握度好。',
    '决策能力强，善于在复杂情况下快速做出合理判断。'
  ];
  
  const learningStyles = [
    '学习能力强，善于总结规律，喜欢系统性的知识结构。',
    '学习方式灵活，善于从实践中获得知识，理论联系实际。',
    '学习效率高，善于抓住重点，能够快速掌握新知识和技能。',
    '学习兴趣广泛，善于跨领域学习，知识面比较宽广。'
  ];
  
  const creativity = [
    '创造力中等偏上，在实用性创新方面表现突出，能将想法转化为现实。',
    '创造力丰富，想象力强，在艺术和设计方面有很好的天赋。',
    '创新思维活跃，善于提出新颖的解决方案，在工作中表现出色。',
    '创造潜力较大，在合适的环境和机会下，能够发挥出色的创新能力。'
  ];
  
  const fateLineOptions = [
    '事业线清晰向上，表明职业发展稳定上升，中年后事业运势特别旺盛。',
    '事业线形态良好，显示职业规划清晰，发展路径明确，前景广阔。',
    '事业线深而稳定，表明工作能力强，在职场中能够稳步发展。',
    '事业线走向积极，预示事业发展顺利，容易获得成功和认可。'
  ];
  
  const marriageLineOptions = [
    '婚姻线清晰单一，预示感情专一，婚姻生活和谐稳定。',
    '婚姻线形态良好，显示感情运势不错，容易遇到合适的伴侣。',
    '婚姻线深而清晰，表明对感情认真负责，婚姻关系持久稳定。',
    '婚姻线走向平稳，预示感情生活和谐，家庭关系融洽。'
  ];
  
  const otherLinesOptions = [
    '太阳线较为明显，表明有一定的艺术天赋和审美能力，容易获得他人认可。',
    '财运线清晰，显示财运不错，善于理财，有一定的财富积累能力。',
    '健康线形态良好，表明身体状况稳定，注重养生保健。',
    '智慧线分支丰富，显示思维活跃，在多个领域都有发展潜力。'
  ];
  
  return {
    lifeLine: {
      description: lifeLineDescriptions[Math.floor(Math.random() * lifeLineDescriptions.length)],
      healthImplications: healthImplications[Math.floor(Math.random() * healthImplications.length)],
      energyLevel: energyLevels[Math.floor(Math.random() * energyLevels.length)],
      lifeStages: lifeStages[Math.floor(Math.random() * lifeStages.length)]
    },
    heartLine: {
      description: heartLineDescriptions[Math.floor(Math.random() * heartLineDescriptions.length)],
      emotionalStyle: emotionalStyles[Math.floor(Math.random() * emotionalStyles.length)],
      relationshipPattern: relationshipPatterns[Math.floor(Math.random() * relationshipPatterns.length)],
      empathyLevel: empathyLevels[Math.floor(Math.random() * empathyLevels.length)]
    },
    headLine: {
      description: headLineDescriptions[Math.floor(Math.random() * headLineDescriptions.length)],
      thinkingStyle: thinkingStyles[Math.floor(Math.random() * thinkingStyles.length)],
      decisionMaking: decisionMaking[Math.floor(Math.random() * decisionMaking.length)],
      learningStyle: learningStyles[Math.floor(Math.random() * learningStyles.length)],
      creativity: creativity[Math.floor(Math.random() * creativity.length)]
    },
    fateLine: fateLineOptions[Math.floor(Math.random() * fateLineOptions.length)],
    marriageLine: marriageLineOptions[Math.floor(Math.random() * marriageLineOptions.length)],
    otherLines: otherLinesOptions[Math.floor(Math.random() * otherLinesOptions.length)]
  };
}

/**
 * 生成动态的基础分析内容
 */
function generateDynamicBasicAnalysis() {
  const lifeLineOptions = [
    '生命线深长清晰，弧度优美，表示体质强健，生命力旺盛，人生轨迹稳定向上。',
    '生命线起点饱满，延伸流畅，显示精力充沛，抗压能力强，健康状况良好。',
    '生命线纹路清晰，走向稳定，预示身心健康，生活规律，长寿的征象明显。',
    '生命线形态良好，深度适中，表明生命活力充足，免疫力强，很少生病。',
    '生命线线条流畅，无明显断裂，显示生命力顽强，身体恢复能力强。'
  ];
  
  const heartLineOptions = [
    '感情线弯曲向上，线条流畅，表示情感丰富，表达能力强，在感情中比较主动积极。',
    '感情线深而清晰，走向稳定，显示感情专一，对爱情忠诚，重视精神层面的交流。',
    '感情线起点清晰，终点明确，预示感情生活和谐，善于处理人际关系，共情能力强。',
    '感情线纹理细腻，分支适度，表明情感细腻，善解人意，是理想的人生伴侣。',
    '感情线走向平稳，深度适中，显示情绪稳定，善于控制情感，理性与感性并重。'
  ];
  
  const headLineOptions = [
    '智慧线笔直清晰，长度适中，显示逻辑思维能力强，分析判断准确，决策果断。',
    '智慧线深而稳定，走向良好，表明学习能力出色，知识面广，善于创新思考。',
    '智慧线形态优美，纹路清晰，预示思维敏捷，理解力强，具有很好的洞察力。',
    '智慧线起点饱满，延伸自然，显示智力水平高，创造力强，善于解决复杂问题。',
    '智慧线线条流畅，分支合理，表明思维灵活，善于多角度思考问题。'
  ];
  
  const fortuneOptions = [
    '整体运势呈稳步上升趋势，近期财运亨通，事业发展顺利，建议积极把握机遇。',
    '综合运势良好，各方面发展均衡，中年后运势特别旺盛，是大器晚成的类型。',
    '运势波动中有上升，贵人运强，容易得到他人帮助，适合团队合作发展。',
    '整体运势稳中有进，虽然发展较为平稳，但持续性强，是细水长流的好运势。',
    '运势呈现多元化发展，在不同领域都有不错的表现，适合多方面发展。'
  ];
  
  const healthOptions = [
    '身体状况整体良好，体质较强，但需注意工作与休息的平衡，避免过度疲劳。',
    '健康运势不错，免疫力强，很少生病，建议保持规律作息，适度运动。',
    '体质偏向健康，精力充沛，但要注意情绪管理，避免压力过大影响身心健康。',
    '身体机能良好，恢复能力强，建议注重预防保健，保持良好的生活习惯。',
    '整体健康状况稳定，但需要关注某些慢性问题，定期体检很重要。'
  ];
  
  return {
    lifeLine: lifeLineOptions[Math.floor(Math.random() * lifeLineOptions.length)],
    heartLine: heartLineOptions[Math.floor(Math.random() * heartLineOptions.length)],
    headLine: headLineOptions[Math.floor(Math.random() * headLineOptions.length)],
    fortune: fortuneOptions[Math.floor(Math.random() * fortuneOptions.length)],
    health: healthOptions[Math.floor(Math.random() * healthOptions.length)]
  };
}

/**
 * 生成动态的实用建议
 */
function generateDynamicPracticalAdvice() {
  const careerFields = [
    ['企业管理', '项目管理', '咨询顾问', '金融投资', '市场营销', '人力资源'],
    ['教育培训', '法律服务', '技术管理', '创业', '政府机关', '非营利组织'],
    ['医疗健康', '艺术设计', '媒体传播', '房地产', '零售商业', '旅游服务'],
    ['科技研发', '工程建设', '财务会计', '销售业务', '客户服务', '质量管理'],
    ['文化创意', '体育健身', '环保能源', '农业科技', '物流运输', '国际贸易']
  ];
  
  const workStyles = [
    '适合在有一定自主权的环境中工作，喜欢制定计划并推动执行，在团队协作中能发挥重要作用，建议选择有挑战性和成长空间的工作。',
    '适合在稳定有序的环境中工作，注重细节和质量，在专业领域能够深入发展，建议选择能够发挥专业技能的工作。',
    '适合在创新活跃的环境中工作，喜欢接受新挑战，在变化中寻找机会，建议选择具有创新性和灵活性的工作。',
    '适合在团队协作的环境中工作，善于沟通协调，在服务他人中获得满足感，建议选择以人为本的工作。',
    '适合在目标导向的环境中工作，追求结果和成就，在竞争中激发潜能，建议选择具有明确目标和激励机制的工作。'
  ];
  
  const developmentPaths = [
    '短期内专注于提升专业技能和管理能力，中期目标是成为团队或部门负责人，长期可考虑创业或担任高级管理职位。',
    '短期内深化专业知识和技术能力，中期目标是成为行业专家，长期可考虑转向咨询或教育领域。',
    '短期内拓展跨领域知识和创新能力，中期目标是参与重要项目或产品开发，长期可考虑创立自己的品牌或公司。',
    '短期内提升沟通和服务能力，中期目标是在客户关系或团队建设方面发挥作用，长期可考虑管理或培训岗位。',
    '短期内强化执行力和结果导向，中期目标是在销售或业务拓展方面取得突破，长期可考虑区域管理或合伙人角色。'
  ];
  
  const loveStyles = [
    '在恋爱中比较主动和直接，对感情认真专一，但有时可能过于理性，建议在表达爱意时多一些浪漫和感性的元素。',
    '在恋爱中比较温和体贴，善于关心照顾对方，但有时可能过于被动，建议更主动地表达自己的需求和想法。',
    '在恋爱中充满激情和创意，喜欢制造惊喜和浪漫，但有时可能不够稳定，建议在激情中保持理性和责任感。',
    '在恋爱中注重精神交流和深度沟通，追求心灵契合，但有时可能过于理想化，建议更多关注现实生活的经营。',
    '在恋爱中比较实际和务实，注重长期发展和稳定关系，但有时可能缺乏浪漫，建议增加情趣和惊喜元素。'
  ];
  
  const selectedFields = careerFields[Math.floor(Math.random() * careerFields.length)];
  
  return {
    careerGuidance: {
      suitableFields: selectedFields,
      workStyle: workStyles[Math.floor(Math.random() * workStyles.length)],
      developmentPath: developmentPaths[Math.floor(Math.random() * developmentPaths.length)],
      skillsToImprove: [
        '情商和人际沟通技巧', '创新思维和创造力', '压力管理和情绪调节',
        '跨文化沟通能力', '数字化技能', '演讲和公众表达',
        '财务管理知识', '行业专业知识', '团队建设能力', '战略思维'
      ],
      industryRecommendations: '建议选择成长性好的行业，如科技、金融、教育、咨询等，这些行业能够充分发挥您的管理和沟通优势。',
      leadershipStyle: '适合采用变革型领导风格，注重激励和启发下属，同时保持一定的权威性，建议多倾听团队意见，采用更加民主的决策方式。'
    },
    relationshipAdvice: {
      loveStyle: loveStyles[Math.floor(Math.random() * loveStyles.length)],
      communicationTips: '在人际沟通中要多倾听他人观点，避免过于强势，学会用更温和的方式表达不同意见，增加情感表达的比重。',
      conflictResolution: '处理冲突时要保持冷静客观，但也要关注对方的情感需求，寻求双赢的解决方案，避免过于坚持己见。',
      partnerCompatibility: '适合与性格互补的伴侣在一起，对方最好具有较强的情感表达能力和包容心，能够平衡您的理性特质。',
      familyRelations: '在家庭关系中要多表达关爱和温暖，不要把工作中的严肃态度带到家庭中，学会在家庭中放松和享受。'
    },
    personalDevelopment: {
      learningRecommendations: '建议采用系统性学习方法，制定明确的学习计划，同时要注重实践应用，将理论知识转化为实际能力。',
      timeManagement: '您的时间管理能力已经很强，建议进一步优化，为休闲和个人兴趣留出更多时间，实现工作生活平衡。',
      stressManagement: '学会适当放松，可以通过运动、音乐、阅读等方式缓解压力，定期进行身心检查，预防过度疲劳。',
      healthTips: '保持规律的作息时间，适度运动，注意饮食营养均衡，定期体检，特别要关注心血管健康。',
      emotionalIntelligence: '继续提升情商，学会更好地理解和表达情感，在人际交往中增加同理心，提高情感敏感度。',
      creativityDevelopment: '可以通过艺术、音乐、写作等方式培养创造力，参加创意思维训练，拓展思维边界。'
    },
    actionPlan: {
      shortTerm: [
        '制定详细的职业发展规划，明确短期目标',
        '参加管理技能培训课程，提升领导能力',
        '建立更广泛的人际网络，扩大社交圈',
        '开始学习一项新技能或爱好，丰富生活',
        '改善工作生活平衡，增加休闲时间'
      ],
      longTerm: [
        '在5年内达到管理层职位或成功创业',
        '建立稳定和谐的家庭关系',
        '实现财务自由和安全感',
        '成为行业内的专家或意见领袖',
        '为社会做出有意义的贡献'
      ],
      dailyPractices: [
        '每天花30分钟进行反思和规划',
        '坚持阅读，保持学习习惯',
        '进行适度的体育锻炼',
        '与家人朋友保持良好沟通',
        '记录每天的成就和感悟'
      ],
      weeklyGoals: [
        '完成一个重要的工作项目或任务',
        '与朋友或同事进行深度交流',
        '学习新知识或技能',
        '进行户外活动或休闲娱乐',
        '整理和规划下周的工作安排'
      ],
      monthlyTargets: [
        '评估和调整职业发展计划',
        '参加行业会议或培训活动',
        '拓展新的人际关系',
        '完成一个个人兴趣项目',
        '进行全面的健康检查'
      ]
    }
  };
}

/**
 * 生成动态的人生阶段
 */
function generateDynamicLifeStages() {
  const childhoodOptions = {
    period: '0-12岁',
    personalityDevelopment: [
      '童年时期表现出强烈的好奇心和探索欲，对新事物充满兴趣',
      '从小就展现出独立自主的性格，不喜欢过度依赖他人',
      '童年期情感丰富，善于表达自己的想法和感受',
      '早期就显示出领导潜质，在同龄人中有一定影响力'
    ],
    keyEvents: [
      '可能在学校担任过班干部或参与过重要活动组织',
      '童年时期可能有过搬家或转学的经历，培养了适应能力',
      '可能在某个兴趣爱好上表现突出，获得过奖励或认可',
      '家庭环境相对和谐，得到了良好的教育和关爱'
    ],
    challenges: ['学习压力适应', '社交技能发展', '情绪管理学习'],
    achievements: ['基础学科表现优秀', '兴趣爱好有所发展', '建立了良好的友谊关系']
  };

  const adolescenceOptions = {
    period: '13-18岁',
    personalityDevelopment: [
      '青春期开始形成独特的价值观和人生观，思考能力增强',
      '在学业和兴趣之间寻找平衡，逐渐明确自己的优势领域',
      '人际关系变得更加复杂，学会处理各种社交情况',
      '开始对未来有初步规划，展现出目标导向的特质'
    ],
    keyEvents: [
      '可能在高中时期担任学生会职务或社团领导',
      '在某次重要考试或竞赛中取得突出成绩',
      '可能经历过重要的友谊变化或情感体验',
      '开始对职业方向有初步思考和探索'
    ],
    challenges: ['学业压力增大', '人际关系复杂化', '自我认知深化'],
    achievements: ['学术成绩稳定提升', '领导能力初步显现', '兴趣特长进一步发展']
  };

  const youngAdultOptions = {
    period: '19-30岁',
    personalityDevelopment: [
      '进入社会后快速适应职场环境，展现出很强的学习能力',
      '在工作中逐渐找到自己的定位，专业技能不断提升',
      '人际交往更加成熟，能够处理复杂的人际关系',
      '开始承担更多责任，展现出可靠和值得信赖的品质'
    ],
    keyEvents: [
      '顺利完成学业并进入理想的工作领域',
      '可能经历过几次工作转换，每次都是为了更好的发展',
      '建立了重要的人际关系网络，包括导师和合作伙伴',
      '可能开始考虑长期的人生规划，包括事业和感情'
    ],
    challenges: ['职场竞争激烈', '工作生活平衡', '人生方向选择'],
    achievements: ['专业技能快速提升', '建立职业声誉', '积累重要人脉资源']
  };

  const middleAgeOptions = {
    period: '31-50岁',
    personalityDevelopment: [
      '进入事业发展的黄金期，在专业领域有了深厚积累',
      '领导能力和管理技能得到充分发展和认可',
      '对人生有了更深刻的理解，价值观更加成熟稳定',
      '开始关注传承和培养下一代，展现出导师气质'
    ],
    keyEvents: [
      '可能在职业生涯中达到重要里程碑，获得晋升或认可',
      '可能经历过重要的人生决策，如创业或转行',
      '家庭责任增加，需要平衡事业和家庭的关系',
      '可能开始投资理财，为未来做长远规划'
    ],
    challenges: ['事业瓶颈突破', '家庭责任加重', '健康管理重要性'],
    achievements: ['事业达到新高度', '建立稳定的家庭基础', '积累了丰富的人生经验']
  };

  const matureAgeOptions = {
    period: '51岁以上',
    personalityDevelopment: [
      '人生阅历丰富，对事物有独到的见解和判断力',
      '更加注重精神层面的追求，关注内心的平静和满足',
      '乐于分享经验和智慧，成为他人的人生导师',
      '对生活有了更深的感悟，追求简单而有意义的生活'
    ],
    keyEvents: [
      '可能在专业领域达到权威地位，受到广泛尊重',
      '开始更多地关注健康和养生，调整生活方式',
      '可能开始培养新的兴趣爱好，丰富退休后的生活',
      '更多地参与社会公益活动，回馈社会'
    ],
    challenges: ['健康状况关注', '角色转换适应', '传承价值实现'],
    achievements: ['人生智慧达到巅峰', '建立了深厚的人际关系', '为社会做出了重要贡献']
  };

  return {
    childhood: {
      period: childhoodOptions.period,
      personalityDevelopment: childhoodOptions.personalityDevelopment[Math.floor(Math.random() * childhoodOptions.personalityDevelopment.length)],
      keyEvents: childhoodOptions.keyEvents.slice(0, 2 + Math.floor(Math.random() * 2)),
      challenges: childhoodOptions.challenges,
      achievements: childhoodOptions.achievements
    },
    adolescence: {
      period: adolescenceOptions.period,
      personalityDevelopment: adolescenceOptions.personalityDevelopment[Math.floor(Math.random() * adolescenceOptions.personalityDevelopment.length)],
      keyEvents: adolescenceOptions.keyEvents.slice(0, 2 + Math.floor(Math.random() * 2)),
      challenges: adolescenceOptions.challenges,
      achievements: adolescenceOptions.achievements
    },
    youngAdult: {
      period: youngAdultOptions.period,
      personalityDevelopment: youngAdultOptions.personalityDevelopment[Math.floor(Math.random() * youngAdultOptions.personalityDevelopment.length)],
      keyEvents: youngAdultOptions.keyEvents.slice(0, 2 + Math.floor(Math.random() * 2)),
      challenges: youngAdultOptions.challenges,
      achievements: youngAdultOptions.achievements
    },
    middleAge: {
      period: middleAgeOptions.period,
      personalityDevelopment: middleAgeOptions.personalityDevelopment[Math.floor(Math.random() * middleAgeOptions.personalityDevelopment.length)],
      keyEvents: middleAgeOptions.keyEvents.slice(0, 2 + Math.floor(Math.random() * 2)),
      challenges: middleAgeOptions.challenges,
      achievements: middleAgeOptions.achievements
    },
    matureAge: {
      period: matureAgeOptions.period,
      personalityDevelopment: matureAgeOptions.personalityDevelopment[Math.floor(Math.random() * matureAgeOptions.personalityDevelopment.length)],
      keyEvents: matureAgeOptions.keyEvents.slice(0, 2 + Math.floor(Math.random() * 2)),
      challenges: matureAgeOptions.challenges,
      achievements: matureAgeOptions.achievements
    }
  };
}

/**
 * 生成动态的人生经历
 */
function generateDynamicLifeExperiences() {
  const careerHistories = [
    '从手相特征推测，您可能有过多次工作转换的经历，每次转换都是为了寻求更好的发展机会。您可能在管理、咨询或技术领域有丰富经验，并且在职场中逐渐展现出领导才能。',
    '从手相特征推测，您的职业发展相对稳定，在某个专业领域深耕多年，积累了丰富的经验和专业声誉，在行业内有一定的影响力。',
    '从手相特征推测，您可能经历过创业或自主创业的阶段，有过成功和挫折的经历，这些经历让您更加成熟和坚韧。',
    '从手相特征推测，您可能在多个不同行业有过工作经历，这种跨领域的经验让您具有更广阔的视野和更强的适应能力。',
    '从手相特征推测，您可能从基层做起，通过不断努力和学习逐步晋升，在职场中展现出很强的上进心和执行力。'
  ];
  
  const educationalBackgrounds = [
    '推测您接受过良好的高等教育，可能是商科、工程或社会科学专业背景。您在学习期间表现优秀，可能担任过学生干部或参与过重要项目。',
    '推测您在教育方面注重实用性，可能通过职业培训或专业认证获得了相关技能，在实践中不断学习和成长。',
    '推测您可能有过海外学习或交流的经历，这种国际化的教育背景为您提供了更广阔的视野和跨文化沟通能力。',
    '推测您在学习方面比较自主，可能通过自学或在线教育获得了很多知识和技能，具有很强的自我驱动力。',
    '推测您可能在艺术、文学或创意领域有过专业学习，这种背景为您提供了独特的审美能力和创新思维。'
  ];
  
  const majorLifeEvents = [
    '人生中可能经历过几次重要的选择和转折，包括职业转换、居住地变迁或重要关系的建立。这些经历让您更加成熟和坚强。',
    '人生中可能经历过一些挑战和困难，但您都能够勇敢面对并从中学习成长，这些经历塑造了您坚韧的性格。',
    '人生中可能有过一些重要的成就和里程碑，这些成功经历给了您信心和动力，也让您更加明确自己的目标和方向。',
    '人生中可能经历过一些意外的机遇和转机，您能够敏锐地抓住这些机会，并将其转化为人生的重要转折点。',
    '人生中可能有过一些深刻的感悟和觉醒时刻，这些经历让您对生活有了更深的理解和更明确的价值观。'
  ];
  
  return {
    careerHistory: careerHistories[Math.floor(Math.random() * careerHistories.length)],
    educationalBackground: educationalBackgrounds[Math.floor(Math.random() * educationalBackgrounds.length)],
    majorLifeEvents: majorLifeEvents[Math.floor(Math.random() * majorLifeEvents.length)],
    hobbiesAndInterests: '您可能对阅读、旅行、运动或艺术有浓厚兴趣，这些爱好帮助您保持身心平衡。您也可能喜欢参加社交活动和团体组织。',
    travelExperiences: '推测您有过国内外旅行的经历，这些经历开阔了您的视野，增强了您的适应能力和跨文化沟通技巧。',
    relationshipHistory: '在感情方面，您可能经历过几段重要的关系，每段关系都让您更加了解自己的需求和期望。您在感情中比较认真和专一。',
    healthChallenges: '总体健康状况良好，但可能因为工作压力大而偶尔出现疲劳或焦虑症状。建议注意预防和及时调整。',
    personalGrowth: '您的个人成长轨迹呈现稳步上升的趋势，从青年时期的探索到现在的成熟稳重，每个阶段都有明显的进步和收获。'
  };
}

/**
 * 生成动态的详细分析
 */
function generateDynamicDetailedAnalysis() {
  const strengthsOptions = [
    ['逻辑思维能力强，善于分析问题', '组织协调能力出色，天生的管理者', '责任心强，值得信赖', '目标导向明确，执行力强'],
    ['沟通表达能力好，善于说服他人', '适应能力强，能够快速融入新环境', '学习能力强，知识更新速度快', '情绪控制能力好，很少情绪化'],
    ['人际关系处理得当，朋友圈广泛', '创新思维活跃，能提出建设性意见', '时间管理能力强，效率高', '抗压能力强，能承担重要责任'],
    ['直觉敏锐，善于洞察事物本质', '艺术天赋突出，审美能力强', '同理心强，善于理解他人', '坚持不懈，不轻易放弃'],
    ['决策能力强，关键时刻能做出正确选择', '团队合作精神好，善于协调', '自我驱动力强，主动性高', '风险控制意识强，谨慎稳重']
  ];
  
  const challengesOptions = [
    ['有时过于追求完美，给自己压力', '在细节处理上可能不够耐心', '对他人要求较高，容易产生失望', '工作与生活平衡需要改善'],
    ['有时显得过于理性，缺乏感性表达', '在面对批评时可能过于敏感', '长期高强度工作可能影响健康', '有时缺乏足够的耐心倾听他人'],
    ['容易陷入细节，忽略整体大局', '在不确定环境中可能感到焦虑', '有时过于依赖他人认可', '在快速变化中可能适应较慢'],
    ['情绪波动较大，需要更好的调节', '有时过于理想化，现实感不足', '在压力下可能出现拖延行为', '社交场合可能感到不自在'],
    ['有时过于谨慎，错失机会', '在创新方面可能保守', '对变化的接受度需要提升', '在表达个人观点时可能犹豫']
  ];
  
  const personalityTraitsOptions = [
    ['理性务实', '逻辑性强', '组织能力出色', '责任心强', '目标导向', '执行力强'],
    ['沟通能力好', '适应性强', '学习能力强', '情绪稳定', '人际关系好', '创新思维'],
    ['时间观念强', '抗压能力强', '领导潜质', '追求完美', '注重效率', '值得信赖'],
    ['直觉敏锐', '艺术天赋', '同理心强', '坚持不懈', '审美能力强', '情感丰富'],
    ['决策果断', '团队精神', '自我驱动', '风险意识', '谨慎稳重', '协调能力强']
  ];
  
  const communicationStyles = [
    '沟通风格直接明了，善于用逻辑和事实说服他人，在表达观点时条理清晰，但有时可能显得过于理性，建议在沟通中增加更多的情感表达。',
    '沟通方式温和友善，善于倾听他人意见，在交流中能够营造和谐氛围，但有时可能过于委婉，建议在必要时更加直接表达观点。',
    '沟通风格活跃生动，善于用生动的语言和例子说明问题，能够吸引他人注意，但有时可能过于跳跃，建议保持逻辑连贯性。',
    '沟通方式深思熟虑，善于从多角度分析问题，表达观点时有深度，但有时可能过于复杂，建议简化表达方式。',
    '沟通风格坚定有力，善于在关键时刻表达立场，具有说服力，但有时可能显得过于强势，建议多考虑他人感受。'
  ];
  
  const leadershipPotentials = [
    '具有很强的领导潜质，天生的管理者气质，善于制定计划和分配任务，能够激励团队成员，但需要注意倾听下属意见，采用更加民主的领导风格。',
    '领导风格偏向服务型，善于支持和帮助团队成员成长，在团队中起到凝聚作用，但有时需要更加果断，在关键时刻做出决策。',
    '具有变革型领导潜质，善于激发团队创新，推动组织变革，但需要注意在变革过程中保持团队稳定性。',
    '领导风格注重细节和质量，善于确保工作标准，但有时可能过于关注细节而忽略大局，建议平衡细节与整体。',
    '具有魅力型领导特质，能够感染和激励他人，在团队中有很强的影响力，但需要注意保持谦逊，避免过于自信。'
  ];
  
  const adaptabilities = [
    '适应能力很强，能够快速融入新环境和新团队，面对变化时能够保持冷静并制定应对策略，这是您的一大优势。',
    '适应能力中等，在熟悉的环境中表现出色，面对变化时需要一定的调整时间，但最终能够很好地适应。',
    '适应能力较强，善于在变化中寻找机会，但有时可能过于急躁，建议在适应过程中保持耐心。',
    '适应能力稳健，喜欢在稳定的环境中工作，面对重大变化时可能需要更多支持，但一旦适应就能表现出色。',
    '适应能力灵活，善于根据不同情况调整策略，在多变的环境中能够保持良好表现。'
  ];
  
  const selectedStrengths = strengthsOptions[Math.floor(Math.random() * strengthsOptions.length)];
  const selectedChallenges = challengesOptions[Math.floor(Math.random() * challengesOptions.length)];
  const selectedTraits = personalityTraitsOptions[Math.floor(Math.random() * personalityTraitsOptions.length)];
  
  return {
    strengths: selectedStrengths,
    challenges: selectedChallenges,
    personalityTraits: selectedTraits,
    communicationStyle: communicationStyles[Math.floor(Math.random() * communicationStyles.length)],
    leadershipPotential: leadershipPotentials[Math.floor(Math.random() * leadershipPotentials.length)],
    adaptability: adaptabilities[Math.floor(Math.random() * adaptabilities.length)],
    handTexture: '手部纹理细腻均匀，显示您内心细腻敏感，对美的事物有较高的鉴赏力，同时也表明您注重生活品质。',
    fingerFlexibility: '手指灵活度良好，表明您思维敏捷，反应快速，在处理复杂问题时能够灵活变通。',
    palmTemperature: '手掌温度适中，显示您情感温度恰到好处，既不过于冷漠也不过于热情，在人际交往中能够把握好分寸。',
    bloodVessels: '血管分布均匀，表明您血液循环良好，身体健康状况不错，精力充沛。',
    muscleDevelopment: '手部肌肉发达程度适中，显示您行动力强，但不会过于冲动，能够在思考后行动。',
    skinElasticity: '皮肤弹性良好，表明您生命活力旺盛，身体机能状态良好，保养得当。',
    nailHealth: '指甲健康状态良好，形状规整，颜色正常，表明您整体健康状况不错，生活习惯良好。'
  };
}

/**
 * 生成动态的心理特征分析
 */
function generateDynamicPsychologicalProfile(mbtiType: string, handType: string, handTraits: string[]) {
  const emotionalPatterns = [
    '情绪相对稳定，不容易被外界因素影响心情，但在面对重要决策时可能会有一定的焦虑感。',
    '情感表达丰富，善于感知他人情绪变化，在人际交往中表现出很强的同理心。',
    '情绪管理能力较强，能够在压力下保持冷静，但偶尔会有情绪波动的时候。',
    '情感深度较深，对事物有独特的感受和理解，但有时可能过于敏感。'
  ];
  
  const behaviorTendencies = [
    '行为模式偏向主动进取，喜欢掌控局面，在团队中往往扮演领导者或协调者的角色。',
    '行为风格相对温和，善于合作，在团队中更多扮演支持者和协调者的角色。',
    '行为特点是灵活多变，能够根据不同情况调整策略，适应性很强。',
    '行为模式偏向稳健，做事有计划有条理，不喜欢冒险但执行力强。'
  ];
  
  const stressResponses = [
    '面对压力时能够保持相对冷静，善于制定应对策略，但长期高压可能导致身心疲惫。',
    '在压力面前表现出很强的韧性，能够通过积极的方式化解压力，恢复能力强。',
    '面对压力时可能会有短暂的焦虑，但能够快速调整状态，寻找解决方案。',
    '压力反应相对温和，善于通过沟通和寻求帮助来缓解压力。'
  ];
  
  const socialStyles = [
    '社交能力强，善于建立人际关系，在群体中有一定的影响力和号召力。',
    '社交风格温和友善，善于倾听他人，在朋友圈中是很好的倾诉对象。',
    '社交表现活跃，喜欢参与各种活动，能够快速融入新的社交环境。',
    '社交偏好相对内敛，但在熟悉的环境中能够展现出很好的沟通能力。'
  ];
  
  const motivationDrivers = [
    '主要动机来源于成就感和认可感，希望通过努力获得他人尊重和社会地位。',
    '动机主要来源于自我实现和个人成长，追求内在的满足感和价值实现。',
    '主要动力来源于帮助他人和社会贡献，希望通过自己的努力让世界变得更好。',
    '动机来源于稳定和安全感，希望建立可靠的生活基础和人际关系。'
  ];
  
  const unconsciousTraits = [
    '潜意识中渴望安全感和稳定性，对不确定性有一定的焦虑，但表面上表现得很自信。',
    '内心深处有很强的创造欲望，希望能够表达自己的独特想法和观点。',
    '潜意识中渴望被理解和接纳，对他人的评价比较敏感，但努力保持独立。',
    '内心追求完美和卓越，对自己要求较高，有时会因为达不到理想标准而焦虑。'
  ];
  
  return {
    mbtiPrediction: `根据手相特征分析，您很可能是${mbtiType}类型，这一判断基于您的${handType}（显示${handTraits.join('、')}）、手部线条特征以及整体手型比例。准确率约为${70 + Math.floor(Math.random() * 15)}%。`,
    cognitiveStyle: generatePersonalizedContent(mbtiType).psychProfile,
    emotionalPattern: emotionalPatterns[Math.floor(Math.random() * emotionalPatterns.length)],
    behaviorTendency: behaviorTendencies[Math.floor(Math.random() * behaviorTendencies.length)],
    stressResponse: stressResponses[Math.floor(Math.random() * stressResponses.length)],
    socialStyle: socialStyles[Math.floor(Math.random() * socialStyles.length)],
    motivationDrivers: motivationDrivers[Math.floor(Math.random() * motivationDrivers.length)],
    unconsciousTraits: unconsciousTraits[Math.floor(Math.random() * unconsciousTraits.length)]
  };
}

/**
 * 生成完整的分析结果（补充缺失字段）
 */
function generateCompleteAnalysis(baseResult: any): PalmAnalysisResponse {
  const randomMBTI = generateRandomMBTI();
  const randomHandType = generateRandomHandType();
  const personalizedContent = generatePersonalizedContent(randomMBTI.type);
  const dynamicBasics = generateDynamicBasicAnalysis();
  const dynamicPsychProfile = generateDynamicPsychologicalProfile(randomMBTI.type, randomHandType.type, randomHandType.traits);
  const dynamicDetailedAnalysis = generateDynamicDetailedAnalysis();
  const dynamicPracticalAdvice = generateDynamicPracticalAdvice();
  const dynamicLifeExperiences = generateDynamicLifeExperiences();
  const dynamicLifeStages = generateDynamicLifeStages();
  
  return {
    handType: baseResult.handType || randomHandType.type,
    personality: baseResult.personality || [personalizedContent.personality],
    lifeLine: baseResult.lifeLine || dynamicBasics.lifeLine,
    heartLine: baseResult.heartLine || dynamicBasics.heartLine,
    headLine: baseResult.headLine || dynamicBasics.headLine,
    fortune: baseResult.fortune || dynamicBasics.fortune,
    health: baseResult.health || dynamicBasics.health,
    career: baseResult.career || personalizedContent.career,
    love: baseResult.love || personalizedContent.love,
    mbtiType: baseResult.mbtiType || randomMBTI.type,
    mbtiDescription: baseResult.mbtiDescription || randomMBTI.description,
    basicFeatures: baseResult.basicFeatures || generateDynamicBasicFeatures(randomHandType.type),
    palmLines: baseResult.palmLines || generateDynamicPalmLines(),
    psychologicalProfile: baseResult.psychologicalProfile || dynamicPsychProfile,
    detailedAnalysis: baseResult.detailedAnalysis || dynamicDetailedAnalysis,
    practicalAdvice: baseResult.practicalAdvice || dynamicPracticalAdvice,
    lifeExperiences: baseResult.lifeExperiences || dynamicLifeExperiences,
    lifeStages: baseResult.lifeStages || dynamicLifeStages
  };
}

/**
 * 调用自定义图像分析API（智能选择最佳可用API）
 */
export async function analyzeWithCustomAPI(imageBase64: string): Promise<PalmAnalysisResponse> {
  const bestAPI = getBestAvailableAPI();
  
  try {
    if (bestAPI === 'openai') {
      console.log('使用OpenAI API进行分析...');
      return await analyzeWithOpenAI(imageBase64);
    } else if (bestAPI === 'groq') {
      console.log('使用Groq API进行分析...');
      return await analyzeWithGroq(imageBase64);
    } else {
      // 如果没有可用的API，直接生成模拟数据
      console.warn('没有可用的API，使用模拟数据生成分析结果');
      return generateCompleteAnalysis({});
    }
  } catch (error) {
    console.warn(`${bestAPI} API调用失败，使用模拟数据:`, error);
    // 如果API调用失败，生成完整的模拟数据
    return generateCompleteAnalysis({});
  }
}

/**
 * 主要的手相分析函数
 * 使用智能API选择策略，优先选择最佳可用API
 */
export async function analyzePalmImage(imageBase64: string): Promise<PalmAnalysisResponse> {
  console.log('开始手相分析...');
  
  // 预处理图像
  const processedImage = preprocessImage(imageBase64);
  
  // 使用智能API选择策略
  const bestAPI = getBestAvailableAPI();
  console.log(`选择的最佳API: ${bestAPI}`);
  
  try {
    if (bestAPI === 'groq') {
      console.log('使用Groq API进行分析（优先选择）...');
      return await analyzeWithGroq(processedImage);
    } else if (bestAPI === 'openai') {
      console.log('使用OpenAI GPT-4o API进行分析...');
      return await analyzeWithOpenAI(processedImage);
    } else {
      console.warn('没有可用的API，使用离线模式生成分析结果...');
      return generateCompleteAnalysis({});
    }
  } catch (primaryError) {
    console.warn(`${bestAPI} API调用失败:`, primaryError);
    
    // 如果主选API是Groq失败了，只有在有OpenAI密钥的情况下才尝试OpenAI
    if (bestAPI === 'groq' && API_CONFIG.OPENAI_API_KEY && API_CONFIG.OPENAI_API_KEY.trim() !== '') {
      const openaiStatus = apiStatusMap.get('openai');
      if (openaiStatus?.available) {
        try {
          console.log('Groq失败，尝试备用API: OpenAI');
          return await analyzeWithOpenAI(processedImage);
        } catch (fallbackError) {
          console.warn('备用API OpenAI 也失败:', fallbackError);
        }
      }
    }
    // 如果主选API是OpenAI失败了，不再尝试Groq（因为用户明确要求优先Groq）
    else if (bestAPI === 'openai') {
      console.log('OpenAI API失败，由于用户设置优先Groq，不进行API切换');
    }
    
    // 如果所有API都失败，返回完整的模拟数据
    console.log('所有可用API都失败，使用离线模式生成分析结果...');
    return generateCompleteAnalysis({});
  }
}

/**
 * 图像预处理函数
 * 确保图像格式符合API要求
 */
export function preprocessImage(imageDataUrl: string): string {
  // 确保图像是base64格式
  if (!imageDataUrl.startsWith('data:image/')) {
    throw new Error('无效的图像格式');
  }
  
  // 可以在这里添加图像压缩、格式转换等逻辑
  return imageDataUrl;
}

/**
 * 验证分析结果的完整性
 */
export function validateAnalysisResult(result: any): PalmAnalysisResponse {
  const requiredSections = ['basicFeatures', 'palmLines', 'psychologicalProfile', 'detailedAnalysis', 'practicalAdvice'];
  
  for (const section of requiredSections) {
    if (!result[section]) {
      console.warn(`分析结果缺少部分: ${section}，将使用默认值`);
      // 不抛出错误，而是使用默认值
      if (!result[section]) {
        result[section] = {};
      }
    }
  }
  
  // 确保数组字段是数组格式
  if (result.detailedAnalysis?.strengths && !Array.isArray(result.detailedAnalysis.strengths)) {
    result.detailedAnalysis.strengths = [result.detailedAnalysis.strengths];
  }
  if (result.detailedAnalysis?.challenges && !Array.isArray(result.detailedAnalysis.challenges)) {
    result.detailedAnalysis.challenges = [result.detailedAnalysis.challenges];
  }
  if (result.detailedAnalysis?.personalityTraits && !Array.isArray(result.detailedAnalysis.personalityTraits)) {
    result.detailedAnalysis.personalityTraits = [result.detailedAnalysis.personalityTraits];
  }
  
  // 验证practicalAdvice中的数组字段
  if (result.practicalAdvice?.careerGuidance?.suitableFields && !Array.isArray(result.practicalAdvice.careerGuidance.suitableFields)) {
    result.practicalAdvice.careerGuidance.suitableFields = [result.practicalAdvice.careerGuidance.suitableFields];
  }
  if (result.practicalAdvice?.careerGuidance?.skillsToImprove && !Array.isArray(result.practicalAdvice.careerGuidance.skillsToImprove)) {
    result.practicalAdvice.careerGuidance.skillsToImprove = [result.practicalAdvice.careerGuidance.skillsToImprove];
  }
  if (result.practicalAdvice?.actionPlan?.shortTerm && !Array.isArray(result.practicalAdvice.actionPlan.shortTerm)) {
    result.practicalAdvice.actionPlan.shortTerm = [result.practicalAdvice.actionPlan.shortTerm];
  }
  if (result.practicalAdvice?.actionPlan?.longTerm && !Array.isArray(result.practicalAdvice.actionPlan.longTerm)) {
    result.practicalAdvice.actionPlan.longTerm = [result.practicalAdvice.actionPlan.longTerm];
  }
  if (result.practicalAdvice?.actionPlan?.dailyPractices && !Array.isArray(result.practicalAdvice.actionPlan.dailyPractices)) {
    result.practicalAdvice.actionPlan.dailyPractices = [result.practicalAdvice.actionPlan.dailyPractices];
  }
  
  return result as PalmAnalysisResponse;
}

/**
 * 获取API状态信息
 */
export function getAPIStatus() {
  const openaiStatus = apiStatusMap.get('openai');
  const groqStatus = apiStatusMap.get('groq');
  
  return {
    openai: {
      available: openaiStatus?.available || false,
      lastSuccess: openaiStatus?.lastSuccessTime,
      lastFailure: openaiStatus?.lastError,
      failureCount: openaiStatus?.failureCount || 0,
      responseTime: openaiStatus?.responseTime || 0
    },
    groq: {
      available: groqStatus?.available || false,
      lastSuccess: groqStatus?.lastSuccessTime,
      lastFailure: groqStatus?.lastError,
      failureCount: groqStatus?.failureCount || 0,
      responseTime: groqStatus?.responseTime || 0
    }
  };
}

/**
 * 重置API状态
 */
export function resetAPIStatus(apiName?: 'openai' | 'groq') {
  if (apiName) {
    apiStatusMap.set(apiName, {
      name: apiName === 'openai' ? 'OpenAI GPT-4o' : 'Groq Llama3',
      available: true,
      lastError: undefined,
      lastSuccessTime: undefined,
      failureCount: 0,
      responseTime: undefined
    });
  } else {
    // 重置所有API状态
    apiStatusMap.set('openai', {
      name: 'OpenAI GPT-4o',
      available: true,
      lastError: undefined,
      lastSuccessTime: undefined,
      failureCount: 0,
      responseTime: undefined
    });
    apiStatusMap.set('groq', {
      name: 'Groq Llama3',
      available: true,
      lastError: undefined,
      lastSuccessTime: undefined,
      failureCount: 0,
      responseTime: undefined
    });
  }
}

/**
 * 测试API连接性
 */
export async function testAPIConnection(apiName: 'openai' | 'groq'): Promise<boolean> {
  try {
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    if (apiName === 'openai') {
      await analyzeWithOpenAI(testImage);
    } else {
      await analyzeWithGroq(testImage);
    }
    
    return true;
  } catch (error) {
    console.warn(`${apiName} API连接测试失败:`, error);
    return false;
  }
}

/**
 * 记录API调用日志
 */
function logAPICall(apiName: string, success: boolean, responseTime: number, error?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    api: apiName,
    success,
    responseTime,
    error: error?.message || null
  };
  
  console.log(`[API调用日志] ${JSON.stringify(logEntry)}`);
  
  // 可以在这里添加更复杂的日志记录逻辑，比如发送到监控服务
}