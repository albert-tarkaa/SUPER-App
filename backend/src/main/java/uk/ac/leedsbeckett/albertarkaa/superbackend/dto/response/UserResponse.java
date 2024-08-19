package uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response;

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
public class UserResponse {
    private String authToken;
    private String username;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String role;
    private boolean isProfileComplete;
    private UUID userId;
}
