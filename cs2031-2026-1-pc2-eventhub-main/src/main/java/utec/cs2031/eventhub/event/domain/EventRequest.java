package utec.cs2031.eventhub.event.domain;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record EventRequest(
    @NotBlank String name,
    @NotBlank String description,
    LocalDateTime eventDate,
    String location,
    Integer maxCapacity,
    EventCategory category
) {}
