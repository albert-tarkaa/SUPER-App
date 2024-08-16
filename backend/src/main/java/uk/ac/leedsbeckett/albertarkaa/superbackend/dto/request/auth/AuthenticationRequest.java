package uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.validation.annotation.Validated;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {
    @NotBlank(message = "Username cannot be null")
    @Email // This annotation is used to validate the email address
    private String username;
    @NotBlank(message = "Password cannot be null")
    @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
    @Pattern(regexp = "^(?=(?:.*\\d.*){2}).{8,}$", message = "Password must be at least 8 characters long and contain at least 2 digits")
     String password;
}
