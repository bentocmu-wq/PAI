import React, { useEffect, useState } from 'react';
import { PushScore } from '../types';
import { ChevronDown, ChevronUp, Wand2, Box } from 'lucide-react';

interface Props {
  onChange?: (score: number) => void;
  onDepthChange?: (depth: number) => void;
  aiHints?: { 
    exudateScore: number; 
    tissueScore: number; 
    reasoning: string;
    estimatedLength: number;
    estimatedWidth: number;
  };
}

const PushToolCalculator: React.FC<Props> = ({ onChange, onDepthChange, aiHints }) => {
  const [inputs, setInputs] = useState<PushScore>({
    length: 0,
    width: 0,
    depth: 0,
    exudateAmount: 0,
    tissueType: 0,
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (aiHints) {
      setInputs(prev => ({
        ...prev,
        exudateAmount: aiHints.exudateScore,
        tissueType: aiHints.tissueScore,
        length: aiHints.estimatedLength > 0 ? aiHints.estimatedLength : prev.length,
        width: aiHints.estimatedWidth > 0 ? aiHints.estimatedWidth : prev.width,
      }));
    }
  }, [aiHints]);

  const calculateAreaScore = (l: number, w: number) => {
    const area = l * w;
    if (area <= 0) return 0;
    if (area <= 0.3) return 1;
    if (area <= 0.6) return 2;
    if (area <= 1.0) return 3;
    if (area <= 2.0) return 4;
    if (area <= 3.0) return 5;
    if (area <= 4.0) return 6;
    if (area <= 8.0) return 7;
    if (area <= 12.0) return 8;
    if (area <= 24.0) return 9;
    return 10;
  };

  const areaScore = calculateAreaScore(inputs.length, inputs.width);
  const totalPushScore = areaScore + inputs.exudateAmount + inputs.tissueType;
  const volume = (inputs.length * inputs.width * inputs.depth).toFixed(2);


  useEffect(() => {
    if (onChange) onChange(totalPushScore);
    if (onDepthChange) onDepthChange(inputs.depth);
  }, [totalPushScore, inputs.depth, onChange, onDepthChange]);

  const handleChange = (field: keyof PushScore, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const tissueTypeOptions = [
    { label: 'แผลปิด/เนื้อเยื่อใหม่ (Closed/Epithelialized)', val: 0 },
    { label: 'เนื้อเยื่อชมพูใหม่ (Epithelial Tissue)', val: 1 },
    { label: 'เนื้อแดงสด (Granulation Tissue)', val: 2 },
    { label: 'เนื้อตายแฉะ/เหลือง (Slough)', val: 3 },
    { label: 'เนื้อตายดำ/แข็ง (Necrotic Tissue/Eschar)', val: 4 },
  ];

  const exudateOptions = [
    { label: 'ไม่มี (None)', val: 0 },
    { label: 'น้อย (Light)', val: 1 },
    { label: 'ปานกลาง (Moderate)', val: 2 },
    { label: 'มาก (Heavy)', val: 3 },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden minimal-shadow">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center font-extrabold text-sm text-indigo-600 shadow-inner">
                <span className="text-[10px] font-bold opacity-60">PUSH</span>
                {totalPushScore}
            </div>
            <div>
                <h2 className="font-extrabold text-slate-900 text-sm">PUSH Tool (V3.0)</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wound Healing Status</p>
            </div>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
      </div>

      {isOpen && (
        <div className="p-6 pt-0 space-y-6 animate-in fade-in duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1. ขนาด (L x W) พื้นที่: {(inputs.length * inputs.width).toFixed(2)} ตร.ซม.</h3>
                <span className="text-[10px] font-bold text-indigo-500">Score: {areaScore}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 ml-1">ยาว (ซม.)</span>
                    <input type="number" value={inputs.length || ''} onChange={(e) => handleChange('length', parseFloat(e.target.value) || 0)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-700" placeholder="0.0" />
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 ml-1">กว้าง (ซม.)</span>
                    <input type="number" value={inputs.width || ''} onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-700" placeholder="0.0" />
                </div>
            </div>
             <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 ml-1">ความลึก (ซม.) - วัดด้วย Cutton Swab</span>
                <input type="number" value={inputs.depth || ''} onChange={(e) => handleChange('depth', parseFloat(e.target.value) || 0)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-700" placeholder="0.0" />
            </div>
             <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Box size={16} className="text-blue-500"/>
                <p className="text-xs font-bold text-blue-800">
                    ปริมาตรแผลโดยประมาณ: <span className="text-base font-black">{volume} ลบ.ซม.</span>
                </p>
            </div>

            <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2. ปริมาณสิ่งขับหลั่ง (Exudate)</label>
                    <span className="text-[10px] font-bold text-indigo-500">Score: {inputs.exudateAmount}</span>
                  </div>
                  <select 
                    value={inputs.exudateAmount} 
                    onChange={(e) => handleChange('exudateAmount', Number(e.target.value))}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-700 appearance-none"
                  >
                    {exudateOptions.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3. ชนิดเนื้อเยื่อ (Tissue Type)</label>
                    <span className="text-[10px] font-bold text-indigo-500">Score: {inputs.tissueType}</span>
                  </div>
                  <select 
                    value={inputs.tissueType} 
                    onChange={(e) => handleChange('tissueType', Number(e.target.value))}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-700 appearance-none"
                  >
                    {tissueTypeOptions.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                  </select>
                </div>
            </div>
            
            {aiHints?.reasoning && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Wand2 size={12} className="text-indigo-400" />
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">AI Clinical Reasoning:</p>
                    </div>
                    <p className="text-xs text-indigo-700 font-semibold leading-relaxed">{aiHints.reasoning}</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PushToolCalculator;