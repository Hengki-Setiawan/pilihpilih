'use client';
import { createRoom, cleanupExpiredRooms } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Sparkles, BarChart3, Loader2, Shuffle, Dices, Layers, Scale, Clock, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

type RoomType = 'gacha' | 'voting' | 'picker' | 'dice' | 'cards' | 'pros_cons';

const roomTypes: { type: RoomType; icon: React.ReactNode; label: string; color: string; needsOptions: boolean; optionPlaceholder?: string }[] = [
    { type: 'gacha', icon: <Sparkles size={20} />, label: 'Gacha', color: 'purple', needsOptions: true, optionPlaceholder: 'Pizza\nBurger\nSushi' },
    { type: 'voting', icon: <BarChart3 size={20} />, label: 'Voting', color: 'blue', needsOptions: true, optionPlaceholder: 'Opsi A\nOpsi B\nOpsi C' },
    { type: 'picker', icon: <Shuffle size={20} />, label: 'Random', color: 'green', needsOptions: true, optionPlaceholder: 'Nama 1\nNama 2\nNama 3' },
    { type: 'dice', icon: <Dices size={20} />, label: 'Dadu', color: 'amber', needsOptions: false },
    { type: 'cards', icon: <Layers size={20} />, label: 'Kartu', color: 'violet', needsOptions: true, optionPlaceholder: 'Truth\nDare\nSkip' },
    { type: 'pros_cons', icon: <Scale size={20} />, label: 'Pro/Kon', color: 'rose', needsOptions: false },
];

const durations = [
    { value: 1, label: '1 Jam' },
    { value: 6, label: '6 Jam' },
    { value: 12, label: '12 Jam' },
    { value: 24, label: '24 Jam' },
];

export function CreateRoomForm() {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<RoomType>('gacha');
    const [options, setOptions] = useState('');
    const [duration, setDuration] = useState(24);
    const [existingRoom, setExistingRoom] = useState<{ id: string; title: string } | null>(null);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        cleanupExpiredRooms().catch(console.error);

        // Check for existing room in localStorage
        const savedRoom = localStorage.getItem('pilihpilih_last_room');
        if (savedRoom) {
            try {
                const room = JSON.parse(savedRoom);
                // Check if room is still valid (not expired)
                if (room.expiresAt > Date.now()) {
                    setExistingRoom(room);
                } else {
                    localStorage.removeItem('pilihpilih_last_room');
                }
            } catch {
                localStorage.removeItem('pilihpilih_last_room');
            }
        }
    }, []);

    const currentType = roomTypes.find(t => t.type === type)!;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;

        // Check if there's an existing room
        if (existingRoom && !showWarning) {
            setShowWarning(true);
            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.set('type', type);
        formData.set('options', currentType.needsOptions ? options : '[]');
        formData.set('duration', duration.toString());

        setLoading(true);

        // Clear existing room from localStorage
        localStorage.removeItem('pilihpilih_last_room');

        try {
            await createRoom(formData);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const colorClasses: Record<string, string> = {
        purple: 'from-purple-600/30 to-pink-600/20 border-purple-500/50 shadow-purple-500/20 text-purple-400',
        blue: 'from-blue-600/30 to-cyan-600/20 border-blue-500/50 shadow-blue-500/20 text-blue-400',
        green: 'from-green-600/30 to-emerald-600/20 border-green-500/50 shadow-green-500/20 text-green-400',
        amber: 'from-amber-600/30 to-orange-600/20 border-amber-500/50 shadow-amber-500/20 text-amber-400',
        violet: 'from-violet-600/30 to-fuchsia-600/20 border-violet-500/50 shadow-violet-500/20 text-violet-400',
        rose: 'from-rose-600/30 to-red-600/20 border-rose-500/50 shadow-rose-500/20 text-rose-400',
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent rounded-2xl blur-xl" />

            <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">

                {/* Warning Modal for Existing Room */}
                {showWarning && existingRoom && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center p-4">
                        <div className="bg-[#1a1a1a] border border-amber-500/30 rounded-xl p-5 max-w-sm w-full">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <h3 className="font-bold text-white mb-1">Room Sebelumnya Masih Aktif</h3>
                                    <p className="text-white/60 text-sm mb-3">
                                        Room "<span className="text-white">{existingRoom.title}</span>" masih berjalan. Lanjutkan buat room baru?
                                    </p>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/${existingRoom.id}`}
                                            className="flex-1 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-medium text-center hover:bg-amber-500/30 transition-colors"
                                        >
                                            Ke Room Lama
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowWarning(false);
                                                setExistingRoom(null);
                                                localStorage.removeItem('pilihpilih_last_room');
                                            }}
                                            className="flex-1 py-2 bg-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors"
                                        >
                                            Buat Baru
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => setShowWarning(false)} className="text-white/40 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Judul Room</label>
                        <input
                            name="title"
                            required
                            placeholder="Contoh: Makan Apa Hari Ini?"
                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Tipe</label>
                        <div className="grid grid-cols-3 gap-2">
                            {roomTypes.map((rt) => (
                                <button
                                    key={rt.type}
                                    type="button"
                                    onClick={() => { setType(rt.type); setOptions(''); }}
                                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${type === rt.type
                                            ? `bg-gradient-to-br ${colorClasses[rt.color]} shadow-lg`
                                            : 'bg-black/20 border-white/10 hover:border-white/20 hover:bg-white/5 text-white/50'
                                        }`}
                                >
                                    <span className={type === rt.type ? colorClasses[rt.color].split(' ').pop() : ''}>{rt.icon}</span>
                                    <span className={`text-xs font-medium ${type === rt.type ? 'text-white' : ''}`}>{rt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration Selector */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-1">
                            <Clock size={14} /> Durasi
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {durations.map((d) => (
                                <button
                                    key={d.value}
                                    type="button"
                                    onClick={() => setDuration(d.value)}
                                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${duration === d.value
                                            ? 'bg-white/20 text-white border border-white/30'
                                            : 'bg-black/20 text-white/50 border border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Options (conditional) */}
                    {currentType.needsOptions && (
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Pilihan <span className="text-white/40">(satu per baris)</span>
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={options}
                                onChange={(e) => setOptions(e.target.value)}
                                placeholder={currentType.optionPlaceholder}
                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none font-mono text-sm"
                            />
                        </div>
                    )}

                    {!currentType.needsOptions && (
                        <div className="bg-white/5 rounded-xl p-3 text-center text-white/50 text-sm">
                            {type === 'dice' && '🎲 Langsung kocok di room!'}
                            {type === 'pros_cons' && '⚖️ Semua bisa tambah argumen.'}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || (currentType.needsOptions && options.split('\n').filter(l => l.trim()).length < 2)}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Membuat...</> : 'Buat Room'}
                    </button>
                </form>
            </div>
        </div>
    );
}
