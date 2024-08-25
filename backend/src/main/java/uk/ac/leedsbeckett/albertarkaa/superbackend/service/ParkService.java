package uk.ac.leedsbeckett.albertarkaa.superbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ControllerResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ParksResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.ParkModel;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.UserModel;
import uk.ac.leedsbeckett.albertarkaa.superbackend.repository.ParkRepository;
import uk.ac.leedsbeckett.albertarkaa.superbackend.util.Authentication.AuthServiceImplementation;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// This is a service class that handles park data
public class ParkService {

    private final ParkRepository parkRepository;
    private final AuthServiceImplementation authServiceImplementation;


    // This method retrieves parks
    public ControllerResponse<List<ParksResponse>> getParks(String parkName) {
        try {
            List<ParkModel> parkModels;
            if (parkName == null || parkName.isBlank()) {
                parkModels = parkRepository.findAll();
            } else {
                parkModels = parkRepository.findByNameContainingIgnoreCase(parkName);
            }

            List<ParksResponse> parksResponses = parkModels.stream()
                    .map(this::mapToParksResponse)
                    .collect(Collectors.toList());

            return new ControllerResponse<>(true, "Parks retrieved successfully", parksResponses);
        } catch (Exception e) {
            Logger.getLogger(getClass().getName()).log(Level.SEVERE, "Error retrieving parks", e);
            return new ControllerResponse<>(false, "Error retrieving parks: " + e.getMessage(), null);
        }
    }

    // This method adds a park
    public ControllerResponse<Object> addPark(String token, ParkModel parkModel) {
        try {
            Optional<UserModel> userOptional = authServiceImplementation.getUserByToken(token);
            if (userOptional.isEmpty()) {
                return new ControllerResponse<>(false, "User not authorised", null);
            }

            parkRepository.save(parkModel);
            return new ControllerResponse<>(true, "Park added successfully", null);
        } catch (Exception e) {
            return new ControllerResponse<>(false, "Error adding park: " + e.getMessage(), null);
        }
    }

    // This method updates a park
    public ControllerResponse<Object> updatePark(String token,ParkModel parkModel) {
        try {
            Optional<UserModel> userOptional = authServiceImplementation.getUserByToken(token);
            if (userOptional.isEmpty()) {
                return new ControllerResponse<>(false, "User not authorised", null);
            }

            parkRepository.save(parkModel);
            return new ControllerResponse<>(true, "Park updated successfully", null);
        } catch (Exception e) {
            return new ControllerResponse<>(false, "Error updating park: " + e.getMessage(), null);
        }
    }

    // This method deletes a park
    public ControllerResponse<Object> deletePark(String token, int parkId) {
        try {
            Optional<UserModel> userOptional = authServiceImplementation.getUserByToken(token);
            if (userOptional.isEmpty()) {
                return new ControllerResponse<>(false, "User not authorised", null);
            }

            parkRepository.deleteById(parkId);
            return new ControllerResponse<>(true, "Park deleted successfully", null);
        } catch (Exception e) {
            return new ControllerResponse<>(false, "Error deleting park: " + e.getMessage(), null);
        }
    }

    // This method retrieves a park
    public ControllerResponse<Object> getPark(int parkId) {
        try {
            ParkModel parkModel = parkRepository.findById(parkId).orElse(null);
            if (parkModel == null) {
                return new ControllerResponse<>(false, "Park not found", null);
            }
            return new ControllerResponse<>(true, "Park retrieved successfully", mapToParksResponse(parkModel));
        } catch (Exception e) {
            return new ControllerResponse<>(false, "Error retrieving park: " + e.getMessage(), null);
        }
    }

    // This method retrieves parks
    private ParksResponse mapToParksResponse(ParkModel parkModel) {
        ParksResponse response = new ParksResponse();
        // Map existing fields
        response.setId(parkModel.getId());
        response.setName(parkModel.getName());
        response.setImageUrl(parkModel.getImageUrl());
        response.setRating(parkModel.getRating());
        response.setReviewCount(parkModel.getReviewCount());
        response.setAddress(parkModel.getAddress());
        response.setLatitude(parkModel.getLatitude());
        response.setLongitude(parkModel.getLongitude());
        response.setPostcode(parkModel.getPostcode());
        response.setDescription(parkModel.getDescription());
        response.setOpeningHours(parkModel.getOpeningHours());
        response.setParkWebsite(parkModel.getParkWebsite());
        response.setActive(parkModel.isActive());
        response.setCreatedAt(parkModel.getCreatedAt());
        response.setUpdatedAt(parkModel.getUpdatedAt());
        response.setAccessibility(parkModel.getAccessibility());
        response.setChildrenFeatures(parkModel.getChildrenFeatures());
        response.setNotices(parkModel.getNotices());

        return response;
    }
}