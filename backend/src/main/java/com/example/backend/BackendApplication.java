package com.example.backend;

import com.example.backend.entity.Tour;
import com.example.backend.repository.TourRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.stream.Stream;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner init(TourRepository tourRepository) {
        return args -> {
            Stream.of(
                    new Tour("BACKEND TEST", "A beautiful tour of Paris.", "Eiffel Tower", "Louvre", "Hike"),
                    new Tour("Tokyo Explorer", "Explore the streets of Tokyo.", "Shinjuku", "Shibuya", "Bike"),
                    new Tour("New York Highlights", "Run through NYC landmarks.", "Central Park", "Times Square", "Running"),
                    new Tour("Rome Historical Walk", "Walk through ancient Rome.", "Colosseum", "Vatican", "Hike"),
                    new Tour("Safari Adventure", "Wildlife vacation in Kenya.", "Nairobi", "Maasai Mara", "Vacation")
            ).forEach(tourRepository::save);

            tourRepository.findAll().forEach(System.out::println);
        };
    }
}