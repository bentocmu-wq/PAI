import React from 'react';
import { TissuePercentages } from '../types';
import { Ruler, Activity } from 'lucide-react';

interface Props {
  percentages: TissuePercentages;
  length: number;
  width: number;
}

const TissueAnalysisView: React.FC<Props> = ({ percentages, length, width }) => {
  const area = (length * width).toFixed(2);
  
  const items = [
    { label: 'เนื้อตาย (Necrotic)', value: percentages.necrotic, color: 'bg-slate-800', textColor: 'text-slate-800' },
    { label: 'เนื้อตายแฉะ (Slough)', value: percentages.slough, color: 'bg-yellow-400', textColor: 'text-yellow-600' },
    { label: 'เนื้อแดงสด (Granulation)', value: percentages.granulation, color: 'bg-red-500', textColor: 'text-red-600' },
    { label: 'ผิวหนังใหม่ (Epithelial)', value: percentages.epithelial, color: 'bg-pink-300', textColor: 'text-pink-600' },
  ];

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 minimal-shadow space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <Activity className="text-emerald-600" size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight italic">สถิติและสัดส่วนแผล</h3>
        </div>
      </div>

      <div className="space-y-6">
        {/* Area Summary */}
        <div className="flex items-center gap-6 p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
            <div className="bg-white p-3 rounded-2xl shadow-sm">
                <Ruler className="text-blue-600" size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">พื้นที่ประมาณการ</p>
                <p className="text-lg font-black text-slate-900 leading-none">
                    {length} × {width} = <span className="text-blue-700">{area} ตร.ซม.</span>
                </p>
            </div>
        </div>

        {/* Tissue Composition Bar */}
        <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">องค์ประกอบเนื้อเยื่อ (%)</p>
                <p className="text-[10px] font-bold text-slate-400">รวม 100%</p>
            </div>
            
            <div className="h-6 w-full flex rounded-full overflow-hidden shadow-inner bg-slate-100">
                {items.map((item, i) => item.value > 0 && (
                    <div 
                        key={i} 
                        style={{ width: `${item.value}%` }} 
                        className={`${item.color} h-full transition-all duration-1000 ease-out border-r border-white/20 last:border-0`}
                    />
                ))}
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`}></div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-500 leading-none mb-1">{item.label}</span>
                            <span className={`text-sm font-black ${item.textColor}`}>{item.value}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TissueAnalysisView;