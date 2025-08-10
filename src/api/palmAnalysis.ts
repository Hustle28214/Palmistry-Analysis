// 手相分析API集成
// 这个文件提供了与外部大模型API的集成接口

export interface PalmAnalysisRequest {
  image: string;
  prompt: string;
}

export interface PalmAnalysisResponse {
  handType: string;
  lifeLine: string;
  heartLine: string;
  headLine: string;
  personality: string[];
  fortune: string;
  health: string;
  career: string;
  love: string;
}

// 配置信息 - 在实际部署时应该使用环境变量
const API_CONFIG = {
  // 示例：OpenAI GPT-4 Vision API
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  
  // 示例：其他图像分析API
  // CUSTOM_API_KEY: import.meta.env.VITE_CUSTOM_API_KEY || '',
  // CUSTOM_API_URL: import.meta.env.VITE_CUSTOM_API_URL || '',
};

/**
 * 调用OpenAI GPT-4 Vision API进行手相分析
 */
export async function analyzeWithOpenAI(imageBase64: string): Promise<PalmAnalysisResponse> {
  if (!API_CONFIG.OPENAI_API_KEY) {
    throw new Error('OpenAI API密钥未配置');
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
              text: `请作为专业的手相分析师，详细分析这张手相图片。请按照以下格式返回JSON结果：
{
  "handType": "手型分类（如：方形手、长方形手等）",
  "lifeLine": "生命线详细分析",
  "heartLine": "感情线详细分析",
  "headLine": "智慧线详细分析",
  "personality": ["性格特点1", "性格特点2", "性格特点3"],
  "fortune": "整体运势分析",
  "health": "健康状况分析",
  "career": "事业发展分析",
  "love": "感情运势分析"
}

请确保分析专业、详细且积极正面。`
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
      max_tokens: 1000,
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
 * 调用自定义图像分析API（示例）
 */
export async function analyzeWithCustomAPI(imageBase64: string): Promise<PalmAnalysisResponse> {
  // 这里可以集成其他图像分析API
  // 例如：百度AI、腾讯AI、阿里云AI等
  
  throw new Error('自定义API尚未实现');
}

/**
 * 主要的手相分析函数
 * 会尝试多个API，如果主要API失败则使用备选方案
 */
export async function analyzePalmImage(imageBase64: string): Promise<PalmAnalysisResponse> {
  try {
    // 首先尝试OpenAI API
    return await analyzeWithOpenAI(imageBase64);
  } catch (error) {
    console.error('OpenAI API调用失败:', error);
    
    try {
      // 尝试其他API
      return await analyzeWithCustomAPI(imageBase64);
    } catch (customError) {
      console.error('自定义API调用失败:', customError);
      
      // 如果所有API都失败，抛出错误让调用方处理
      throw new Error('所有图像分析API都不可用');
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
  const requiredFields = ['handType', 'lifeLine', 'heartLine', 'headLine', 'personality', 'fortune', 'health', 'career', 'love'];
  
  for (const field of requiredFields) {
    if (!result[field]) {
      throw new Error(`分析结果缺少必要字段: ${field}`);
    }
  }
  
  // 确保personality是数组
  if (!Array.isArray(result.personality)) {
    result.personality = [result.personality];
  }
  
  return result as PalmAnalysisResponse;
}