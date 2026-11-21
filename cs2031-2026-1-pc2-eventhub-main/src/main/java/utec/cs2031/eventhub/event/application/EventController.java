package utec.cs2031.eventhub.event.application;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import utec.cs2031.eventhub.event.domain.*;
import utec.cs2031.eventhub.user.domain.User;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService service;

    @GetMapping
    public Page<EventResponse> list(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        return service.list(PageRequest.of(page, size)).map(EventResponse::from);
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable Long id) {
        return EventResponse.from(service.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(@Valid @RequestBody EventRequest req, @AuthenticationPrincipal User user) {
        return EventResponse.from(service.create(req, user));
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventRequest req,
                                @AuthenticationPrincipal User user) {
        return EventResponse.from(service.update(id, req, user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        service.delete(id, user);
    }
}
