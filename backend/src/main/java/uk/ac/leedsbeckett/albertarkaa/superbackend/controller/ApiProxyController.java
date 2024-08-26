package uk.ac.leedsbeckett.albertarkaa.superbackend.controller;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/proxy")
public class ApiProxyController {

    // This is a controller class that proxies requests to external APIs
    private static final Logger logger = LoggerFactory.getLogger(ApiProxyController.class);

    // WebClient is a non-blocking, reactive HTTP client that is part of the Spring WebFlux module and is used to make HTTP requests
    private final WebClient webClient;

    @Value("${WEATHER_API_KEY}")
    private String WeatherApiKey;

    @Value("${AIRQUALITY_API_KEY}")
    private String airQualityApiKey;

    @Value("${OPENROUTE_API_KEY}")
    private String openRouteApiKey;

    @Value("${VOICERSS_API_KEY}")
    private String voiceRssApiKey;

    @Value("${PREDICTHQ_API_KEY}")
    private String predictHqApiKey;

    // This method fetches weather data from the WeatherMap API based on the latitude and longitude of a location
    @GetMapping("/weather")
   // @Cacheable(value = "weatherCache", key = "#lat + '-' + #lon", condition = "#result.statusCode.is2xxSuccessful()")
    public Mono<ResponseEntity<String>> getWeather(
            @RequestParam Double lat,
            @RequestParam Double lon
    ) {
        logger.info("Fetching weather data for lat: {}, lon: {}", lat, lon);

        String cacheKey = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HH"));

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("api.weatherapi.com")
                        .path("/v1/forecast.json")
                        .queryParam("key", WeatherApiKey)
                        .queryParam("q", lat + "," + lon)
                        .queryParam("days", 7)
                        .queryParam("aqi", "no")
                        .queryParam("alerts", "no")
                        .queryParam("cache-buster", cacheKey)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .map(ResponseEntity::ok)
                .timeout(Duration.ofSeconds(10))
                .onErrorResume(this::handleError);
    }

    // This method fetches air quality data from the AirVisual API based on the latitude and longitude of a location
    @GetMapping("/air-quality")
    // The @Cacheable annotation is used to cache the response of this method based on the input parameters
    @Cacheable(value = "airQualityCache", key = "#lat + '-' + #lon", condition = "#lat != null && #lon != null")
    public Mono<ResponseEntity<String>> getAirQuality(@RequestParam @NotNull Double lat, @RequestParam @NotNull Double lon) {
        logger.info("Fetching air quality data for lat: {} and lon: {}", lat, lon);
        return webClient.get()
                .uri("https://api.waqi.info/feed/geo:{lat};{lon}/?token={apiKey}",
                        lat, lon, airQualityApiKey)
                .retrieve()
                .bodyToMono(String.class)
                .map(ResponseEntity::ok)
                .timeout(Duration.ofSeconds(10))
                .onErrorResume(this::handleError);
    }

    // This method fetches directions data from the OpenRoute API based on the start and end locations and the profile
    @GetMapping("/directions")
    // The @Cacheable annotation is used to cache the response of this method based on the input parameters
    @Cacheable(value = "directionsCache", key = "#start + '-' + #end + '-' + #profile",
            condition = "#start != null && #end != null && #profile != null")
    public Mono<ResponseEntity<String>> getDirections(
            @RequestParam @NotNull String start,
            @RequestParam @NotNull String end,
            @RequestParam @NotNull String profile) {
        logger.info("Fetching directions for start: {}, end: {}, profile: {}", start, end, profile);

        String url = String.format("https://api.openrouteservice.org/v2/directions/%s?api_key=%s&start=%s&end=%s",
                profile, openRouteApiKey, start, end);

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .map(ResponseEntity::ok)
                .timeout(Duration.ofSeconds(15))
                .onErrorResume(this::handleError);
    }

    // This method fetches the text-to-speech conversion of an instruction using the VoiceRSS API and returns the audio file
    @GetMapping("/speak")
    public Mono<byte[]> speakInstruction(@RequestParam String instruction) {
        return webClient.get()
                .uri("https://api.voicerss.org/?key={key}&hl=en-us&src={instruction}",
                        voiceRssApiKey, instruction)
                .retrieve()
                .bodyToMono(byte[].class)
                .onErrorResume(e -> {
                    // Log the error and return an empty byte array or error message
                    System.err.println("Error in text-to-speech conversion: " + e.getMessage());
                    return Mono.just(new byte[0]);
                });
    }

    // This method fetches events data from the PredictHQ API for the next 7 days within a 1.5 mile radius of Leeds, UK
    @GetMapping("/events")
    public Mono<String> fetchEvents() {
        // Get the current date and the date 7 days from now
        LocalDate now = LocalDate.now();
        LocalDate futureDate = now.plusDays(7);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Build the URI for the PredictHQ API request with the required query parameters and headers for
        // authentication and content type and make a GET request to fetch the events data for the next 7 days within a 1.5 mile radius of Leeds, UK
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("api.predicthq.com")
                        .path("/v1/events/")
                        .queryParam("category", "expos,concerts,festivals,performing-arts,community,sports,public-holidays,observances,daylight-savings,airport-delays,severe-weather,disasters,terror,health-warnings")
                        .queryParam("active.gte", now.format(formatter)) // Start date should be today
                        .queryParam("active.lte", futureDate.format(formatter)) // End date should be 7 days from now
                        .queryParam("state", "active") // Only active events
                        .queryParam("sort", "start") // Sort by start date
                        .queryParam("limit", 5) // Limit to 5 events
                        .queryParam("within", "1.5mi@53.7995746,-1.5471022")  // Leeds coordinates
                        .build())
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + predictHqApiKey)
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(e -> {
                    // Log the error and return an empty JSON array or error message
                    System.err.println("Error fetching events: " + e.getMessage());
                    return Mono.just("[]");
                });
    }

    @PostMapping("/points-of-interest")
    @Cacheable(value = "poisCache", key = "#latitude + '-' + #longitude", condition = "#latitude != null && #longitude != null")
    public Mono<ResponseEntity<String>> getPointofInterest(
            @RequestParam @NotNull Double latitude,
            @RequestParam @NotNull Double longitude)
    {
        logger.info("Fetching POIs for latitude: {} and longitude: {}", latitude, longitude);

        List<Integer> categories = List.of(191, 564, 518, 601, 583);

        // Create the request body for the POIs API call
        Map<String, Object> requestBody = Map.of(
                "request", "pois",
                "geometry", Map.of(
                        "geojson", Map.of(
                                "type", "Point",
                                "coordinates", List.of(longitude, latitude)
                        ),
                        "buffer", 500 // Buffer radius in meters, 500 meters
                ),
                "filters", Map.of(
                        "category_ids", categories
                )
        );

        return webClient.post()
                .uri("https://api.openrouteservice.org/pois")
                .header(HttpHeaders.AUTHORIZATION, openRouteApiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(ResponseEntity::ok)
                .timeout(Duration.ofSeconds(10))
                .onErrorResume(this::handleError);
    }

    // This method handles errors that occur during API calls and returns an appropriate response
    private Mono<ResponseEntity<String>> handleError(Throwable error) {
        if (error instanceof WebClientResponseException wcre) {
            HttpStatus status = (HttpStatus) wcre.getStatusCode();
            String body = wcre.getResponseBodyAsString();
            logger.error("API call failed with status {}: {}", status, body, wcre);
            return Mono.just(ResponseEntity.status(status).body(body));
        } else {
            logger.error("Unexpected error occurred", error);
            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred"));
        }
    }

}
