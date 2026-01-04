"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { saveProfile } from '@/app/actions/auth';
import { Camera, Check } from 'lucide-react';
import { clsx } from 'clsx';

// 生成 1-10 的图片路径
const DEFAULT_AVATARS = Array.from({ length: 10 }, (_, i) => `/avatars/defaults/${i + 1}.png`);

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const rawName = searchParams.get('name') || ""; 

  const [prefix, setPrefix] = useState("Ms.");
  const [nameBase, setNameBase] = useState(rawName);
  const [avatarType, setAvatarType] = useState<'upload' | 'default'>('default');
  const [selectedDefault, setSelectedDefault] = useState(DEFAULT_AVATARS[0]);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadPreview(URL.createObjectURL(file));
      setAvatarType('upload');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-[#333] mb-2">Welcome, Instructor!</h1>
        <p className="text-gray-400 font-bold mb-8">Let's set up your profile card one time. This will be shown on all your student reports.</p>

        <form action={saveProfile} onSubmit={() => setSubmitting(true)} className="space-y-8">
          
          {/* 1. 设置名字 */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm">
            <h2 className="text-xl font-black text-[#333] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-[#26B7FF] rounded-full flex items-center justify-center text-sm">1</span>
              Your Display Name
            </h2>
            <div className="flex gap-4">
              <select 
                name="prefix" 
                value={prefix} 
                onChange={e => setPrefix(e.target.value)}
                className="h-14 bg-gray-50 rounded-2xl px-4 font-bold outline-none focus:ring-2 focus:ring-[#26B7FF] border-r-[16px] border-transparent"
              >
                <option>Ms.</option>
                <option>Mr.</option>
                <option>Mrs.</option>
                <option>Dr.</option>
                <option>Tr.</option>
              </select>
              <input 
                name="nameBase"
                type="text" 
                value={nameBase}
                onChange={e => setNameBase(e.target.value)}
                className="flex-1 h-14 bg-gray-50 rounded-2xl px-6 font-bold outline-none focus:ring-2 focus:ring-[#26B7FF]"
              />
            </div>
            <p className="mt-4 text-center text-gray-400 font-bold text-sm">
              Preview: <span className="text-[#26B7FF] text-lg">{prefix} {nameBase}</span>
            </p>
          </div>

          {/* 2. 设置头像 */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm">
            <h2 className="text-xl font-black text-[#333] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm">2</span>
              Choose Avatar
            </h2>

            <input type="hidden" name="avatarType" value={avatarType} />
            <input type="hidden" name="defaultAvatarUrl" value={selectedDefault} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* 选项 A: 上传 */}
              <div 
                className={clsx("border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative", 
                  avatarType === 'upload' ? "border-[#26B7FF] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <input 
                  type="file" 
                  name="avatarFile"
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm overflow-hidden relative">
                  {uploadPreview ? (
                    <img src={uploadPreview} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-gray-400" />
                  )}
                </div>
                <p className="font-bold text-[#333]">Upload Photo</p>
                <p className="text-xs text-gray-400 mt-1">Tap to browse</p>
                {avatarType === 'upload' && <div className="absolute top-4 right-4 bg-[#26B7FF] text-white p-1 rounded-full"><Check size={12}/></div>}
              </div>

              {/* 选项 B: 默认头像网格 */}
              <div>
                <p className="font-bold text-[#333] mb-4 text-center text-sm">Or pick a default:</p>
                <div className="grid grid-cols-5 gap-2">
                  {DEFAULT_AVATARS.map((src) => (
                    <div 
                      key={src}
                      onClick={() => { setSelectedDefault(src); setAvatarType('default'); }}
                      className={clsx("aspect-square rounded-xl cursor-pointer border-2 overflow-hidden transition-all bg-gray-100",
                        (avatarType === 'default' && selectedDefault === src) ? "border-[#26B7FF] ring-2 ring-blue-200" : "border-transparent hover:border-gray-200"
                      )}
                    >
                      <img src={src} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            disabled={submitting}
            className="w-full h-16 bg-[#26B7FF] text-white rounded-full font-black text-xl shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {submitting ? 'Setting up Profile...' : 'Complete Setup'}
          </button>

        </form>
      </div>
    </div>
  );
}