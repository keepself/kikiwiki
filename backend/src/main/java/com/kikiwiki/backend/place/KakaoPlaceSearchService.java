package com.kikiwiki.backend.place;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

// 카카오 로컬 API(키워드 장소 검색) 프록시 - REST API 키를 프론트에 노출하지 않으려고 백엔드를 거쳐서 호출함
@Service
public class KakaoPlaceSearchService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.kakao.rest-api-key:}")
    private String restApiKey;

    public boolean isConfigured() {
        return restApiKey != null && !restApiKey.isBlank();
    }

    // "주변 탐색" 칩에서 고를 수 있는 카테고리만 허용 - 클라이언트가 준 문자열이 그대로
    // 카카오 API URL에 붙기 때문에, 화이트리스트 밖의 값은 아예 막아야 함
    private static final java.util.Set<String> ALLOWED_CATEGORY_GROUP_CODES =
            java.util.Set.of("FD6", "CE7", "CS2", "PK6");

    private static final int NEARBY_RADIUS_METERS = 1000;

    public List<PlaceSearchResult> search(String query, Double lat, Double lng) {
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "카카오 장소 검색이 아직 설정되지 않았어요.");
        }

        List<PlaceSearchResult> results = searchKeyword(query, lat, lng);
        // "상암로 125-9"처럼 상호명이 아니라 순수 주소를 넣으면 키워드 검색(장소/업체명 위주)이
        // 결과를 못 찾는 경우가 많아서, 그럴 때만 주소 전용 검색으로 한 번 더 시도함
        if (results.isEmpty()) {
            results = searchAddress(query);
        }
        return results;
    }

    // 검색어 없이, 지도에 보이는 위치 기준 반경 안의 카테고리 장소를 바로 찾음 (예: "음식점" 칩)
    public List<PlaceSearchResult> searchNearby(String categoryGroupCode, double lat, double lng) {
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "카카오 장소 검색이 아직 설정되지 않았어요.");
        }
        if (!ALLOWED_CATEGORY_GROUP_CODES.contains(categoryGroupCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 카테고리예요: " + categoryGroupCode);
        }

        String url = "https://dapi.kakao.com/v2/local/search/category.json"
                + "?category_group_code=" + categoryGroupCode
                + "&x=" + lng + "&y=" + lat
                + "&radius=" + NEARBY_RADIUS_METERS
                + "&sort=distance";

        List<PlaceSearchResult> results = new ArrayList<>();
        for (JsonNode doc : callAndGetDocuments(url)) {
            results.add(toResult(doc));
        }
        return results;
    }

    private List<PlaceSearchResult> searchKeyword(String query, Double lat, Double lng) {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String url = "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + encodedQuery;
        // 현재 위치를 알면 카카오 로컬 API의 좌표 우선순위 정렬을 그대로 씀 - 가까운 곳부터 나옴
        if (lat != null && lng != null) {
            url += "&x=" + lng + "&y=" + lat + "&sort=distance";
        }

        List<PlaceSearchResult> results = new ArrayList<>();
        for (JsonNode doc : callAndGetDocuments(url)) {
            results.add(toResult(doc));
        }
        return results;
    }

    private PlaceSearchResult toResult(JsonNode doc) {
        String address = doc.path("road_address_name").asText();
        if (address.isBlank()) {
            address = doc.path("address_name").asText();
        }
        return new PlaceSearchResult(
                doc.path("place_name").asText(),
                address,
                doc.path("category_name").asText(),
                doc.path("place_url").asText(),
                doc.path("phone").asText(),
                doc.path("y").asDouble(),
                doc.path("x").asDouble()
        );
    }

    private List<PlaceSearchResult> searchAddress(String query) {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + encodedQuery;

        List<PlaceSearchResult> results = new ArrayList<>();
        for (JsonNode doc : callAndGetDocuments(url)) {
            String roadAddress = doc.path("road_address").path("address_name").asText();
            String jibunAddress = doc.path("address").path("address_name").asText();
            String address = !roadAddress.isBlank() ? roadAddress : jibunAddress;
            if (address.isBlank()) {
                address = doc.path("address_name").asText();
            }
            results.add(new PlaceSearchResult(
                    address,
                    address,
                    "주소",
                    "",
                    "",
                    doc.path("y").asDouble(),
                    doc.path("x").asDouble()
            ));
        }
        return results;
    }

    private JsonNode callAndGetDocuments(String url) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "KakaoAK " + restApiKey)
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new IOException("카카오 로컬 API 응답 오류 (" + response.statusCode() + "): " + response.body());
            }
            return objectMapper.readTree(response.body()).path("documents");
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "장소 검색 중 오류가 발생했습니다: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "장소 검색 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
