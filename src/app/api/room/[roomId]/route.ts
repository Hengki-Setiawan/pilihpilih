import { db } from '@/lib/db';
import { rooms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const { roomId } = await params;
        const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
        if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
