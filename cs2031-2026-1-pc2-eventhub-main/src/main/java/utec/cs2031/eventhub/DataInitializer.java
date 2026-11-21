package utec.cs2031.eventhub;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import utec.cs2031.eventhub.event.domain.Event;
import utec.cs2031.eventhub.event.domain.EventCategory;
import utec.cs2031.eventhub.event.infrastructure.EventRepository;
import utec.cs2031.eventhub.user.domain.User;
import utec.cs2031.eventhub.user.infrastructure.UserRepository;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Bean
    CommandLineRunner seed(UserRepository userRepo, EventRepository eventRepo, PasswordEncoder encoder) {
        return args -> {
            User u1 = new User();
            u1.setUsername("municipalidad");
            u1.setEmail("eventos@muni.gob.pe");
            u1.setPassword(encoder.encode("password123"));
            u1.setFullName("Municipalidad de Lima");
            userRepo.save(u1);

            User u2 = new User();
            u2.setUsername("club.atletico");
            u2.setEmail("contacto@clubatletico.pe");
            u2.setPassword(encoder.encode("password123"));
            u2.setFullName("Club Atlético Lima");
            userRepo.save(u2);

            User u3 = new User();
            u3.setUsername("utec.cultura");
            u3.setEmail("cultura@utec.edu.pe");
            u3.setPassword(encoder.encode("password123"));
            u3.setFullName("UTEC Cultura");
            userRepo.save(u3);

            saveEvent(eventRepo, u1, "Festival de Verano 2026", "Gran festival de música y arte en el Parque de la Exposición",
                    LocalDateTime.of(2026, 1, 15, 18, 0), "Parque de la Exposición, Lima", 5000, EventCategory.CULTURAL);
            saveEvent(eventRepo, u1, "Feria Gastronómica Limeña", "Degustación de los mejores platos típicos de Lima",
                    LocalDateTime.of(2026, 2, 8, 10, 0), "Miraflores, Lima", 2000, EventCategory.CULTURAL);
            saveEvent(eventRepo, u2, "Maratón Ciudad de Lima", "Carrera atlética 10K por el centro histórico",
                    LocalDateTime.of(2026, 3, 22, 6, 30), "Plaza Mayor de Lima", 1500, EventCategory.DEPORTIVO);
            saveEvent(eventRepo, u2, "Torneo de Fútbol Distrital", "Campeonato interdistrital de fútbol amateur",
                    LocalDateTime.of(2026, 4, 5, 8, 0), "Estadio Municipal San Borja", 500, EventCategory.DEPORTIVO);
            saveEvent(eventRepo, u3, "Hackathon DBP 2026", "Competencia de desarrollo de software de 48 horas",
                    LocalDateTime.of(2026, 5, 10, 9, 0), "UTEC, Barranco", 200, EventCategory.ACADEMICO);
            saveEvent(eventRepo, u3, "Conferencia de Inteligencia Artificial", "Charlas y talleres sobre IA aplicada",
                    LocalDateTime.of(2026, 6, 20, 9, 0), "UTEC, Auditorio Principal", 300, EventCategory.ACADEMICO);
            saveEvent(eventRepo, u1, "Noche de Cine al Aire Libre", "Proyección de películas clásicas peruanas",
                    LocalDateTime.of(2026, 7, 12, 19, 30), "Parque Kennedy, Miraflores", 800, EventCategory.CULTURAL);
            saveEvent(eventRepo, u2, "Taller de Yoga Gratuito", "Sesión de yoga para principiantes en el parque",
                    LocalDateTime.of(2026, 8, 3, 7, 0), "Parque Reducto, Miraflores", 100, EventCategory.DEPORTIVO);
        };
    }

    private void saveEvent(EventRepository repo, User organizer, String name, String desc,
                           LocalDateTime date, String loc, int capacity, EventCategory cat) {
        Event e = new Event();
        e.setOrganizer(organizer);
        e.setName(name);
        e.setDescription(desc);
        e.setEventDate(date);
        e.setLocation(loc);
        e.setMaxCapacity(capacity);
        e.setCategory(cat);
        repo.save(e);
    }
}
