import React from 'react';
import ExploreBtn from "@/components/exploreBtn";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
    const response = await fetch(`${BASE_URL}/api/events`);
    const { events } = await response.json();

    return (
        <section>
            <h1 className="text-center">The Hub For Every Dev < br /> Event you Can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All In One Place</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>
                <ul className="events">
                    {events.map((event: IEvent) => (
                        <li key={event._id} className="list-none">
                            <EventCard {...event} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
export default Page
