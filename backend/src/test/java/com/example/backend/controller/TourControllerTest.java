package com.example.backend.controller;

import com.example.backend.entity.Tour;
import com.example.backend.entity.User;
import com.example.backend.service.TourService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourControllerTest {

    @Mock private TourService tourService;
    @Mock private HttpServletRequest request;

    @InjectMocks
    private TourController tourController;

    private UUID userId;
    private UUID tourId;
    private Tour testTour;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        tourId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);

        testTour = new Tour("Test Tour", "desc", "1.0,2.0", "3.0,4.0", "car", 10.0, 60.0, null);
        testTour.setId(tourId);
        testTour.setUser(user);
    }

    @Test
    void readAll_returnsTours() {
        when(request.getAttribute("userId")).thenReturn(userId);
        when(tourService.findByUserId(userId)).thenReturn(List.of(testTour));

        List<Tour> result = tourController.readAll(request);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Tour");
    }

    @Test
    void readAll_noTours_returnsEmptyList() {
        when(request.getAttribute("userId")).thenReturn(userId);
        when(tourService.findByUserId(userId)).thenReturn(List.of());

        List<Tour> result = tourController.readAll(request);

        assertThat(result).isEmpty();
    }

    @Test
    // findById now filters by userId — existing tour with correct owner returns 200
    void read_existingId_returns200WithTour() {
        when(request.getAttribute("userId")).thenReturn(userId);
        when(tourService.findById(tourId, userId)).thenReturn(Optional.of(testTour));

        ResponseEntity<Tour> result = tourController.read(tourId, request);

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        assertThat(result.getBody()).isEqualTo(testTour);
    }

    @Test
    // findById returns empty when tour doesn't exist or belongs to another user
    void read_nonExistingId_returns404() {
        when(request.getAttribute("userId")).thenReturn(userId);
        when(tourService.findById(tourId, userId)).thenReturn(Optional.empty());

        ResponseEntity<Tour> result = tourController.read(tourId, request);

        assertThat(result.getStatusCode().value()).isEqualTo(404);
        assertThat(result.getBody()).isNull();
    }

    @Test
    void create_callsServiceAndReturnsTour() {
        when(request.getAttribute("userId")).thenReturn(userId);
        when(tourService.create(testTour, userId)).thenReturn(testTour);

        Tour result = tourController.create(testTour, request);

        assertThat(result).isEqualTo(testTour);
        verify(tourService).create(testTour, userId);
    }

    @Test
    void update_callsServiceAndReturnsTour() {
        when(request.getAttribute("userId")).thenReturn(userId);
        when(tourService.update(tourId, testTour, userId)).thenReturn(testTour);

        Tour result = tourController.update(tourId, testTour, request);

        assertThat(result).isEqualTo(testTour);
        verify(tourService).update(tourId, testTour, userId);
    }

    @Test
    // delete now requires userId for ownership check
    void delete_callsServiceDeleteWithUserId() {
        when(request.getAttribute("userId")).thenReturn(userId);

        tourController.delete(tourId, request);

        verify(tourService).deleteById(tourId, userId);
    }

    @Test
    void search_returnsTours() {
        when(request.getAttribute("userId")).thenReturn(userId);
        when(tourService.search("Vienna", 0, 0, userId)).thenReturn(List.of(testTour));

        List<Tour> result = tourController.search("Vienna", 0, 0, request);

        assertThat(result).hasSize(1);
        verify(tourService).search("Vienna", 0, 0, userId);
    }

    @Test
    void search_emptyQuery_delegatesToServiceSearch() {
        when(request.getAttribute("userId")).thenReturn(userId);
        when(tourService.search("", 0, 0, userId)).thenReturn(List.of(testTour));

        List<Tour> result = tourController.search("", 0, 0, request);

        assertThat(result).hasSize(1);
        verify(tourService).search("", 0, 0, userId);
    }
}
