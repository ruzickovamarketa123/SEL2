package com.example.backend.controller;

import com.example.backend.dto.TourLogDto;
import com.example.backend.entity.Tour;
import com.example.backend.entity.TourLog;
import com.example.backend.service.TourLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourLogControllerTest {

    // The controller now depends only on TourLogService — no direct repo access
    @Mock private TourLogService tourLogService;
    @Mock private HttpServletRequest request;

    @InjectMocks
    private TourLogController tourLogController;

    private UUID userId;
    private UUID logId;
    private UUID tourId;
    private TourLogDto testDto;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        logId  = UUID.randomUUID();
        tourId = UUID.randomUUID();

        testDto = new TourLogDto();
        testDto.setId(logId);
        testDto.setTourId(tourId);
        testDto.setDate("2026-06-01");
        testDto.setTime("10:00");
        testDto.setTotalDistance(12.5);
        testDto.setRating(4);
        testDto.setComment("Great hike");
        testDto.setDifficulty("Medium");
        testDto.setTotalTime(90.0);

        when(request.getAttribute("userId")).thenReturn(userId);
    }

    @Test
    // readAll must return only logs belonging to the current user
    void readAll_returnsOnlyUserLogs() {
        when(tourLogService.findAllByUser(userId)).thenReturn(List.of(testDto));

        List<TourLogDto> result = tourLogController.readAll(request);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(logId);
        verify(tourLogService).findAllByUser(userId);
    }

    @Test
    // Service throws RuntimeException when log not found or not owned — controller returns 404
    void read_notFoundOrUnauthorized_returns404() {
        when(tourLogService.findById(logId, userId)).thenThrow(new RuntimeException("Not found"));

        ResponseEntity<TourLogDto> result = tourLogController.read(logId, request);

        assertThat(result.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void create_delegatesToServiceAndReturnsDto() {
        when(tourLogService.create(testDto, userId)).thenReturn(testDto);

        TourLogDto result = tourLogController.create(testDto, request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(logId);
        verify(tourLogService).create(testDto, userId);
    }

    @Test
    // Service throws if the tour doesn't belong to the user
    void create_unauthorizedTour_throwsException() {
        when(tourLogService.create(testDto, userId))
                .thenThrow(new RuntimeException("Not authorized to add logs to this tour"));

        assertThatThrownBy(() -> tourLogController.create(testDto, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    void delete_delegatesToServiceWithUserId() {
        tourLogController.delete(logId, request);

        // Ownership check is done inside TourLogService — controller just delegates
        verify(tourLogService).delete(logId, userId);
    }
}
