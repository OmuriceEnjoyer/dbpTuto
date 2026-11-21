package utec.cs2031.eventhub.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import utec.cs2031.eventhub.user.domain.User;
import utec.cs2031.eventhub.user.infrastructure.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.username()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username ya existe");
        if (userRepo.existsByEmail(req.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ya existe");
        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPassword(encoder.encode(req.password()));
        user.setFullName(req.fullName());
        userRepo.save(user);
        return new AuthResponse(jwtUtil.generate(user.getUsername()));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByUsername(req.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
        if (!encoder.matches(req.password(), user.getPassword()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        return new AuthResponse(jwtUtil.generate(user.getUsername()));
    }
}
