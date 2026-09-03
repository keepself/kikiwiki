package com.kikiwiki.backend.ootd;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Base64;
import java.util.UUID;

// OOTD 사진을 DB가 아니라 서버 디스크에 파일로 저장 - 매일 쌓이는 사진이라 DB에 base64로 넣으면
// 덤프가 금방 커져서 이메일 백업(25MB 제한)이 깨짐. docker-compose.prod.yml에서 볼륨 마운트해뒀기 때문에
// 배포로 컨테이너가 갈아끼워져도 사진은 그대로 남음
@Service
public class OotdImageStorageService {

    @Value("${app.ootd.upload-dir}")
    private String uploadDir;

    public String save(String imageDataUrl, LocalDate entryDate) {
        int commaIndex = imageDataUrl.indexOf(',');
        if (commaIndex == -1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 이미지 데이터입니다.");
        }

        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(imageDataUrl.substring(commaIndex + 1));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 이미지 데이터입니다.");
        }

        String filename = entryDate + "-" + UUID.randomUUID() + ".jpg";

        try {
            Path dir = Path.of(uploadDir);
            Files.createDirectories(dir);
            Files.write(dir.resolve(filename), bytes);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "사진 저장 중 오류가 발생했습니다: " + e.getMessage());
        }

        return filename;
    }

    public byte[] read(String filename) {
        try {
            return Files.readAllBytes(Path.of(uploadDir).resolve(filename));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사진을 찾을 수 없습니다.");
        }
    }
}
