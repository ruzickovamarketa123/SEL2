package com.example.backend.repository;

import com.example.backend.entity.Tour;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TourRepository extends CrudRepository<Tour, Long> {}
