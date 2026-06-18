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
     * Searches (case-insensitive) in:
     *   - tour name
     *   - tour description
     *   - fromName / toName
     *   - transportType
     *   - log comments
     *
     * Uses LEFT JOIN so tours with no logs are still returned if
     * the tour fields match.  DISTINCT avoids duplicates when a
     * tour has multiple matching logs.
     */
    @Query("""
        SELECT DISTINCT t FROM Tour t
        LEFT JOIN FETCH t.tourLogs l
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
