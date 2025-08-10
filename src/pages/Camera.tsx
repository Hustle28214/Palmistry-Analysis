import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, RefreshCw, AlertCircle, Settings, Monitor, Video, Shield, Bug, Upload, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';

type PermissionState = 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error' | 'https_required';

interface DebugInfo {
  isHttps: boolean;
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  userAgent: string;
  availableDevicesCount: number;
  lastError: string;
  attempts: number;
}

interface CameraDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export default function CameraPage() {
  const navigate = useNavigate();
  const { setCurrentImage } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [permissionState, setPermissionState] = useState<PermissionState>('requesting');
  const [errorMessage, setErrorMessage] = useState('');
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    isHttps: false,
    hasMediaDevices: false,
    hasGetUserMedia: false,
    userAgent: '',
    availableDevicesCount: 0,
    lastError: '',
    attempts: 0
  });

  // 更新调试信息
  const updateDebugInfo = useCallback(() => {
    const info: DebugInfo = {
      isHttps: window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      userAgent: navigator.userAgent,
      availableDevicesCount: availableDevices.length,
      lastError: '',
      attempts: 0
    };
    setDebugInfo(prev => ({ ...prev, ...info, attempts: prev.attempts + 1 }));
    return info;
  }, [availableDevices.length]);

  // 枚举可用的摄像头设备
  const enumerateDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn('enumerateDevices not supported');
        setDebugInfo(prev => ({ ...prev, lastError: 'enumerateDevices API not supported' }));
        return [];
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `摄像头 ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
      
      console.log('Detected video devices:', videoDevices);
      setAvailableDevices(videoDevices);
      
      // 更新调试信息中的设备数量
      setDebugInfo(prev => ({ ...prev, availableDevicesCount: videoDevices.length }));
      
      if (videoDevices.length === 0) {
        setPermissionState('unavailable');
        setErrorMessage('未检测到摄像头设备，请检查设备连接或尝试刷新页面');
        setDebugInfo(prev => ({ ...prev, lastError: 'No video input devices found' }));
        return [];
      }
      
      return videoDevices;
    } catch (error: any) {
      console.error('Error enumerating devices:', error);
      setPermissionState('error');
      setErrorMessage('无法检测摄像头设备');
      setDebugInfo(prev => ({ ...prev, lastError: `Enumerate devices error: ${error.toString()}` }));
      return [];
    }
  }, []);

  // 尝试多种配置启动摄像头
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setIsLoading(true);
      setPermissionState('requesting');
      setErrorMessage('');
      
      // 更新调试信息
      const debug = updateDebugInfo();
      
      // 检查HTTPS环境
      if (!debug.isHttps) {
        setPermissionState('https_required');
        setErrorMessage('摄像头需要HTTPS环境或localhost访问');
        return;
      }
      
      // 检查是否支持摄像头API
      if (!debug.hasMediaDevices || !debug.hasGetUserMedia) {
        setPermissionState('unavailable');
        setErrorMessage('您的浏览器不支持摄像头功能，请使用现代浏览器');
        return;
      }

      console.log('Starting camera with deviceId:', deviceId);
      
      // 枚举设备
      const devices = await enumerateDevices();
      if (devices.length === 0) {
        return;
      }

      // 简化的配置选项，优先使用最基础的配置
      const configs = [
        // 最简配置 - 优先尝试
        {
          video: deviceId ? { deviceId: { exact: deviceId } } : true
        },
        // 基础配置
        {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        // 中等分辨率配置
        {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: deviceId ? undefined : 'user'
          }
        }
      ];

      let mediaStream: MediaStream | null = null;
      let lastError: any = null;
      let configIndex = 0;

      // 依次尝试不同配置
      for (const config of configs) {
        try {
          console.log(`Trying camera config ${configIndex + 1}:`, config);
          mediaStream = await navigator.mediaDevices.getUserMedia(config);
          console.log('Camera started successfully with config:', config);
          break;
        } catch (error: any) {
          lastError = error;
          console.warn(`Camera config ${configIndex + 1} failed:`, config, error);
          configIndex++;
        }
      }

      if (!mediaStream) {
        throw lastError;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setPermissionState('granted');
        if (deviceId) {
          setSelectedDeviceId(deviceId);
        }
        console.log('Camera stream attached to video element');
        toast.success('摄像头启动成功！');
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      // 更新调试信息中的错误
      setDebugInfo(prev => ({ ...prev, lastError: error.toString() }));
      
      // 详细的错误处理
      if (error.name === 'NotAllowedError') {
        setPermissionState('denied');
        setErrorMessage('摄像头权限被拒绝，请点击地址栏的摄像头图标允许访问');
      } else if (error.name === 'NotFoundError') {
        setPermissionState('unavailable');
        setErrorMessage('未检测到摄像头设备，请检查设备连接或尝试其他摄像头');
      } else if (error.name === 'NotReadableError') {
        setPermissionState('error');
        setErrorMessage('摄像头被其他应用占用，请关闭其他应用后重试');
      } else if (error.name === 'OverconstrainedError') {
        setPermissionState('error');
        setErrorMessage('摄像头不支持所需的分辨率，请尝试其他设备');
      } else if (error.name === 'SecurityError') {
        setPermissionState('https_required');
        setErrorMessage('安全限制：摄像头需要HTTPS环境');
      } else {
        setPermissionState('error');
        setErrorMessage(`摄像头启动失败: ${error.message || error.toString()}`);
      }
      
      toast.error(errorMessage || '摄像头启动失败');
    } finally {
      setIsLoading(false);
    }
  }, [errorMessage, enumerateDevices, updateDebugInfo]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
    toast.success('照片拍摄成功！');
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    const imageToUse = mode === 'camera' ? capturedImage : uploadedImage;
    if (imageToUse) {
      setCurrentImage(imageToUse);
      navigate('/analysis');
    }
  }, [capturedImage, uploadedImage, mode, setCurrentImage, navigate]);

  // 文件上传处理
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 文件类型验证
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('请选择 JPG、PNG 或 WebP 格式的图片');
      return;
    }

    // 文件大小验证 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('图片文件大小不能超过 10MB');
      return;
    }

    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadedImage(result);
        setCapturedImage(null); // 清除拍摄的照片
        toast.success('图片上传成功！');
      }
    };
    reader.onerror = () => {
      toast.error('图片读取失败，请重试');
    };
    reader.readAsDataURL(file);
  }, []);

  // 触发文件选择
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 清除上传的图片
  const clearUploadedImage = useCallback(() => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 切换模式
  const switchMode = useCallback((newMode: 'camera' | 'upload') => {
    setMode(newMode);
    if (newMode === 'camera') {
      clearUploadedImage();
      if (!stream && permissionState !== 'granted') {
        startCamera();
      }
    } else {
      stopCamera();
      setCapturedImage(null);
    }
  }, [stream, permissionState, startCamera, stopCamera, clearUploadedImage]);

  // 获取浏览器名称
  const getBrowserName = useCallback(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return '浏览器';
  }, []);

  // 获取权限指导
  const getPermissionGuide = useCallback(() => {
    const browser = getBrowserName();
    const guides = {
      Chrome: '点击地址栏左侧的摄像头图标，选择"允许"',
      Firefox: '点击地址栏左侧的摄像头图标，选择"允许"',
      Safari: '在Safari菜单中选择"偏好设置" > "网站" > "摄像头"',
      Edge: '点击地址栏左侧的摄像头图标，选择"允许"',
    };
    return guides[browser as keyof typeof guides] || '在浏览器设置中允许此网站访问摄像头';
  }, [getBrowserName]);

  // 初始化
  useEffect(() => {
    // 初始化调试信息
    updateDebugInfo();
    // 只在拍照模式下自动启动摄像头
    if (mode === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []); // 移除依赖项以避免无限循环

  // 切换摄像头设备
  const switchCamera = useCallback((deviceId: string) => {
    stopCamera();
    startCamera(deviceId);
    setShowDeviceList(false);
  }, [startCamera, stopCamera]);

  // 权限被拒绝时的界面
  const renderPermissionDenied = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">需要摄像头权限</h3>
      <p className="text-gray-300 mb-4">{errorMessage}</p>
      
      <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 mb-6 max-w-sm">
        <h4 className="font-semibold text-white mb-2 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          {getBrowserName()}权限设置
        </h4>
        <p className="text-sm text-blue-100">{getPermissionGuide()}</p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={() => startCamera()}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          重新请求权限
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="block px-6 py-2 text-gray-300 hover:text-white transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );

  // HTTPS要求界面
  const renderHttpsRequired = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <Shield className="w-16 h-16 text-yellow-400 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">需要安全连接</h3>
      <p className="text-gray-300 mb-4">{errorMessage}</p>
      
      <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-4 mb-6 max-w-sm">
        <h4 className="font-semibold text-white mb-2 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          解决方案
        </h4>
        <ul className="text-sm text-yellow-100 text-left space-y-1">
          <li>• 使用 localhost 访问（推荐开发环境）</li>
          <li>• 使用 HTTPS 协议访问网站</li>
          <li>• 在浏览器中允许不安全的本地连接</li>
        </ul>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新页面
        </button>
        
        <button
          onClick={() => startCamera()}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
        >
          <Camera className="w-4 h-4 mr-2" />
          重试访问摄像头
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="block px-6 py-2 text-gray-300 hover:text-white transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );

  // 摄像头不可用时的界面
  const renderUnavailable = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <AlertCircle className="w-16 h-16 text-yellow-400 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">摄像头不可用</h3>
      <p className="text-gray-300 mb-4">{errorMessage}</p>
      
      {availableDevices.length > 0 && (
        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 mb-4 max-w-sm">
          <h4 className="font-semibold text-white mb-2 flex items-center">
            <Video className="w-4 h-4 mr-2" />
            检测到的摄像头设备
          </h4>
          <div className="space-y-2">
            {availableDevices.map((device) => (
              <button
                key={device.deviceId}
                onClick={() => switchCamera(device.deviceId)}
                className="w-full p-2 text-sm bg-blue-800 hover:bg-blue-700 rounded text-white transition-colors"
              >
                {device.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-4 mb-6 max-w-sm">
        <h4 className="font-semibold text-white mb-2">解决方案：</h4>
        <ul className="text-sm text-yellow-100 text-left space-y-1">
          <li>• 检查摄像头是否正确连接</li>
          <li>• 关闭其他正在使用摄像头的应用</li>
          <li>• 尝试不同的摄像头设备</li>
          <li>• 检查设备管理器中的摄像头状态</li>
          <li>• 尝试刷新页面或重启浏览器</li>
          <li>• 检查浏览器是否为最新版本</li>
        </ul>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={() => startCamera()}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          重新检测设备
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="block px-6 py-2 text-gray-300 hover:text-white transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-gray-900 dark:bg-gray-900">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">{mode === 'camera' ? '拍摄手相' : '上传手相'}</h1>
          <div className="flex items-center space-x-2">
            {/* 调试信息按钮 */}
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              title="显示调试信息"
            >
              <Bug className="w-5 h-5" />
            </button>
            
            {/* 设备选择按钮 */}
            {availableDevices.length > 1 && permissionState === 'granted' && (
              <button
                onClick={() => setShowDeviceList(!showDeviceList)}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors relative"
              >
                <Monitor className="w-6 h-6" />
                {showDeviceList && (
                  <div className="absolute top-12 right-0 bg-gray-800 rounded-lg shadow-lg p-2 min-w-48 z-10">
                    <div className="text-sm text-gray-300 mb-2">选择摄像头：</div>
                    {availableDevices.map((device) => (
                      <button
                        key={device.deviceId}
                        onClick={() => switchCamera(device.deviceId)}
                        className={`w-full p-2 text-sm rounded hover:bg-gray-700 transition-colors text-left ${
                          selectedDeviceId === device.deviceId ? 'bg-blue-600 text-white' : 'text-gray-300'
                        }`}
                      >
                        {device.label}
                      </button>
                    ))}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 模式切换选项卡 */}
        <div className="mx-4 mb-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => switchMode('camera')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                mode === 'camera'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-semibold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 mr-2" />
              拍摄照片
            </button>
            <button
              onClick={() => switchMode('upload')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                mode === 'upload'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-semibold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              上传图片
            </button>
          </div>
        </div>

        {/* 调试信息面板 */}
        {showDebugInfo && (
          <div className="mx-4 mb-4 p-4 bg-gray-800 rounded-lg text-white text-xs">
            <h4 className="font-semibold mb-2 flex items-center">
              <Bug className="w-4 h-4 mr-2" />
              调试信息
            </h4>
            <div className="space-y-1">
              <div>HTTPS: {debugInfo.isHttps ? '✅' : '❌'}</div>
              <div>MediaDevices API: {debugInfo.hasMediaDevices ? '✅' : '❌'}</div>
              <div>getUserMedia: {debugInfo.hasGetUserMedia ? '✅' : '❌'}</div>
              <div>可用设备数: {debugInfo.availableDevicesCount}</div>
              <div>尝试次数: {debugInfo.attempts}</div>
              <div>权限状态: {permissionState}</div>
              {debugInfo.lastError && (
                <div className="text-red-300">错误: {debugInfo.lastError}</div>
              )}
              <div className="text-gray-400 mt-2 break-all">
                浏览器: {debugInfo.userAgent.slice(0, 50)}...
              </div>
            </div>
          </div>
        )}

        {/* Camera/Upload View */}
        <div className="relative mx-4 mb-6">
          <div className="relative aspect-square bg-black rounded-2xl overflow-hidden">
            {mode === 'upload' ? (
              // 上传模式界面
              uploadedImage ? (
                <div className="relative w-full h-full">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                  <button
                    onClick={clearUploadedImage}
                    className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="mb-6">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">选择手相图片</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      支持 JPG、PNG、WebP 格式<br />
                      文件大小不超过 10MB
                    </p>
                  </div>
                  
                  <button
                    onClick={triggerFileSelect}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    选择图片
                  </button>
                  
                  <div className="mt-6 text-xs text-gray-400">
                    <p>• 请确保图片清晰可见手掌纹路</p>
                    <p>• 建议在光线充足的环境下拍摄</p>
                    <p>• 手掌应完整显示在图片中</p>
                  </div>
                </div>
              )
            ) : (
              // 拍照模式界面（原有逻辑）
              permissionState === 'denied' ? (
                renderPermissionDenied()
              ) : permissionState === 'https_required' ? (
                renderHttpsRequired()
              ) : permissionState === 'unavailable' || permissionState === 'error' ? (
                renderUnavailable()
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="text-white text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p>正在启动摄像头...</p>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 pb-8">
          {mode === 'upload' ? (
            // 上传模式控制按钮
            uploadedImage ? (
              <div className="flex space-x-4">
                <button
                  onClick={clearUploadedImage}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  重新选择
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all"
                >
                  开始分析
                </button>
              </div>
            ) : (
              <button
                onClick={triggerFileSelect}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all flex items-center justify-center"
              >
                <Upload className="w-6 h-6 mr-2" />
                选择图片文件
              </button>
            )
          ) : (
            // 拍照模式控制按钮（原有逻辑）
            capturedImage ? (
              <div className="flex space-x-4">
                <button
                  onClick={retakePhoto}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  重新拍摄
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all"
                >
                  开始分析
                </button>
              </div>
            ) : (
              <button
                onClick={capturePhoto}
                disabled={permissionState !== 'granted' || isLoading}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Camera className="w-6 h-6 mr-2" />
                拍摄照片
              </button>
            )
          )}
        </div>

        {/* 隐藏的文件输入元素 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}