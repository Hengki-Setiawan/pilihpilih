'use client';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download } from 'lucide-react';
import { useRef } from 'react';

interface QRShareModalProps {
    url: string;
    title: string;
    onClose: () => void;
}

export function QRShareModal({ url, title, onClose }: QRShareModalProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    const downloadQR = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            const link = document.createElement('a');
            link.download = `pilihpilih-${title.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Scan QR Code</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div ref={qrRef} className="bg-white p-4 rounded-xl mx-auto w-fit">
                    <QRCodeSVG
                        value={url}
                        size={200}
                        level="H"
                        includeMargin={false}
                    />
                </div>

                <p className="text-center text-white/50 text-sm mt-4 mb-4">{title}</p>

                <div className="flex gap-2">
                    <button
                        onClick={downloadQR}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={16} />
                        Download
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
