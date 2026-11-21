package utec.cs2031.eventhub.event.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import utec.cs2031.eventhub.event.infrastructure.EventRepository;
import utec.cs2031.eventhub.user.domain.User;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository repo;

    public Page<Event> list(Pageable pageable) {
        return repo.findAll(pageable);
    }

    public Event get(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));
    }

    public Event create(EventRequest req, User organizer) {
        Event e = new Event();
        e.setOrganizer(organizer);
        apply(e, req);
        return repo.save(e);
    }

    public Event update(Long id, EventRequest req, User user) {
        Event e = get(id);
        if (!e.getOrganizer().getId().equals(user.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        apply(e, req);
        return repo.save(e);
    }

    public void delete(Long id, User user) {
        Event e = get(id);
        if (!e.getOrganizer().getId().equals(user.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        repo.delete(e);
    }

    private void apply(Event e, EventRequest req) {
        e.setName(req.name());
        e.setDescription(req.description());
        e.setEventDate(req.eventDate());
        e.setLocation(req.location());
        e.setMaxCapacity(req.maxCapacity());
        if (req.category() != null) e.setCategory(req.category());
    }
}
