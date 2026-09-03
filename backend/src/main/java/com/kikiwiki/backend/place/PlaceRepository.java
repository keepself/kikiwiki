package com.kikiwiki.backend.place;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    List<Place> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    Optional<Place> findByIdAndDeletedAtIsNull(Long id);
}
