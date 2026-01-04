"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Loader2, BookOpen } from 'lucide-react'; 
import { clsx } from 'clsx';
import { submitAssessment } from '@/app/actions/teacher';

// --- 类型定义 ---
interface Question {
  qId: string;
  content: string;
  content_ar?: string;
  qType: string;
  tag: string;
  options: any;
}

interface TextbookItem {
  id: string;
  name: string;
}

// 🔥🔥 核心：默认兜底题目 (保证测试阶段页面不空)
const DEFAULT_QUESTIONS: Question[] = [
  { qId: 'q_vocab', content: 'Vocabulary Retention', content_ar: 'حفظ المفردات', qType: 'RADAR', tag: 'Vocabulary', options: null },
  { qId: 'q_gramm', content: 'Grammar Accuracy', content_ar: 'دقة القواعد', qType: 'RADAR', tag: 'Grammar', options: null },
  { qId: 'q_listen', content: 'Listening Comprehension', content_ar: 'فهم الاستماع', qType: 'RADAR', tag: 'Listening', options: null },
  { qId: 'q_speak', content: 'Speaking Fluency', content_ar: 'طلاقة التحدث', qType: 'RADAR', tag: 'Speaking', options: null },
  { qId: 'q_conf', content: 'Confidence & Interaction', content_ar: 'الثقة والتفاعل', qType: 'RADAR', tag: 'Confidence', options: null },
];

export default function AssessmentFormPage({ params }: { params: { materialId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 中的 ID (可能是 SessionID)
  const sessionId = params.materialId; 
  const urlName = searchParams.get('name') || "Student";
  const [studentName, setStudentName] = useState(urlName);
  
  const [loading, setLoading] = useState(true);
  const [loadingQs, setLoadingQs] = useState(false);
  
  const [materials, setMaterials] = useState<TextbookItem[]>([]); 
  const [selectedMaterialId, setSelectedMaterialId] = useState(""); 
  const [selectedMaterialName, setSelectedMaterialName] = useState(""); 

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 初始化：加载教材列表
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/textbook-list");
        const json = await res.json();
        
        if (json.success && json.data.length > 0) {
          setMaterials(json.data);
          setSelectedMaterialId(json.data[0].id);
          setSelectedMaterialName(json.data[0].name);
        } else {
          // 极端情况：API 挂了，手动塞一个
          const mockMat = { id: 'MOCK', name: 'Trailclass Demo (Fallback)' };
          setMaterials([mockMat]);
          setSelectedMaterialId(mockMat.id);
          setSelectedMaterialName(mockMat.name);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 2. 加载题目 (带 Mock 兜底)
  useEffect(() => {
    if (!selectedMaterialId) return;

    async function fetchQuestions() {
      setLoadingQs(true);
      
      // 如果选的是 Mock 教材，直接用 Mock 题目
      if (selectedMaterialId.startsWith('MOCK')) {
        setQuestions(DEFAULT_QUESTIONS);
        setLoadingQs(false);
        return;
      }

      try {
        const res = await fetch(`/api/textbook/${selectedMaterialId}`); 
        const data = await res.json();
        
        if (data.questions && data.questions.length > 0) {
          const radarQs = data.questions.filter((q: any) => q.qType === 'RADAR');
          // 如果筛选完没题目（可能是 Excel 没填对），还是用 Mock
          if (radarQs.length === 0) setQuestions(DEFAULT_QUESTIONS);
          else setQuestions(radarQs);
        } else {
          setQuestions(DEFAULT_QUESTIONS);
        }
      } catch (e) {
        console.error("Using default questions due to error", e);
        setQuestions(DEFAULT_QUESTIONS);
      } finally {
        setLoadingQs(false);
      }
    }
    fetchQuestions();
  }, [selectedMaterialId]);

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedMaterialId(newId);
    const mat = materials.find(m => m.id === newId);
    if (mat) setSelectedMaterialName(mat.name);
  };

  const handleSelect = (qId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 构造分数
      const scoresToSubmit: Record<string, number> = {};
      questions.forEach(q => {
        if (answers[q.qId]) {
          scoresToSubmit[q.tag || q.qId] = answers[q.qId];
        }
      });

      // 默认好评 (如果老师没填具体的评语逻辑)
      const defaultFeedback = `Great job today, ${studentName}! You showed excellent participation and I really enjoyed having you in class. Keep practicing!`;

      const result = await submitAssessment({
        sessionId: sessionId, 
        studentName: studentName,
        teacherId: 'current-user',
        scores: scoresToSubmit, 
        feedback: defaultFeedback, 
        materialName: selectedMaterialName 
      });
      
      if (result && result.success) {
        router.push(`/report/${result.data.id}`);
      } else {
        alert("Submission failed. Try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("System error.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#26B7FF] w-8 h-8"/></div>;

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans pb-40">
      
      {/* 顶部 */}
      <div className="sticky top-0 z-50 bg-[#F6F6F6]/90 backdrop-blur-md border-b border-gray-200/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/teacher/schedule" className="flex items-center gap-1 text-[#26B7FF] font-extrabold hover:opacity-80">
            <ChevronLeft className="w-5 h-5 stroke-[3px]" /> Back
          </Link>
          <div className="text-gray-400 font-bold text-xs uppercase tracking-widest">
            Session: {sessionId}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#333333] mb-4">Class Assessment</h1>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
             <span className="text-gray-400 font-bold text-sm uppercase">Student:</span>
             <input 
               type="text" 
               value={studentName}
               onChange={(e) => setStudentName(e.target.value)}
               className="font-black text-[#26B7FF] text-lg bg-transparent border-b-2 border-transparent focus:border-[#26B7FF] focus:outline-none text-center min-w-[100px]"
             />
          </div>
        </div>

        <div className="space-y-6">
          {/* 教材选择 */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
               <BookOpen className="text-[#26B7FF]" size={24} />
               <h3 className="text-xl font-extrabold text-[#333]">Select Material</h3>
            </div>
            <div className="relative">
              <select 
                value={selectedMaterialId}
                onChange={handleMaterialChange}
                className="w-full h-14 bg-gray-50 rounded-xl px-4 font-bold text-[#333] border-2 border-transparent focus:border-[#26B7FF] outline-none appearance-none cursor-pointer"
              >
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-bold px-1">
              *Testing Mode: Default questions loaded if material empty.
            </p>
          </div>

          {/* 题目渲染 */}
          {loadingQs ? (
            <div className="py-10 text-center text-gray-400 flex flex-col items-center">
              <Loader2 className="animate-spin mb-2" /> Loading...
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.qId} className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-xl bg-[#26B7FF] text-white flex items-center justify-center font-extrabold text-sm">{idx + 1}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#26B7FF] bg-blue-50 px-3 py-1 rounded-lg">{q.tag || 'General'}</span>
                </div>
                
                <h3 className="text-xl font-extrabold text-[#333333] mb-2">{q.content}</h3>
                {q.content_ar && (
                  <p className="text-gray-400 text-sm font-bold text-right mb-6" dir="rtl">{q.content_ar}</p>
                )}

                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleSelect(q.qId, val)}
                      className={clsx(
                        "h-12 md:h-14 rounded-xl font-bold transition-all",
                        answers[q.qId] === val 
                          ? "bg-[#26B7FF] text-white shadow-lg scale-105" 
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-6 border-t shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-4xl mx-auto flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-12 py-4 rounded-full bg-[#FDE700] text-[#333333] text-lg font-extrabold shadow-xl hover:scale-105 transition-all"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}