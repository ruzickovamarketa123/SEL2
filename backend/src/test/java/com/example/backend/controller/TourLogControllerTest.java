package com.example.backend.controller;

import com.example.backend.dto.TourLogDto;
import com.example.backend.entity.Tour;
import com.example.backend.entity.TourLog;
import com.example.backend.repository.TourLogRepository;
import com.example.backend.repository.TourRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourLogControllerTest {

    @Mock private TourLogRepository tourLogRepository;
    @Mock private TourRepository tourRepository;

    @InjectMocks
    private TourLogController tourLogController;

    private UUID logId;
    private UUID tourId;
    private Tour testTour;
    private TourLog testLog;

    @BeforeEach
    void setUp() {
        logId = UUID.randomUUID();
        tourId = UUID.randomUUID();

        testTour = new Tour("Alpine Trail", "desc", "1.0,2.0", "3.0,4.0", "hike", 10.0, 60.0, null);
        testTour.setId(tourId);

        testLog = new TourLog(testTour, LocalDateTime.of(2026, 6, 1, 10, 0),
                12.5, 4, "Great hike", "medium", 90.0);
        testLog.setId(logId);
    }

    @Test
    void readAll_returnsListOfDtos() {
        when(tourLogRepository.findAll()).thenReturn(List.of(testLog));

        List<TourLogDto> result = tourLogController.readAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(logId);
        assertThat(result.get(0).getTourId()).isEqualTo(tourId);
    }

    @Test
    void readAll_noLogs_returnsEmptyList() {
        when(tourLogRepository.findAll()).thenReturn(List.of());

        List<TourLogDto> result = tourLogController.readAll();

        assertThat(result).isEmpty();
    }

    @Test
    void read_existingId_returns200WithDto() {
        when(tourLogRepository.findById(logId)).thenReturn(Optional.of(testLog));

        ResponseEntity<TourLogDto> result = tourLogController.read(logId);

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getId()).isEqualTo(logId);
    }

    @Test
    void read_nonExistingId_returns404() {
        when(tourLogRepository.findById(logId)).thenReturn(Optional.empty());

        ResponseEntity<TourLogDto> result = tourLogController.read(logId);

        assertThat(result.getStatusCode().value()).isEqualTo(404);
        assertThat(result.getBody()).isNull();
    }

    @Test
    void create_savesLogAndReturnsDto() {
        when(tourRepository.findById(tourId)).thenReturn(Optional.of(testTour));
        when(tourLogRepository.save(any(TourLog.class))).thenReturn(testLog);

        TourLogDto dto = new TourLogDto();
        dto.setTourId(tourId);
        dto.setDate("2026-06-01");
        dto.setTime("10:00");
        dto.setTotalDistance(12.5);
        dto.setRating(4);
        dto.setComment("Great hike");
        dto.setDifficulty("medium");
        dto.setTotalTime(90.0);

        TourLogDto result = tourLogController.create(dto);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(logId);
        verify(tourLogRepository).save(any(TourLog.class));
    }

    @Test
    void create_tourNotFound_throwsException() {
        when(tourRepository.findById(tourId)).thenReturn(Optional.empty());

        TourLogDto dto = new TourLogDto();
        dto.setTourId(tourId);
        dto.setDate("2026-06-01");
        dto.setTime("10:00");

        assertThatThrownBy(() -> tourLogController.create(dto))
                .isInstanceOf(Exception.class);
    }

    @Test
    void update_savesLogWithCorrectId() {
        when(tourRepository.findById(tourId)).thenReturn(Optional.of(testTour));
        when(tourLogRepository.save(any(TourLog.class))).thenReturn(testLog);

        TourLogDto dto = new TourLogDto();
        dto.setTourId(tourId);
        dto.setDate("2026-06-01");
        dto.setTime("10:00");
        dto.setTotalDistance(12.5);
        dto.setRating(4);
        dto.setComment("Updated comment");
        dto.setDifficulty("hard");
        dto.setTotalTime(90.0);

        TourLogDto result = tourLogController.update(logId, dto);

        assertThat(result).isNotNull();
        verify(tourLogRepository).save(argThat(log -> log.getId().equals(logId)));
    }

    @Test
    void delete_callsDeleteById() {
        tourLogController.delete(logId);

        verify(tourLogRepository).deleteById(logId);
    }
}