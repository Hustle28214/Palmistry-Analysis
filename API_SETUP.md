# 手相分析应用 - API配置指南

本应用支持集成多种图像处理大模型API来进行手相分析。目前支持OpenAI GPT-4 Vision API，并可扩展支持其他AI服务。

## 支持的API服务

### 1. OpenAI GPT-4 Vision API（推荐）

#### 配置步骤：

1. **获取API密钥**
   - 访问 [OpenAI官网](https://platform.openai.com/)
   - 注册账户并获取API密钥
   - 确保账户有足够的余额

2. **配置环境变量**
   
   在项目根目录创建 `.env` 文件：
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **重启开发服务器**
   ```bash
   npm run dev
   ```

#### 费用说明：
- GPT-4 Vision API按使用量计费
- 每次分析大约消耗 0.01-0.03 USD
- 建议设置使用限额以控制成本

### 2. 其他AI服务（可扩展）

应用架构支持集成以下服务：
- 百度AI开放平台
- 腾讯云AI
- 阿里云视觉智能
- Google Cloud Vision API
- Azure Computer Vision

## 离线模式

如果没有配置API密钥或API调用失败，应用会自动切换到离线模式：
- 使用预设的分析模板
- 生成随机但合理的手相解读
- 确保应用正常运行

## 开发者指南

### 添加新的API服务

1. 在 `src/api/palmAnalysis.ts` 中添加新的分析函数
2. 实现 `PalmAnalysisResponse` 接口
3. 在 `analyzePalmImage` 函数中添加备选方案

### API响应格式

所有API都应返回以下格式的JSON：

```typescript
interface PalmAnalysisResponse {
  handType: string;        // 手型分类
  lifeLine: string;        // 生命线分析
  heartLine: string;       // 感情线分析
  headLine: string;        // 智慧线分析
  personality: string[];   // 性格特点数组
  fortune: string;         // 运势分析
  health: string;          // 健康分析
  career: string;          // 事业分析
  love: string;           // 感情分析
}
```

### 错误处理

应用包含完善的错误处理机制：
- API调用失败时自动降级到离线模式
- 显示用户友好的错误提示
- 记录详细的错误日志供调试

## 安全注意事项

1. **API密钥安全**
   - 不要将API密钥提交到版本控制系统
   - 使用环境变量存储敏感信息
   - 定期轮换API密钥

2. **数据隐私**
   - 用户上传的图片仅用于分析
   - 不会永久存储在外部服务器
   - 遵循相关数据保护法规

3. **使用限制**
   - 设置合理的API调用频率限制
   - 监控API使用量和成本
   - 实现缓存机制减少重复调用

## 故障排除

### 常见问题

1. **API调用失败**
   - 检查API密钥是否正确配置
   - 确认网络连接正常
   - 查看浏览器控制台错误信息

2. **分析结果异常**
   - 检查图片质量和格式
   - 确认API响应格式正确
   - 查看详细错误日志

3. **性能问题**
   - 优化图片大小和格式
   - 实现结果缓存
   - 考虑使用CDN加速

### 调试模式

在开发环境中，可以通过浏览器控制台查看详细的API调用日志：
- 请求参数
- 响应内容
- 错误信息
- 性能指标

## 生产部署

### 环境变量配置

在生产环境中设置以下环境变量：
```bash
VITE_OPENAI_API_KEY=your_production_api_key
VITE_API_TIMEOUT=30000
VITE_MAX_RETRIES=3
```

### 性能优化

1. **图片压缩**
   - 自动压缩上传的图片
   - 优化图片格式和质量

2. **缓存策略**
   - 实现本地缓存避免重复分析
   - 使用浏览器缓存存储结果

3. **错误监控**
   - 集成错误监控服务
   - 设置告警机制

## 技术支持

如果在配置或使用过程中遇到问题，请：
1. 查看浏览器控制台错误信息
2. 检查网络连接和API配置
3. 参考本文档的故障排除部分
4. 联系技术支持团队

---

**注意**: 本应用仅供娱乐和学习目的，分析结果不应作为重要决策的依据。