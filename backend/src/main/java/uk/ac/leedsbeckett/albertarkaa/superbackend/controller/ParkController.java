package uk.ac.leedsbeckett.albertarkaa.superbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ControllerResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ParksResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.ParkModel;
import uk.ac.leedsbeckett.albertarkaa.superbackend.service.ParkService;

import java.util.List;

// Allow cross-origin requests from any origin and allow any headers
@CrossOrigin(origins = "*", allowedHeaders = "*")
// Mark this class as a REST controller to handle HTTP requests
@RestController
// Map HTTP requests to this controller to the /api/v1/parks path
@RequestMapping("/api/v1/parks")
@RequiredArgsConstructor
public class ParkController {

    private final ParkService parkService;

    // Handle GET requests to /api/v1/parks/list-parks
    @GetMapping("/list-parks")
    public ResponseEntity<ControllerResponse<List<ParksResponse>>> getParks(@RequestParam(required = false) String parkName) {
        // Call the ParkService to get the list of parks
        ControllerResponse<List<ParksResponse>> response = parkService.getParks(parkName);

        // Check if the service response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the list of parks
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle POST requests to /api/v1/parks/add-park
    @PostMapping("/add-park")
    public ResponseEntity<ControllerResponse<Object>> addPark(@RequestHeader("Authorization") String token,
                                                              @RequestBody ParkModel parkModel) {
        // Call the ParkService to add a new park
        var response = parkService.addPark(token, parkModel);

        // Check if the service response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the response
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle POST requests to /api/v1/parks/update-park
    @PostMapping("/update-park")
    public ResponseEntity<ControllerResponse<Object>> updatePark(@RequestHeader("Authorization") String token,
                                                                 @RequestBody ParkModel parkModel) {
        // Call the ParkService to update an existing park
        var response = parkService.updatePark(token, parkModel);

        // Check if the service response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the response
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle POST requests to /api/v1/parks/delete-park
    @PostMapping("/delete-park")
    public ResponseEntity<ControllerResponse<Object>> deletePark(@RequestHeader("Authorization") String token,
                                                                 @RequestBody int parkId) {
        // Call the ParkService to delete a park by its ID
        var response = parkService.deletePark(token, parkId);

        // Check if the service response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the response
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

    // Handle GET requests to /api/v1/parks/{parkId}
    @GetMapping("/{parkId}")
    public ResponseEntity<ControllerResponse<Object>> getPark(@PathVariable int parkId) {
        // Call the ParkService to get details of a specific park by its ID
        var response = parkService.getPark(parkId);

        // Check if the service response is successful
        if (response.isSuccess()) {
            // Return HTTP 200 OK with the park details
            return ResponseEntity.ok(response);
        } else {
            // Return HTTP 400 Bad Request with the error response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }

}
