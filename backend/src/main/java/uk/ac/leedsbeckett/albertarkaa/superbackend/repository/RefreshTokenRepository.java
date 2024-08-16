package uk.ac.leedsbeckett.albertarkaa.superbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.RefreshTokenModel;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenModel, Integer> {
    Optional<RefreshTokenModel> findByToken(String token);
    Optional<RefreshTokenModel> findByUserId(UUID userId);
}