package uk.ac.leedsbeckett.albertarkaa.superbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import uk.ac.leedsbeckett.albertarkaa.superbackend.model.ParkModel;
import uk.ac.leedsbeckett.albertarkaa.superbackend.repository.ParkRepository;

import java.io.InputStream;
import java.util.List;


@Component
@RequiredArgsConstructor
// This is a service class that seeds the database with park data
public class ParkDataSeedService implements ApplicationRunner {

    private final ParkRepository parkRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            long count = parkRepository.count();

            if (count == 0) {
                // Load park data from the JSON file
                ClassPathResource resource = new ClassPathResource("parkData.json");

                try (InputStream inputStream = resource.getInputStream()) {
                    List<ParkModel> parks = objectMapper.readValue(inputStream, new TypeReference<>() {});
                    parkRepository.saveAll(parks);
                }
            } else {
                System.out.println("Data seeding not required");
            }
        } catch (Exception e) {
            System.out.println("Error occurred during data seeding");
        }
    }
}