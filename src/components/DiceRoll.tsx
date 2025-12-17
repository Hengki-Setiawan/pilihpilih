'use client';
import { Room } from '@/db/schema';
import { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';

const diceEmoji = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function DiceRoll({ room }: { room: Room }) {
    const state = JSON.parse(room.state);
    const [rolling, setRolling] = useState(false);
    const [currentValue, setCurrentValue] = useState(state.lastRoll || 1);
    const diceCount = state.diceCount || 1;

    useEffect(() => {
        if (state.isRolling && state.rollTimestamp) {
            setRolling(true);

            // Animate dice
            let count = 0;
            const interval = setInterval(() => {
                setCurrentValue(Math.floor(Math.random() * 6) + 1);
                count++;
                if (count > 15) {
                    clearInterval(interval);
                    setRolling(false);
                    setCurrentValue(state.lastRoll);
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, [state.isRolling, state.rollTimestamp, state.lastRoll]);

    const handleRoll = async () => {
        if (rolling) return;
        const { rollDice } = await import('@/app/actions');
        await rollDice(room.id);
    };

    return (
        <div className="flex flex-col items-center gap-8 px-4">
            {/* Dice Display */}
            <div className="flex gap-4 justify-center flex-wrap">
                {Array.from({ length: diceCount }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-white to-gray-200 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/50 ${rolling ? 'animate-bounce' : ''
                            }`}
                        style={{
                            animationDelay: `${i * 100}ms`
                        }}
                    >
                        <span className="text-5xl md:text-7xl select-none" style={{ color: '#1a1a1a' }}>
                            {diceEmoji[currentValue]}
                        </span>
                    </div>
                ))}
            </div>

            {/* Result */}
            <div className="text-center">
                {!rolling && state.lastRoll && (
                    <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                        {state.lastRoll}
                    </div>
                )}
                {rolling && (
                    <div className="text-xl text-white/50">Mengocok...</div>
                )}
                {!rolling && !state.lastRoll && (
                    <div className="text-white/30 text-sm">Tekan tombol untuk mengocok dadu</div>
                )}
            </div>

            {/* Roll Button */}
            <button
                onClick={handleRoll}
                disabled={rolling}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-50 flex items-center gap-2"
            >
                <Dices size={20} className={rolling ? 'animate-spin' : ''} />
                {rolling ? 'Mengocok...' : 'KOCOK DADU'}
            </button>

            {/* History */}
            {state.history && state.history.length > 0 && (
                <div className="text-center">
                    <p className="text-xs text-white/30 mb-2">Riwayat:</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {state.history.slice(-10).map((roll: number, i: number) => (
                            <span key={i} className="text-lg">{diceEmoji[roll]}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
