import React, { useState } from 'react';
import { CheckCircle, XCircle, Key, AlertCircle, Play, Loader2, Clock } from 'lucide-react';
import { testOpenAIConnection, testGroqConnection, getAPIConfigStatus } from '../utils/apiTest';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  message: string;
  responseTime?: number;
}

const ApiTest: React.FC = () => {
  const [openaiTesting, setOpenaiTesting] = useState(false);
  const [groqTesting, setGroqTesting] = useState(false);
  const [openaiResult, setOpenaiResult] = useState<TestResult | null>(null);
  const [groqResult, setGroqResult] = useState<TestResult | null>(null);

  const apiStatus = getAPIConfigStatus();

  const handleOpenAITest = async () => {
    setOpenaiTesting(true);
    setOpenaiResult(null);
    toast.info('正在测试 OpenAI API 连接...');
    
    try {
      const result = await testOpenAIConnection();
      setOpenaiResult(result);
      
      if (result.success) {
        toast.success('OpenAI API 连接成功！');
      } else {
        toast.error(`OpenAI API 连接失败: ${result.message}`);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: `测试过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`
      };
      setOpenaiResult(errorResult);
      toast.error('OpenAI API 测试失败');
    } finally {
      setOpenaiTesting(false);
    }
  };

  const handleGroqTest = async () => {
    setGroqTesting(true);
    setGroqResult(null);
    toast.info('正在测试 Groq API 连接...');
    
    try {
      const result = await testGroqConnection();
      setGroqResult(result);
      
      if (result.success) {
        toast.success('Groq API 连接成功！');
      } else {
        toast.error(`Groq API 连接失败: ${result.message}`);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: `测试过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`
      };
      setGroqResult(errorResult);
      toast.error('Groq API 测试失败');
    } finally {
      setGroqTesting(false);
    }
  };

  const renderTestResult = (result: TestResult | null, testing: boolean) => {
    if (testing) {
      return (
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">测试中...</span>
        </div>
      );
    }
    
    if (!result) return null;
    
    return (
      <div className={`mt-3 p-3 rounded-lg ${
        result.success 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-start space-x-2">
          {result.success ? (
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className={`text-sm ${
              result.success 
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {result.message}
            </p>
            {result.responseTime && (
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  响应时间: {result.responseTime}ms
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Key className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              API 配置测试
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              检查环境变量配置状态并测试API连接
            </p>
          </div>

          <div className="space-y-6">
            {/* OpenAI API */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  OpenAI GPT-4o API
                </h3>
                <div className="flex items-center space-x-3">
                  {apiStatus.openai.configured ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <button
                    onClick={handleOpenAITest}
                    disabled={!apiStatus.openai.configured || openaiTesting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {openaiTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {openaiTesting ? '测试中' : '测试连接'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  状态: {apiStatus.openai.configured ? '已配置' : '未配置'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  密钥预览: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {apiStatus.openai.keyPreview}
                  </code>
                </p>
              </div>
              {renderTestResult(openaiResult, openaiTesting)}
            </div>

            {/* Groq API */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Groq API
                </h3>
                <div className="flex items-center space-x-3">
                  {apiStatus.groq.configured ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <button
                    onClick={handleGroqTest}
                    disabled={!apiStatus.groq.configured || groqTesting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {groqTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {groqTesting ? '测试中' : '测试连接'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  状态: {apiStatus.groq.configured ? '已配置' : '未配置'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  密钥预览: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {apiStatus.groq.keyPreview}
                  </code>
                </p>
              </div>
              {renderTestResult(groqResult, groqTesting)}
            </div>

            {/* Hugging Face API */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Hugging Face API (可选)
                </h3>
                {apiStatus.huggingface.configured ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  状态: {apiStatus.huggingface.configured ? '已配置' : '未配置'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  密钥预览: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {apiStatus.huggingface.keyPreview}
                  </code>
                </p>
              </div>
            </div>
          </div>

          {/* 配置说明 */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              配置说明
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 请确保在项目根目录的 .env 文件中配置了相应的API密钥</li>
              <li>• 至少需要配置 OpenAI 或 Groq 其中一个API密钥</li>
              <li>• 配置完成后需要重启开发服务器以加载新的环境变量</li>
              <li>• 点击"测试连接"按钮可以验证API密钥是否有效</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;