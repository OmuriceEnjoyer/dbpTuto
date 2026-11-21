package utec.cs2031.eventhub.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret}") private String secret;
    private static final long EXPIRY_MS = 86_400_000;

    public String generate(String username) {
        return JWT.create().withSubject(username)
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .sign(Algorithm.HMAC256(secret));
    }

    public String extractUsername(String token) {
        return JWT.require(Algorithm.HMAC256(secret)).build().verify(token).getSubject();
    }
}
