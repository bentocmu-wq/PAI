import React, { useState, useRef, useEffect } from 'react';
import { Camera, Stethoscope, Sparkles, BrainCircuit, ArrowLeft, Share2, Lightbulb, MapPin, Download, ScanLine } from 'lucide-react';
import { analyzeWoundImage } from './services/geminiService';
import { BradenScore, WoundAnalysisResult, AppState } from './types';
import BradenScaleCalculator from './components/BradenScaleCalculator';
import PushToolCalculator from './components/PushToolCalculator';
import TissueAnalysisView from './components/TissueAnalysisView';
import ARMeasurementGuide from './components/ARMeasurementGuide';

const NativeAppIcon = ({ size = 120 }) => (
  <div 
    className="bg-blue-800 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden shadow-2xl shadow-blue-900/30"
    style={{ width: size, height: size }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
    <div className="relative z-10 icon-float">
      <div className="w-28 h-10 bg-white rounded-full shadow-lg flex items-center justify-center relative overflow-hidden">
        <div className="w-10 h-full bg-slate-100 flex items-center justify-center">
           <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
        </div>
        <div className="absolute left-4 w-1 h-1 rounded-full bg-slate-200"></div>
        <div className="absolute right-4 w-1 h-1 rounded-full bg-slate-200"></div>
      </div>
    </div>
  </div>
);

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<WoundAnalysisResult | null>(null);
  const [bradenScoreValues, setBradenScoreValues] = useState<BradenScore | null>(null);
  const [currentPushScore, setCurrentPushScore] = useState<number>(0);
  const [currentDepth, setCurrentDepth] = useState<number>(0);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handler = (e: Event) => {
        e.preventDefault();
        console.log('`beforeinstallprompt` event was fired.');
        setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) { return; }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    } else {
        console.log('User dismissed the install prompt');
    }
    setInstallPrompt(null);
  };

  const handleCaptureFromAR = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    startAnalysis(imageDataUrl);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        startAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (base64String: string) => {
    setAppState(AppState.ANALYZING);
    try {
        const base64Data = base64String.split(',')[1];
        const result = await analyzeWoundImage(base64Data, selectedSite);
        setAnalysisResult(result);
        setAppState(AppState.RESULTS);
    } catch (error) {
        setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setSelectedImage(null);
    setAnalysisResult(null);
    setBradenScoreValues(null);
    setCurrentPushScore(0);
    setCurrentDepth(0);
    setSelectedSite('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getBradenTotal = () => bradenScoreValues ? (Object.values(bradenScoreValues) as number[]).reduce((a, b) => a + b, 0) : 'ยังไม่ประเมิน';
  
  const handleShareResult = async () => {
    if (!analysisResult) return;

    const bradenTotal = getBradenTotal();
    const length = analysisResult.pushToolHints.estimatedLength;
    const width = analysisResult.pushToolHints.estimatedWidth;
    const area = (length * width).toFixed(2);
    const volume = (length * width * currentDepth).toFixed(2);
    
    let riskLevel = '';
    if (typeof bradenTotal === 'number') {
        if (bradenTotal <= 9) riskLevel = 'เสี่ยงสูงมาก';
        else if (bradenTotal <= 12) riskLevel = 'เสี่ยงสูง';
        else if (bradenTotal <= 14) riskLevel = 'เสี่ยงปานกลาง';
        else if (bradenTotal <= 18) riskLevel = 'เสี่ยงต่ำ';
        else riskLevel = 'ไม่มีความเสี่ยง';
    }

    const shareText = `🏥 รายงานการประเมินแผลกดทับ (Clinical Report)
-------------------------
📍 ข้อมูลลักษณะแผล:
- ตำแหน่งแผล: ${selectedSite || analysisResult.anatomicalLocation || 'ไม่ระบุ'}
- ระดับแผล (Stage): ${analysisResult.stage}
- ขนาด: ${length} x ${width} x ${currentDepth} ซม.
- พื้นที่: ${area} ตร.ซม. | ปริมาตร: ${volume} ลบ.ซม.
- เนื้อเยื่อหลัก: ${analysisResult.tissueType}
- สิ่งขับหลั่ง: ${analysisResult.exudateLevel}

📊 องค์ประกอบเนื้อเยื่อ:
- เนื้อตาย: ${analysisResult.tissuePercentages.necrotic}% | เนื้อเหลือง: ${analysisResult.tissuePercentages.slough}%
- เนื้อแดง: ${analysisResult.tissuePercentages.granulation}% | ผิวใหม่: ${analysisResult.tissuePercentages.epithelial}%

🔢 คะแนนการประเมิน:
- Braden Scale: ${bradenTotal} (${riskLevel})
- PUSH Tool Score: ${currentPushScore} คะแนน

💊 แผนการพยาบาลและ Dressing แนะนำ:
${analysisResult.careRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

-------------------------
วิเคราะห์โดยระบบ OstomyAI (Clinical High Accuracy Mode)
*รายงานนี้เป็นเพียงข้อมูลสนับสนุนการตัดสินใจของพยาบาลผู้เชี่ยวชาญ*`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'รายงานประเมินแผล', text: shareText });
      } catch (err) { console.error('Sharing failed', err); }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('คัดลอกรายงานลงคลิปบอร์ดแล้ว');
      } catch (err) { alert('ไม่สามารถคัดลอกได้'); }
    }
  };
  
  if (appState === AppState.AR_CAPTURE) {
    return <ARMeasurementGuide onCapture={handleCaptureFromAR} onBack={() => setAppState(AppState.IDLE)} />;
  }

  return (
    <div className="min-h-screen flex flex-col safe-top safe-bottom bg-[#fdfdfd]">
      <header className="px-6 py-5 flex items-center justify-between bg-white/70 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100/50">
        <div className="flex items-center gap-3">
          {appState !== AppState.IDLE ? (
            <button onClick={resetApp} className="p-2.5 bg-slate-50 rounded-full active:scale-90 transition-transform">
              <ArrowLeft size={18} className="text-slate-600" />
            </button>
          ) : (
            <div className="bg-blue-800 p-2 rounded-xl shadow-lg shadow-blue-200">
              <BrainCircuit className="text-white w-4 h-4" />
            </div>
          )}
          <span className="font-extrabold text-lg tracking-tight text-slate-900">OstomyAI</span>
        </div>
        <div className="flex items-center gap-4">
           {installPrompt && appState === AppState.IDLE && (
              <button onClick={handleInstallClick} className="bg-blue-600 text-white pl-3 pr-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform hover:bg-blue-700">
                 <Download size={14} /> <span>ติดตั้งแอป</span>
              </button>
            )}
           { appState === AppState.IDLE &&
             <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
               <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase">High Accuracy Mode</span>
             </div>
           }
        </div>
      </header>

      <main className="flex-1 px-6 py-8 w-full max-w-xl mx-auto space-y-12">
        {appState === AppState.IDLE && (
          <div className="page-enter space-y-12">
            <div className="flex flex-col items-center text-center space-y-8 py-4">
               <NativeAppIcon />
               <div className="space-y-3">
                  <h1 className="text-3xl font-[800] text-slate-900 tracking-tight leading-tight">
                    ระบบวิเคราะห์พยาธิสภาพ<br/>
                    <span className="text-blue-700 italic">ET Clinical Assistant</span>
                  </h1>
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 minimal-shadow space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <MapPin size={18} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">1. เลือกตำแหน่งแผล (ถ้ามี)</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    {['Sacrum', 'Heel', 'Trochanter', 'Ischium', 'Others'].map(site => (
                      <button 
                        key={site}
                        onClick={() => setSelectedSite(site)}
                        className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border ${selectedSite === site ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-blue-200'}`}
                      >
                        {site}
                      </button>
                    ))}
                 </div>
              </div>
              
              <div className="space-y-3">
                 <div className="text-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">2. เลือกวิธีการถ่ายภาพ</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setAppState(AppState.AR_CAPTURE)}
                      className="w-full bg-white text-blue-700 py-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-all border-2 border-blue-200 hover:border-blue-400"
                    >
                      <div className="bg-blue-50 p-2 rounded-xl">
                        <ScanLine size={20} />
                      </div>
                      <span className="text-base">โหมดวัดระยะ AR</span>
                      <span className="text-[10px] font-bold text-slate-400">แม่นยำสูงสุด</span>
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-2 shadow-2xl active:scale-[0.97] transition-all"
                    >
                      <div className="bg-white/10 p-2 rounded-xl">
                        <Camera size={20} />
                      </div>
                      <span className="text-base">ถ่ายภาพทันที</span>
                      <span className="text-[10px] font-bold text-slate-400">รวดเร็ว</span>
                    </button>
                 </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            </div>

            <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 space-y-4">
               <div className="flex items-center gap-3">
                  <Lightbulb className="text-amber-500" size={18} />
                  <h3 className="text-sm font-bold text-amber-900">เทคนิคถ่ายภาพให้ AI แม่นยำ</h3>
               </div>
               <ul className="text-[11px] text-amber-800/80 space-y-2 font-medium">
                  <li className="flex gap-2"><span>•</span> <span>มีแสงสว่างเพียงพอ ไม่ย้อนแสง</span></li>
                  <li className="flex gap-2"><span>•</span> <span>วางไม้บรรทัดหรือเหรียญข้างแผลเพื่ออ้างอิงขนาด</span></li>
                  <li className="flex gap-2"><span>•</span> <span>ถ่ายในมุมตั้งฉากกับแผล 90 องศา</span></li>
               </ul>
            </div>
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="page-enter flex flex-col items-center justify-center py-24 text-center gap-10">
            <div className="w-56 h-56 relative">
              <div className="absolute inset-0 border-[6px] border-slate-50 rounded-full"></div>
              <div className="absolute inset-0 border-[6px] border-blue-700 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-5 overflow-hidden rounded-full shadow-inner bg-slate-100">
                {selectedImage && <img src={selectedImage} alt="Scanning" className="w-full h-full object-cover grayscale opacity-40 blur-[2px]" />}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">AI Clinical Logic Engine<br/>กำลังวิเคราะห์ผล</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Computing Staging & PUSH Scores...</p>
            </div>
          </div>
        )}

        {appState === AppState.RESULTS && analysisResult && (
          <div className="page-enter space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-[3rem] overflow-hidden minimal-shadow border border-slate-100">
                <div className="aspect-[4/3] relative">
                  <img src={selectedImage || ''} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="bg-blue-600 p-1 rounded-md"> <Sparkles className="text-white" size={10} /> </div>
                       <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Professional Assessment</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{selectedSite || analysisResult.anatomicalLocation}</p>
                        <h2 className="text-4xl font-black text-white tracking-tight italic">{analysisResult.stage}</h2>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 border-b border-slate-50">
                   <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2"> <BrainCircuit size={12} /> AI Visual Reasoning </p>
                      <p className="text-[13px] text-blue-900 leading-relaxed font-semibold">{analysisResult.visualEvidence}</p>
                   </div>
                </div>

                <div className="p-8 grid grid-cols-2 gap-4 bg-white">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tissue Condition</p>
                    <p className="font-bold text-slate-800 text-[15px]">{analysisResult.tissueType}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">AI Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-700" style={{ width: analysisResult.aiConfidence }}></div></div>
                      <p className="font-bold text-blue-700 text-xs">{analysisResult.aiConfidence}</p>
                    </div>
                  </div>
                </div>
             </div>

             <TissueAnalysisView percentages={analysisResult.tissuePercentages} length={analysisResult.pushToolHints.estimatedLength} width={analysisResult.pushToolHints.estimatedWidth} />
             <BradenScaleCalculator onChange={setBradenScoreValues} aiHints={analysisResult.visualBradenHints} />
             <PushToolCalculator 
                aiHints={analysisResult.pushToolHints} 
                onChange={setCurrentPushScore}
                onDepthChange={setCurrentDepth} 
             />
             <div className="bg-white p-8 rounded-[3rem] minimal-shadow border border-slate-100 space-y-8">
                <div className="flex items-center gap-4"><div className="bg-slate-900 p-3 rounded-2xl"><Stethoscope className="text-white" size={20} /></div><h3 className="text-xl font-black text-slate-900 tracking-tight italic">Nursing Care Plan</h3></div>
                <div className="space-y-4">{analysisResult.careRecommendations.map((rec, i) => (<div key={i} className="flex gap-5 p-5 bg-slate-50/50 rounded-3xl border border-slate-100/30"><div className="bg-white w-8 h-8 rounded-full flex items-center justify-center text-blue-700 font-black text-sm shrink-0 shadow-sm border border-slate-100">{i+1}</div><p className="text-slate-700 text-[14px] font-semibold leading-relaxed">{rec}</p></div>))}</div>
             </div>
             
             <div className="bg-white p-8 rounded-[3rem] minimal-shadow border border-slate-100 space-y-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">ดำเนินการต่อ</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleShareResult}
                    className="w-full py-5 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                  >
                    <Share2 size={18} />
                    <span>แชร์ผลลัพธ์</span>
                  </button>

                  <button onClick={resetApp} className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold active:scale-[0.98] transition-all">วิเคราะห์แผลใหม่</button>
                </div>
             </div>
          </div>
        )}

        {(appState === AppState.MANUAL_BRADEN || appState === AppState.MANUAL_PUSH) && (
          <div className="page-enter space-y-8">
             {appState === AppState.MANUAL_BRADEN ? (<BradenScaleCalculator onChange={setBradenScoreValues} />) : (<PushToolCalculator onChange={setCurrentPushScore} />)}
             <button onClick={resetApp} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-bold active:scale-[0.98] transition-all">กลับหน้าหลัก</button>
          </div>
        )}
      </main>
      <div className="h-12"></div>
    </div>
  );
}

export default App;