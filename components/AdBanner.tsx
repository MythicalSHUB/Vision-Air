import React, { useEffect } from 'react';

const AdBanner: React.FC = () => {
  useEffect(() => {
    try {
      // @ts-ignore
      const ads = (window.adsbygoogle = window.adsbygoogle || []);
      ads.push({});
    } catch (e) {
      // AdSense might be blocked or failing to load
      console.log("AdSense failed to load", e);
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-4 px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="glass-panel rounded-2xl p-1 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden group hover:bg-white/60 dark:hover:bg-white/10 transition-colors duration-500">
            <div className="absolute top-0 right-0 px-3 py-1 bg-gray-200/50 dark:bg-white/5 rounded-bl-xl border-b border-l border-gray-200/50 dark:border-white/5">
                <p className="text-[8px] text-gray-500 dark:text-white/30 font-bold tracking-widest uppercase">Advertisement</p>
            </div>
            
            <div className="w-full flex justify-center items-center bg-gray-100/50 dark:bg-black/20 rounded-xl overflow-hidden min-h-[100px] relative transition-colors duration-500">
                 {/* 
                    Replace data-ad-client and data-ad-slot with your actual values.
                    The values below are placeholders.
                 */}
                 <ins className="adsbygoogle"
                     style={{ display: 'block', width: '100%' }}
                     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                     data-ad-slot="1234567890"
                     data-ad-format="auto"
                     data-full-width-responsive="true"
                 />
                 
                 {/* Fallback visual to show layout during dev or if ads blocked */}
                 <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-gray-300 dark:text-white/5 text-4xl font-bold uppercase tracking-widest select-none">Ad Space</span>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default AdBanner;