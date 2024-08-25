package uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ParksResponse {

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
    private List<String> accessibility;
    private List<String> childrenFeatures;
    private List<String> notices;
}
