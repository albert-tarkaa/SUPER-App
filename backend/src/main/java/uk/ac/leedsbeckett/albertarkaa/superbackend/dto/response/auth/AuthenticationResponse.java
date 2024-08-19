package uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String authToken;
    private String refreshToken;
    private String username;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String role;
    private UUID userId;
    private boolean isProfileComplete;
}
