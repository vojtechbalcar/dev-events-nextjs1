'use server'

import Booking from '@/database/booking.model'
import connectDB from "@/lib/mongodb"

export const createBooking = async ({ eventId, slug, email} : { eventId: string; slug: string, email : string}) => {

    try {
        await connectDB();
        console.log('createBooking called with:', { eventId, slug, email });
        await Booking.create({ eventId, email });

        return { success : true };
    } catch (e){
        console.error('Error creating booking event', e);
        return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}