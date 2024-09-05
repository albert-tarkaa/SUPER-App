package uk.ac.leedsbeckett.albertarkaa.superbackend.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.RegisterRequest;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.request.auth.AuthenticationRequest;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ErrorHandlingAndPerformanceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Error Handling Tests for Registration
    @Test
    public void testInvalidRegistration() throws Exception {
        // Invalid email, weak password, future date of birth
        RegisterRequest invalidRequest = new RegisterRequest(
                "albert-email",
                "weak",
                "John",
                "Doe",
                java.time.LocalDate.now().plusDays(1), // Future date
                "Male"
        );

        // Response should be 400 Bad Request
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorMessage").exists());
    }

    // Error Handling Tests for Login
    @Test
    public void testLoginWithNonExistentUser() throws Exception {
        // Non-existent user login request
        AuthenticationRequest nonExistentUser = new AuthenticationRequest("lbu@example.com", "password123");

        // Response should be 400 Bad Request
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nonExistentUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorMessage").value("Invalid username or password"));
    }

    // Performance and Load Tests
    @Test
    public void testConcurrentUserLogins() throws Exception {
        // Test with 100 concurrent users logging in at the same time using 10 threads
        int numberOfUsers = 100;
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CountDownLatch latch = new CountDownLatch(numberOfUsers);

        for (int i = 0; i < numberOfUsers; i++) {
            final String username = "user" + i + "@example.com";
            executor.submit(() -> {
                try {
                    AuthenticationRequest loginRequest = new AuthenticationRequest(username, "password123");
                    mockMvc.perform(post("/api/v1/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(loginRequest)))
                            .andExpect(status().isOk());
                } catch (Exception e) {
                    fail("Login failed for user: " + username);
                } finally {
                    latch.countDown();
                }
            });
        }

        boolean completed = latch.await(30, TimeUnit.SECONDS);
        assertTrue(completed, "Not all logins completed within the expected time");
    }

    @Test
    @Timeout(30) // Test fails if it takes longer than 30 seconds
    public void testApiProxyPerformance() throws Exception {
        int numberOfRequests = 1000;
        ExecutorService executor = Executors.newFixedThreadPool(20);
        CountDownLatch latch = new CountDownLatch(numberOfRequests);
        List<Exception> exceptions = new ArrayList<>();

        for (int i = 0; i < numberOfRequests; i++) {
            executor.submit(() -> {
                try {
                    mockMvc.perform(get("/api/v1/proxy/weather")
                                    .param("lat", "51.5074")
                                    .param("lon", "0.1278"))
                            .andExpect(status().isOk());
                } catch (Exception e) {
                    exceptions.add(e);
                } finally {
                    latch.countDown();
                }
            });
        }

        boolean completed = latch.await(25, TimeUnit.SECONDS);
        assertTrue(completed, "Not all API requests completed within the expected time");
        assertTrue(exceptions.isEmpty(), "Some API requests failed: " + exceptions);
    }
}
