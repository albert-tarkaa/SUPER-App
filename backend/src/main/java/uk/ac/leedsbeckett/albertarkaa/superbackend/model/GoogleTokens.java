package uk.ac.leedsbeckett.albertarkaa.superbackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GoogleTokens {

    String accessToken;
    String refreshToken;
    String idToken;

}
