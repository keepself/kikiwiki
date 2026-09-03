package com.kikiwiki.backend.profile;

import jakarta.validation.constraints.NotBlank;

public class ProfileImageRequest {

    // "data:image/jpeg;base64,..." 형태 - 프론트에서 캔버스로 리사이즈한 뒤 보냄
    @NotBlank(message = "이미지 데이터가 필요합니다.")
    private String dataUrl;

    public String getDataUrl() {
        return dataUrl;
    }

    public void setDataUrl(String dataUrl) {
        this.dataUrl = dataUrl;
    }
}
