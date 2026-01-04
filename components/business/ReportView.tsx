"use client";

import React, { useState } from 'react';
import { 
  Download, ChevronLeft, ChevronRight, Quote, Star, 
  Activity, Sparkles, Trophy, Users, CheckCircle2, Flag, Lock, Globe
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

// --- 1. 静态资源与配置 (翻译字典) ---
const TRANSLATIONS = {
  en: {
    back: "Back to Dashboard",
    export: "Export Certificate",
    certTag: "Trial Session Certified",
    certTitle: "CERTIFICATE",
    certSub: "of COMPLETION",
    awardedTo: "This honor is awarded to",
    recognition: "In recognition of outstanding performance and active participation in the trial session",
    date: "Session Date",
    instructor: "Lead Instructor",
    auditTag: "Performance Audit",
    radarTitle: "Skill Radar Analysis",
    radarDesc: "Based on the trial session observation, we've analyzed the student's current language proficiency across five core dimensions.",
    vocabTitle: "Vocabulary Focus",
    sentTitle: "Core Sentences",
    journeyTag: "Learning Journey",
    journeyTitle: "Growth Panorama",
    currentMission: "Current Mission",
    specialist: "Academy Specialist",
    team: "Trailclass Global Education Team",
    r_vocab: "Vocabulary",
    r_grammar: "Grammar",
    r_listening: "Listening",
    r_speaking: "Speaking",
    r_confidence: "Confidence"
  },
  ar: {
    back: "عودة إلى لوحة التحكم",
    export: "تصدير الشهادة",
    certTag: "شهادة الجلسة التجريبية",
    certTitle: "شهادة",
    certSub: "إتمام الدورة",
    awardedTo: "تُمنح هذه الشهادة لـ",
    recognition: "تقديراً للأداء المتميز والمشاركة الفعالة في الجلسة التجريبية",
    date: "تاريخ الجلسة",
    instructor: "المدرب المسؤول",
    auditTag: "تدقيق الأداء",
    radarTitle: "تحليل المهارات",
    radarDesc: "بناءً على ملاحظات الجلسة التجريبية، قمنا بتحليل الكفاءة اللغوية الحالية للطالب عبر خمسة أبعاد رئيسية.",
    vocabTitle: "الكلمات الجديدة",
    sentTitle: "الجمل الأساسية",
    journeyTag: "رحلة التعلم",
    journeyTitle: "بانوراما النمو",
    currentMission: "المهمة الحالية",
    specialist: "أخصائي الأكاديمية",
    team: "فريق التعليم العالمي Trailclass",
    r_vocab: "المفردات",
    r_grammar: "القواعد",
    r_listening: "الاستماع",
    r_speaking: "تحدث",
    r_confidence: "الثقة"
  }
};

// --- 2. 子组件 (SVG 图表等) ---
const RadarChart = ({ scores, labels }: { scores: any, labels: any }) => {
  const size = 240; 
  const center = size / 2; 
  const radius = 80;
  const keys = Object.keys(scores); 
  const total = keys.length;

  const getLabel = (key: string) => {
    if(key === 'Vocabulary') return labels.r_vocab;
    if(key === 'Grammar') return labels.r_grammar;
    if(key === 'Listening') return labels.r_listening;
    if(key === 'Speaking') return labels.r_speaking;
    if(key === 'Confidence') return labels.r_confidence;
    return key;
  };

  const getAngle = (index: number) => (Math.PI * 2 * index) / total - Math.PI / 2;
  const getPoint = (index: number, value: number, max: number) => {
    const angle = getAngle(index);
    const r = (value / max) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };
  
  const gridCircles = [1, 2, 3, 4, 5].map(level => (
    <circle key={`grid-${level}`} cx={center} cy={center} r={(level / 5) * radius} fill="none" stroke="#854d0e" strokeWidth="1" opacity="0.3" />
  ));
  const axesLines = keys.map((_, i) => {
    const [ex, ey] = getPoint(i, 5, 5);
    return <line key={`axis-${i}`} x1={center} y1={center} x2={ex} y2={ey} stroke="#854d0e" strokeWidth="1" opacity="0.3" />;
  });
  const dataCoordinates = keys.map((key, i) => getPoint(i, scores[key], 5));
  const dataPointsStr = dataCoordinates.map(p => p.join(',')).join(' ');
  const dataDots = dataCoordinates.map((p, i) => (
    <circle key={`dot-${i}`} cx={p[0]} cy={p[1]} r="5" fill="#26B7FF" stroke="white" strokeWidth="2" />
  ));
  const labelElements = keys.map((key, i) => {
    const angle = getAngle(i);
    const [ax, ay] = getPoint(i, 5, 5);
    const labelOffset = 30; 
    const lx = center + (radius + labelOffset) * Math.cos(angle);
    const ly = center + (radius + labelOffset) * Math.sin(angle);
    let anchor = "middle"; let baseline = "middle";
    if (i === 0) { anchor = "middle"; baseline = "auto"; } 
    else if (i === 1 || i === 2) { anchor = "start"; }    
    else { anchor = "end"; }                              
    return (
      <g key={`label-${i}`}>
        <line x1={ax} y1={ay} x2={lx} y2={ly} stroke="#854d0e" strokeWidth="1" opacity="0.6" />
        <text x={lx} y={ly} textAnchor={anchor} dominantBaseline={baseline} className="text-[11px] font-black fill-black capitalize">
          {getLabel(key)}
        </text>
      </g>
    );
  });
  
  return (
    <div className="relative flex flex-col items-center my-4">
      <svg width={size} height={size} className="overflow-visible filter drop-shadow-sm">
        {gridCircles} {axesLines}
        <polygon points={dataPointsStr} fill="#26B7FF" fillOpacity="0.5" stroke="#26B7FF" strokeWidth="3" strokeLinejoin="round" />
        {dataDots} {labelElements}
      </svg>
    </div>
  );
};

const WindingPathBg = () => (
  <svg className="absolute top-0 left-0 w-full h-full -z-0" viewBox="0 0 400 600" preserveAspectRatio="none">
    <path d="M 200,0 C 200,0 200,40 140,80 C 60,130 60,180 140,220 C 220,260 220,310 140,360 C 60,410 60,460 140,500 C 200,530 200,600 200,600" fill="none" stroke="#DBEAFE" strokeWidth="4" strokeDasharray="8 8" className="opacity-60"/>
    <path d="M 200,0 C 200,0 200,40 140,80 C 60,130 60,180 140,220 C 220,260 220,310 140,360 C 60,410 60,460 140,500 C 200,530 200,600 200,600" fill="none" stroke="#BFDBFE" strokeWidth="12" className="opacity-20"/>
  </svg>
);

// --- 3. 类型定义 (这就是你的"契约"，后端数据必须满足这个格式) ---
export interface ReportData {
  reportId: string;
  studentName: string;
  sessionDate: string;
  instructor: string;
  courseName: string;
  scores: Record<string, number>;
  feedback: string;
  vocabulary: { word: string; trans: string }[];
  sentences: { en: string; ar?: string; icon?: any }[];
}

interface ReportViewProps {
  data: ReportData; // 接收整理好的数据
}

// --- 4. 主 UI 组件 (纯展示，不含任何后端调用) ---
export default function ReportView({ data }: ReportViewProps) {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');
  const handleExport = () => window.print();

  // 学习路径逻辑
  const journeySteps = [
    { title: lang === 'en' ? "Welcome Gate" : "بوابة الترحيب", sub: lang === 'en' ? "Understand Instructions" : "فهم التعليمات", status: 'passed' },
    { title: lang === 'en' ? "Small Sparks" : "شرارة البداية", sub: lang === 'en' ? "Answer Simple Questions" : "الإجابة على أسئلة بسيطة", status: 'passed' },
    { title: lang === 'en' ? "Playground of Logic" : "ملعب المنطق", sub: lang === 'en' ? "Express Full Sentences" : "تكوين جمل كاملة", status: 'current' },
    { title: lang === 'en' ? "School of Wisdom" : "مدرسة الحكمة", sub: lang === 'en' ? "Real Life Conversation" : "محادثة واقعية", status: 'locked' },
    { title: lang === 'en' ? "Castle of Goals" : "قلعة الأهداف", sub: lang === 'en' ? "Confident Speaker" : "متحدث واثق", status: 'locked', icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-white font-sans pb-20 selection:bg-blue-100" dir={isRtl ? "rtl" : "ltr"}>
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm px-6 py-4 mb-8 no-print">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
           <Link href="/teacher/evaluate" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-sm transition-colors">
            {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />} {t.back}
          </Link>
          <button onClick={toggleLang} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-all">
            <Globe size={16} /> {lang === 'en' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-8">
        
        {/* 证书卡片 */}
        <div className="bg-white rounded-[32px] p-3 shadow-lg border-2 border-blue-100/50">
          <div className="border-[3px] border-[#FDE700] rounded-[24px] p-8 md:p-12 relative overflow-hidden">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-[#26B7FF] font-black text-xs tracking-[0.2em] uppercase mb-1">{t.certTag}</p>
                <p className="text-gray-300 text-[10px] font-mono" dir="ltr">ID: {data.reportId.toUpperCase()}</p>
              </div>
              <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#26B7FF] text-[#26B7FF] font-bold text-xs hover:bg-blue-50 transition-colors no-print">
                <Download size={14} /> {t.export}
              </button>
            </div>
            <div className="text-center mb-16 relative">
              <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-[#FDE700] p-3 rounded-full shadow-lg"><Trophy className="text-[#333] w-6 h-6" /></div>
              <h1 className="text-4xl md:text-5xl font-serif italic text-gray-300 mb-6 mt-4">
                <span className="font-bold text-[#333] not-italic mr-3">{t.certTitle}</span> {t.certSub}
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{t.awardedTo}</p>
              <div className="inline-block relative">
                 <h2 className="text-7xl md:text-8xl font-black text-[#333] tracking-tighter relative z-10">{data.studentName}</h2>
                 <div className="absolute bottom-4 left-0 right-0 h-6 bg-[#FDE700] -z-0"></div>
              </div>
              <p className="mt-8 text-gray-500 max-w-lg mx-auto leading-relaxed">
                {t.recognition} <span className="font-bold text-[#26B7FF]">"{data.courseName}"</span>.
              </p>
            </div>
            <div className="flex justify-between max-w-2xl mx-auto pb-8">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">{t.date}</p>
                <p className="font-black text-[#333]">{data.sessionDate}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">{t.instructor}</p>
                <p className="font-black text-[#26B7FF]">{data.instructor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 雷达图 */}
        <div className="bg-[#FDE700] rounded-[32px] p-8 md:p-12 shadow-lg text-[#333] relative overflow-hidden print:bg-[#FDE700]">
            <Sparkles className={clsx("absolute top-10 text-yellow-600/30 w-24 h-24", isRtl ? "left-10" : "right-10")} />
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 flex justify-center p-4 md:p-0">
                    <RadarChart scores={data.scores} labels={t} />
                </div>
                <div className="flex-1">
                    <div className="inline-block bg-white text-amber-900 text-[10px] font-black px-3 py-1.5 rounded-md mb-4 uppercase shadow-sm">{t.auditTag}</div>
                    <h3 className="text-4xl font-black mb-6 text-black">{t.radarTitle}</h3>
                    <p className="text-gray-900 text-base mb-8 leading-relaxed font-bold">{t.radarDesc}</p>
                    <div className="grid grid-cols-2 gap-3">
                    {Object.entries(data.scores).slice(0,4).map(([key, val]) => (
                        <div key={key} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border border-yellow-100">
                        <span className="text-[11px] font-black text-amber-900 uppercase">
                          {key === 'Vocabulary' && t.r_vocab}
                          {key === 'Grammar' && t.r_grammar}
                          {key === 'Listening' && t.r_listening}
                          {key === 'Speaking' && t.r_speaking}
                        </span>
                        <span className="text-2xl font-black text-black" dir="ltr">{val as number}/5</span>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            </div>
        </div>

        {/* 词汇与句型 */}
        <div className="bg-[#26B7FF] rounded-[32px] p-8 md:p-12 shadow-lg text-white print:bg-[#26B7FF]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <div className="flex items-center gap-2 mb-8 text-white">
                        <span className="text-2xl">🧠</span><h3 className="text-2xl font-black">{t.vocabTitle}</h3>
                    </div>
                    <div className="space-y-3">
                    {data.vocabulary.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <span className="font-black text-xl" dir="ltr">{item.word}</span>
                            <span className="text-[#26B7FF] text-xs font-bold bg-white px-3 py-1 rounded-full shadow-sm">
                              {lang === 'en' ? item.word : item.trans}
                            </span>
                        </div>
                    ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-8 px-2 text-white">
                        <span className="text-[#FDE700]">⚡️</span><h3 className="text-2xl font-black">{t.sentTitle}</h3>
                    </div>
                    {data.sentences.map((sent, i) => (
                        <div key={i} className="bg-white p-6 rounded-[24px] shadow-md flex gap-5 items-center transform hover:scale-[1.02] transition-transform">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#26B7FF] flex items-center justify-center shrink-0">
                              {sent.icon ? <sent.icon size={20} /> : <Star size={20} />}
                            </div>
                            <div>
                                <p className="font-black text-[#333] text-lg mb-1" dir="ltr">{sent.en}</p>
                                <p className="text-gray-400 text-xs font-medium font-sans">{lang === 'ar' ? sent.ar : ""}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 成长路径 */}
        <div className="bg-white p-12 rounded-[32px] shadow-lg text-center relative overflow-hidden min-h-[700px] border-2 border-gray-100">
           <div className="inline-block px-4 py-2 border border-blue-100 rounded-full text-[#26B7FF] text-xs font-bold uppercase tracking-widest mb-6">📍 {t.journeyTag}</div>
           <h2 className="text-3xl font-black text-[#333] mb-16 relative z-10">{t.journeyTitle}</h2>
           <div className="max-w-lg mx-auto relative">
             <WindingPathBg />
             <div className="space-y-24 relative z-10 py-10">
               {journeySteps.map((step, i) => {
                 const isEven = i % 2 === 0;
                 const alignLeft = isRtl ? !isEven : isEven; 
                 let iconStyles = ''; let textStyles = ''; let StatusIcon = null;
                 if (step.status === 'passed') {
                    iconStyles = 'bg-[#26B7FF] text-white shadow-md'; textStyles = 'text-[#333]';
                    StatusIcon = <CheckCircle2 size={16} className="text-[#26B7FF] bg-white rounded-full" />;
                 } else if (step.status === 'current') {
                    iconStyles = 'bg-[#FDE700] text-[#333] shadow-[0_0_25px_rgba(253,231,0,0.7)] scale-110'; textStyles = 'text-[#333]';
                    StatusIcon = <Sparkles size={16} className="text-[#FDE700] bg-[#333] p-0.5 rounded-full" />;
                 } else {
                    iconStyles = 'bg-gray-100 text-gray-300'; textStyles = 'text-gray-300 grayscale';
                    StatusIcon = <Lock size={14} className="text-gray-300" />;
                 }
                 return (
                   <div key={i} className={`flex items-center gap-8 ${alignLeft ? 'flex-row text-left' : 'flex-row-reverse text-right'} transition-all`}>
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shrink-0 relative z-10 transition-transform ${iconStyles}`} 
                          style={{ transform: alignLeft ? 'translateX(-20px)' : 'translateX(20px)' }}>
                       {step.icon ? <step.icon size={30} /> : <Star size={30} fill={step.status !== 'locked' ? "currentColor" : "none"} />}
                       <div className="absolute -top-1 -right-1 z-20">{StatusIcon}</div>
                     </div>
                     <div className={`flex-1 ${alignLeft ? 'pl-4' : 'pr-4'} ${textStyles}`}>
                       <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${step.status === 'passed' ? 'text-[#26B7FF]' : (step.status === 'current' ? 'text-amber-500' : 'text-gray-400')}`}>{step.title}</p>
                       <h4 className="font-black text-xl mb-1">{step.sub}</h4>
                     </div>
                   </div>
                 );
               })}
               <div className="absolute top-[43%] left-[65%] z-20 hidden md:block">
                  <div className="bg-[#333] text-[#FDE700] px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-xl animate-bounce">
                    {t.currentMission} <Sparkles size={10} />
                  </div>
               </div>
             </div>
           </div>
        </div>

        {/* 老师反馈 */}
        <div className="bg-[#26B7FF] rounded-[32px] p-8 md:p-12 text-white relative shadow-lg overflow-hidden mb-12 print:bg-[#26B7FF]">
           <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
             <div className="relative shrink-0">
               <div className="w-28 h-28 bg-[#FDE700] rounded-[24px] flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-xl">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Annie" alt="Teacher" className="w-24 h-24" />
               </div>
               <div className="absolute -bottom-3 -left-3 -right-3 bg-[#FDE700] text-[#333] text-[10px] font-black text-center py-1 rounded-full shadow-sm uppercase">{t.specialist}</div>
             </div>
             <div className="flex-1 text-center md:text-left">
               <Quote className="text-white/30 w-12 h-12 mb-4 mx-auto md:mx-0" />
               <h3 className="text-xl md:text-2xl font-black italic leading-relaxed mb-6" dir="ltr">"{data.feedback}"</h3>
               <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
                 <div></div>
                 <div className="text-right"><p className="font-black text-2xl">{data.instructor}</p><p className="text-blue-100 text-[10px] uppercase tracking-[0.2em] opacity-80">{t.team}</p></div>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}