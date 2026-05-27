
import React, { useEffect, useState } from 'react';
import { BradenScore } from '../types';
// Fixed: Added ShieldCheck to lucide-react imports
import { ChevronDown, ChevronUp, AlertCircle, ShieldCheck } from 'lucide-react';

interface Props {
  onChange: (score: BradenScore) => void;
  aiHints?: { moistureObservation: string; frictionObservation: string };
}

const BradenScaleCalculator: React.FC<Props> = ({ onChange, aiHints }) => {
  // เริ่มต้นที่คะแนนปกติ (ไม่มีความเสี่ยง)
  const [scores, setScores] = useState<BradenScore>({
    sensoryPerception: 4,
    moisture: 4,
    activity: 4,
    mobility: 4,
    nutrition: 4,
    frictionShear: 3,
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onChange(scores);
  }, [scores, onChange]);

  const updateScore = (field: keyof BradenScore, value: number) => {
    setScores((prev) => ({ ...prev, [field]: value }));
  };

  const totalScore = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);

  const getRiskLabel = (score: number) => {
    if (score <= 9) return { label: 'เสี่ยงสูงมาก (Very High Risk)', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (score <= 12) return { label: 'เสี่ยงสูง (High Risk)', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (score <= 14) return { label: 'เสี่ยงปานกลาง (Moderate Risk)', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (score <= 18) return { label: 'เสี่ยงต่ำ (Low Risk)', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { label: 'ไม่มีความเสี่ยง (No Risk)', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const risk = getRiskLabel(totalScore);

  const options = [
    { 
      label: '1. การรับความรู้สึก (Sensory Perception)', 
      field: 'sensoryPerception', 
      opts: [
        'บกพร่องอย่างรุนแรง (ไม่ตอบสนองต่อความเจ็บปวด)', 
        'บกพร่องมาก (ตอบสนองเฉพาะความเจ็บปวดเท่านั้น)', 
        'บกพร่องเล็กน้อย (ตอบสนองต่อคำสั่ง แต่บอกความรู้สึกไม่ได้ทั้งหมด)', 
        'ปกติ (สื่อสารความรู้สึกได้ดี ไม่มีปัญหา)'
      ] 
    },
    { 
      label: '2. ความเปียกชื้น (Moisture)', 
      field: 'moisture', 
      hint: aiHints?.moistureObservation, 
      opts: [
        'เปียกชื้นตลอดเวลา (ผิวหนังเปียกจากเหงื่อ/ปัสสาวะตลอด)', 
        'เปียกชื้นบ่อย (ต้องเปลี่ยนผ้าปู/ผ้าอ้อมทุกเวร)', 
        'เปียกชื้นบางครั้ง (ต้องเปลี่ยนผ้าปู/ผ้าอ้อมวันละครั้ง)', 
        'แห้งปกติ (ผิวหนังแห้งดี นานๆ ครั้งจึงจะเปียก)'
      ] 
    },
    { 
      label: '3. การทำกิจกรรม (Activity)', 
      field: 'activity', 
      opts: [
        'นอนบนเตียงตลอดเวลา (Bedfast)', 
        'นั่งบนรถเข็นได้บ้าง (Chairfast)', 
        'เดินได้บ้าง (พยุงเดินเป็นระยะทางสั้นๆ)', 
        'เดินได้บ่อย (เดินออกนอกห้องได้อย่างน้อยวันละ 2 ครั้ง)'
      ] 
    },
    { 
      label: '4. การเคลื่อนไหว (Mobility)', 
      field: 'mobility', 
      opts: [
        'ขยับไม่ได้เลย (ต้องมีคนพลิกตัวให้ทั้งหมด)', 
        'ขยับได้น้อยมาก (เปลี่ยนท่าเองได้บ้างเล็กน้อย)', 
        'ขยับได้เล็กน้อย (เปลี่ยนท่าเองได้บ่อยแต่ไม่คล่อง)', 
        'ปกติ (เปลี่ยนท่าทางได้เองอย่างอิสระ)'
      ] 
    },
    { 
      label: '5. ภาวะโภชนาการ (Nutrition)', 
      field: 'nutrition', 
      opts: [
        'แย่มาก (ทานได้น้อยกว่า 1/3 ของมื้ออาหาร หรือ NPO)', 
        'ไม่เพียงพอ (ทานได้เพียง 1/2 ของมื้ออาหาร)', 
        'เพียงพอ (ทานได้เกือบหมดมื้อ หรือได้อาหารทางสายยาง)', 
        'ดีเยี่ยม (ทานได้หมดทุกมื้อ และทานอาหารเสริมได้)'
      ] 
    },
    { 
      label: '6. แรงเสียดทานและแรงครูด (Friction & Shear)', 
      field: 'frictionShear', 
      hint: aiHints?.frictionObservation, 
      opts: [
        'มีปัญหา (ต้องใช้คนช่วยยก ตัวไถลลงบ่อย)', 
        'อาจมีปัญหา (ขยับตัวได้เองบ้าง แต่ยังมีการไถล)', 
        'ไม่มีปัญหา (เคลื่อนย้ายตัวได้ดี ไม่มีการไถล)'
      ] 
    }
  ];

  return (
    <div className={`bg-white rounded-[2rem] border ${risk.border} overflow-hidden minimal-shadow transition-colors duration-500`}>
      <div 
        className="p-6 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold text-sm ${risk.bg} ${risk.color} border border-black/5 shadow-inner`}>
                <span className="text-[9px] font-black opacity-60 uppercase tracking-tighter">TOTAL</span>
                <span className="text-xl">{totalScore}</span>
            </div>
            <div>
                <h2 className="font-extrabold text-slate-900 text-base">Braden Scale</h2>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${risk.color.replace('text', 'bg')}`}></div>
                  <p className={`text-[11px] font-black uppercase tracking-widest ${risk.color}`}>{risk.label}</p>
                </div>
            </div>
        </div>
        <div className="bg-slate-50 p-2 rounded-full">
          {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 pt-0 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-slate-100 w-full mb-2"></div>
          
          <div className="space-y-6">
            {options.map((item, idx) => (
              <div key={idx} className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                <div className="flex items-start justify-between gap-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-tight leading-tight flex-1">
                    {item.label}
                  </label>
                  <div className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm shrink-0">
                    <span className="text-xs font-black text-blue-700">{(scores as any)[item.field]} แต้ม</span>
                  </div>
                </div>

                {item.hint && (
                  <div className="flex items-center gap-2 bg-blue-50/80 p-2 rounded-xl border border-blue-100">
                    <AlertCircle size={12} className="text-blue-500 shrink-0" />
                    <span className="text-[10px] text-blue-700 font-bold leading-tight">AI สังเกตเห็น: {item.hint}</span>
                  </div>
                )}

                <div className="relative">
                  <select 
                    value={(scores as any)[item.field]} 
                    onChange={(e) => updateScore(item.field as keyof BradenScore, Number(e.target.value))}
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none text-[13px] font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm pr-10"
                  >
                    {item.opts.map((opt, oIdx) => (
                      <option key={oIdx} value={oIdx + 1}>
                         คะแนน {oIdx + 1}: {opt}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={14} className="text-slate-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`p-5 rounded-3xl ${risk.bg} border ${risk.border} flex items-center gap-4`}>
             <div className={`${risk.color.replace('text', 'bg')} p-2 rounded-xl text-white`}>
               <ShieldCheck size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">สรุปผลการประเมิน</p>
               <p className={`text-sm font-black ${risk.color}`}>ระดับความเสี่ยง: {risk.label}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BradenScaleCalculator;
