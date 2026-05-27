import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, Zap } from 'lucide-react';

interface Props {
  onCapture: (imageDataUrl: string) => void;
  onBack: () => void;
}

const ARMeasurementGuide: React.FC<Props> = ({ onCapture, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream;
    
    const getCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Use the back camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาตในเบราว์เซอร์ของคุณ");
      }
    };

    getCamera();

    // Cleanup function to stop the stream
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video to get full resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // High quality JPEG
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover z-0"></video>
      <div className="absolute inset-0 bg-black/20 z-10"></div>

      {/* AR Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full max-w-lg max-h-lg p-8">
          {/* Main targeting circle */}
          <circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="29.5" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" fill="none" />
          
          {/* Crosshairs */}
          <line x1="50" y1="22" x2="50" y2="28" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
          <line x1="50" y1="72" x2="50" y2="78" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
          <line x1="22" y1="50" x2="28" y2="50" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
          <line x1="72" y1="50" x2="78" y2="50" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
          
          {/* Grid */}
          <line x1="35" y1="35" x2="65" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="0.25" />
          <line x1="35" y1="65" x2="65" y2="65" stroke="rgba(255,255,255,0.2)" strokeWidth="0.25" />
          <line x1="35" y1="35" x2="35" y2="65" stroke="rgba(255,255,255,0.2)" strokeWidth="0.25" />
          <line x1="65" y1="35" x2="65" y2="65" stroke="rgba(255,255,255,0.2)" strokeWidth="0.25" />
        </svg>
      </div>

      <div className="relative z-30 flex flex-col justify-between h-full w-full safe-top safe-bottom p-6">
        {/* Top Controls */}
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="bg-black/40 p-3 rounded-full backdrop-blur-sm active:scale-90 transition-transform">
            <X size={20} />
          </button>
          <div className="bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
            <Zap size={14} className="text-yellow-300" />
            <span className="text-xs font-bold uppercase tracking-widest">Precision Mode</span>
          </div>
        </div>

        {/* Instructions & Capture Button */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-center font-bold bg-black/40 px-6 py-3 rounded-2xl backdrop-blur-sm max-w-xs">
            วางตำแหน่งแผลให้อยู่ในวงกลม และถ่ายในมุมตั้งฉาก
          </p>
          <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform ring-4 ring-white/20">
            <div className="w-16 h-16 rounded-full bg-white ring-2 ring-black"></div>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={onBack} className="bg-white text-black font-bold px-6 py-3 rounded-xl">
              กลับหน้าหลัก
            </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ARMeasurementGuide;