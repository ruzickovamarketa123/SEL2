package com.example.backend.service;

import com.example.backend.dto.TourLogDto;
import com.example.backend.entity.Tour;
import com.example.backend.entity.TourLog;
import com.example.backend.repository.TourLogRepository;
import com.example.backend.repository.TourRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class TourLogService {

    private static final Logger logger = LogManager.getLogger(TourLogService.class);

    private final TourLogRepository tourLogRepository;
    private final TourRepository    tourRepository;

    public TourLogService(TourLogRepository tourLogRepository,
                          TourRepository tourRepository) {
        this.tourLogRepository = tourLogRepository;
        this.tourRepository    = tourRepository;
    }

    public List<TourLogDto> findAllByUser(UUID userId) {
        logger.debug("Fetching all logs for userId={}", userId);
        return tourLogRepository.findByTourUserId(userId)
                .stream()
                .map(TourLogDto::new)
                .toList();
    }

    public TourLogDto findById(UUID id, UUID userId) {
        logger.debug("Fetching log id={} for userId={}", id, userId);
        TourLog log = getLogAndVerifyOwner(id, userId);
        return new TourLogDto(log);
    }

    public TourLogDto create(TourLogDto dto, UUID userId) {
        logger.info("Creating log for tourId={} userId={}", dto.getTourId(), userId);

        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> {
                    logger.error("Tour not found: id={}", dto.getTourId());
                    return new RuntimeException("Tour not found");
                });

        // Verify the tour belongs to the requesting user
        if (!tour.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized log creation: userId={} tried to log on tourId={}",
                    userId, dto.getTourId());
            throw new RuntimeException("Not authorized to add logs to this tour");
        }

        TourLog log = new TourLog(
                tour,
                parseDateTime(dto.getDate(), dto.getTime()),
                dto.getTotalDistance(),
                dto.getRating(),
                dto.getComment(),
                dto.getDifficulty(),
                dto.getTotalTime()
        );

        TourLogDto saved = new TourLogDto(tourLogRepository.save(log));
        logger.info("TourLog created: id={}", saved.getId());
        return saved;
    }

    public TourLogDto update(UUID id, TourLogDto dto, UUID userId) {
        logger.info("Updating log id={} by userId={}", id, userId);

        TourLog existing = getLogAndVerifyOwner(id, userId);

        existing.setDateTime(parseDateTime(dto.getDate(), dto.getTime()));
        existing.setTotalDistance(dto.getTotalDistance());
        existing.setRating(dto.getRating());
        existing.setComment(dto.getComment());
        existing.setDifficulty(dto.getDifficulty());
        existing.setTotalTime(dto.getTotalTime());

        TourLogDto saved = new TourLogDto(tourLogRepository.save(existing));
        logger.info("TourLog updated: id={}", saved.getId());
        return saved;
    }

    public void delete(UUID id, UUID userId) {
        logger.info("Deleting log id={} by userId={}", id, userId);
        getLogAndVerifyOwner(id, userId);
        tourLogRepository.deleteById(id);
        logger.info("TourLog deleted: id={}", id);
    }

    private TourLog getLogAndVerifyOwner(UUID id, UUID userId) {
        TourLog log = tourLogRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("TourLog not found: id={}", id);
                    return new RuntimeException("TourLog not found");
                });

        if (!log.getTour().getUser().getId().equals(userId)) {
            logger.warn("Unauthorized access: userId={} tried to access log id={}", userId, id);
            throw new RuntimeException("Not authorized to access this log");
        }

        return log;
    }

    private LocalDateTime parseDateTime(String date, String time) {
        return LocalDateTime.of(
                LocalDate.parse(date),
                LocalTime.parse(time)
        );
    }
}
