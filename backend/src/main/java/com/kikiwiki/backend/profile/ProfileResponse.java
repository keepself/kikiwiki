package com.kikiwiki.backend.profile;

import com.kikiwiki.backend.user.User;

public class ProfileResponse {

    private Integer heightCm;
    private String profileImageDataUrl;

    public ProfileResponse(User user) {
        this.heightCm = user.getHeightCm();
        this.profileImageDataUrl = user.getProfileImageDataUrl();
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public String getProfileImageDataUrl() {
        return profileImageDataUrl;
    }
}
