"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Download, ChevronLeft, Quote, Star, 
  Activity, Sparkles, Trophy, Lock, Globe, Gift, Rocket, BookOpen, Lightbulb
} from 'lucide-react';
import { clsx } from 'clsx';
import { getReportDetail } from '@/app/actions/teacher';

// --- UI 字典 (保持不变) ---
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
    specialist: "أخصائي الأكاديمية",
    team: "فريق التعليم العالمي Trailclass",
    r_vocab: "المفردات",
    r_grammar: "القواعد",
    r_listening: "الاستماع",
    r_speaking: "تحدث",
    r_confidence: "الثقة"
  }
};

// --- SVG Radar (保持不变) ---
const RadarChart = ({ scores, labels }: { scores: any, labels: any }) => {
  const size = 240; const center = size / 2; const radius = 80;
  const keys = Object.keys(scores); const total = keys.length;
  const getLabel = (key: string) => {
    if(key.includes('Vocab')) return labels.r_vocab;
    if(key.includes('Gramm')) return labels.r_grammar;
    if(key.includes('Listen')) return labels.r_listening;
    if(key.includes('Speak')) return labels.r_speaking;
    if(key.includes('Confid')) return labels.r_confidence;
    return key;
  };
  const getAngle = (index: number) => (Math.PI * 2 * index) / total - Math.PI / 2;
  const getPoint = (index: number, value: number, max: number) => {
    const angle = getAngle(index);
    const r = (value / max) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };
  const dataCoordinates = keys.map((key, i) => getPoint(i, scores[key], 5));
  const dataPointsStr = dataCoordinates.map(p => p.join(',')).join(' ');
  return (
    <div className="relative flex flex-col items-center my-4">
      <svg width={size} height={size} className="overflow-visible filter drop-shadow-sm">
        {[1, 2, 3, 4, 5].map(level => (
          <circle key={level} cx={center} cy={center} r={(level / 5) * radius} fill="none" stroke="#854d0e" strokeWidth="1" opacity="0.1" />
        ))}
        {keys.map((_, i) => {
          const [ex, ey] = getPoint(i, 5, 5);
          return <line key={i} x1={center} y1={center} x2={ex} y2={ey} stroke="#854d0e" strokeWidth="1" opacity="0.1" />;
        })}
        <polygon points={dataPointsStr} fill="#26B7FF" fillOpacity="0.5" stroke="#26B7FF" strokeWidth="3" strokeLinejoin="round" />
        {dataCoordinates.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#26B7FF" stroke="white" strokeWidth="2" />)}
        {keys.map((key, i) => {
          const angle = getAngle(i);
          const [ax, ay] = getPoint(i, 5, 5);
          const lx = center + (radius + 25) * Math.cos(angle);
          const ly = center + (radius + 25) * Math.sin(angle);
          let anchor = "middle" as const;
          if (i === 1 || i === 2) anchor = "start";
          if (i === 3 || i === 4) anchor = "end";
          return (
             <text key={key} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" className="text-[10px] font-black fill-black uppercase tracking-wider">{getLabel(key)}</text>
          );
        })}
      </svg>
    </div>
  );
};

// --- 🔥 兜底数据 ---
const FALLBACK_VOCAB = ["Apple", "Banana", "Orange", "Grape"];
const FALLBACK_VOCAB_AR = ["تفاحة", "موز", "برتقال", "عنب"];
const FALLBACK_SENTENCES = ["How are you?", "What is your name?", "I like apples."];
const FALLBACK_SENTENCES_AR = ["كيف حالك؟", "ما اسمك؟", "أنا أحب التفاح."];

export default function ReportPage() {
  const params = useParams();
  const reportId = (params?.id as string) || (params?.reportId as string) || "";
  
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  const getLang = (obj: any, field: string) => {
    if (!obj) return "";
    if (lang === 'ar' && obj[`${field}_ar`]) return obj[`${field}_ar`];
    return obj[field] || "";
  };

  useEffect(() => {
    async function fetchData() {
      if (!reportId) {
        setLoading(false);
        return;
      }
      const result = await getReportDetail(reportId);
      if (result.success && result.data) {
        const d = new Date(result.data.sessionDate);
        const formattedDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        setData({ ...result.data, sessionDate: formattedDate });
      }
      setLoading(false);
    }
    fetchData();
  }, [reportId]);

  const toggleLang = () => { setLang(prev => prev === 'en' ? 'ar' : 'en'); };
  const handleExport = () => { window.print(); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26B7FF]"></div></div>;
  
  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 gap-4">
      <div className="p-4 bg-gray-100 rounded-full"><Lock size={32}/></div>
      <p className="font-bold">Report unavailable</p>
    </div>
  );

  // --- 数据处理 ---
  const modules = data.textbook?.modules || [];
  const vocabModule = modules.find((m: any) => m.title.toLowerCase().includes('vocab')) || {};
  let vocabList = [];
  try {
    const rawContent = getLang(vocabModule, 'content');
    vocabList = rawContent ? JSON.parse(rawContent) : (lang === 'en' ? FALLBACK_VOCAB : FALLBACK_VOCAB_AR);
  } catch (e) { vocabList = FALLBACK_VOCAB; }

  const sentModule = modules.find((m: any) => m.title.toLowerCase().includes('sent')) || {};
  let sentList = [];
  try {
    const rawContent = getLang(sentModule, 'content');
    sentList = rawContent ? JSON.parse(rawContent) : (lang === 'en' ? FALLBACK_SENTENCES : FALLBACK_SENTENCES_AR);
  } catch (e) { sentList = FALLBACK_SENTENCES; }

  // --- 成长路径数据 ---
  const journeySteps = [
    { title: lang === 'en' ? "Welcome Gate" : "بوابة الترحيب", status: 'passed', icon: Star },
    { title: lang === 'en' ? "Small Sparks" : "شرارة البداية", status: 'passed', icon: Star },
    { title: lang === 'en' ? "Playground of Logic" : "ملعب المنطق", status: 'current', icon: Star },
    { title: lang === 'en' ? "School of Wisdom" : "مدرسة الحكمة", status: 'locked', icon: BookOpen },
    { title: lang === 'en' ? "Castle of Goals" : "قلعة الأهداف", status: 'locked', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-white font-sans pb-20 selection:bg-blue-100" dir={isRtl ? "rtl" : "ltr"}>
      {/* 🔥 添加新的动画 Keyframes */}
      <style jsx global>{`
        @media print { @page { margin: 0; size: auto; } .no-print { display: none !important; } }
        
        @keyframes dash-flow {
          to { stroke-dashoffset: -32; }
        }
        .animate-dash-flow {
          animation: dash-flow 1s linear infinite;
        }

        @keyframes ripple-effect {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .ripple-container::before, .ripple-container::after {
          content: ''; absolute; inset: 0; border-radius: 9999px; background-color: #FDE700; z-index: -1;
          animation: ripple-effect 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .ripple-container::after { animation-delay: 0.8s; }

        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.9; }
          50% { transform: translate(var(--tx), var(--ty)); opacity: 0.5; }
        }

        /* 🔥 新增：路径光效动画 */
        @keyframes path-glow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(38, 183, 255, 0.3)); }
          50% { filter: drop-shadow(0 0 6px rgba(38, 183, 255, 0.6)); }
        }
        .path-glow { animation: path-glow 2s ease-in-out infinite; }
      `}</style>

      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 mb-8 no-print">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
           <Link href="/teacher/schedule" className="flex items-center gap-2 text-gray-500 text-sm font-bold">
            {isRtl ? <ChevronLeft className="rotate-180" /> : <ChevronLeft />} {t.back}
          </Link>
          <button onClick={toggleLang} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
            <Globe size={16} /> {lang === 'en' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-8">
        
        {/* 证书 (保持不变) */}
        <div className="bg-white rounded-[32px] p-3 shadow-lg border-2 border-blue-100/50">
          {/* ...证书内容... */}
          <div className="border-[3px] border-[#FDE700] rounded-[24px] p-8 md:p-12 relative overflow-hidden text-center">
            <div className="flex justify-between items-start mb-8 absolute top-8 left-8 right-8">
              <p className="text-[#26B7FF] font-black text-xs tracking-[0.2em] uppercase">{t.certTag}</p>
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#26B7FF] text-[#26B7FF] font-bold text-xs hover:bg-blue-50 no-print">
                <Download size={14} /> {t.export}
              </button>
            </div>
            <Trophy className="text-[#333] w-12 h-12 mx-auto mt-8 mb-4 bg-[#FDE700] p-2 rounded-full shadow-lg" />
            <h1 className="text-4xl md:text-5xl font-serif italic text-gray-300 mb-6">
              <span className="font-bold text-[#333] not-italic mr-3">{t.certTitle}</span>{t.certSub}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{t.awardedTo}</p>
            <h2 className="text-6xl md:text-8xl font-black text-[#333] tracking-tighter mb-8">{data.studentName}</h2>
            <p className="text-gray-500 max-w-lg mx-auto leading-relaxed mb-8">{t.recognition} <span className="font-bold text-[#26B7FF]">"{data.courseName}"</span>.</p>
            <div className="flex justify-center gap-12 border-t border-gray-100 pt-8">
              <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t.date}</p><p className="font-black text-[#333]">{data.sessionDate}</p></div>
              <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t.instructor}</p><p className="font-black text-[#26B7FF]">{data.instructor}</p></div>
            </div>
          </div>
        </div>

        {/* 雷达图 (保持不变) */}
        <div className="bg-[#FDE700] rounded-[32px] p-8 md:p-12 shadow-lg text-[#333] relative overflow-hidden">
          {/* ...雷达图内容... */}
          <Sparkles className="absolute top-10 right-10 text-yellow-600/20 w-32 h-32" />
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 w-full flex justify-center"><RadarChart scores={data.scores} labels={t} /></div>
            <div className="flex-1">
               <div className="inline-block bg-white text-amber-900 text-[10px] font-black px-3 py-1.5 rounded-md mb-4 uppercase shadow-sm">{t.auditTag}</div>
               <h3 className="text-4xl font-black mb-6">{t.radarTitle}</h3>
               <p className="text-gray-900 font-bold leading-relaxed mb-6">{t.radarDesc}</p>
               <div className="grid grid-cols-2 gap-3">
                 {Object.entries(data.scores).slice(0,4).map(([k,v]) => (
                   <div key={k} className="bg-white/50 p-3 rounded-xl flex justify-between items-center border border-yellow-600/10">
                     <span className="text-xs font-black uppercase text-amber-900">{k}</span>
                     <span className="font-black">{v as number}/5</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* 词汇与句型 (保持不变) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-[#26B7FF] rounded-[32px] p-8 shadow-lg text-white">
             {/* ...词汇内容... */}
             <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><span className="text-2xl">🧠</span> {getLang(vocabModule, 'title') || t.vocabTitle}</h3>
             <div className="space-y-3">
               {vocabList.map((word: string, i: number) => (
                 <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 font-black text-xl flex justify-between items-center">
                   <span>{word}</span>
                   <span className="w-2 h-2 bg-white rounded-full opacity-50"></span>
                 </div>
               ))}
             </div>
           </div>
           <div className="bg-white border-2 border-gray-100 rounded-[32px] p-8 shadow-sm">
             {/* ...句型内容... */}
             <h3 className="text-2xl font-black mb-6 text-[#333] flex items-center gap-2"><span>⚡️</span> {getLang(sentModule, 'title') || t.sentTitle}</h3>
             <div className="space-y-4">
               {sentList.map((sent: string, i: number) => (
                 <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                   <Activity className="text-[#26B7FF] shrink-0 mt-1" size={18} />
                   <p className="font-bold text-[#333]">{sent}</p>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* 🔥🔥🔥 成长路径 (炫酷光影升级版) 🔥🔥🔥 */}
        {/* 增加 overflow-hidden 和相对定位，用于包含背景元素 */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl border-2 border-gray-50 relative overflow-hidden">
           
           {/* 🔥 增加环境光效和粒子 */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full filter blur-[80px] opacity-40 animate-pulse"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-100 rounded-full filter blur-[80px] opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
           
           <Rocket className="absolute top-8 left-8 text-blue-200 w-20 h-20 -rotate-45 opacity-70 blur-[1px] animate-pulse" style={{animationDuration: '4s'}} />
           <Lightbulb className="absolute bottom-16 right-8 text-yellow-200 w-16 h-16 rotate-12 opacity-70 blur-[1px] animate-pulse" style={{animationDuration: '5s'}} />
           <div className="absolute top-1/3 right-20 w-4 h-4 bg-blue-300 rounded-full opacity-50 animate-bounce blur-[1px]" style={{animationDuration: '6s'}}></div>
           <div className="absolute bottom-1/4 left-24 w-6 h-6 bg-yellow-300 rounded-full opacity-50 animate-bounce blur-[1px]" style={{animationDuration: '7s'}}></div>

           <div className="text-center mb-10 relative z-10">
             <div className="inline-block px-4 py-2 border border-blue-100 rounded-full text-[#26B7FF] text-xs font-bold uppercase tracking-widest mb-4 bg-white/80 backdrop-blur-sm shadow-sm">📍 {t.journeyTag}</div>
             <h2 className="text-3xl font-black text-[#333]">{t.journeyTitle}</h2>
           </div>
           
           <div className="max-w-md mx-auto relative z-10">
             {/* 🔥 升级背景路径：增加光影和流动感 */}
             <svg className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full pointer-events-none path-glow" viewBox="0 0 400 600" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                   <stop offset="0%" stopColor="#85D6FF" stopOpacity="0.2" />
                   <stop offset="50%" stopColor="#26B7FF" stopOpacity="0.6" />
                   <stop offset="100%" stopColor="#85D6FF" stopOpacity="0.2" />
                 </linearGradient>
               </defs>
               {/* 底层光晕路径 */}
               <path d="M 200 30 C 200 120, 120 120, 120 200 C 120 280, 280 280, 280 360 C 280 440, 200 440, 200 530" stroke="url(#pathGradient)" strokeWidth="14" fill="none" strokeLinecap="round" className="blur-[4px]" />
               {/* 中层实线路径 */}
               <path d="M 200 30 C 200 120, 120 120, 120 200 C 120 280, 280 280, 280 360 C 280 440, 200 440, 200 530" stroke="#E5E7EB" strokeWidth="8" fill="none" strokeLinecap="round" />
               {/* 上层流动虚线 (更亮) */}
               <path d="M 200 30 C 200 120, 120 120, 120 200 C 120 280, 280 280, 280 360 C 280 440, 200 440, 200 530" stroke="#26B7FF" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="12 12" className="animate-dash-flow" />
             </svg>

             <div className="space-y-12 relative z-10 py-4">
               {journeySteps.map((step, i) => {
                 const isLeft = i % 2 === 1;
                 const offsetClass = isLeft ? "-translate-x-20" : "translate-x-20";
                 const Icon = step.icon;
                 const isCurrent = step.status === 'current';
                 const isPassed = step.status === 'passed';
                 
                 return (
                   <div key={i} className={clsx("flex flex-col items-center transition-transform relative", i !== 0 && i !== journeySteps.length -1 ? offsetClass : "")}>
                     
                     {/* 🔥 漂浮粒子 (增强版) */}
                     {isCurrent && (
                       <>
                         <Star className="absolute top-0 -left-10 text-yellow-400 w-5 h-5 animate-[float-particle_3s_ease-in-out_infinite] filter drop-shadow-md" style={{'--tx': '-12px', '--ty': '-18px'} as React.CSSProperties} fill="currentColor" />
                         <Star className="absolute bottom-0 -right-10 text-yellow-300 w-4 h-4 animate-[float-particle_4s_ease-in-out_infinite_0.5s] filter drop-shadow-sm" style={{'--tx': '12px', '--ty': '18px'} as React.CSSProperties} fill="currentColor" />
                         <Sparkles className="absolute -top-6 right-0 text-yellow-200 w-6 h-6 animate-[float-particle_3.5s_ease-in-out_infinite_1s] filter drop-shadow-md" style={{'--tx': '6px', '--ty': '-12px'} as React.CSSProperties} />
                       </>
                     )}

                     <div className={clsx("relative group", isCurrent ? "ripple-container" : "")}>
                       {/* 节点主体 (增强光影和质感) */}
                       <div className={clsx(
                         "w-20 h-20 rounded-full flex items-center justify-center border-[5px] relative z-10 transition-all duration-300 group-hover:scale-105",
                         isPassed ? 'bg-gradient-to-br from-[#26B7FF] to-[#0099FF] border-[#85D6FF] text-white shadow-lg shadow-blue-300/50' : 
                         isCurrent ? 'bg-gradient-to-br from-[#FDE700] to-[#E6C200] border-[#FFF59D] text-[#333] scale-110 shadow-xl shadow-yellow-300/60' : 'bg-gray-50 border-gray-200 text-gray-300 shadow-sm'
                       )}>
                         <Icon size={28} fill={step.status !== 'locked' ? "currentColor" : "none"} strokeWidth={2.5} className="filter drop-shadow-sm" />
                       </div>
                     </div>

                     {/* 文本标签 (增强 hover 效果) */}
                     <div className={clsx(
                       "text-center mt-3 bg-white/90 backdrop-blur-sm p-1.5 px-4 rounded-full shadow-sm border border-gray-100 transition-all duration-300",
                       isCurrent ? "border-yellow-300 shadow-yellow-200/50 scale-105 font-black" : "group-hover:border-blue-200 group-hover:shadow-blue-100/50 group-hover:scale-105"
                       )}>
                       <h4 className={clsx("font-black text-xs whitespace-nowrap", step.status === 'locked' ? 'text-gray-400' : 'text-[#333]')}>{step.title}</h4>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
        </div>

        {/* 评语 (保持不变) */}
        <div className="bg-[#26B7FF] text-white rounded-[32px] p-8 md:p-12 shadow-lg flex flex-col md:flex-row gap-8 items-center">
           {/* ...评语内容... */}
           <div className="w-24 h-24 bg-[#FDE700] rounded-2xl flex items-center justify-center border-4 border-white/20 shadow-xl shrink-0">
             <img src={data.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Teacher" className="w-full h-full object-cover" />
           </div>
           <div className="flex-1 text-center md:text-left">
             <Quote className="text-white/30 w-10 h-10 mb-4 mx-auto md:mx-0" />
             <h3 className="text-lg md:text-xl font-bold italic leading-relaxed mb-4" dir="auto">"{data.feedback}"</h3>
             <p className="font-black text-xl">{data.instructor}</p>
             <p className="text-blue-100 text-[10px] uppercase tracking-[0.2em]">{t.team}</p>
           </div>
        </div>

      </div>
    </div>
  );
}