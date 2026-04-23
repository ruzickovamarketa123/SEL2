package com.example.backend.repository;

import com.example.backend.entity.TourLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TourLogRepository extends JpaRepository<TourLog, UUID> {
}