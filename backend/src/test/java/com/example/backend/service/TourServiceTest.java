package com.example.backend.service;

import com.example.backend.entity.Tour;
import com.example.backend.entity.User;
import com.example.backend.repository.TourLogRepository;
import com.example.backend.repository.TourRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourServiceTest {

    @Mock private TourRepository tourRepository;
    @Mock private UserRepository userRepository;
    @Mock private TourLogRepository tourLogRepository;
    @Mock private RestTemplate restTemplate;

    private TourService tourService;

    private User testUser;
    private UUID userId;
    private UUID tourId;

    @BeforeEach
    void setUp() {
        tourService = new TourService(tourRepository, userRepository, tourLogRepository, restTemplate);
        userId = UUID.randomUUID();
        tourId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
    }

    @Test
    void findById_existingTour_returnsTour() {
        Tour tour = new Tour("Alpine Trail", "Nice hike", "14.0,48.0", "16.0,47.0", "hike", 12.5, 180.0, null);
        tour.setId(tourId);
        when(tourRepository.findById(tourId)).thenReturn(Optional.of(tour));

        Optional<Tour> result = tourService.findById(tourId);

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Alpine Trail");
    }

    @Test
    //important because the controller does orElse(null) — this chain only works if the service actually returns an empty optional
    void findById_nonExistingTour_returnsEmpty() {
        when(tourRepository.findById(tourId)).thenReturn(Optional.empty());

        Optional<Tour> result = tourService.findById(tourId);

        assertThat(result).isEmpty();
    }

    @Test
    //verifies the service doesn't accidentally filter, transform, or lose items
    void findByUserId_returnsTourList() {
        Tour t1 = new Tour("Tour A", "", "1.0,2.0", "3.0,4.0", "car", 10.0, 60.0, null);
        Tour t2 = new Tour("Tour B", "", "5.0,6.0", "7.0,8.0", "bike", 20.0, 90.0, null);
        when(tourRepository.findByUserId(userId)).thenReturn(List.of(t1, t2));

        List<Tour> result = tourService.findByUserId(userId);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Tour::getName).containsExactly("Tour A", "Tour B");
    }

    @Test
    //checks the service returns empty list rather than null — because the frontend would crash if it got null
    void findByUserId_noTours_returnsEmptyList() {
        when(tourRepository.findByUserId(userId)).thenReturn(List.of());

        List<Tour> result = tourService.findByUserId(userId);

        assertThat(result).isEmpty();
    }

    @Test
    //without it, the next line tour.setUser(user) would get a null and throw a confusing exception
    void create_userNotFound_throwsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        Tour tour = new Tour("Test", "", "1.0,2.0", "3.0,4.0", "car", null, null, null);

        assertThatThrownBy(() -> tourService.create(tour, userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    //tests the resilience logic — the app shouldn't crash just because an external API is unavailable
    void create_orsCallFails_savesTourWithZeroDistanceAndTime() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(restTemplate.getForObject(any(String.class), eq(com.example.backend.dto.OrsResponseDto.class)))
                .thenThrow(new RuntimeException("ORS unavailable"));

        Tour tour = new Tour("Rainy Day", "", "1.0,2.0", "3.0,4.0", "hike", null, null, null);
        Tour saved = new Tour("Rainy Day", "", "1.0,2.0", "3.0,4.0", "hike", 0.0, 0.0, null);
        saved.setId(UUID.randomUUID());
        when(tourRepository.save(any(Tour.class))).thenReturn(saved);

        Tour result = tourService.create(tour, userId);

        assertThat(result.getDistance()).isEqualTo(0.0);
        assertThat(result.getEstimatedTime()).isEqualTo(0.0);
        verify(tourRepository).save(any(Tour.class));
    }

    @Test
    //checks the service throws "Tour not found" rather than a NullPointerException when trying to call methods on a null tour
    void update_tourNotFound_throwsException() {
        when(tourRepository.findById(tourId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourService.update(tourId, new Tour(), userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Tour not found");
    }

    @Test
    //tests the ownership guard — without it anyone could edit anyone else's tours
    void update_unauthorizedUser_throwsException() {
        UUID otherUserId = UUID.randomUUID();
        User otherUser = new User();
        otherUser.setId(otherUserId);

        Tour existing = new Tour("Tour", "", "1.0,2.0", "3.0,4.0", "car", 10.0, 60.0, null);
        existing.setId(tourId);
        existing.setUser(otherUser);

        when(tourRepository.findById(tourId)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> tourService.update(tourId, new Tour(), userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    //tests the optimization — no point making an expensive external API call if the route didn't change
    void update_noRouteChange_doesNotCallOrs() {
        Tour existing = new Tour("Tour", "desc", "1.0,2.0", "3.0,4.0", "car", 10.0, 60.0, null);
        existing.setId(tourId);
        existing.setUser(testUser);

        Tour details = new Tour("Tour Updated", "new desc", "1.0,2.0", "3.0,4.0", "car", null, null, null);
        when(tourRepository.findById(tourId)).thenReturn(Optional.of(existing));
        when(tourRepository.save(any())).thenReturn(existing);

        tourService.update(tourId, details, userId);

        verify(restTemplate, never()).getForObject(any(String.class), any());
    }

    @Test
    //tests the cascade logic, if someone accidentally removes one of those lines, this test catches it
    void deleteById_deletesLogsAndTour() {
        tourService.deleteById(tourId);

        verify(tourLogRepository).deleteByTourId(tourId);
        verify(tourRepository).deleteById(tourId);
    }

    @Test
    void create_bikeTransport_usesCyclingProfile() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(restTemplate.getForObject(any(String.class), any()))
                .thenThrow(new RuntimeException("skip"));
        when(tourRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Tour tour = new Tour("Bike Tour", "", "1.0,2.0", "3.0,4.0", "bike", null, null, null);
        tourService.create(tour, userId);

        verify(restTemplate).getForObject(
                argThat((String url) -> url.contains("cycling-regular")),
                any()
        );
    }

    @Test
    void create_hikeTransport_usesFootWalkingProfile() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(restTemplate.getForObject(any(String.class), any()))
                .thenThrow(new RuntimeException("skip"));
        when(tourRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Tour tour = new Tour("Hike", "", "1.0,2.0", "3.0,4.0", "hike", null, null, null);
        tourService.create(tour, userId);

        verify(restTemplate).getForObject(
                argThat((String url) -> url.contains("foot-walking")),
                any()
        );
    }

    @Test
    void create_nullTransport_usesDefaultDrivingProfile() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(restTemplate.getForObject(any(String.class), any()))
                .thenThrow(new RuntimeException("skip"));
        when(tourRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Tour tour = new Tour("Drive", "", "1.0,2.0", "3.0,4.0", null, null, null, null);
        tourService.create(tour, userId);

        verify(restTemplate).getForObject(
                argThat((String url) -> url.contains("driving-car")),
                any()
        );
    }
}