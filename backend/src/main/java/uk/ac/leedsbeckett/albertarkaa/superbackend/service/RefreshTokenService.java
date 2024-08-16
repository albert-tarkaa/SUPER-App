package uk.ac.leedsbeckett.albertarkaa.superbackend.service;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.RefreshTokenModel;
import uk.ac.leedsbeckett.albertarkaa.superbackend.repository.RefreshTokenRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
// This is a service class that handles the refresh token
public class RefreshTokenService {
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    // Save a refresh token
    public void saveToken(UUID userId, String token) {
        Optional<RefreshTokenModel> existingTokenOptional = refreshTokenRepository.findByUserId(userId);
        if(existingTokenOptional.isPresent()){
            var refreshToken  = existingTokenOptional.get();
            if(isValid(refreshToken)){
                return;
            }
            else {
                refreshTokenRepository.delete(refreshToken);
            }
        }
        RefreshTokenModel refreshToken = RefreshTokenModel.builder()
                .userId(userId)
                .token(token)
                .expiryDate(Instant.now().plusMillis(600000))
                .build();
        refreshTokenRepository.save(refreshToken);
    }

    // Find a refresh token by token
    public Optional<RefreshTokenModel> findByToken(String token){
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshTokenModel verifyExpiration(RefreshTokenModel token){
        if(token.getExpiryDate().compareTo(Instant.now())<0){
            refreshTokenRepository.delete(token);
            throw new RuntimeException(token.getToken() + " Refresh token is expired. Please make a new login..!");
        }
        return token;

    }

    boolean isValid(RefreshTokenModel token){
        return token.getExpiryDate().compareTo(Instant.now())<0;
    }

    public Optional<RefreshTokenModel> findByUserId(UUID userId) {
        return refreshTokenRepository.findByUserId(userId);
    }
}
