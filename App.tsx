import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ResultView from './components/ResultView';
import { ImageState, ProcessingState, EnhancementType } from './types';
import { enhanceImage, getPromptForType } from './services/geminiService';
import { Wand2, AlertCircle, Trash2, SlidersHorizontal } from 'lucide-react';

const App: React.FC = () => {
  // Default to true (Dark Mode)
  const [darkMode, setDarkMode] = useState(true);

  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: null,
    base64: null,
    mimeType: null,
  });

  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    error: null,
    resultBase64: null,
  });

  const [selectedType, setSelectedType] = useState<EnhancementType>(EnhancementType.HIGH_QUALITY);
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Apply theme class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    return () => {
      if (imageState.previewUrl) {
        URL.revokeObjectURL(imageState.previewUrl);
      }
    };
  }, [imageState.previewUrl]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const handleImageSelected = (file: File) => {
    if (imageState.previewUrl) URL.revokeObjectURL(imageState.previewUrl);
    setProcessingState({ isProcessing: false, error: null, resultBase64: null });
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Content = base64String.split(',')[1];
      
      // Robust MIME type detection
      // 1. Start with the file object's type
      let mimeType = file.type;

      // 2. If missing or generic octet-stream, try to get from Data URL
      if (!mimeType || mimeType === 'application/octet-stream') {
        const match = base64String.match(/^data:([^;]+);/);
        if (match && match[1] && match[1] !== 'application/octet-stream') {
          mimeType = match[1];
        }
      }

      // 3. If still missing or generic, infer from extension
      if (!mimeType || mimeType === 'application/octet-stream') {
         const extension = file.name.split('.').pop()?.toLowerCase();
         switch(extension) {
           case 'png': mimeType = 'image/png'; break;
           case 'webp': mimeType = 'image/webp'; break;
           case 'heic': mimeType = 'image/heic'; break;
           case 'heif': mimeType = 'image/heif'; break;
           default: mimeType = 'image/jpeg'; break;
         }
      }

      // Create a Blob with the corrected MIME type for the preview URL.
      // This ensures that if the OS reports 'application/octet-stream' for a valid JPEG,
      // the browser will still render it correctly because we force the correct type.
      const blob = file.slice(0, file.size, mimeType);
      const newPreviewUrl = URL.createObjectURL(blob);

      setImageState({
        file,
        previewUrl: newPreviewUrl,
        base64: base64Content,
        mimeType: mimeType,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = async () => {
    if (!imageState.base64 || !imageState.file || !imageState.mimeType) return;

    setProcessingState({ isProcessing: true, error: null, resultBase64: null });

    try {
      const prompt = getPromptForType(selectedType, customPrompt);
      const enhancedBase64 = await enhanceImage(
        imageState.base64,
        imageState.mimeType,
        prompt
      );
      
      setProcessingState({
        isProcessing: false,
        error: null,
        resultBase64: enhancedBase64,
      });
    } catch (error: any) {
      setProcessingState({
        isProcessing: false,
        error: error.message || "An unexpected error occurred.",
        resultBase64: null,
      });
    }
  };

  const handleReset = () => {
    if (imageState.previewUrl) URL.revokeObjectURL(imageState.previewUrl);
    setImageState({ file: null, previewUrl: null, base64: null, mimeType: null });
    setProcessingState({ isProcessing: false, error: null, resultBase64: null });
    setCustomPrompt("");
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/20 dark:selection:bg-white/20">
      
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />

      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center gap-10 transition-colors duration-500">
        
        {/* Intro Text */}
        {!imageState.file && (
          <div className="text-center space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-12">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-white/50 pb-2 transition-all duration-500">
              Clarity Redefined
            </h2>
            <p className="text-gray-600 dark:text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto transition-colors duration-500">
              Experience the next generation of image restoration. Powered by state-of-the-art AI.
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <div className="w-full max-w-6xl">
          {!imageState.file ? (
            <UploadArea onImageSelected={handleImageSelected} />
          ) : (
            <div className="space-y-8">
               {/* Configuration Bar */}
              <div className="glass-panel rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-end justify-between animate-in fade-in slide-in-from-top-4 duration-700">
                
                <div className="flex-1 w-full space-y-5">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-800 dark:text-white/80 flex items-center gap-2 tracking-wide transition-colors duration-300">
                            <SlidersHorizontal className="w-4 h-4" />
                            PROCESSING MODE
                        </label>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.values(EnhancementType).map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-3 text-sm rounded-xl transition-all duration-300 text-left truncate border
                                ${selectedType === type 
                                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                                    : 'bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-gray-600 dark:text-white/60 hover:bg-white/80 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {selectedType === EnhancementType.CUSTOM && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="Describe your vision..."
                                className="w-full px-5 py-3 rounded-xl bg-white/40 dark:bg-black/20 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-400/50 dark:focus:border-white/30 focus:bg-white/60 dark:focus:bg-black/30 transition-all"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleReset}
                        disabled={processingState.isProcessing}
                        className="p-4 text-gray-400 hover:text-red-500 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-all disabled:opacity-30"
                        title="Reset"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleEnhance}
                        disabled={processingState.isProcessing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-semibold rounded-xl shadow-lg shadow-black/10 dark:shadow-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                         {processingState.isProcessing ? (
                             <span className="flex items-center gap-2">Processing...</span>
                         ) : (
                             <>
                                <Wand2 className="w-4 h-4" />
                                Enhance
                             </>
                         )}
                    </button>
                </div>
              </div>

              {/* Error Message */}
              {processingState.error && (
                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-100 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                  <p>{processingState.error}</p>
                </div>
              )}

              {/* Result View */}
              <ResultView 
                originalUrl={imageState.previewUrl!} 
                resultBase64={processingState.resultBase64} 
                isProcessing={processingState.isProcessing}
              />
            </div>
          )}
        </div>

      </main>
      
      <footer className="py-8 text-center text-gray-400 dark:text-white/20 text-xs font-medium tracking-widest uppercase transition-colors duration-500">
        Powered by Advanced Intelligence
      </footer>
    </div>
  );
};

export default App;