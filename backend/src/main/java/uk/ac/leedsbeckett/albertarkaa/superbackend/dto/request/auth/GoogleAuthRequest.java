package uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GoogleAuthRequest {
    private String email;
    private String firstName;
    private String lastName;
}
