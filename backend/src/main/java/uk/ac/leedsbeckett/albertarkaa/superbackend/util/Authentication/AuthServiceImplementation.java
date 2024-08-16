package uk.ac.leedsbeckett.albertarkaa.superbackend.util.Authentication;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.UserModel;
import uk.ac.leedsbeckett.albertarkaa.superbackend.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
// This is a service class that handles authentication of users in the application using JWT tokens
public class AuthServiceImplementation implements AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public Optional<UserModel> getUserByToken(String token) {
        String username = jwtService.extractUsername(token.substring(7)); //remove Bearer from token
        return userRepository.findByUsername(username);
    }

    @Override
    public boolean isAuthorized(UserModel user, UUID id) {
        return user.getId() == id;
    }
}
