package utec.cs2031.eventhub.event.infrastructure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import utec.cs2031.eventhub.event.domain.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findAll(Pageable pageable);
}
