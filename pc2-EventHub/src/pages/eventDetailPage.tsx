import {useCallback, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useFetch} from "../hooks/useFetch";
import {getEventById, deleteEvent} from "../services/eventService";
import type {Event} from "../types/index";
import {useAuth} from "../context/AuthContext";
import {Button} from "../components/Button";

function getUsernameFromToken(token: string): string | null {
    if (!token) return null;
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return null;
        const decoded = JSON.parse(atob(payloadBase64));
        return decoded.sub || null; 
    } catch (e) {
        return null;
    }
}

export function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [deleting, setDeleting] = useState(false);

    const fetchEvent = useCallback(() => getEventById(Number(id)), [id]);
    const { data: event, loading, error } = useFetch<Event>(fetchEvent, [id]);

    const username = getUsernameFromToken(token);
    const isOrganizer = event && username && event.organizerUsername === username;

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        setDeleting(true);
        try {
            await deleteEvent(Number(id));
            navigate("/dashboard");
        } catch (err) {
            alert("Failed to delete event.");
            setDeleting(false);
        }
    };

    if (loading) return <p>Loading event details...</p>;
    if (error) return <p>Error loading event: {error.message}</p>;
    if (!event) return <p>Event not found.</p>;

    return (
        <div className="event-detail" style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto" }}>
            <h1>{event.name}</h1>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleString()}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Max Capacity:</strong> {event.maxCapacity}</p>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Organizer:</strong> {event.organizerUsername}</p>

            {isOrganizer && (
                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                    <Button onClick={() => alert("Edit feature coming soon...")} style={{ backgroundColor: "gray" }}>
                        Edit Event
                    </Button>
                    <Button onClick={handleDelete} disabled={deleting} style={{ backgroundColor: "red", color: "white" }}>
                        {deleting ? "Deleting..." : "Delete Event"}
                    </Button>
                </div>
            )}
            
            <div style={{ marginTop: "20px" }}>
                <Button onClick={() => navigate(-1)}>Back</Button>
            </div>
        </div>
    );
}
