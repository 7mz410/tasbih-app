/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Plus, ListMusic, History, ChevronLeft, ChevronRight, Volume2, VolumeX, Languages } from 'lucide-react';

import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';

// Types
interface DhikrOption {
  id: string;
  ar: string;
  en: string;
  target: number;
}

const DEFAULT_DHIKR: DhikrOption[] = [
  { id: 'subhanallah', ar: 'سبحان الله', en: 'Subhanallah', target: 33 },
  { id: 'alhamdulillah', ar: 'الحمد لله', en: 'Alhamdulillah', target: 33 },
  { id: 'allahuakbar', ar: 'الله أكبر', en: 'Allahu Akbar', target: 33 },
  { id: 'astaghfirullah', ar: 'أستغفر الله', en: 'Astaghfirullah', target: 100 },
  { id: 'la_ilaha_illa_allah', ar: 'لا إله إلا الله', en: 'La ilaha illa Allah', target: 100 },
];

const TRANSLATIONS = {
  ar: {
    title: 'المسبحة',
    subtitle: 'مسبحة رقمية',
    target: 'الهدف',
    cycles: 'الدورات',
    total: 'إجمالي التسبيح',
    reset: 'تصفير العداد',
    history: 'سجل الأذكار',
    clearHistory: 'مسح السجل',
    noHistory: 'لا يوجد سجل حتى الآن',
    footer: 'أذكار • استغفار • صلاة',
    adPlaceholder: 'مساحة إعلانية'
  },
  en: {
    title: 'Tasbih',
    subtitle: 'Digital Rosary',
    target: 'Target',
    cycles: 'Cycles',
    total: 'Total Count',
    reset: 'Reset Counter',
    history: 'Dhikr History',
    clearHistory: 'Clear History',
    noHistory: 'No history yet',
    footer: 'Dhikr • Istighfar • Prayer',
    adPlaceholder: 'Advertisement Space'
  }
};

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeDhikrIndex, setActiveDhikrIndex] = useState<number>(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [history, setHistory] = useState<{ name: string; count: number; date: string }[]>([]);

  const t = TRANSLATIONS[lang];
  const activeDhikr = DEFAULT_DHIKR[activeDhikrIndex];
  const isRtl = lang === 'ar';

  // AdMob Setup
  useEffect(() => {
    const initAdMob = async () => {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
      });

      await AdMob.showBanner({
        adId: 'ca-app-pub-4856138997069982/9749305619',
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false, // Set to true if you are testing
      });
    };

    initAdMob();
  }, []);

  // Load state
  useEffect(() => {
    const savedCount = localStorage.getItem('tasbih_count');
    const savedTotal = localStorage.getItem('tasbih_total');
    const savedHistory = localStorage.getItem('tasbih_history');
    const savedLang = localStorage.getItem('tasbih_lang');
    
    if (savedCount) setCount(parseInt(savedCount));
    if (savedTotal) setTotalCount(parseInt(savedTotal));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedLang) setLang(savedLang as 'ar' | 'en');
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('tasbih_count', count.toString());
    localStorage.setItem('tasbih_total', totalCount.toString());
    localStorage.setItem('tasbih_history', JSON.stringify(history));
    localStorage.setItem('tasbih_lang', lang);
  }, [count, totalCount, history, lang]);

  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
    setTotalCount(prev => prev + 1);
    
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    if (isSoundEnabled) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }
  }, [isSoundEnabled]);

  const handleReset = () => {
    if (count > 0) {
      const newHistoryItem = {
        name: activeDhikr[lang],
        count: count,
        date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
    }
    setCount(0);
  };

  const nextDhikr = () => {
    setActiveDhikrIndex((prev) => (prev + 1) % DEFAULT_DHIKR.length);
    setCount(0);
  };

  const prevDhikr = () => {
    setActiveDhikrIndex((prev) => (prev - 1 + DEFAULT_DHIKR.length) % DEFAULT_DHIKR.length);
    setCount(0);
  };

  return (
    <div className={`min-h-screen bg-[#f8f9fa] text-slate-800 font-sans flex flex-col items-center p-4 pt-8 md:pt-16 overflow-hidden pb-24`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Decorative BG */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50 to-transparent -z-10 opacity-60" />
      
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 px-2">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all active:scale-95"
        >
          <History className="w-6 h-6 text-emerald-600" />
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold text-emerald-800 tracking-tight">{t.title}</h1>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">{t.subtitle}</span>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all active:scale-95"
          >
            <Languages className="w-6 h-6 text-emerald-600" />
          </button>
          <button 
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all active:scale-95"
          >
            {isSoundEnabled ? <Volume2 className="w-6 h-6 text-emerald-600" /> : <VolumeX className="w-6 h-6 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Dhikr Selector */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <ListMusic className="w-12 h-12 text-emerald-600" />
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <button onClick={isRtl ? prevDhikr : nextDhikr} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
            {isRtl ? <ChevronRight /> : <ChevronLeft />}
          </button>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDhikr.id + lang}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center flex-1"
            >
              <h2 className={`text-2xl font-bold text-slate-800 mb-1 ${lang === 'ar' ? 'font-serif' : 'font-sans'}`}>
                {activeDhikr[lang]}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">{t.target}: {activeDhikr.target}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <button onClick={isRtl ? nextDhikr : prevDhikr} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
            {isRtl ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
      </div>

      {/* Counter Ring */}
      <div className="relative flex flex-col items-center justify-center p-6 mb-8 mt-4">
        <div className="w-60 h-60 md:w-72 md:h-72 rounded-full border-8 border-white shadow-2xl flex items-center justify-center bg-gradient-to-br from-white to-emerald-50 relative">
          <svg className="absolute w-full h-full -rotate-90">
             <circle cx="50%" cy="50%" r="45%" className="stroke-slate-100 fill-none" strokeWidth="8" />
             <motion.circle
               cx="50%" cy="50%" r="45%" 
               className="stroke-emerald-500 fill-none" 
               strokeWidth="8" strokeLinecap="round"
               animate={{ strokeDasharray: `${(Math.min(count % activeDhikr.target, activeDhikr.target) / activeDhikr.target) * 100 * 2.8}, 1000` }}
               transition={{ type: 'spring', stiffness: 50 }}
             />
          </svg>

          <div className="text-center z-10">
            <motion.span 
              key={count}
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="text-7xl font-black text-slate-800 tabular-nums"
            >
              {count}
            </motion.span>
            <div className="mt-2 text-xs font-bold text-emerald-700 uppercase tracking-widest opacity-60">
              {t.cycles}: {Math.floor(count / activeDhikr.target)}
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          className="absolute -bottom-6 bg-emerald-600 text-white w-20 h-20 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center active:bg-emerald-700 transition-colors z-20 border-4 border-white"
        >
          <Plus className="w-10 h-10" />
        </motion.button>
      </div>

      {/* Stats */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">{t.total}</span>
          <span className="text-lg font-bold text-slate-700 tabular-nums">{totalCount}</span>
        </div>
        <button onClick={handleReset} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center hover:bg-red-50 group transition-all">
          <RotateCcw className="w-5 h-5 text-slate-400 group-hover:text-red-500 mb-1" />
          <span className="text-xs font-bold text-slate-500 group-hover:text-red-600">{t.reset}</span>
        </button>
      </div>

      {/* Footer Branding */}
      <footer className="mt-6 mb-4">
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{t.footer}</p>
      </footer>

      {/* History Slide-over */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pt-8 max-h-[80vh] overflow-y-auto z-50 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">{t.history}</h3>
                <button onClick={() => { setHistory([]); localStorage.removeItem('tasbih_history'); }} className="text-xs text-red-500 font-bold px-3 py-1.5 rounded-full">{t.clearHistory}</button>
              </div>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="py-12 text-center">
                    <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">{t.noHistory}</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50">
                      <div>
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.date}</div>
                      </div>
                      <div className="text-lg font-black text-emerald-600">{item.count}</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
