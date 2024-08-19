package uk.ac.leedsbeckett.albertarkaa.superbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.UserModel;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserModel, Integer> {

    Optional<UserModel> findByUsername(String username); // Find a user by username;
    Optional <UserModel> findById(UUID userId); // Find a user by ID;
}