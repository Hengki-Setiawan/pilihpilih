'use client';
import { Room } from '@/db/schema';
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';

export function ProsConsPanel({ room }: { room: Room }) {
    const state = JSON.parse(room.state);
    const pros = state.pros || [];
    const cons = state.cons || [];
    const [proInput, setProInput] = useState('');
    const [conInput, setConInput] = useState('');

    const handleAddPro = async () => {
        if (!proInput.trim()) return;
        const { addProCon } = await import('@/app/actions');
        await addProCon(room.id, 'pro', proInput.trim());
        setProInput('');
    };

    const handleAddCon = async () => {
        if (!conInput.trim()) return;
        const { addProCon } = await import('@/app/actions');
        await addProCon(room.id, 'con', conInput.trim());
        setConInput('');
    };

    const handleVote = async (type: 'pro' | 'con', id: string) => {
        const { voteProCon } = await import('@/app/actions');
        await voteProCon(room.id, type, id);
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pros Column */}
                <div className="bg-gradient-to-b from-green-500/10 to-green-500/5 rounded-2xl border border-green-500/20 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <ThumbsUp className="text-green-400" size={20} />
                        <h3 className="font-bold text-green-400">PRO ({pros.length})</h3>
                    </div>

                    {/* Add Pro */}
                    <div className="flex gap-2 mb-4">
                        <input
                            value={proInput}
                            onChange={(e) => setProInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPro()}
                            placeholder="Tambah alasan pro..."
                            className="flex-1 px-3 py-2 bg-black/30 border border-green-500/20 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-green-500/50"
                        />
                        <button
                            onClick={handleAddPro}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>

                    {/* Pro List */}
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {pros.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-2 bg-black/20 rounded-lg p-3 group"
                            >
                                <button
                                    onClick={() => handleVote('pro', item.id)}
                                    className="flex items-center gap-1 text-xs text-green-400/70 hover:text-green-400 transition-colors shrink-0"
                                >
                                    <ThumbsUp size={14} />
                                    <span>{item.votes || 0}</span>
                                </button>
                                <p className="text-white/80 text-sm flex-1">{item.text}</p>
                            </div>
                        ))}
                        {pros.length === 0 && (
                            <p className="text-white/30 text-sm text-center py-4">Belum ada alasan pro</p>
                        )}
                    </div>
                </div>

                {/* Cons Column */}
                <div className="bg-gradient-to-b from-red-500/10 to-red-500/5 rounded-2xl border border-red-500/20 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <ThumbsDown className="text-red-400" size={20} />
                        <h3 className="font-bold text-red-400">KONTRA ({cons.length})</h3>
                    </div>

                    {/* Add Con */}
                    <div className="flex gap-2 mb-4">
                        <input
                            value={conInput}
                            onChange={(e) => setConInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCon()}
                            placeholder="Tambah alasan kontra..."
                            className="flex-1 px-3 py-2 bg-black/30 border border-red-500/20 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-red-500/50"
                        />
                        <button
                            onClick={handleAddCon}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>

                    {/* Con List */}
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {cons.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-2 bg-black/20 rounded-lg p-3 group"
                            >
                                <button
                                    onClick={() => handleVote('con', item.id)}
                                    className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors shrink-0"
                                >
                                    <ThumbsUp size={14} />
                                    <span>{item.votes || 0}</span>
                                </button>
                                <p className="text-white/80 text-sm flex-1">{item.text}</p>
                            </div>
                        ))}
                        {cons.length === 0 && (
                            <p className="text-white/30 text-sm text-center py-4">Belum ada alasan kontra</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="text-center mt-6 text-white/40 text-sm">
                Total: {pros.length + cons.length} argumen
            </div>
        </div>
    );
}
