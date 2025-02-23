package uk.ac.leedsbeckett.albertarkaa.superbackend.service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.AuthenticationRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.RefreshTokenRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.RegisterRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.ResetPasswordRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.AuthResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ControllerResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.UserResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.auth.AuthenticationResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.UserModel;
import uk.ac.leedsbeckett.albertarkaa.superbackend.repository.UserRepository;
import uk.ac.leedsbeckett.albertarkaa.superbackend.util.Authentication.JwtService;
import uk.ac.leedsbeckett.albertarkaa.superbackend.util.Authentication.Role;


import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);


    @Transactional // This annotation is used to indicate that the method should be run within a transaction
    // This method is used to register a new user
    public ControllerResponse<Object> register(RegisterRequest registerRequest) {
        try {
            // Check if the user already exists
            if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
                return new ControllerResponse<>(false, "Username/email already exists", null);
            }

            // Validate the user input
            String PASSWORD_REGEX = "^(?=(?:.*\\d.*){2}).{8,}$";

            if (!registerRequest.getPassword().matches(PASSWORD_REGEX) || registerRequest.getPassword().length() < 8) {
                return new ControllerResponse<>(false, "Password must be at least 8 characters long and contain at least 2 digits", null);
            }

            if (registerRequest.getDob().isAfter(java.time.LocalDate.now())) {
                return new ControllerResponse<>(false, "Date of birth cannot be in the future", null);
            }

            if (registerRequest.getUsername() == null || !registerRequest.getUsername().matches("^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
                return new ControllerResponse<>(false, "Invalid email address", null);
            }

            if (registerRequest.getFirstName() == null || registerRequest.getFirstName().length() < 2) {
                return new ControllerResponse<>(false, "First name must be at least 2 characters long", null);
            }

            if (registerRequest.getLastName() == null || registerRequest.getLastName().length() < 2) {
                return new ControllerResponse<>(false, "Last name must be at least 2 characters long", null);
            }

            // Create a new user
            var user = UserModel.builder()
                    .username(registerRequest.getUsername())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .firstName(registerRequest.getFirstName())
                    .lastName(registerRequest.getLastName())
                    .dob(registerRequest.getDob())
                    .gender(registerRequest.getGender())
                    .createdAt(java.time.LocalDateTime.now())
                    .lastLogin(java.time.LocalDateTime.now())
                    .isProfileComplete(true)
                    .authMethod("email")
                    .role(Role.USER)
                    .build();
            userRepository.save(user);

            //Login the user
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Generate JWT tokens
            String jwtToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user.getUsername());

            refreshTokenService.saveToken(user.getId(), refreshToken);

            return new ControllerResponse<>(true, null, AuthenticationResponse.builder()
                    .authToken(jwtToken)
                    .refreshToken(refreshToken)
                    .username(user.getUsername())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .gender(user.getGender())
                    .dob(user.getDob())
                    .role(user.getRole().name())
                    .userId(user.getId())
                    .build());
        } catch (Exception e) {
            logger.error("An error occurred", e);
            return new ControllerResponse<>(false, "An unexpected error occurred while processing your request. Please try again later.", null);
        }
    }

// This method is used to log in a user
    public ControllerResponse <AuthenticationResponse> login(AuthenticationRequest authenticationRequest) {
        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            Optional<UserModel> userOptional = userRepository.findByUsername(authenticationRequest.getUsername());

            if (userOptional.isEmpty()) {
                return new ControllerResponse<>(false, "Invalid  account details", null);
            }

            UserModel user = userOptional.get();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Generate JWT tokens
            String jwtToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user.getUsername());

            refreshTokenService.saveToken(user.getId(), refreshToken);

            return new ControllerResponse<>(true, null, AuthenticationResponse.builder()
                    .authToken(jwtToken)
                    .refreshToken(refreshToken)
                    .username(user.getUsername())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .gender(user.getGender())
                    .dob(user.getDob())
                    .role(user.getRole().name())
                    .userId(user.getId())
                    .isProfileComplete(user.isProfileComplete())
                    .build());
        } catch (BadCredentialsException e) {
            // Handle invalid authentication details
            return new ControllerResponse<>(false, "Invalid username or password", null);
        } catch (Exception e) {
            // Handle any other unexpected errors
            logger.error("An error occurred", e);
            return new ControllerResponse<>(false, "An unexpected error occurred while processing your request. Please try again later.", null);
        }
    }

    // This method is used to refresh the JWT token
    public ControllerResponse<AuthenticationResponse> refresh(RefreshTokenRequest refreshTokenRequest) {
        try {
            UUID userId = refreshTokenRequest.getUserId();
            String token = refreshTokenRequest.getRefreshToken();
            Optional<UserModel> user = userRepository.findById(userId);

            if (user.isEmpty()) {
                return new ControllerResponse<>(false, "Invalid  account details", null);
            }

            if (!user.get().isProfileComplete()){
                return new ControllerResponse<>(false, "Please complete your profile", null);
            }

            if (!refreshTokenService.validateToken(userId, token)) {
                return new ControllerResponse<>(false, "Invalid refresh token", null);
            }



            var jwtToken = jwtService.generateToken(user.get());
            return new ControllerResponse<>(true, null, AuthenticationResponse.builder()
                    .authToken(jwtToken)
                    .refreshToken(jwtService.generateRefreshToken(user.get().getUsername()))
                    .username(user.get().getUsername())
                    .role(user.get().getRole().name())
                    .userId(user.get().getId())
                    .build());
        } catch (Exception e) {
            logger.error("An error occurred", e);
            return new ControllerResponse<>(false, "An unexpected error occurred while processing your request. Please try again later.", null);
        }
    }

    // This method is used to reset the user's password
    public ControllerResponse<Object> resetPassword(ResetPasswordRequest resetPasswordRequest) {
        try {
            Optional<UserModel> user = userRepository.findByUsername(resetPasswordRequest.getEmail());
            if (user.isEmpty()) {
                return new ControllerResponse<>(false, "Invalid  account details", null);
            }
            if (!resetPasswordRequest.getPassword().equals(resetPasswordRequest.getPasswordConfirm())) {
                return new ControllerResponse<>(false, "Passwords do not match", null);
            }
            UserModel userModel = user.get();
            userModel.setPassword(passwordEncoder.encode(resetPasswordRequest.getPassword()));
            userRepository.save(userModel);
            return new ControllerResponse<>(true, null, "Password reset successfully");
        } catch (Exception e) {
            logger.error("An error occurred", e);
            return new ControllerResponse<>(false, "An unexpected error occurred while processing your request. Please try again later.", null);
        }

    }

    // This method is used to send a password reset link to the user's email
    public ControllerResponse<Object> forgotPassword(String email) {
        try {
            Optional<UserModel> user = userRepository.findByUsername(email);
            if (user.isEmpty()) {
                return new ControllerResponse<>(false, "Invalid  account details", null);
            }
            //send email with password reset link
            return new ControllerResponse<>(true, null, "Password reset link sent to email");
        } catch (Exception e) {
            logger.error("An error occurred", e);
            return new ControllerResponse<>(false, "An unexpected error occurred while processing your request. Please try again later.", null);
        }
    }

    // This method is used to get the user's information
    public ControllerResponse<Object> getUser(String token) {
        try {
            String username = jwtService.extractUsername(token);
            Optional<UserModel> user = userRepository.findByUsername(username);
            return user.<ControllerResponse<Object>>map(userModel -> new ControllerResponse<>(true, null, UserResponse.builder()
                    .username(userModel.getUsername())
                    .firstName(userModel.getFirstName())
                    .lastName(userModel.getLastName())
                    .dob(userModel.getDob())
                    .gender(userModel.getGender())
                    .role(userModel.getRole().name())
                    .isProfileComplete(userModel.isProfileComplete())
                    .authToken(token)
                    .refreshToken(jwtService.generateRefreshToken(userModel.getUsername()))
                    .userId(userModel.getId())
                    .build())).orElseGet(() -> new ControllerResponse<>(false, "Invalid  account details", null));

        } catch (Exception e) {
            logger.error("An error occurred", e);
            return new ControllerResponse<>(false, "An unexpected error occurred while processing your request. Please try again later.", null);
        }
    }

    // This method is used to authenticate the user using Google
    public ControllerResponse<Object> authenticateGoogle(String email, String firstName, String lastName) {
        try {
            // Check if the user exists, if not, create a new user
            UserModel user = userRepository.findByUsername(email)
                    .orElseGet(() -> {
                        UserModel newUser = new UserModel();
                        newUser.setUsername(email);
                        newUser.setFirstName(firstName);
                        newUser.setLastName(lastName);
                        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                        newUser.setCreatedAt(java.time.LocalDateTime.now());
                        newUser.setLastLogin(java.time.LocalDateTime.now());
                        newUser.setRole(Role.USER);
                        newUser.setProfileComplete(true);
                        newUser.setAuthMethod("google");
                        return userRepository.save(newUser);
                    });

            // Update last login time and auth method
            user.setLastLogin(java.time.LocalDateTime.now());
            user.setAuthMethod("google");
            userRepository.save(user);

            // Generate JWT tokens
            String accessToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(email);

            refreshTokenService.saveToken(user.getId(), refreshToken);

            // Create response data
            AuthResponse authResponse = AuthResponse.builder()
                    .authToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(user)
                    .build();

            return ControllerResponse.builder()
                    .success(true)
                    .errorMessage(null)
                    .data(authResponse)
                    .build();
        } catch (Exception e) {
            logger.error("An error occurred", e);
            return ControllerResponse.builder()
                    .success(false)
                    .errorMessage("An unexpected error occurred while processing your request. Please try again later.")
                    .data(null)
                    .build();
        }
    }
}
