package com.example.backend.repository;

import com.example.backend.entity.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TourRepository extends JpaRepository<Tour, UUID> {

    List<Tour> findByUserId(UUID userId);

    /**
     * Full-text search across tour fields and their log comments.
     * Uses LEFT JOIN (no FETCH) since tourLogs are @JsonIgnore — 
     * we only need them for the WHERE condition, not for serialization.
     * DISTINCT avoids duplicate tours when multiple logs match.
     */
    @Query("""
        SELECT DISTINCT t FROM Tour t
        LEFT JOIN t.tourLogs l
        WHERE t.user.id = :userId
          AND (
            LOWER(t.name)          LIKE LOWER(CONCAT('%', :term, '%')) OR
            LOWER(t.description)   LIKE LOWER(CONCAT('%', :term, '%')) OR
            LOWER(t.fromName)      LIKE LOWER(CONCAT('%', :term, '%')) OR
            LOWER(t.toName)        LIKE LOWER(CONCAT('%', :term, '%')) OR
            LOWER(t.transportType) LIKE LOWER(CONCAT('%', :term, '%')) OR
            LOWER(l.comment)       LIKE LOWER(CONCAT('%', :term, '%')) OR
            LOWER(l.difficulty)    LIKE LOWER(CONCAT('%', :term, '%'))
          )
    """)
    List<Tour> searchByUserId(@Param("userId") UUID userId, @Param("term") String term);
}
