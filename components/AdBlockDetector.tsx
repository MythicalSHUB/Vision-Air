import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const AdBlockDetector: React.FC = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkAdBlock = async () => {
    setChecking(true);
    
    // Give the browser a moment to process initial loads
    await new Promise(resolve => setTimeout(resolve, 500));

    let blocked = false;

    // Method 1: CSS Bait
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-placement doubleclick pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
    bait.style.position = 'absolute';
    bait.style.top = '-1000px';
    bait.style.left = '-1000px';
    bait.style.height = '1px';
    bait.style.width = '1px';
    document.body.appendChild(bait);

    // Small delay to allow CSS injection from adblockers to take effect
    await new Promise(resolve => setTimeout(resolve, 100));

    if (
        bait.offsetHeight === 0 || 
        bait.offsetWidth === 0 || 
        window.getComputedStyle(bait).display === 'none' || 
        window.getComputedStyle(bait).visibility === 'hidden'
    ) {
        blocked = true;
    }
    
    document.body.removeChild(bait);

    // Method 2: Network Check (Google Ads specific)
    if (!blocked) {
        try {
            const request = new Request(
                'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', 
                { method: 'HEAD', mode: 'no-cors' }
            );
            await fetch(request);
        } catch (error) {
            // Network error usually implies blocked request
            blocked = true;
        }
    }

    setIsBlocked(blocked);
    setChecking(false);
  };

  useEffect(() => {
    checkAdBlock();
  }, []);

  if (checking || !isBlocked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/90 dark:bg-black/80 backdrop-blur-3xl transition-colors duration-500">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center relative overflow-hidden bg-white/10 dark:bg-white/5">
        
        {/* Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
                <ShieldAlert className="w-10 h-10 text-red-500 dark:text-red-400" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Ad Blocker Detected</h2>
            
            <div className="space-y-4 mb-8">
                <p className="text-gray-200 dark:text-white/70 font-light leading-relaxed">
                    We noticed you're using an ad blocker.
                </p>
                <p className="text-gray-300 dark:text-white/60 text-sm font-light leading-relaxed border-t border-white/10 pt-4">
                    Vision Air provides expensive AI processing for free. To keep this tool available to everyone, we require ads to cover our server costs.
                </p>
                <p className="text-white font-medium text-sm">
                    Please disable your ad blocker to continue.
                </p>
            </div>

            <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-white hover:bg-white/90 text-black font-semibold rounded-xl transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
            >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                I've Disabled It
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdBlockDetector;