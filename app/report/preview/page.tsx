"use client";

import React, { useState } from 'react';
import { SkillRadar } from '@/components/business/SkillRadar';
import { Trophy, Star, MessageCircle, Mic, Coffee, Quote, Download, Check, Languages, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

// --- 1. 多语言字典配置 ---
const TRANSLATIONS = {
  en: {
    export: "Export Certificate",
    certTitle: "CERTIFICATE",
    certSub: "of COMPLETION",
    awardedTo: "This Honor is Awarded To",
    recognition: "In recognition of outstanding performance and active participation in the trial session",
    dateLabel: "Session Date",
    instructorLabel: "Lead Instructor",
    radarTitle: "Skill Radar Analysis",
    radarDesc: "Based on the trial session observation, we've analyzed the student's current language proficiency across five core dimensions.",
    vocabTitle: "Vocabulary Focus",
    sentenceTitle: "Core Sentences",
    growthTitle: "Growth Panorama",
    feedbackTitle: "Teacher's Feedback",
    growthSteps: [
      { title: "Welcome Gate", sub: "Understand Instructions", desc: "理解指令" },
      { title: "Small Sparks", sub: "Answer Simple Questions", desc: "回答问题" },
      { title: "Playground of Logic", sub: "Express Full Sentences", desc: "表达长句" },
      { title: "School of Wisdom", sub: "Real Life Conversation", desc: "现实交流" },
      { title: "Castle of Goals", sub: "Confident Speaker", desc: "自信演讲" },
    ],
    currentMission: "CURRENT MISSION",
  },
  ar: {
    export: "تصدير الشهادة",
    certTitle: "شهادة",
    certSub: "إتمام الدورة",
    awardedTo: "تُمنح هذه الجائزة لـ",
    recognition: "تقديراً للأداء المتميز والمشاركة الفعالة في الجلسة التجريبية",
    dateLabel: "تاريخ الجلسة",
    instructorLabel: "المدرب الرئيسي",
    radarTitle: "تحليل المهارات",
    radarDesc: "بناءً على ملاحظات الجلسة، قمنا بتحليل الكفاءة اللغوية الحالية للطالب عبر خمسة أبعاد أساسية.",
    vocabTitle: "الكلمات المستهدفة",
    sentenceTitle: "الجمل الأساسية",
    growthTitle: "بانوراما النمو",
    feedbackTitle: "ملاحظات المعلم",
    growthSteps: [
      { title: "بوابة الترحيب", sub: "فهم التعليمات", desc: "Understand Instructions" },
      { title: "شرارات صغيرة", sub: "الإجابة على أسئلة بسيطة", desc: "Answer Simple Questions" },
      { title: "ملعب المنطق", sub: "التعبير بجمل كاملة", desc: "Express Full Sentences" },
      { title: "مدرسة الحكمة", sub: "محادثة واقعية", desc: "Real Life Conversation" },
      { title: "قلعة الأهداف", sub: "متحدث واثق", desc: "Confident Speaker" },
    ],
    currentMission: "المهمة الحالية",
  }
};

// --- Mock Data ---
const REPORT_DATA = {
  studentName: "Yara",
  courseName: "Football Mania",
  date: "December 30, 2025",
  teacher: "Ms. Hala",
  scores: [
    { subject: 'Vocabulary', A: 3, fullMark: 5 },
    { subject: 'Grammar', A: 3, fullMark: 5 },
    { subject: 'Listening', A: 2, fullMark: 5 },
    { subject: 'Speaking', A: 2, fullMark: 5 },
    { subject: 'Confidence', A: 3, fullMark: 5 },
  ],
  vocab: [
    { word: "football", zh: "كرة القدم" },
    { word: "kick", zh: "يركل" },
    { word: "goal", zh: "هدف" },
    { word: "team", zh: "فريق" },
    { word: "ball", zh: "كرة" },
  ],
  sentences: [
    { en: "I like to play football.", zh: "أحب لعب كرة القدم.", icon: "star" },
    { en: "He can kick the ball.", zh: "يستطيع ركل الكرة.", icon: "sparkle" },
  ]
};

export default function ReportPreviewPage() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const t = TRANSLATIONS[lang];
  const isAr = lang === 'ar';

  return (
    <div className={clsx("min-h-screen bg-[#F6F6F6] font-sans py-10 px-4 md:px-8", isAr ? "rtl" : "ltr")}>
      
      {/* --- Top Control Bar --- */}
      <div className="max-w-4xl mx-auto flex justify-between mb-6 no-print">
         <button 
           onClick={() => setLang(prev => prev === 'en' ? 'ar' : 'en')}
           className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-bold text-xs shadow-sm hover:bg-gray-50"
         >
           <Languages className="w-4 h-4" /> {lang === 'en' ? 'العربية' : 'English'}
         </button>

        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[#26B7FF] font-bold text-sm shadow-sm hover:shadow-md transition-all"
        >
          <Download className="w-4 h-4" /> {t.export}
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8" dir={isAr ? "rtl" : "ltr"}>

        {/* --- 1. Certificate Card --- */}
        <div className="bg-white rounded-[30px] p-2 shadow-xl relative overflow-hidden">
          <div className="border-4 border-[#FFD700] rounded-[24px] p-8 md:p-12 text-center relative z-10">
            <div className={clsx("absolute top-6 text-[10px] text-[#26B7FF] font-black tracking-widest uppercase", isAr ? "right-6" : "left-6")}>
              Trial Session Certified<br/><span className="text-gray-300">ID: 51TK-KSA-EURL73</span>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FDE700] rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                <Trophy className="w-8 h-8 text-[#333333]" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-[#333333] mb-2 tracking-tight">
              {t.certTitle} <span className="italic text-gray-200 font-light">{t.certSub}</span>
            </h1>
            
            <p className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase mb-8">
              {t.awardedTo}
            </p>

            <h2 className="text-5xl md:text-6xl font-black text-[#333333] mb-8 relative inline-block">
              {REPORT_DATA.studentName}
              <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[#FDE700] opacity-50 -rotate-1"></div>
            </h2>

            <p className="text-gray-500 max-w-lg mx-auto leading-relaxed mb-12">
              {t.recognition} <span className="text-[#26B7FF] font-bold">"{REPORT_DATA.courseName}"</span>.
            </p>

            <div className="flex justify-between items-end border-t border-gray-100 pt-8 max-w-xl mx-auto">
              <div className="text-left rtl:text-right">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{t.dateLabel}</p>
                <p className="font-bold text-[#333333]">{REPORT_DATA.date}</p>
              </div>
              <div className="text-right rtl:text-left">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{t.instructorLabel}</p>
                <p className="font-bold text-[#26B7FF] font-handwriting text-xl">{REPORT_DATA.teacher}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. Radar Analysis Section --- */}
        <div className="bg-white rounded-[30px] p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="bg-gray-50 rounded-3xl p-4 order-2 md:order-1">
              <SkillRadar data={REPORT_DATA.scores} />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-black text-[#333333] mb-4">{t.radarTitle}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {t.radarDesc}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {REPORT_DATA.scores.map(s => (
                  <div key={s.subject} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-gray-400">{s.subject}</span>
                    <span className="font-bold text-[#333333]">{s.A}<span className="text-gray-300 text-xs">/5</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. Vocab & Sentences --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[30px] p-8 shadow-sm">
            <h3 className="font-black text-lg text-[#333333] mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#26B7FF] text-xs">Aa</div>
              {t.vocabTitle}
            </h3>
            <div className="space-y-3">
              {REPORT_DATA.vocab.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-[#F8F9FA] p-4 rounded-xl">
                  <span className="font-bold text-[#333333]">{item.word}</span>
                  <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-md">{item.zh}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="font-black text-lg text-[#333333] mb-2 px-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#FDE700] fill-current" />
                {t.sentenceTitle}
             </h3>
             {REPORT_DATA.sentences.map((sent, i) => (
               <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-2xl bg-[#FFF9C4] flex-shrink-0 flex items-center justify-center text-[#Fbc02d]">
                    <Sparkles className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-bold text-[#333333] text-lg mb-1">{sent.en}</p>
                   <p className="text-xs text-gray-400 font-medium">{sent.zh}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* --- 4. Growth Panorama (Updated Style) --- */}
        <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
           <span className="inline-block bg-blue-50 text-[#26B7FF] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Learning Journey</span>
           <h3 className="text-3xl font-black text-[#333333] mb-16">{t.growthTitle}</h3>

           {/* Panorama Container */}
           <div className="relative max-w-lg mx-auto space-y-12">
              
              {t.growthSteps.map((step, index) => {
                const isLast = index === t.growthSteps.length - 1;
                const isEven = index % 2 === 0;
                
                return (
                  <div key={index} className={clsx(
                    "flex items-center relative z-10", 
                    isLast ? "justify-center flex-col gap-4" : (isEven ? (isAr ? "flex-row" : "flex-row-reverse") : (isAr ? "flex-row-reverse" : "flex-row"))
                  )}>
                    
                    {/* Text Side (Only for non-last items) */}
                    {!isLast && (
                      <div className={clsx("w-1/2 px-4", isEven ? "text-left rtl:text-right" : "text-right rtl:text-left")}>
                         <h4 className="text-[10px] font-black uppercase text-[#26B7FF] tracking-widest mb-1">{step.title}</h4>
                         <p className="text-sm font-extrabold text-[#333333] leading-tight">{step.sub}</p>
                         <p className="text-[10px] text-gray-400 mt-1">{step.desc}</p>
                      </div>
                    )}

                    {/* Icon Center */}
                    <div className={clsx("relative flex-shrink-0 group cursor-default")}>
                      <div className={clsx(
                        "w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-transform duration-300 hover:scale-105",
                        isLast ? "bg-[#5CB8FF] ring-4 ring-[#FDE700]" : "bg-[#5CB8FF]"
                      )}>
                        <Star className="w-8 h-8 text-white fill-current" />
                      </div>
                      
                      {/* Checkmark Badge */}
                      <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                         <Check className="w-3 h-3 text-[#26B7FF] stroke-[4px]" />
                      </div>

                      {/* Current Mission Label (Only Last Item) */}
                      {isLast && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#333333] text-[#FDE700] text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 shadow-lg">
                           {t.currentMission} <Sparkles className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Text Side (Alternative for odd items) - actually handled by flex-row/reverse above */}
                     {!isLast && <div className="w-1/2"></div>}
                     
                     {/* Last Item Text (Bottom) */}
                     {isLast && (
                       <div className="text-center mt-2">
                          <h4 className="text-[10px] font-black uppercase text-[#26B7FF] tracking-widest mb-1">{step.title}</h4>
                          <p className="text-lg font-extrabold text-[#333333] leading-tight">{step.sub}</p>
                          <p className="text-xs text-gray-400 mt-1">{step.desc}</p>
                       </div>
                     )}

                  </div>
                );
              })}
           </div>
        </div>

        {/* --- 5. Teacher Feedback --- */}
        <div className="bg-[#26B7FF] rounded-[30px] p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-blue-200">
          <Quote className="absolute top-8 left-8 w-12 h-12 text-white/20" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
             {/* ... Teacher avatar & info same as before ... */}
            <div className="flex-shrink-0 text-center">
              <div className="w-20 h-20 bg-white rounded-full mx-auto border-4 border-[#FDE700] overflow-hidden mb-3">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Teacher" />
              </div>
              <div className="bg-[#FDE700] text-[#333333] text-[10px] font-black px-3 py-1 rounded-full uppercase">Specialist</div>
            </div>
            <div className="text-center md:text-left rtl:md:text-right">
              <h4 className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">{t.feedbackTitle}</h4>
              <p className="text-xl md:text-2xl font-bold leading-relaxed italic mb-6">
                "We recommend practicing 'listen and repeat' exercises at home and using visual aids to reinforce the connection between actions and words."
              </p>
              <div className="border-t border-white/20 pt-4">
                 <p className="font-black text-2xl">Ms. Hala</p>
                 <p className="text-xs text-blue-100 font-bold tracking-[0.2em] uppercase">51Talk Global Education Team</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}