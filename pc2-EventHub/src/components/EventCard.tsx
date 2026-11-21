import type {ReactNode} from "react";
import type { Event } from "../types/index";

interface EventCardProps {
    event: Event;
    children?: ReactNode;
}

export function EventCard({ event, children }: EventCardProps) {
    return (
        <div className="event-card">
            <h2>{event.name}</h2>
            <p>{event.description}</p>
            <p>Date: {event.eventDate}</p>
            <p>Location: {event.location}</p>
            <p>Max Capacity: {event.maxCapacity}</p>
            <p>Category: {event.category}</p>
            <p>Organizer: {event.organizerUsername}</p>
            {children}
        </div>
    );
}