package uk.ac.leedsbeckett.albertarkaa.superbackend.util.Authentication;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.UserModel;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ControllerResponse;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationUtility {
    // This class is used to authorize users;

    private final AuthService authService;

    public <T> ControllerResponse<T> authorizeUser(String token, UUID id) {

        Optional<UserModel> userOptional = authService.getUserByToken(token);
        if (userOptional.isEmpty()) {
            return new ControllerResponse<>(false, "User not found", null);
        }

        UserModel user = userOptional.get();
        if (!authService.isAuthorized(user, id)) {
            return new ControllerResponse<>(false, "Unauthorized", null);
        }

        return new ControllerResponse<>(true, null, null); // User is authorized
    }
}