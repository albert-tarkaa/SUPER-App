package uk.ac.leedsbeckett.albertarkaa.superbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens") // Map this class to a database table named "refresh_tokens"
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RefreshTokenModel {

    @Id
    private String token;
    private Instant expiryDate;
    private UUID userId;
}