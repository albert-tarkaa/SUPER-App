package uk.ac.leedsbeckett.albertarkaa.superbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.time.LocalDateTime;

// Entity class representing a park
@Entity
// Map this class to a database table named "parks"
@Table(name = "parks")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ParkModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String imageUrl;
    private Double rating;
    private Integer reviewCount;
    private String address;
    private double latitude;
    private double longitude;
    private String postcode;
    private String description;
    private String openingHours;
    private String parkWebsite;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ElementCollection
    private List<String> accessibility;

    @ElementCollection
    private List<String> childrenFeatures;

    @ElementCollection
    private List<String> notices;
}