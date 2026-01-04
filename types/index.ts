// report-system/types/index.ts

export type TrackType = 'Life' | 'Exam';

export interface Material {
  id: string;
  title: string;
  description: string;
  track: TrackType;
  icon: 'sun' | 'trophy' | 'coffee' | 'microscope' | 'file'; // 对应截图里的图标
  level?: string;
}