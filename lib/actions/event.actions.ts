'use server';
import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model'

export const getSimiliarEventBySlug = async ( slug : string ) => {
    try {
        await  connectDB();

        const event = await Event.findOne({ slug });

        const docs = await Event.find({_id : { $ne : event._id }, tags :{ $in : event.tags}}).lean();
        return docs.map(doc => ({ ...doc, _id: doc._id.toString() }))


    } catch {
        return [];
    }
}

export default getSimiliarEventBySlug;
