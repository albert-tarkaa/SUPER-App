package uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.auth;

import lombok.*;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtAuthenticationResponse {

    @NonNull
    private String accessToken;

    private String tokenType = "Bearer";

    private boolean fullyAuthenticated;

    private boolean usingDefaultPassword;

    private String username;

    private String role;

    @NonNull
    String refreshToken;

    public JwtAuthenticationResponse(String token,
                                     String refreshToken,
                                     String role,
                                     boolean fullyAuthenticated,
                                     String username) {
        this.accessToken = token;
        this.refreshToken = refreshToken;
        this.fullyAuthenticated = fullyAuthenticated;
        this.role = role;
        this.username = username;

    }
}