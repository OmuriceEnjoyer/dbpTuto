import {useState} from "react";
import type {FormEvent} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "../components/Button";
import {ErrorMessage} from "../components/ErrorMessage";
import {FormField} from "../components/FormField";
import {createEvent} from "../services/eventService";
import type {CreateEventPayload} from "../types/index";

export function CreateEventPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [location, setLocation] = useState("");
    const [maxCapacity, setMaxCapacity] = useState("500");
    const [category, setCategory] = useState("CULTURAL");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload: CreateEventPayload = {
                name,
                description,
                eventDate: new Date(eventDate).toISOString(),
                location,
                maxCapacity: parseInt(maxCapacity, 10),
                category
            };
            const newEvent = await createEvent(payload);
            navigate(`/events/${newEvent.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create event. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Create Event</h1>
            {error && <ErrorMessage message={error} />}
            <FormField label="Name" value={name} onChange={setName} required />
            <FormField label="Description" value={description} onChange={setDescription} required />
            <FormField label="Event Date" type="datetime-local" value={eventDate} onChange={setEventDate} required />
            <FormField label="Location" value={location} onChange={setLocation} required />
            <FormField label="Max Capacity" type="number" value={maxCapacity} onChange={setMaxCapacity} required />
            
            <div style={{ marginBottom: "15px" }}>
                <label htmlFor="category">Category</label>
                <select 
                    id="category" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
                >
                    <option value="CULTURAL">Cultural</option>
                    <option value="DEPORTIVO">Deportivo</option>
                    <option value="ACADEMICO">Academico</option>
                </select>
            </div>

            <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Event"}
            </Button>
        </form>
    );
}
