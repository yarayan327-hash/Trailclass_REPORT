"use client";
import React from 'react';
import { Material } from '@/types';
import { Sun, Trophy, Coffee, Microscope, FileText, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  material: Material;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const MaterialCard: React.FC<Props> = ({ material, isSelected, onSelect }) => {
  // 根据类型映射图标
  const IconMap = {
    sun: Sun,
    trophy: Trophy,
    coffee: Coffee,
    microscope: Microscope,
    file: FileText,
  };
  const Icon = IconMap[material.icon];

  // 样式逻辑：Life Track 用黄色标签，Exam Track 用蓝色标签
  const isLife = material.track === 'Life';
  
  return (
    <div 
      onClick={() => onSelect(material.id)}
      className={clsx(
        "relative bg-white p-8 rounded-[24px] cursor-pointer transition-all duration-300 border-2",
        "hover:shadow-[0_10px_30px_rgba(38,183,255,0.15)] hover:-translate-y-1",
        isSelected 
          ? "border-[#26B7FF] shadow-[0_10px_30px_rgba(38,183,255,0.15)]" 
          : "border-transparent shadow-sm"
      )}
    >
      {/* 选中时的右上角对勾 */}
      {isSelected && (
        <div className="absolute top-4 right-4 text-[#26B7FF]">
          <CheckCircle2 className="w-6 h-6 fill-blue-50" />
        </div>
      )}

      {/* 顶部标签和图标 */}
      <div className="flex justify-between items-start mb-6">
        <span className={clsx(
          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em]",
          isLife ? "bg-[#FFF9C4] text-[#8C7A00]" : "bg-[#E3F2FD] text-[#1565C0]"
        )}>
          {material.track} Track
        </span>
        <Icon className={clsx(
          "w-6 h-6",
          isLife ? "text-[#26B7FF]" : "text-[#26B7FF]" // 截图里图标统一是蓝色系
        )} strokeWidth={2} />
      </div>

      {/* 内容区域 */}
      <h3 className="text-xl font-extrabold text-[#333333] mb-3 leading-tight">
        {material.title}
      </h3>
      <p className="text-sm text-gray-500 font-medium leading-relaxed">
        {material.description}
      </p>
    </div>
  );
};