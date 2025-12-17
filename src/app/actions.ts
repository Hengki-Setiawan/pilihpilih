'use server'

import { db } from '@/lib/db';
import { rooms } from '@/db/schema';
import { redirect } from 'next/navigation';
import { eq, lt } from 'drizzle-orm';

type RoomType = 'gacha' | 'voting' | 'picker' | 'dice' | 'cards' | 'pros_cons';

export async function createRoom(formData: FormData) {
    const title = formData.get('title') as string;
    const type = formData.get('type') as RoomType;
    const optionsRaw = formData.get('options') as string;
    const durationHours = parseInt(formData.get('duration') as string) || 24;

    if (!title) {
        throw new Error('Missing title');
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + durationHours * 60 * 60 * 1000; // Use selected duration

    let options: any[] = [];
    let state: any = {};

    // Types that need options
    if (['gacha', 'voting', 'picker', 'cards'].includes(type)) {
        const optionsList = optionsRaw?.split('\n').filter(line => line.trim() !== '') || [];
        options = optionsList.map((label, index) => ({
            id: crypto.randomUUID(),
            label: label.trim(),
            color: `hsl(${index * 137.5 % 360}, 70%, 60%)`,
        }));
    }

    // Set initial state based on type
    switch (type) {
        case 'gacha':
            state = { winner: null, isSpinning: false, votes: {} };
            break;
        case 'voting':
            state = { votes: {} };
            break;
        case 'picker':
            state = { lastPicked: null, isPicking: false };
            break;
        case 'dice':
            state = { lastRoll: null, isRolling: false, diceCount: 1, history: [] };
            break;
        case 'cards':
            state = { drawn: [], lastDrawn: null, isDrawing: false };
            break;
        case 'pros_cons':
            state = { pros: [], cons: [] };
            break;
    }

    await db.insert(rooms).values({
        id,
        type,
        title,
        options: JSON.stringify(options),
        createdAt: now,
        expiresAt,
        state: JSON.stringify(state)
    });

    redirect(`/${id}`);
}

export async function spinWheel(roomId: string) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) throw new Error('Room not found');

    const options = JSON.parse(room.options);
    const currentState = JSON.parse(room.state);
    const winnerIndex = Math.floor(Math.random() * options.length);
    const winner = options[winnerIndex];

    // Add to history (keep last 10)
    const history = currentState.history || [];
    history.unshift({
        label: winner.label,
        timestamp: Date.now()
    });
    if (history.length > 10) history.pop();

    await db.update(rooms).set({
        state: JSON.stringify({
            winner: winner.id,
            isSpinning: true,
            spinTimestamp: Date.now(),
            votes: currentState.votes || {},
            history
        })
    }).where(eq(rooms.id, roomId));
}

export async function vote(roomId: string, optionId: string) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) throw new Error('Room not found');

    const state = JSON.parse(room.state);
    const votes = state.votes || {};
    votes[optionId] = (votes[optionId] || 0) + 1;

    await db.update(rooms).set({
        state: JSON.stringify({
            ...state,
            votes
        })
    }).where(eq(rooms.id, roomId));
}

export async function cleanupExpiredRooms() {
    const now = Date.now();
    await db.delete(rooms).where(lt(rooms.expiresAt, now));
}

export async function deleteRoom(roomId: string) {
    await db.delete(rooms).where(eq(rooms.id, roomId));
}

// Random Picker
export async function pickRandom(roomId: string) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) throw new Error('Room not found');

    const options = JSON.parse(room.options);
    const randomIndex = Math.floor(Math.random() * options.length);
    const picked = options[randomIndex];

    await db.update(rooms).set({
        state: JSON.stringify({
            isPicking: true,
            pickTimestamp: Date.now(),
            lastPicked: picked.label
        })
    }).where(eq(rooms.id, roomId));
}

// Dice Roll
export async function rollDice(roomId: string) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) throw new Error('Room not found');

    const state = JSON.parse(room.state);
    const result = Math.floor(Math.random() * 6) + 1;
    const history = state.history || [];
    history.push(result);

    await db.update(rooms).set({
        state: JSON.stringify({
            ...state,
            isRolling: true,
            rollTimestamp: Date.now(),
            lastRoll: result,
            history: history.slice(-20)
        })
    }).where(eq(rooms.id, roomId));
}

// Card Draw
export async function drawCard(roomId: string) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) throw new Error('Room not found');

    const options = JSON.parse(room.options);
    const state = JSON.parse(room.state);
    const drawn = state.drawn || [];

    const available = options.filter((o: any) => !drawn.includes(o.label));
    if (available.length === 0) return;

    const randomIndex = Math.floor(Math.random() * available.length);
    const card = available[randomIndex];
    drawn.push(card.label);

    await db.update(rooms).set({
        state: JSON.stringify({
            ...state,
            isDrawing: true,
            drawTimestamp: Date.now(),
            lastDrawn: card.label,
            drawn
        })
    }).where(eq(rooms.id, roomId));
}

export async function resetCards(roomId: string) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) throw new Error('Room not found');

    await db.update(rooms).set({
        state: JSON.stringify({
            drawn: [],
            lastDrawn: null
        })
    }).where(eq(rooms.id, roomId));
}

// Pros & Cons
export async function addProCon(roomId: string, type: 'pro' | 'con', text: string) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) throw new Error('Room not found');

    const state = JSON.parse(room.state);
    const list = type === 'pro' ? (state.pros || []) : (state.cons || []);

    list.push({
        id: crypto.randomUUID(),
        text,
        votes: 0
    });

    if (type === 'pro') {
        state.pros = list;
    } else {
        state.cons = list;
    }

    await db.update(rooms).set({
        state: JSON.stringify(state)
    }).where(eq(rooms.id, roomId));
}

export async function voteProCon(roomId: string, type: 'pro' | 'con', itemId: string) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) throw new Error('Room not found');

    const state = JSON.parse(room.state);
    const list = type === 'pro' ? (state.pros || []) : (state.cons || []);

    const item = list.find((i: any) => i.id === itemId);
    if (item) {
        item.votes = (item.votes || 0) + 1;
    }

    await db.update(rooms).set({
        state: JSON.stringify(state)
    }).where(eq(rooms.id, roomId));
}
