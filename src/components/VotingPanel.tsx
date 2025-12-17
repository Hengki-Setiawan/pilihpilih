'use client';
import { Room } from '@/db/schema';
import { vote } from '@/app/actions';
import { useState, useEffect } from 'react';
import { User, Users } from 'lucide-react';

export function VotingPanel({ room }: { room: Room }) {
    const options = JSON.parse(room.options);
    const state = JSON.parse(room.state);
    const votes = state.votes || {};
    const voters = state.voters || {};

    const [nickname, setNickname] = useState('');
    const [hasVoted, setHasVoted] = useState(false);
    const [showNicknameModal, setShowNicknameModal] = useState(false);
    const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('pilihpilih_nickname');
        if (saved) setNickname(saved);

        const votedRoom = localStorage.getItem(`voted_${room.id}`);
        if (votedRoom) setHasVoted(true);
    }, [room.id]);

    const handleVote = async (optionId: string) => {
        if (hasVoted) return;

        if (!nickname) {
            setPendingOptionId(optionId);
            setShowNicknameModal(true);
            return;
        }

        await vote(room.id, optionId);
        localStorage.setItem(`voted_${room.id}`, 'true');
        setHasVoted(true);
    };

    const submitWithNickname = async () => {
        if (!nickname.trim() || !pendingOptionId) return;

        localStorage.setItem('pilihpilih_nickname', nickname.trim());
        setShowNicknameModal(false);

        await vote(room.id, pendingOptionId);
        localStorage.setItem(`voted_${room.id}`, 'true');
        setHasVoted(true);
    };

    const totalVotes = Object.values(votes).reduce((a: any, b: any) => a + b, 0) as number;
    const uniqueVoters = Object.keys(voters).length;

    const colors = [
        '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
        '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
    ];

    return (
        <div className="w-full max-w-lg mx-auto px-4">
            {/* Nickname Modal */}
            {showNicknameModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="text-purple-400" size={20} />
                            <h3 className="font-bold text-white">Masukkan Nama (Opsional)</h3>
                        </div>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Nama kamu..."
                            maxLength={20}
                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 mb-4"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowNicknameModal(false);
                                    if (pendingOptionId) handleVote(pendingOptionId);
                                }}
                                className="flex-1 py-2 bg-white/10 rounded-lg text-white/70 text-sm font-medium hover:bg-white/20"
                            >
                                Skip
                            </button>
                            <button
                                onClick={submitWithNickname}
                                disabled={!nickname.trim()}
                                className="flex-1 py-2 bg-purple-600 rounded-lg text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                            >
                                Vote
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mb-6 text-white/40 text-sm">
                <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{uniqueVoters || totalVotes} voter{(uniqueVoters || totalVotes) !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div>{totalVotes} total votes</div>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {options.map((option: any, index: number) => {
                    const count = votes[option.id] || 0;
                    const percent = totalVotes === 0 ? 0 : (count / totalVotes) * 100;
                    const color = colors[index % colors.length];

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            disabled={hasVoted}
                            className={`w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 transition-all active:scale-[0.99] group ${hasVoted ? 'cursor-default' : 'hover:border-white/20'
                                }`}
                        >
                            {/* Progress Bar */}
                            <div
                                className="absolute top-0 left-0 h-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${percent}%`,
                                    background: `linear-gradient(90deg, ${color}40, ${color}20)`
                                }}
                            />

                            <div className="relative p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full shadow-lg"
                                        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}50` }}
                                    />
                                    <span className="font-medium text-white group-hover:text-white/90">{option.label}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-white/50 font-medium">{percent.toFixed(0)}%</span>
                                    <span
                                        className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold min-w-[3rem] text-center"
                                        style={{ backgroundColor: `${color}30`, color: color }}
                                    >
                                        {count}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {hasVoted && (
                <div className="text-center text-green-400/70 pt-6 text-sm">
                    ✓ Kamu sudah vote!
                </div>
            )}
        </div>
    );
}
