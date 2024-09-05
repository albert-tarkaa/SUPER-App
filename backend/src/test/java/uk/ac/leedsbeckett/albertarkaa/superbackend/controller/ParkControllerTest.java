package uk.ac.leedsbeckett.albertarkaa.superbackend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ControllerResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response.ParksResponse;
import uk.ac.leedsbeckett.albertarkaa.superbackend.service.ParkService;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ParkControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ParkService parkService;

    @InjectMocks
    private ParkController parkController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(parkController).build();
    }

    @Test
    void testGetAllParks() throws Exception {
        // Setup
        mockMvc = MockMvcBuilders.standaloneSetup(parkController).build();

        ParksResponse park1 = new ParksResponse();
        park1.setId(1L);
        park1.setName("Central Park");

        ParksResponse park2 = new ParksResponse();
        park2.setId(2L);
        park2.setName("Hyde Park");

        List<ParksResponse> parksList = Arrays.asList(park1, park2);
        ControllerResponse<List<ParksResponse>> response = new ControllerResponse<>(true, null, parksList);

        when(parkService.getParks(any())).thenReturn(response);

        // Execute and Assert
        mockMvc.perform(get("/api/v1/parks/list-parks")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Central Park"))
                .andExpect(jsonPath("$.data[1].name").value("Hyde Park"));
    }
}