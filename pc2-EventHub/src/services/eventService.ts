import api from '../api/axios';
import type { Event, PaginatedResponse, CreateEventPayload, UpdateEventPayload } from '../types/index';

export const getEvents = async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Event>> => {
    const { data } = await api.get<PaginatedResponse<Event>>(`/events?page=${page}&size=${size}`);
    return data
}

export const getEventById = async (id: number): Promise<Event> => {
    const { data } = await api.get<Event>(`/events/${id}`);
    return data
}

export const createEvent = async (event: CreateEventPayload): Promise<Event> => {
    const { data } = await api.post<Event>('/events', event);
    return data
}

export const updateEvent = async (id: number, event: UpdateEventPayload): Promise<Event> => {
    const { data } = await api.put<Event>(`/events/${id}`, event);
    return data
}

export const deleteEvent = async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
}
