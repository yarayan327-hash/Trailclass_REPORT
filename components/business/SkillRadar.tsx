"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface Props {
  data: { subject: string; A: number; fullMark: number }[];
}

export const SkillRadar: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          {/* 蜘蛛网底纹 */}
          <PolarGrid stroke="#E5E7EB" />
          
          {/* 维度文字 */}
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }} 
          />
          
          {/* 数据区域 - 蓝色填充 */}
          <Radar
            name="Student"
            dataKey="A"
            stroke="#26B7FF"
            strokeWidth={2}
            fill="#26B7FF"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};