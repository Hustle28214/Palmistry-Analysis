import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Sparkles, Clock, Shield, Star } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: Camera,
      title: '智能拍摄',
      description: '一键调用摄像头，智能识别手部轮廓，确保拍摄质量'
    },
    {
      icon: Sparkles,
      title: 'AI分析',
      description: '运用先进的人工智能技术，精准识别手相特征'
    },
    {
      icon: Clock,
      title: '快速解读',
      description: '秒级分析速度，即时获得详细的手相解读报告'
    },
    {
      icon: Shield,
      title: '隐私保护',
      description: '本地存储，数据安全，保护您的个人隐私'
    }
  ];

  const testimonials = [
    {
      name: '李小明',
      rating: 5,
      comment: '分析结果很准确，界面设计也很美观，体验很棒！'
    },
    {
      name: '王美丽',
      rating: 5,
      comment: '操作简单，分析详细，对了解自己很有帮助。'
    }
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            探索您的
            <span className="text-yellow-400">手相奥秘</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            运用AI技术，为您提供专业的手相分析服务
          </p>
          <Link
            to="/camera"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all transform hover:scale-105 shadow-lg"
          >
            <Camera className="w-6 h-6" />
            <span>开始分析</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-16">
            为什么选择我们
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-16">
            使用流程
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">拍摄手相</h3>
              <p className="text-gray-600 dark:text-gray-300">根据指导拍摄清晰的手部照片</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">AI分析</h3>
              <p className="text-gray-600 dark:text-gray-300">人工智能快速识别手相特征</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">查看结果</h3>
              <p className="text-gray-600 dark:text-gray-300">获得详细的手相解读报告</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-16">
            用户评价
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{testimonial.comment}"</p>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            准备好探索您的手相了吗？
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            立即开始，发现隐藏在您手中的秘密
          </p>
          <Link
            to="/camera"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all transform hover:scale-105 shadow-lg"
          >
            <Camera className="w-6 h-6" />
            <span>立即开始</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;