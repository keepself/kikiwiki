package com.kikiwiki.backend.profile;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class ProfileRequest {

    @Min(value = 50, message = "키는 50cm 이상이어야 합니다.")
    @Max(value = 250, message = "키는 250cm 이하여야 합니다.")
    private Integer heightCm;

    public Integer getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Integer heightCm) {
        this.heightCm = heightCm;
    }
}
