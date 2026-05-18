package com.example.backend.repository;

import com.example.backend.entity.Tour;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.UUID;

public interface TourRepository extends CrudRepository<Tour, UUID> {
    List<Tour> findByUserId(UUID userId);
}