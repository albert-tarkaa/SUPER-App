package uk.ac.leedsbeckett.albertarkaa.superbackend.util.Authentication;

import uk.ac.leedsbeckett.albertarkaa.superbackend.model.UserModel;

import java.util.Optional;
import java.util.UUID;

public interface AuthService {
    Optional<UserModel> getUserByToken(String token);
    boolean isAuthorized(UserModel user,UUID id);
}