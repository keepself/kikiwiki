package com.kikiwiki.backend.ootd;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OotdEntryRepository extends JpaRepository<OotdEntry, Long> {

    List<OotdEntry> findAllByDeletedAtIsNullOrderByEntryDateDescCreatedAtDesc();

    Optional<OotdEntry> findByIdAndDeletedAtIsNull(Long id);
}
