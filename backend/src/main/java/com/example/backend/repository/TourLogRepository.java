package com.example.backend.repository;

import com.example.backend.entity.TourLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface TourLogRepository extends JpaRepository<TourLog, UUID> {
    void deleteByTourId(UUID tourId);

    // Returns only logs whose tour belongs to the given user
    List<TourLog> findByTourUserId(UUID userId);
}