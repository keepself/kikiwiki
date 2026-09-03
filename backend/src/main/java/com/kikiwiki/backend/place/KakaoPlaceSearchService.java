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

    public List<PlaceSearchResult> search(String query) {
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "카카오 장소 검색이 아직 설정되지 않았어요.");
        }

        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://dapi.kakao.com/v2/local/search/keyword.json?query=" + encodedQuery))
                .header("Authorization", "KakaoAK " + restApiKey)
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new IOException("카카오 로컬 API 응답 오류 (" + response.statusCode() + "): " + response.body());
            }

            JsonNode documents = objectMapper.readTree(response.body()).path("documents");
            List<PlaceSearchResult> results = new ArrayList<>();
            for (JsonNode doc : documents) {
                String address = doc.path("road_address_name").asText();
                if (address.isBlank()) {
                    address = doc.path("address_name").asText();
                }
                results.add(new PlaceSearchResult(
                        doc.path("place_name").asText(),
                        address,
                        doc.path("category_name").asText(),
                        doc.path("place_url").asText(),
                        doc.path("y").asDouble(),
                        doc.path("x").asDouble()
                ));
            }
            return results;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "장소 검색 중 오류가 발생했습니다: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "장소 검색 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
