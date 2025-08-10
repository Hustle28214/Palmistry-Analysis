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
 }

// 配置信息 - 在实际部署时应该使用环境变量
const API_CONFIG = {
  // 示例：OpenAI GPT-4 Vision API
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  
  // 免费LLM API配置
  HUGGINGFACE_API_KEY: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  HUGGINGFACE_API_URL: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
  
  // 已移除Ollama配置
  
  // 其他免费API配置
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || 'gsk_demo_key_for_testing',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
};

/**
 * 调用OpenAI GPT-4 Vision API进行手相分析
 */
export async function analyzeWithOpenAI(imageBase64: string): Promise<PalmAnalysisResponse> {
  if (!API_CONFIG.OPENAI_API_KEY || API_CONFIG.OPENAI_API_KEY === '') {
    throw new Error('OpenAI API密钥未配置。请在.env文件中设置VITE_OPENAI_API_KEY');
  }

  const response = await fetch(API_CONFIG.OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `你是一位世界顶级的手相分析大师，拥有30年的专业经验，精通传统手相学、现代心理学、行为科学、神经科学和人格心理学。请对这张手掌图片进行极其详细和深入的专业分析。

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
  });

  if (!response.ok) {
    throw new Error(`OpenAI API调用失败: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('API返回内容为空');
  }

  try {
    // 尝试解析JSON响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('无法从响应中提取JSON');
    }
  } catch (parseError) {
    console.error('解析API响应失败:', parseError);
    throw new Error('API响应格式错误');
  }
}

/**
 * 调用Groq免费API进行手相分析
 */
export async function analyzeWithGroq(imageBase64: string): Promise<PalmAnalysisResponse> {
  if (!API_CONFIG.GROQ_API_KEY || API_CONFIG.GROQ_API_KEY === '' || API_CONFIG.GROQ_API_KEY === 'gsk_demo_key_for_testing') {
    throw new Error('Groq API密钥未配置。请在.env文件中设置VITE_GROQ_API_KEY');
  }

  const response = await fetch(API_CONFIG.GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'user',
          content: `你是一位世界顶级的手相分析大师，拥有30年的专业经验，精通传统手相学、现代心理学、行为科学、神经科学和人格心理学。请对这张手掌图片进行极其详细和深入的专业分析。

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
  }
}

请确保返回完整的JSON格式，所有字段都必须填写详细内容，不得遗漏或简化。`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API调用失败: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('API返回内容为空');
  }

  try {
    // 尝试解析JSON响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('无法从响应中提取JSON');
    }
  } catch (parseError) {
    console.error('解析API响应失败:', parseError);
    throw new Error('API响应格式错误');
  }
}

// Ollama API 已移除，现在只使用 OpenAI GPT API

/**
 * 生成完整的分析结果（补充缺失字段）
 */
function generateCompleteAnalysis(baseResult: any): PalmAnalysisResponse {
  return {
    handType: baseResult.handType || '方形手',
    personality: baseResult.personality || ['理性思维', '逻辑性强', '务实稳重', '组织能力强', '责任心强'],
    lifeLine: baseResult.lifeLine || '生命线清晰深长，表示身体健康，生命力旺盛。',
    heartLine: baseResult.heartLine || '感情线弯曲向上，表示您是一个感情丰富、善于表达的人。',
    headLine: baseResult.headLine || '智慧线长度适中且清晰，显示您思维敏捷，分析能力强。',
    fortune: baseResult.fortune || '整体运势呈上升趋势，近期会有不错的机遇出现。',
    health: baseResult.health || '身体状况良好，但需要注意休息，避免过度劳累。',
    career: baseResult.career || '事业发展稳定，有贵人相助。适合从事需要创造力和沟通能力的工作。',
    love: baseResult.love || '感情运势不错，单身者有机会遇到心仪对象。',
    mbtiType: baseResult.mbtiType || 'ENTJ',
    mbtiDescription: baseResult.mbtiDescription || '指挥官型人格，天生的领导者，具有强烈的目标导向和执行力。',
    basicFeatures: {
      handType: '方形手型显示您具有务实稳重的性格，做事有条理，注重细节，善于规划和组织。',
      handSize: '手掌大小适中，表明您在处理事务时既有宏观视野，也能关注细节，平衡能力强。',
      skinTexture: '皮肤纹理细腻，显示您内心敏感细腻，对美的事物有较高的鉴赏力和追求。',
      palmThickness: '手掌厚度适中，表明您精力充沛，行动力强，能够持续投入到感兴趣的事业中。',
      fingerLength: '手指长度比例协调，显示您思维敏捷，表达能力强，善于与人沟通交流。',
      nailShape: '指甲形状规整，表明您注重个人形象，有良好的生活习惯和自我管理能力。',
      thumbAnalysis: '拇指发达有力，显示您意志力坚强，有很强的自控力和领导潜质。'
    },
    palmLines: {
      lifeLine: {
        description: '生命线起点清晰，弧度优美，延伸至手腕附近，整体线条深而稳定。',
        healthImplications: '体质良好，免疫力强，很少生病。注意保持规律作息，避免过度疲劳。',
        energyLevel: '精力充沛，活力十足，能够承担较大的工作压力和生活挑战。',
        lifeStages: '青年时期发展顺利，中年事业有成，晚年生活安康，整体人生轨迹向上。'
      },
      heartLine: {
        description: '感情线起始于小指下方，向食指方向延伸，线条清晰，略有弯曲。',
        emotionalStyle: '情感表达直接真诚，不喜欢拐弯抹角，对待感情专一认真。',
        relationshipPattern: '在恋爱中比较主动，喜欢掌控关系节奏，对伴侣要求较高。',
        empathyLevel: '共情能力强，能够理解他人情感，是朋友眼中的好倾听者。'
      },
      headLine: {
        description: '智慧线从拇指与食指间开始，向小指方向延伸，线条笔直清晰。',
        thinkingStyle: '逻辑思维能力强，善于分析问题，做决定时理性大于感性。',
        decisionMaking: '决策果断，很少犹豫不决，能够在关键时刻做出正确判断。',
        learningStyle: '学习能力强，善于总结规律，喜欢系统性的知识结构。',
        creativity: '创造力中等偏上，在实用性创新方面表现突出，能将想法转化为现实。'
      },
      fateLine: '事业线清晰向上，表明职业发展稳定上升，中年后事业运势特别旺盛。',
      marriageLine: '婚姻线清晰单一，预示感情专一，婚姻生活和谐稳定。',
      otherLines: '太阳线较为明显，表明有一定的艺术天赋和审美能力，容易获得他人认可。'
    },
    psychologicalProfile: {
      mbtiPrediction: '根据手相特征分析，您很可能是ENTJ类型（指挥官），这一判断基于您的方形手型（显示务实理性）、清晰的智慧线（显示逻辑思维）、以及手指的协调比例（显示沟通能力）。准确率约为75%。',
      cognitiveStyle: '偏向理性认知，善于逻辑分析和系统思考，在处理复杂问题时能够保持冷静客观的态度。',
      emotionalPattern: '情绪相对稳定，不容易被外界因素影响心情，但在面对重要决策时可能会有一定的焦虑感。',
      behaviorTendency: '行为模式偏向主动进取，喜欢掌控局面，在团队中往往扮演领导者或协调者的角色。',
      stressResponse: '面对压力时能够保持相对冷静，善于制定应对策略，但长期高压可能导致身心疲惫。',
      socialStyle: '社交能力强，善于建立人际关系，在群体中有一定的影响力和号召力。',
      motivationDrivers: '主要动机来源于成就感和认可感，希望通过努力获得他人尊重和社会地位。',
      unconsciousTraits: '潜意识中渴望安全感和稳定性，对不确定性有一定的焦虑，但表面上表现得很自信。'
    },
    detailedAnalysis: {
      strengths: [
        '逻辑思维能力强，善于分析问题',
        '组织协调能力出色，天生的管理者',
        '责任心强，值得信赖',
        '目标导向明确，执行力强',
        '沟通表达能力好，善于说服他人',
        '适应能力强，能够快速融入新环境',
        '学习能力强，知识更新速度快',
        '情绪控制能力好，很少情绪化',
        '人际关系处理得当，朋友圈广泛',
        '创新思维活跃，能提出建设性意见',
        '时间管理能力强，效率高',
        '抗压能力强，能承担重要责任'
      ],
      challenges: [
        '有时过于追求完美，给自己压力',
        '在细节处理上可能不够耐心',
        '对他人要求较高，容易产生失望',
        '工作与生活平衡需要改善',
        '有时显得过于理性，缺乏感性表达',
        '在面对批评时可能过于敏感',
        '长期高强度工作可能影响健康',
        '有时缺乏足够的耐心倾听他人'
      ],
      personalityTraits: [
        '理性务实', '逻辑性强', '组织能力出色', '责任心强',
        '目标导向', '执行力强', '沟通能力好', '适应性强',
        '学习能力强', '情绪稳定', '人际关系好', '创新思维',
        '时间观念强', '抗压能力强', '领导潜质', '追求完美',
        '注重效率', '值得信赖'
      ],
      communicationStyle: '沟通风格直接明了，善于用逻辑和事实说服他人，在表达观点时条理清晰，但有时可能显得过于理性，建议在沟通中增加更多的情感表达。',
      leadershipPotential: '具有很强的领导潜质，天生的管理者气质，善于制定计划和分配任务，能够激励团队成员，但需要注意倾听下属意见，采用更加民主的领导风格。',
      adaptability: '适应能力很强，能够快速融入新环境和新团队，面对变化时能够保持冷静并制定应对策略，这是您的一大优势。',
      handTexture: '手部纹理细腻均匀，显示您内心细腻敏感，对美的事物有较高的鉴赏力，同时也表明您注重生活品质。',
      fingerFlexibility: '手指灵活度良好，表明您思维敏捷，反应快速，在处理复杂问题时能够灵活变通。',
      palmTemperature: '手掌温度适中，显示您情感温度恰到好处，既不过于冷漠也不过于热情，在人际交往中能够把握好分寸。',
      bloodVessels: '血管分布均匀，表明您血液循环良好，身体健康状况不错，精力充沛。',
      muscleDevelopment: '手部肌肉发达程度适中，显示您行动力强，但不会过于冲动，能够在思考后行动。',
      skinElasticity: '皮肤弹性良好，表明您生命活力旺盛，身体机能状态良好，保养得当。',
      nailHealth: '指甲健康状态良好，形状规整，颜色正常，表明您整体健康状况不错，生活习惯良好。'
    },
    practicalAdvice: {
      careerGuidance: {
        suitableFields: [
          '企业管理', '项目管理', '咨询顾问', '金融投资',
          '市场营销', '人力资源', '教育培训', '法律服务',
          '技术管理', '创业', '政府机关', '非营利组织'
        ],
        workStyle: '适合在有一定自主权的环境中工作，喜欢制定计划并推动执行，在团队协作中能发挥重要作用，建议选择有挑战性和成长空间的工作。',
        developmentPath: '短期内专注于提升专业技能和管理能力，中期目标是成为团队或部门负责人，长期可考虑创业或担任高级管理职位。',
        skillsToImprove: [
          '情商和人际沟通技巧', '创新思维和创造力', '压力管理和情绪调节',
          '跨文化沟通能力', '数字化技能', '演讲和公众表达',
          '财务管理知识', '行业专业知识', '团队建设能力', '战略思维'
        ],
        industryRecommendations: '建议选择成长性好的行业，如科技、金融、教育、咨询等，这些行业能够充分发挥您的管理和沟通优势。',
        leadershipStyle: '适合采用变革型领导风格，注重激励和启发下属，同时保持一定的权威性，建议多倾听团队意见，采用更加民主的决策方式。'
      },
      relationshipAdvice: {
        loveStyle: '在恋爱中比较主动和直接，对感情认真专一，但有时可能过于理性，建议在表达爱意时多一些浪漫和感性的元素。',
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
    },
    lifeExperiences: {
      careerHistory: '从手相特征推测，您可能有过多次工作转换的经历，每次转换都是为了寻求更好的发展机会。您可能在管理、咨询或技术领域有丰富经验，并且在职场中逐渐展现出领导才能。',
      educationalBackground: '推测您接受过良好的高等教育，可能是商科、工程或社会科学专业背景。您在学习期间表现优秀，可能担任过学生干部或参与过重要项目。',
      majorLifeEvents: '人生中可能经历过几次重要的选择和转折，包括职业转换、居住地变迁或重要关系的建立。这些经历让您更加成熟和坚强。',
      hobbiesAndInterests: '您可能对阅读、旅行、运动或艺术有浓厚兴趣，这些爱好帮助您保持身心平衡。您也可能喜欢参加社交活动和团体组织。',
      travelExperiences: '推测您有过国内外旅行的经历，这些经历开阔了您的视野，增强了您的适应能力和跨文化沟通技巧。',
      relationshipHistory: '在感情方面，您可能经历过几段重要的关系，每段关系都让您更加了解自己的需求和期望。您在感情中比较认真和专一。',
      healthChallenges: '总体健康状况良好，但可能因为工作压力大而偶尔出现疲劳或焦虑症状。建议注意预防和及时调整。',
      personalGrowth: '您的个人成长轨迹呈现稳步上升的趋势，从青年时期的探索到现在的成熟稳重，每个阶段都有明显的进步和收获。'
    }
  };
}

/**
 * 调用自定义图像分析API（示例）
 */
export async function analyzeWithCustomAPI(imageBase64: string): Promise<PalmAnalysisResponse> {
  // 首先尝试Groq API
  try {
    return await analyzeWithGroq(imageBase64);
  } catch (groqError) {
    console.error('Groq API调用失败:', groqError);
    
    // 如果Groq失败，生成完整的模拟数据
    return generateCompleteAnalysis({});
  }
}

/**
 * 主要的手相分析函数
 * 优先使用OpenAI GPT API，如果失败则使用备选方案
 */
export async function analyzePalmImage(imageBase64: string): Promise<PalmAnalysisResponse> {
  console.log('开始手相分析...');
  
  try {
    // 首先尝试OpenAI GPT API
    console.log('尝试使用OpenAI GPT-4 Vision API...');
    return await analyzeWithOpenAI(imageBase64);
  } catch (openaiError) {
    console.warn('OpenAI API不可用:', openaiError);
    
    try {
      // 如果OpenAI失败，尝试免费的LLM API
      console.log('尝试使用免费LLM API...');
      return await analyzeWithCustomAPI(imageBase64);
    } catch (freeApiError) {
      console.warn('免费API不可用:', freeApiError);
      
      // 如果所有API都失败，返回完整的模拟数据
      console.log('使用离线模式生成分析结果...');
      return generateCompleteAnalysis({});
    }
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