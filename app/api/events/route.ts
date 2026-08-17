import {NextRequest, NextResponse} from "next/server";

import { v2 as cloudinary } from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

// The form sends array fields as pseudo-array strings: `[ item", "item", "item ]`
// (missing opening quote on first item, missing closing quote on last item — not valid JSON).
// This function handles three cases: valid JSON array, that malformed bracket format, or plain string.
function parsePseudoArray(raw: string): string[] {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) return (parsed as unknown[]).map(String);
    } catch { /* not valid JSON — fall through */ }

    if (raw.startsWith('[')) {
        // Strip outer brackets, then split on the `", "` separator between items
        const inner = raw.slice(1, raw.lastIndexOf(']')).trim();
        return inner.split(/",\s*"/).map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
    }

    return raw ? [raw] : [];
}

export async function POST(req : NextRequest ) {
    try {
        await connectDB();

        const formData = await req.formData();

        // formData.get returns string | File | null — guard before calling File methods
        const fileEntry = formData.get('image');
        if (!(fileEntry instanceof Blob)) {
            return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
        }

        const tags = parsePseudoArray(formData.get('tags') as string);
        const agendaItems = parsePseudoArray(formData.get('agenda') as string);
        const agenda = [JSON.stringify(agendaItems)];

        const arrayBuffer = await fileEntry.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if (error) return reject(error);
                resolve(results as { secure_url: string });
            }).end(buffer);
        });

        const event = Object.fromEntries(formData.entries());
        event.image = uploadResult.secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags,
            agenda,
        });

        return NextResponse.json({ message : 'Event created successfully', event : createdEvent }, {status : 201});
    } catch (e) {
        console.error(e);
        return NextResponse.json({message: 'Event creation failed', error: e instanceof Error ? e.message : 'Unknown'}, {status : 500});
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({message: 'Event list successfully', events}, { status : 200});
   } catch (e) {
        return NextResponse.json({message: 'Event fetching failed', error: e}, {status  : 500});
    }
}