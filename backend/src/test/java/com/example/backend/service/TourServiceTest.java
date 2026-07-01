package com.example.backend.service;

import com.example.backend.entity.Tour;
import com.example.backend.entity.TourLog;          // AGGIUNTO: per i test sui calcoli
import com.example.backend.entity.User;
import com.example.backend.repository.TourLogRepository;
import com.example.backend.repository.TourRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;                      // AGGIUNTO: per costruire TourLog nei test
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourServiceTest {

    @Mock private TourRepository    tourRepository;
    @Mock private UserRepository    userRepository;
    @Mock private TourLogRepository tourLogRepository;
    @Mock private RestTemplate      restTemplate;

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
    void findById_existingTourCorrectUser_returnsTour() {
        Tour tour = new Tour("Alpine Trail", "Nice hike", "14.0,48.0", "16.0,47.0", "hike", 12.5, 180.0, null);
        tour.setId(tourId);
        tour.setUser(testUser);
        when(tourRepository.findById(tourId)).thenReturn(Optional.of(tour));

        Optional<Tour> result = tourService.findById(tourId, userId);

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Alpine Trail");
    }

    @Test
    // findById must return empty when the tour belongs to a different user
    void findById_tourBelongsToOtherUser_returnsEmpty() {
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());

        Tour tour = new Tour("Alpine Trail", "Nice hike", "14.0,48.0", "16.0,47.0", "hike", 12.5, 180.0, null);
        tour.setId(tourId);
        tour.setUser(otherUser);
        when(tourRepository.findById(tourId)).thenReturn(Optional.of(tour));

        Optional<Tour> result = tourService.findById(tourId, userId);

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
    // the app must not crash just because ORS is temporarily unavailable
    void create_orsCallFails_savesTourWithZeroDistanceAndTime() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(restTemplate.getForObject(any(String.class), any()))
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
    // ownership guard — without it anyone could edit anyone else's tours
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
    // cascade logic — if either line is removed accidentally, this test catches it
    void deleteById_ownerCanDelete_deletesLogsAndTour() {
        Tour tour = new Tour("Tour", "", "1.0,2.0", "3.0,4.0", "car", 10.0, 60.0, null);
        tour.setId(tourId);
        tour.setUser(testUser);
        when(tourRepository.findById(tourId)).thenReturn(Optional.of(tour));

        tourService.deleteById(tourId, userId);

        verify(tourLogRepository).deleteByTourId(tourId);
        verify(tourRepository).deleteById(tourId);
    }

    @Test
    // unauthorized delete must throw before touching the DB
    void deleteById_unauthorizedUser_throwsException() {
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());

        Tour tour = new Tour("Tour", "", "1.0,2.0", "3.0,4.0", "car", 10.0, 60.0, null);
        tour.setId(tourId);
        tour.setUser(otherUser);
        when(tourRepository.findById(tourId)).thenReturn(Optional.of(tour));

        assertThatThrownBy(() -> tourService.deleteById(tourId, userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Not authorized");

        verify(tourRepository, never()).deleteById(any());
        verify(tourLogRepository, never()).deleteByTourId(any());
    }


    @Test
    // if ORS geocoding fails the original string is returned so the tour can still be saved
    void geocodeLocation_orsGeodingFails_returnsOriginalString() {
        when(restTemplate.getForObject(any(String.class), eq(com.example.backend.dto.GeocodingDto.class)))
                .thenThrow(new RuntimeException("network error"));

        String result = tourService.geocodeLocation("Vienna");

        assertThat(result).isEqualTo("Vienna");
    }

    @Test
    void search_delegatesToRepository() {
        Tour tour = new Tour("Vienna Forest Hike", "desc", "16.0,48.0", "16.1,48.1", "hike", 10.0, 60.0, null);
        tour.setId(tourId);
        when(tourRepository.searchByUserId(userId, "vienna")).thenReturn(List.of(tour));

        List<Tour> result = tourService.search("vienna", 0, 0, userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Vienna Forest Hike");
        verify(tourRepository).searchByUserId(userId, "vienna");
    }

    @Test
    void calculatePopularity_countsLogsCappedAtFive() {
        assertThat(tourService.calculatePopularity(List.of())).isZero();
        assertThat(tourService.calculatePopularity(List.of(new TourLog(), new TourLog(), new TourLog())))
                .isEqualTo(3);
        assertThat(tourService.calculatePopularity(java.util.Collections.nCopies(7, new TourLog())))
                .isEqualTo(5);
    }

    @Test
    void calculateChildFriendliness_expertLongTour_isClampedToOne() {
        TourLog tough = new TourLog(null, LocalDateTime.now(), 20.0, 2, "tough", "Expert", 300.0);
        assertThat(tourService.calculateChildFriendliness(List.of(tough))).isEqualTo(1);
    }

    @Test
    void search_minPopularityFilter_excludesLowPopularityTours() {
        Tour popular = new Tour("Popular", "", "1,2", "3,4", "hike", 1.0, 1.0, null);
        popular.setId(tourId);
        Tour lonely = new Tour("Lonely", "", "1,2", "3,4", "hike", 1.0, 1.0, null);
        lonely.setId(UUID.randomUUID());

        when(tourRepository.findByUserId(userId)).thenReturn(List.of(popular, lonely));

        TourLog a = new TourLog(popular, LocalDateTime.now(), 5.0, 4, "c", "Easy", 60.0);
        TourLog b = new TourLog(popular, LocalDateTime.now(), 5.0, 4, "c", "Easy", 60.0);
        TourLog c = new TourLog(popular, LocalDateTime.now(), 5.0, 4, "c", "Easy", 60.0);
        when(tourLogRepository.findByTourUserId(userId)).thenReturn(List.of(a, b, c));

        List<Tour> result = tourService.search("", 1, 0, userId);

        assertThat(result).extracting(Tour::getName).containsExactly("Popular");
    }
}
