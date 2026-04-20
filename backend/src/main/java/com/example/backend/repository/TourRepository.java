package com.example.backend.repository;

import com.example.backend.entity.Tour;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TourRepository extends CrudRepository<Tour, UUID> {}
