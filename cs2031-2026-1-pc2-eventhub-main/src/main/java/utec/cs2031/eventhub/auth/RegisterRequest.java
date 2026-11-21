package utec.cs2031.eventhub.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
    @NotBlank String username,
    @Email @NotBlank String email,
    @NotBlank String password,
    @NotBlank String fullName
) {}
