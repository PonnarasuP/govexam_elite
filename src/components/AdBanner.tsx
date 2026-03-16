import React from 'react';
import { cn } from '../lib/utils';

interface AdBannerProps {
  className?: string;
  slot?: string;
  label?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className, slot, label = "Sponsored Content" }) => {
  return (
    <div className={cn(
      "w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center min-h-[100px] relative group",
      className
    )}>
      <div className="absolute top-2 left-4 text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
        {label}
      </div>
      
      {/* Placeholder for AdSense */}
      <div className="w-full h-full flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mb-1">Ad Slot: {slot || 'General'}</p>
          <div className="w-24 h-[1px] bg-white/5 mx-auto" />
        </div>
      </div>

      {/* This is where the actual AdSense code will go */}
      {/* 
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot={slot}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
           (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
      */}
    </div>
  );
};

export default AdBanner;
