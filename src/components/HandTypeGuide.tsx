import React from 'react';
import { Hand, Square, RectangleHorizontal, Triangle, Circle } from 'lucide-react';

interface HandType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  characteristics: string[];
  personality: string[];
  imageUrl: string;
}

const handTypes: HandType[] = [
  {
    id: 'square',
    name: '方形手',
    icon: Square,
    description: '手掌呈方形，手指相对较短，整体比例均匀',
    characteristics: [
      '手掌宽度与长度接近',
      '手指长度适中',
      '掌纹清晰深刻',
      '手掌厚实有力'
    ],
    personality: [
      '理性务实',
      '逻辑思维强',
      '组织能力出色',
      '责任心重',
      '执行力强'
    ],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=square%20shaped%20palm%20hand%20realistic%20clean%20background&image_size=square'
  },
  {
    id: 'rectangular',
    name: '长方形手',
    icon: RectangleHorizontal,
    description: '手掌呈长方形，手指修长，整体显得优雅',
    characteristics: [
      '手掌长度大于宽度',
      '手指修长纤细',
      '掌纹细腻',
      '手型优雅'
    ],
    personality: [
      '感性细腻',
      '艺术天赋',
      '直觉敏锐',
      '创造力丰富',
      '情感深度'
    ],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=rectangular%20shaped%20palm%20hand%20long%20fingers%20realistic%20clean%20background&image_size=square'
  },
  {
    id: 'conical',
    name: '圆锥形手',
    icon: Triangle,
    description: '手掌宽阔，手指向指尖逐渐变细，呈圆锥状',
    characteristics: [
      '手掌宽阔',
      '手指根部粗，指尖细',
      '整体呈圆锥形',
      '掌纹丰富'
    ],
    personality: [
      '创意丰富',
      '表达能力强',
      '社交活跃',
      '适应性强',
      '乐观开朗'
    ],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=conical%20shaped%20palm%20hand%20tapered%20fingers%20realistic%20clean%20background&image_size=square'
  },
  {
    id: 'pointed',
    name: '尖形手',
    icon: Circle,
    description: '手掌较小，手指尖细，整体显得精致',
    characteristics: [
      '手掌相对较小',
      '手指尖细',
      '骨骼纤细',
      '皮肤细腻'
    ],
    personality: [
      '敏感细腻',
      '直觉力强',
      '艺术气质',
      '想象力丰富',
      '精神追求高'
    ],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pointed%20shaped%20palm%20hand%20delicate%20fingers%20realistic%20clean%20background&image_size=square'
  }
];

interface HandTypeGuideProps {
  selectedType?: string;
  onTypeSelect?: (typeId: string) => void;
}

const HandTypeGuide: React.FC<HandTypeGuideProps> = ({ selectedType, onTypeSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Hand className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">手型分类指南</h2>
        <p className="text-gray-600 dark:text-gray-300">了解不同手型的特征，帮助您更好地进行手相分析</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {handTypes.map((handType) => {
          const Icon = handType.icon;
          const isSelected = selectedType === handType.id;
          
          return (
            <div
              key={handType.id}
              className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500'
              }`}
              onClick={() => onTypeSelect?.(handType.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {handType.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {handType.description}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">外观特征：</h4>
                    <ul className="space-y-1">
                      {handType.characteristics.map((char, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                          {char}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">性格特征：</h4>
                    <div className="flex flex-wrap gap-2">
                      {handType.personality.map((trait, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${
                            isSelected
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <img
                  src={handType.imageUrl}
                  alt={`${handType.name}示例`}
                  className="w-full h-32 object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">分析提示</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>• 手型分析是手相学的基础，不同手型反映不同的性格倾向</p>
          <p>• 实际分析中可能存在混合型手，需要综合考虑各种特征</p>
          <p>• 手型特征会随年龄和生活经历发生细微变化</p>
          <p>• 建议结合掌纹、手指长度等其他因素进行综合分析</p>
        </div>
      </div>
    </div>
  );
};

export default HandTypeGuide;