'use client';
import { useEffect, useState } from 'react';
import { Room } from '@/db/schema';
import { GachaWheel } from './GachaWheel';
import { VotingPanel } from './VotingPanel';
import { RandomPicker } from './RandomPicker';
import { DiceRoll } from './DiceRoll';
import { CardDraw } from './CardDraw';
import { ProsConsPanel } from './ProsConsPanel';
import { QRShareModal } from './QRShareModal';
import { ThemeToggle } from './ThemeToggle';
import { Copy, Check, Clock, ArrowLeft, Trash2, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteRoom } from '@/app/actions';

function formatTimeLeft(expiresAt: number): string {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}j ${mins}m`;
    return `${mins}m`;
}

const typeLabels: Record<string, { icon: string; label: string }> = {
    gacha: { icon: '🎡', label: 'Gacha Wheel' },
    voting: { icon: '📊', label: 'Live Voting' },
    picker: { icon: '🎯', label: 'Random Picker' },
    dice: { icon: '🎲', label: 'Dice Roll' },
    cards: { icon: '🎴', label: 'Card Draw' },
    pros_cons: { icon: '⚖️', label: 'Pro & Kontra' },
};

export function RoomClient({ initialRoom }: { initialRoom: Room }) {
    const router = useRouter();
    const [room, setRoom] = useState(initialRoom);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [mounted, setMounted] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTimeLeft(formatTimeLeft(room.expiresAt));

        localStorage.setItem('pilihpilih_last_room', JSON.stringify({
            id: room.id,
            title: room.title,
            expiresAt: room.expiresAt
        }));
    }, [room.expiresAt, room.id, room.title]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/room/${room.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (JSON.stringify(data) !== JSON.stringify(room)) {
                        setRoom(data);
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 1500);
        return () => clearInterval(interval);
    }, [room.id, room]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(formatTimeLeft(room.expiresAt));
        }, 60000);
        return () => clearInterval(interval);
    }, [room.expiresAt]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteRoom(room.id);
            localStorage.removeItem('pilihpilih_last_room');
            router.push('/');
        } catch (error) {
            console.error(error);
            setDeleting(false);
        }
    };

    const typeInfo = typeLabels[room.type] || { icon: '❓', label: room.type };

    const renderContent = () => {
        switch (room.type) {
            case 'gacha': return <GachaWheel room={room} />;
            case 'voting': return <VotingPanel room={room} />;
            case 'picker': return <RandomPicker room={room} />;
            case 'dice': return <DiceRoll room={room} />;
            case 'cards': return <CardDraw room={room} />;
            case 'pros_cons': return <ProsConsPanel room={room} />;
            default: return <div className="text-center text-white/50">Type tidak dikenal</div>;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* QR Modal */}
            {showQR && mounted && (
                <QRShareModal
                    url={window.location.href}
                    title={room.title}
                    onClose={() => setShowQR(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-red-500/30 rounded-xl p-5 max-w-sm w-full">
                        <div className="text-center">
                            <Trash2 className="mx-auto text-red-400 mb-3" size={32} />
                            <h3 className="font-bold text-white mb-2">Hapus Room?</h3>
                            <p className="text-white/60 text-sm mb-4">
                                Room "<span className="text-white">{room.title}</span>" akan dihapus permanen.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-2 bg-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 py-2 bg-red-500 rounded-lg text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {deleting ? 'Menghapus...' : 'Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-[#888] hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                        <span className="text-sm hidden sm:inline">Kembali</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {mounted && (
                            <div className="flex items-center gap-1 text-xs text-[#666]">
                                <Clock size={12} />
                                <span>{timeLeft}</span>
                            </div>
                        )}

                        <ThemeToggle />

                        <button
                            onClick={() => setShowQR(true)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="QR Code"
                        >
                            <QrCode size={16} />
                        </button>

                        <button
                            onClick={copyLink}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                        >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin'}</span>
                        </button>

                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Hapus Room"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Title */}
            <div className="text-center py-6 px-4">
                <h1 className="text-xl md:text-2xl font-bold text-white">{room.title}</h1>
                <p className="text-xs text-[#666] mt-1">
                    {typeInfo.icon} {typeInfo.label}
                </p>
            </div>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto pb-8">
                {renderContent()}
            </main>
        </div>
    );
}
