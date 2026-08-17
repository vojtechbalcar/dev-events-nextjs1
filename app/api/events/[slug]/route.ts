import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

// In Next.js 15+, dynamic route params are a Promise and must be awaited
type Context = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
    try {
        const { slug } = await params;

        // Reject empty or whitespace-only slugs before hitting the database
        if (!slug?.trim()) {
            return NextResponse.json(
                { message: 'Slug is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const event = await Event.findOne({ slug });

        if (!event) {
            return NextResponse.json(
                { message: `No event found for slug "${slug}"` },
                { status: 404 }
            );
        }

        return NextResponse.json({ event }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { message: 'Failed to fetch event', error: e instanceof Error ? e.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
