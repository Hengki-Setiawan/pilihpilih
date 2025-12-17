'use client';
import { Room } from '@/db/schema';
import { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';

export function CardDraw({ room }: { room: Room }) {
    const options = JSON.parse(room.options); // cards array
    const state = JSON.parse(room.state);
    const [flipping, setFlipping] = useState(false);
    const [currentCard, setCurrentCard] = useState<string | null>(state.lastDrawn || null);
    const [isRevealed, setIsRevealed] = useState(!!state.lastDrawn);

    useEffect(() => {
        if (state.isDrawing && state.drawTimestamp) {
            setFlipping(true);
            setIsRevealed(false);

            setTimeout(() => {
                setCurrentCard(state.lastDrawn);
                setIsRevealed(true);
                setFlipping(false);
            }, 600);
        }
    }, [state.isDrawing, state.drawTimestamp, state.lastDrawn]);

    const handleDraw = async () => {
        if (flipping) return;
        const { drawCard } = await import('@/app/actions');
        await drawCard(room.id);
    };

    const drawnCount = state.drawn?.length || 0;
    const remainingCount = options.length - drawnCount;

    return (
        <div className="flex flex-col items-center gap-6 px-4">
            {/* Card Display */}
            <div className="relative perspective-1000">
                <div
                    className={`w-48 h-72 md:w-56 md:h-80 relative transition-transform duration-500 transform-style-preserve-3d ${flipping ? 'rotate-y-180' : ''
                        }`}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: flipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transition: 'transform 0.6s'
                    }}
                >
                    {/* Card Back */}
                    <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-4 border-white/20 shadow-2xl flex items-center justify-center"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="w-full h-full rounded-xl m-2 border-2 border-white/20 flex items-center justify-center">
                            <span className="text-6xl opacity-50">🎴</span>
                        </div>
                    </div>

                    {/* Card Front */}
                    <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white to-gray-100 border-4 border-white/50 shadow-2xl flex items-center justify-center p-4"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        {currentCard && isRevealed && (
                            <div className="text-center">
                                <p className="text-2xl md:text-3xl font-bold text-gray-800 break-words">
                                    {currentCard}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="text-center">
                <p className="text-white/50 text-sm">
                    Tersisa: {remainingCount} / {options.length} kartu
                </p>
                {state.drawn && state.drawn.length > 0 && (
                    <p className="text-white/30 text-xs mt-1">
                        Terakhir: {state.drawn.slice(-3).join(', ')}
                    </p>
                )}
            </div>

            {/* Draw Button */}
            <button
                onClick={handleDraw}
                disabled={flipping || remainingCount === 0}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center gap-2"
            >
                <Layers size={20} />
                {remainingCount === 0 ? 'Kartu Habis' : flipping ? 'Mengambil...' : 'AMBIL KARTU'}
            </button>

            {/* Reset */}
            {drawnCount > 0 && (
                <button
                    onClick={async () => {
                        const { resetCards } = await import('@/app/actions');
                        await resetCards(room.id);
                    }}
                    className="text-white/40 hover:text-white/70 text-sm transition-colors"
                >
                    Reset Deck
                </button>
            )}
        </div>
    );
}
