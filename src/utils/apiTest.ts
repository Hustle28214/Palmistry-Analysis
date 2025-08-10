// API测试工具函数

/**
 * 测试OpenAI API连接
 */
export async function testOpenAIConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === '') {
    return { success: false, message: 'OpenAI API密钥未配置' };
  }
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "API connection successful".'
        }],
        max_tokens: 50
      })
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: `连接成功！响应: ${data.choices[0]?.message?.content || '无响应内容'}`,
        responseTime 
      };
    } else {
      const errorData = await response.json();
      return { 
        success: false, 
        message: `API调用失败: ${errorData.error?.message || response.statusText}`,
        responseTime 
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { 
      success: false, 
      message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime 
    };
  }
}

/**
 * 测试Groq API连接
 */
export async function testGroqConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey || apiKey === '') {
    return { success: false, message: 'Groq API密钥未配置' };
  }
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "API connection successful".'
        }],
        max_tokens: 50
      })
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: `连接成功！响应: ${data.choices[0]?.message?.content || '无响应内容'}`,
        responseTime 
      };
    } else {
      const errorData = await response.json();
      return { 
        success: false, 
        message: `API调用失败: ${errorData.error?.message || response.statusText}`,
        responseTime 
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { 
      success: false, 
      message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime 
    };
  }
}

/**
 * 获取API配置状态
 */
export function getAPIConfigStatus() {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const huggingfaceKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  return {
    openai: {
      configured: !!(openaiKey && openaiKey !== ''),
      keyPreview: openaiKey && openaiKey !== '' 
        ? `${openaiKey.substring(0, 8)}...${openaiKey.substring(openaiKey.length - 8)}` 
        : '未配置'
    },
    groq: {
      configured: !!(groqKey && groqKey !== ''),
      keyPreview: groqKey && groqKey !== '' 
        ? `${groqKey.substring(0, 8)}...${groqKey.substring(groqKey.length - 8)}` 
        : '未配置'
    },
    huggingface: {
      configured: !!(huggingfaceKey && huggingfaceKey !== ''),
      keyPreview: huggingfaceKey && huggingfaceKey !== '' 
        ? `${huggingfaceKey.substring(0, 8)}...${huggingfaceKey.substring(huggingfaceKey.length - 8)}` 
        : '未配置'
    }
  };
}