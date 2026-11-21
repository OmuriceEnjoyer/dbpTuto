package utec.cs2031.eventhub.event.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import utec.cs2031.eventhub.user.domain.User;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Event {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @NotBlank private String name;
    @NotBlank private String description;
    private LocalDateTime eventDate;
    private String location;
    private Integer maxCapacity;

    @Enumerated(EnumType.STRING)
    private EventCategory category = EventCategory.CULTURAL;
}
