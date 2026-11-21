import {useState, useCallback} from "react";
import {useFetch} from "../hooks/useFetch";
import type {Event, PaginatedResponse} from "../types/index";
import {EventCard} from "../components/EventCard";
import {Link} from "react-router-dom";
import {getEvents} from "../services/eventService";

export function EventListPage() {
    const [page, setPage] = useState(0);
    const size = 10;
    
    const fetchEvents = useCallback(() => getEvents(page, size), [page, size]);
    const {data, loading, error} = useFetch<PaginatedResponse<Event>>(fetchEvents, [page, size]);

    if (loading && !data) {
        return <p>Loading events...</p>;
    }

    if (error) {
        return <p>Error loading events: {error.message}</p>;
    }

    const events = data?.content || [];

    return (
        <div>
            <h1>Event List</h1>
            {events.length === 0 ? (
                <p>No events available.</p>
            ) : (
                <div>
                    {events.map((event) => (
                        <EventCard key={event.id} event={event}>
                            <Link to={`/events/${event.id}`}>View Details</Link>
                        </EventCard>
                    ))}
                    
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button 
                            disabled={page === 0} 
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </button>
                        <span>Page {data?.number !== undefined ? data.number + 1 : 1} of {data?.totalPages || 1}</span>
                        <button 
                            disabled={!data || page >= data.totalPages - 1} 
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}