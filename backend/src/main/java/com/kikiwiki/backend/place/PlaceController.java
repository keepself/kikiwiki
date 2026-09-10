package com.kikiwiki.backend.place;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceRepository placeRepository;
    private final KakaoPlaceSearchService kakaoPlaceSearchService;

    public PlaceController(PlaceRepository placeRepository, KakaoPlaceSearchService kakaoPlaceSearchService) {
        this.placeRepository = placeRepository;
        this.kakaoPlaceSearchService = kakaoPlaceSearchService;
    }

    @GetMapping("/search")
    public List<PlaceSearchResult> search(
            @RequestParam("query") String query,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng
    ) {
        return kakaoPlaceSearchService.search(query, lat, lng);
    }

    @GetMapping("/nearby")
    public List<PlaceSearchResult> nearby(
            @RequestParam("category") String category,
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng
    ) {
        return kakaoPlaceSearchService.searchNearby(category, lat, lng);
    }

    @PostMapping
    public ResponseEntity<PlaceResponse> create(@Valid @RequestBody PlaceRequest request) {
        Place place = new Place(
                request.getTitle(),
                request.getAddress(),
                request.getLat(),
                request.getLng(),
                request.getCategory(),
                request.getPlaceUrl(),
                request.getStatus(),
                request.getRating(),
                request.getReview(),
                request.getTags(),
                request.getVisitedAt()
        );

        Place saved = placeRepository.save(place);

        return ResponseEntity.status(HttpStatus.CREATED).body(new PlaceResponse(saved));
    }

    @GetMapping
    public List<PlaceResponse> getAll() {
        return placeRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(PlaceResponse::new)
                .toList();
    }

    @PutMapping("/{id}")
    public PlaceResponse update(@PathVariable("id") Long id, @Valid @RequestBody PlaceRequest request) {
        Place place = placeRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "장소를 찾을 수 없습니다: " + id));

        place.update(
                request.getTitle(),
                request.getAddress(),
                request.getLat(),
                request.getLng(),
                request.getCategory(),
                request.getPlaceUrl(),
                request.getStatus(),
                request.getRating(),
                request.getReview(),
                request.getTags(),
                request.getVisitedAt()
        );

        Place updated = placeRepository.save(place);

        return new PlaceResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        Place place = placeRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "장소를 찾을 수 없습니다: " + id));

        place.softDelete();
        placeRepository.save(place);

        return ResponseEntity.noContent().build();
    }
}
