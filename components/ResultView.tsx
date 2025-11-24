import React, { useState, useEffect } from 'react';
import { Download, ArrowLeftRight, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ResultViewProps {
  originalUrl: string;
  resultBase64: string | null;
  isProcessing: boolean;
}

const ResultView: React.FC<ResultViewProps> = ({ originalUrl, resultBase64, isProcessing }) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const [overlayPosition, setOverlayPosition] = useState(50);
  const [imgError, setImgError] = useState(false);

  // Reset error state when image changes
  useEffect(() => {
    setImgError(false);
  }, [originalUrl]);

  const resultUrl = resultBase64 ? `data:image/png;base64,${resultBase64}` : null;

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = 'enhanced_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOverlayMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = 0;
    
    if ('touches' in e) {
       x = e.touches[0].clientX - rect.left;
    } else {
       x = e.clientX - rect.left;
    }
    
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setOverlayPosition(pos);
  };

  const renderOriginalImage = (className: string) => {
    if (imgError) {
        return (
            <div className={`flex flex-col items-center justify-center p-6 text-center text-gray-400 bg-gray-100 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-white/10 ${className}`}>
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm font-medium">Preview Unavailable</p>
                <p className="text-[10px] opacity-60 mt-1 uppercase tracking-wider">Format not supported by browser</p>
                <p className="text-xs text-blue-500 mt-2">Processing still works!</p>
            </div>
        );
    }
    return (
        <img 
            src={originalUrl} 
            alt="Original" 
            className={className} 
            onError={() => setImgError(true)}
        />
    );
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex p-1 bg-gray-200/50 dark:bg-black/30 backdrop-blur-lg rounded-full border border-gray-200 dark:border-white/5 transition-colors duration-500">
            <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${viewMode === 'side-by-side' ? 'bg-white dark:bg-white text-black shadow-lg' : 'text-gray-500 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
            >
                Split
            </button>
            <button
                onClick={() => setViewMode('overlay')}
                disabled={!resultUrl || imgError}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${viewMode === 'overlay' ? 'bg-white dark:bg-white text-black shadow-lg' : 'text-gray-500 dark:text-white/60 hover:text-black dark:hover:text-white disabled:opacity-30'}`}
            >
                Slide
            </button>
        </div>
        
        {resultUrl && (
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black dark:text-black dark:bg-white dark:hover:bg-white/90 rounded-full transition-all shadow-lg shadow-black/10 dark:shadow-white/10 active:scale-95"
            >
                <Download className="w-3.5 h-3.5" />
                Save
            </button>
        )}
      </div>

      {/* Display Area */}
      <div className="relative w-full glass-panel rounded-[2rem] overflow-hidden min-h-[400px] border border-white/20 dark:border-white/10 transition-all duration-500">
        
        {isProcessing && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md transition-colors duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
                    <Loader2 className="w-10 h-10 text-gray-900 dark:text-white/90 animate-spin relative z-10" />
                </div>
                <p className="mt-6 text-gray-700 dark:text-white/90 font-medium tracking-wide text-sm animate-pulse">Enhancing details...</p>
            </div>
        )}

        {!resultUrl && !isProcessing ? (
            // Only Original Visible
            <div className="w-full h-full flex items-center justify-center p-6">
                {renderOriginalImage("max-h-[600px] w-auto rounded-xl shadow-2xl")}
            </div>
        ) : viewMode === 'side-by-side' || imgError ? (
            // Side by Side View (forced if image error)
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full">
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-[0.2em] px-1">Original</span>
                    <div className="relative aspect-square md:aspect-auto bg-gray-100 dark:bg-black/20 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-white/5 transition-colors duration-500">
                        {renderOriginalImage("max-w-full max-h-[500px] object-contain")}
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                     <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Processed
                     </span>
                    <div className="relative aspect-square md:aspect-auto bg-gray-100 dark:bg-black/20 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.2)] transition-colors duration-500">
                        {resultUrl && <img src={resultUrl} alt="Enhanced" className="max-w-full max-h-[500px] object-contain animate-in fade-in zoom-in duration-700" />}
                    </div>
                </div>
            </div>
        ) : (
            // Overlay/Slider View
            <div 
                className="relative w-full h-[500px] md:h-[600px] cursor-ew-resize overflow-hidden select-none group"
                onMouseMove={handleOverlayMove}
                onTouchMove={handleOverlayMove}
            >
                <img 
                    src={originalUrl} 
                    alt="Original" 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                />
                
                <div 
                    className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - overlayPosition}% 0 0)` }}
                >
                    {resultUrl && (
                        <img 
                            src={resultUrl} 
                            alt="Enhanced" 
                            className="absolute inset-0 w-full h-full object-contain" 
                        />
                    )}
                </div>

                {/* Minimalist Slider Handle */}
                <div 
                    className="absolute top-0 bottom-0 w-[1px] bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                    style={{ left: `${overlayPosition}%` }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/50 rounded-full shadow-xl flex items-center justify-center text-white">
                        <ArrowLeftRight className="w-4 h-4 drop-shadow-md" />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResultView;