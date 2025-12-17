'use client';

interface AdBannerProps {
    slot?: 'header' | 'sidebar' | 'footer';
    size?: 'small' | 'medium' | 'large';
}

export function AdBanner({ slot = 'footer', size = 'medium' }: AdBannerProps) {
    const sizeClasses = {
        small: 'h-16',
        medium: 'h-24',
        large: 'h-32'
    };

    return (
        <div
            className={`w-full ${sizeClasses[size]} bg-gradient-to-r from-white/[0.02] to-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center overflow-hidden`}
            data-ad-slot={slot}
        >
            {/* Replace this with actual Google AdSense code */}
            {/* 
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      */}

            <div className="text-center">
                <div className="text-white/20 text-xs font-medium">📢 AD SPACE</div>
                <div className="text-white/10 text-[10px]">Google AdSense Placeholder</div>
            </div>
        </div>
    );
}
