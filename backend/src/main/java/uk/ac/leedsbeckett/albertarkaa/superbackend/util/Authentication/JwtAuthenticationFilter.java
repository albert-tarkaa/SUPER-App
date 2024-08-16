package uk.ac.leedsbeckett.albertarkaa.superbackend.util.Authentication;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
// This is a filter class that handles JWT authentication for the application API endpoints using Spring Security
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService; // Service for handling JWTs
    private final UserDetailsService userDetailsService; // Service for managing user details

    // This method is called by the Spring Security filter chain for each HTTP request
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization"); // Extract authorization header from the request
        final String jwt;
        final String username;

        // If the authorization header is missing or doesn't start with "Bearer ", continue with the filter chain
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authorizationHeader.substring(7); // Extract the JWT token from the authorization header
        username = jwtService.extractUsername(jwt);

        // If the username is not null and there's no existing authentication in the SecurityContext
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load user details from the database using the username extracted from the JWT token
            final UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate the JWT token against the loaded user details
            if (jwtService.validateToken(jwt, userDetails)) {
                // If the token is valid, create an authentication token with the user details and authorities
                final UsernamePasswordAuthenticationToken usernameAuthToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                // Set the authentication details from the HTTP request
                usernameAuthToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the created authentication token in the SecurityContext
                SecurityContextHolder.getContext().setAuthentication(usernameAuthToken);
            }
        }
        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }
}
