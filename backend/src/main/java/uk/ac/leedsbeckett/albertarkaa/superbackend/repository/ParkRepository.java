package uk.ac.leedsbeckett.albertarkaa.superbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.ParkModel;

import java.util.List;
import java.util.Optional;

@Repository // This is a repository class
public interface ParkRepository extends JpaRepository<ParkModel, Integer> {
    Optional<ParkModel> findByOpeningHours(String openingHours); // Find a park by opening hours
    List<ParkModel> findByNameContainingIgnoreCase(String parkName); // Find parks by name
}
