package uk.ac.leedsbeckett.albertarkaa.superbackend.controller.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.AuthenticationRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.RefreshTokenRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.RegisterRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.ResetPasswordRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ControllerResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.auth.AuthenticationResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.service.AuthenticationService;



// Mark this class as a REST controller to handle HTTP requests
@RestController
// Map HTTP requests to this controller to the /api/v1/auth path
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    // Handle POST requests to /api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<ControllerResponse<Object>> register(@RequestBody RegisterRequest registerRequest) {
        // Call the AuthenticationService to register a new user
        var response = authenticationService.register(registerRequest);

        // Check if the registration response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the registration response
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle POST requests to /api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<ControllerResponse<AuthenticationResponse>> login(@RequestBody AuthenticationRequest authenticationRequest) {
        // Call the AuthenticationService to authenticate a user
        ControllerResponse<AuthenticationResponse> response = authenticationService.login(authenticationRequest);

        // Check if the login response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the authentication response
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle POST requests to /api/v1/auth/refresh
    @PostMapping("/refresh")
    public ResponseEntity<ControllerResponse<AuthenticationResponse>> refresh(@RequestBody @Valid RefreshTokenRequest refreshTokenRequest) {
        // Call the AuthenticationService to refresh an authentication token
        ControllerResponse<AuthenticationResponse> response = authenticationService.refresh(String.valueOf(refreshTokenRequest));

        // Check if the token refresh response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the refreshed authentication response
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle POST requests to /api/v1/auth/google
    @PostMapping("/google")
    public ResponseEntity<ControllerResponse<Object>> googleAuth(@RequestBody String code) {
        // Call the AuthenticationService to authenticate a user using Google OAuth code
        ControllerResponse<Object> response = authenticationService.authenticateGoogle(code);

        // Check if the Google authentication response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the authentication response
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle GET requests to /api/v1/auth/user
    @GetMapping("/user")
    public ResponseEntity<ControllerResponse<Object>> getUser(@RequestBody String token) {
        // Call the AuthenticationService to get user details using a token
        ControllerResponse<Object> response = authenticationService.getUser(token);

        // Check if the get user response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the user details
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle POST requests to /api/v1/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<ControllerResponse<Object>> forgotPassword(@RequestBody String email) {
        // Call the AuthenticationService to initiate a password reset process for the given email
        ControllerResponse<Object> response = authenticationService.forgotPassword(email);

        // Check if the forgot password response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the response
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle POST requests to /api/v1/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<ControllerResponse<Object>> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        // Call the AuthenticationService to reset the password based on the provided request
        ControllerResponse<Object> response = authenticationService.resetPassword(resetPasswordRequest);

        // Check if the password reset response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the response
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

}

