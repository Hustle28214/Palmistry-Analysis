# API配置指南

本应用支持多种AI分析API，您可以根据需要配置相应的API密钥。

## 🚀 快速开始

1. 复制 `.env.example` 文件为 `.env`
2. 在 `.env` 文件中填入您的API密钥
3. 重启应用

## 📋 API选项

### 1. OpenAI GPT-4 Vision API（推荐）

**优势：**
- 最佳的图像识别和分析能力
- 最详细和准确的手相分析结果
- 支持图像输入

**获取方式：**
1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 注册账号并创建API密钥
3. 在 `.env` 文件中设置：
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

**费用：** 按使用量付费，约$0.01-0.03每次分析

### 2. Groq API（免费替代方案）

**优势：**
- 完全免费
- 响应速度快
- 无需信用卡

**获取方式：**
1. 访问 [Groq Console](https://console.groq.com/keys)
2. 注册账号并创建API密钥
3. 在 `.env` 文件中设置：
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

**限制：** 不支持图像输入，基于文本模式分析

### 3. Hugging Face API（可选）

**优势：**
- 开源模型
- 免费额度
- 多种模型选择

**获取方式：**
1. 访问 [Hugging Face](https://huggingface.co/settings/tokens)
2. 创建访问令牌
3. 在 `.env` 文件中设置：
   ```
   VITE_HUGGINGFACE_API_KEY=your_huggingface_token_here
   ```

## 🔧 配置示例

创建 `.env` 文件：

```env
# 至少配置一个API密钥
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🎯 推荐配置

### 开发和测试
```env
# 使用免费的Groq API
VITE_GROQ_API_KEY=your_groq_api_key
```

### 生产环境
```env
# 使用OpenAI获得最佳效果
VITE_OPENAI_API_KEY=your_openai_api_key
# 备用方案
VITE_GROQ_API_KEY=your_groq_api_key
```

## 🛡️ 安全注意事项

1. **永远不要**将API密钥提交到版本控制系统
2. 将 `.env` 文件添加到 `.gitignore`
3. 定期轮换API密钥
4. 监控API使用量和费用

## 🔄 降级机制

应用具有智能降级机制：

1. **首选：** OpenAI GPT-4 Vision API
2. **备选：** Groq/Hugging Face API
3. **最后：** 离线模式（模拟数据）

即使没有配置任何API密钥，应用也能正常工作，只是会使用预设的分析模板。

## ❓ 常见问题

### Q: 为什么我的API调用失败？
A: 请检查：
- API密钥是否正确
- 账户是否有足够余额（OpenAI）
- 网络连接是否正常
- API服务是否可用

### Q: 可以同时配置多个API吗？
A: 可以！应用会按优先级自动选择可用的API。

### Q: 离线模式的分析结果准确吗？
A: 离线模式使用预设模板，仅供娱乐参考，不如真实AI分析准确。

### Q: 如何查看当前使用的是哪个API？
A: 打开浏览器开发者工具的控制台，可以看到详细的API调用日志。

## 📞 技术支持

如果您在配置过程中遇到问题，请：

1. 检查控制台错误信息
2. 确认API密钥格式正确
3. 验证网络连接
4. 查看API服务商的状态页面

---

配置完成后，重启应用即可开始使用AI手相分析功能！