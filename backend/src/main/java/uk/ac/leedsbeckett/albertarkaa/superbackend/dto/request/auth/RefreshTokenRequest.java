package uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh Token cannot be null")
    private String refreshToken;

    @NotBlank(message = "createdBy cannot be null")
    private String userId;

}