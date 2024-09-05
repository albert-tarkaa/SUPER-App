package uk.ac.leedsbeckett.albertarkaa.superbackend.controller.auth;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.fasterxml.jackson.databind.ObjectMapper;
import uk.ac.leedsbeckett.albertarkaa.superbackend.controller.ParkController;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.RefreshTokenRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.ResetPasswordRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.UserResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.service.AuthenticationService;
import uk.ac.leedsbeckett.albertarkaa.superbackend.service.ParkService;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.RegisterRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.AuthenticationRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ControllerResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.auth.AuthenticationResponse;

import java.time.LocalDate;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthenticationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private ParkService parkService;

    @InjectMocks
    private AuthenticationController authenticationController;

    @InjectMocks
    private ParkController parkController;

    private ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());


    // Setup the mock MVC environment before each test
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authenticationController, parkController).build();
    }

    // Test user registration
    @Test
    void testUserRegistration() throws Exception {
        // Create a new user registration request
        RegisterRequest registerRequest = new RegisterRequest(
                "albert@example.com",
                "Password123",
                "John",
                "Doe",
                LocalDate.of(1990, 1, 2),
                "Male"
        );

        // Create a new user registration response
        AuthenticationResponse authResponse = new AuthenticationResponse(
                "jwt_token",
                "refresh_token",
                "albert@example.com",
                "John",
                "Doe",
                LocalDate.of(1990, 1, 2),
                "Male",
                "USER",
                UUID.randomUUID(),
                true
        );

        // Create a new controller response
        ControllerResponse<Object> response = new ControllerResponse<>(true, null, authResponse);

        // Mock the authentication service to return the response
        when(authenticationService.register(any(RegisterRequest.class))).thenReturn(response);

        // Perform the POST request to /api/v1/auth/register
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("albert@example.com"));
    }

    // Test user login
    @Test
    void testUserLogin() throws Exception {
        // Create a new authentication request
        AuthenticationRequest authRequest = new AuthenticationRequest("albert@example.com", "Password123");

        // Create a new authentication response
        var response = getAuthenticationResponseControllerResponse("jwt_token", "refresh_token", "albert@example.com", UUID.randomUUID());

        // Mock the authentication service to return the response
        when(authenticationService.login(any(AuthenticationRequest.class))).thenReturn(response);

        // Perform the POST request to /api/v1/auth/login
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.authToken").value("jwt_token"));
    }

    // Test refresh token
    @Test
    void testRefreshToken() throws Exception {
        // Create a new refresh token request
        UUID userId = UUID.randomUUID();
        RefreshTokenRequest refreshTokenRequest = new RefreshTokenRequest("refresh_token", userId);

        // Create a new authentication response
        var response = getAuthenticationResponseControllerResponse("new_jwt_token", "new_refresh_token", "test@example.com", userId);

        // Mock the authentication service to return the response
        when(authenticationService.refresh(any(RefreshTokenRequest.class))).thenReturn(response);

        // Perform the POST request to /api/v1/auth/refresh
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshTokenRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.authToken").value("new_jwt_token"))
                .andExpect(jsonPath("$.data.refreshToken").value("new_refresh_token"));
    }


    private static ControllerResponse<AuthenticationResponse> getAuthenticationResponseControllerResponse(String new_jwt_token, String new_refresh_token, String mail, UUID userId) {
        AuthenticationResponse authResponse = new AuthenticationResponse(
                new_jwt_token,
                new_refresh_token,
                mail,
                "John",
                "Doe",
                LocalDate.of(1990, 1, 1),
                "Male",
                "USER",
                userId,
                true
        );

        // Create a new controller response
        ControllerResponse<AuthenticationResponse> response = new ControllerResponse<>(true, null, authResponse);
        return response;
    }

    // Test get user
    @Test
    void testGetUser() throws Exception {
        UserResponse userResponse = new UserResponse(
                "jwt_token",
                "refresh_token",
                "test@example.com",
                "John",
                "Doe",
                LocalDate.of(1990, 1, 1),
                "Male",
                "USER",
                true,
                UUID.randomUUID()
        );

        ControllerResponse<Object> response = new ControllerResponse<>(true, null, userResponse);

        when(authenticationService.getUser(anyString())).thenReturn(response);

        mockMvc.perform(get("/api/v1/auth/user")
                        .header("Authorization", "Bearer jwt_token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("test@example.com"))
                .andExpect(jsonPath("$.data.firstName").value("John"))
                .andExpect(jsonPath("$.data.lastName").value("Doe"));
    }

    @Test
    void testForgotPassword() throws Exception {
        String email = "test@example.com";
        ControllerResponse<Object> response = new ControllerResponse<>(true, null, "Password reset link sent to email");

        when(authenticationService.forgotPassword(anyString())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("Password reset link sent to email"));
    }

    @Test
    void testResetPassword() throws Exception {
        ResetPasswordRequest resetPasswordRequest = new ResetPasswordRequest(
                "test@example.com",
                "newPassword123",
                "newPassword123"
        );

        ControllerResponse<Object> response = new ControllerResponse<>(true, null, "Password reset successfully");

        when(authenticationService.resetPassword(any(ResetPasswordRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("Password reset successfully"));
    }


}