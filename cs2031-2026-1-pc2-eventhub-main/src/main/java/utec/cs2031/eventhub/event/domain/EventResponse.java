package utec.cs2031.eventhub.event.domain;

import java.time.LocalDateTime;

public record EventResponse(
    Long id,
    String name,
    String description,
    LocalDateTime eventDate,
    String location,
    Integer maxCapacity,
    EventCategory category,
    String organizerUsername
) {
    public static EventResponse from(Event e) {
        return new EventResponse(e.getId(), e.getName(), e.getDescription(),
                e.getEventDate(), e.getLocation(), e.getMaxCapacity(),
                e.getCategory(), e.getOrganizer().getUsername());
    }
}
