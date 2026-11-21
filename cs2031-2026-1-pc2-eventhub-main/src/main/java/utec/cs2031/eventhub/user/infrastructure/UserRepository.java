package utec.cs2031.eventhub.user.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import utec.cs2031.eventhub.user.domain.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
