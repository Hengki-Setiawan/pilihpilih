'use client';
import { Room } from '@/db/schema';
import { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';

export function RandomPicker({ room }: { room: Room }) {
    const options = JSON.parse(room.options);
    const state = JSON.parse(room.state);
    const [spinning, setSpinning] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [winner, setWinner] = useState<string | null>(state.lastPicked || null);

    // Slot machine effect
    useEffect(() => {
        if (state.isPicking && state.pickTimestamp) {
            const targetIndex = options.findIndex((o: any) => o.label === state.lastPicked);
            if (targetIndex === -1) return;

            setSpinning(true);
            setWinner(null);

            let count = 0;
            const maxSpins = 20 + targetIndex;

            const interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % options.length);
                count++;

                if (count >= maxSpins) {
                    clearInterval(interval);
                    setSpinning(false);
                    setWinner(options[targetIndex].label);
                }
            }, 100 - Math.min(count * 2, 50));

            return () => clearInterval(interval);
        }
    }, [state.isPicking, state.pickTimestamp, options, state.lastPicked]);

    const handlePick = async () => {
        if (spinning) return;

        const { pickRandom } = await import('@/app/actions');
        await pickRandom(room.id);
    };

    const colors = [
        '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
        '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
    ];

    return (
        <div className="flex flex-col items-center gap-6 px-4 w-full max-w-md mx-auto">
            {/* Slot Display */}
            <div className="w-full bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <div className="relative h-48 flex items-center justify-center overflow-hidden">
                    {/* Selection indicator */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 bg-gradient-to-r from-purple-500/20 via-purple-500/30 to-purple-500/20 border-y border-purple-500/50 z-10" />

                    {/* Scrolling items */}
                    <div
                        className="transition-transform duration-100"
                        style={{
                            transform: spinning ? `translateY(${-currentIndex * 64}px)` : 'translateY(0)'
                        }}
                    >
                        {(spinning ? [...options, ...options, ...options] : options).map((option: any, index: number) => (
                            <div
                                key={index}
                                className={`h-16 flex items-center justify-center text-xl font-bold transition-all ${!spinning && winner === option.label
                                        ? 'text-white scale-110'
                                        : spinning
                                            ? 'text-white/70'
                                            : 'text-white/40'
                                    }`}
                                style={{
                                    color: !spinning && winner === option.label ? colors[index % colors.length] : undefined
                                }}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Result */}
            <div className="h-20 flex items-center justify-center text-center">
                {winner && !spinning ? (
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        🎯 {winner}
                    </div>
                ) : spinning ? (
                    <div className="text-white/50">Memilih...</div>
                ) : (
                    <div className="text-white/30 text-sm">Tekan tombol untuk memilih random</div>
                )}
            </div>

            {/* Pick Button */}
            <button
                onClick={handlePick}
                disabled={spinning}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all disabled:opacity-50 flex items-center gap-2"
            >
                <Shuffle size={20} className={spinning ? 'animate-spin' : ''} />
                {spinning ? 'Memilih...' : 'PILIH RANDOM'}
            </button>
        </div>
    );
}
