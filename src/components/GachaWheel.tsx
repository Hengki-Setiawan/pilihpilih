'use client';
import { Room } from '@/db/schema';
import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { spinWheel } from '@/app/actions';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '@/lib/sounds';

export function GachaWheel({ room }: { room: Room }) {
    const options = JSON.parse(room.options);
    const state = JSON.parse(room.state);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const lastSpinRef = useRef<number | null>(null);
    const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize sound on first interaction
    useEffect(() => {
        const initSound = () => {
            soundManager.init();
            document.removeEventListener('click', initSound);
        };
        document.addEventListener('click', initSound);
        return () => document.removeEventListener('click', initSound);
    }, []);

    useEffect(() => {
        if (state.isSpinning && state.winner && state.spinTimestamp) {
            if (lastSpinRef.current === state.spinTimestamp) return;
            lastSpinRef.current = state.spinTimestamp;

            const winnerIndex = options.findIndex((o: any) => o.id === state.winner);
            if (winnerIndex === -1) return;

            const sliceAngle = 360 / options.length;
            const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.5);
            const winnerAngle = winnerIndex * sliceAngle + sliceAngle / 2 + randomOffset;

            const spins = 10 + Math.random() * 2;
            const baseRotation = rotation + (360 * spins);
            const currentWheelAngle = rotation % 360;
            const targetAngle = 270 - winnerAngle;
            const diff = ((targetAngle - currentWheelAngle) % 360 + 360) % 360;
            const targetRotation = baseRotation + diff;

            const duration = 8;
            const elapsed = (Date.now() - state.spinTimestamp) / 1000;

            if (elapsed < duration) {
                setSpinning(true);
                setRotation(targetRotation);

                // Play tick sounds during spin
                if (soundEnabled) {
                    let tickDelay = 50;
                    let tickCount = 0;
                    const maxTicks = 60;

                    const playTicks = () => {
                        if (tickCount < maxTicks) {
                            soundManager.playTick();
                            tickCount++;
                            tickDelay = Math.min(tickDelay * 1.08, 500);
                            tickIntervalRef.current = setTimeout(playTicks, tickDelay);
                        }
                    };
                    playTicks();
                }

                setTimeout(() => {
                    setSpinning(false);
                    if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);

                    if (soundEnabled) soundManager.playDing();
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.5 },
                        colors: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6']
                    });
                }, (duration - elapsed) * 1000);
            } else {
                setRotation(targetRotation);
                setSpinning(false);
            }
        }

        return () => {
            if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
        };
    }, [state.isSpinning, state.winner, state.spinTimestamp, options, rotation, soundEnabled]);

    const handleSpin = async () => {
        if (spinning) return;
        await spinWheel(room.id);
    };

    const colors = [
        '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
        '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
    ];

    return (
        <div className="flex flex-col items-center gap-6 w-full px-4">
            {/* Sound Toggle */}
            <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="absolute top-20 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                title={soundEnabled ? 'Mute' : 'Unmute'}
            >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Wheel Container */}
            <div className="relative" style={{ width: 'min(320px, 85vw)', height: 'min(320px, 85vw)' }}>
                {/* Pointer */}
                <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-20">
                    <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-white drop-shadow-lg" />
                </div>

                {/* Outer glow */}
                <div
                    className="absolute inset-[-4px] rounded-full"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                        filter: 'blur(2px)'
                    }}
                />

                {/* Wheel */}
                <div
                    className="w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-2xl relative"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning ? 'transform 8s cubic-bezier(0.05, 0.3, 0.1, 1)' : 'none',
                        background: '#1a1a1a'
                    }}
                >
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                        {options.map((option: any, index: number) => {
                            const sliceAngle = 360 / options.length;
                            const startAngle = index * sliceAngle - 90;
                            const endAngle = (index + 1) * sliceAngle - 90;

                            const startRad = (startAngle * Math.PI) / 180;
                            const endRad = (endAngle * Math.PI) / 180;

                            const x1 = 100 + 100 * Math.cos(startRad);
                            const y1 = 100 + 100 * Math.sin(startRad);
                            const x2 = 100 + 100 * Math.cos(endRad);
                            const y2 = 100 + 100 * Math.sin(endRad);

                            const largeArc = sliceAngle > 180 ? 1 : 0;
                            const path = options.length === 1
                                ? `M 100 100 m -100, 0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0`
                                : `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                            const midAngle = (startAngle + endAngle) / 2;
                            const midRad = (midAngle * Math.PI) / 180;
                            const labelRadius = 65;
                            const labelX = 100 + labelRadius * Math.cos(midRad);
                            const labelY = 100 + labelRadius * Math.sin(midRad);

                            const displayLabel = option.label.length > 8
                                ? option.label.slice(0, 8) + '..'
                                : option.label;

                            return (
                                <g key={option.id}>
                                    <path d={path} fill={colors[index % colors.length]} stroke="#1a1a1a" strokeWidth="2" />
                                    <text
                                        x={labelX}
                                        y={labelY}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="white"
                                        fontSize={options.length > 6 ? "9" : "11"}
                                        fontWeight="700"
                                        transform={`rotate(${midAngle + 90}, ${labelX}, ${labelY})`}
                                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)' }}
                                    >
                                        {displayLabel}
                                    </text>
                                </g>
                            );
                        })}
                        <circle cx="100" cy="100" r="20" fill="#2a2a2a" stroke="#444" strokeWidth="3" />
                        <circle cx="100" cy="100" r="10" fill="#444" />
                        <circle cx="100" cy="100" r="4" fill="#666" />
                    </svg>
                </div>
            </div>

            {/* Status */}
            <div className="h-8 flex items-center justify-center">
                {spinning && <div className="text-white/60 text-sm animate-pulse">Memutar...</div>}
            </div>

            {/* Spin Button */}
            <button
                onClick={handleSpin}
                disabled={spinning}
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
            >
                <RotateCcw size={24} className={spinning ? 'animate-spin' : ''} />
                {spinning ? 'Memutar...' : 'PUTAR'}
            </button>

            {/* History */}
            {state.history && state.history.length > 0 && (
                <div className="w-full max-w-sm mt-6">
                    <div className="text-xs text-white/40 mb-2 text-center">Riwayat Spin</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {state.history.slice(0, 5).map((h: any, i: number) => (
                            <span
                                key={i}
                                className={`px-3 py-1 rounded-full text-xs ${i === 0
                                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                        : 'bg-white/5 text-white/50'
                                    }`}
                            >
                                {h.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
