import { db } from '@/lib/db';
import { rooms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { RoomClient } from '@/components/RoomClient';

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();

    if (!room) return notFound();

    if (Date.now() > room.expiresAt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <div className="text-center space-y-4 max-w-md bg-white/10 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
                    <h1 className="text-4xl font-bold text-red-500">Room Expired</h1>
                    <p className="text-gray-300">This room has expired and is no longer available.</p>
                    <a href="/" className="inline-block px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
                        Create New Room
                    </a>
                </div>
            </div>
        );
    }

    return <RoomClient initialRoom={room} />;
}
