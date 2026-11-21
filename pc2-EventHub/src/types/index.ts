export interface RegisterPayload {
    username: string,
    email: string,
    password: string,
    fullName: string
}

export interface LoginPayload {
    username: string,
    password: string    
}

export interface AuthResponse {
    token: string,
}

export interface ApiError {
    message: string,
    status: number
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

export interface Event {
    id : number,
    name : string,
    description : string,
    eventDate : string,
    location : string,
    maxCapacity : number,
    category : string,
    organizerUsername : string,
}

export interface CreateEventPayload {
    name : string,
    description : string,
    eventDate : string,
    location : string,
    maxCapacity : number,
    category : string,
}

export interface UpdateEventPayload {
    name? : string,
    description? : string,
    eventDate? : string,
    location? : string,
    maxCapacity? : number,
    category? : string,
}

export interface DeleteEventPayload {
    id : number,
}