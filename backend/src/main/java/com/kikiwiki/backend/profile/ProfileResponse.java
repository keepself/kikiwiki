package com.kikiwiki.backend.profile;

import com.kikiwiki.backend.user.User;

public class ProfileResponse {

    private String username;
    private Integer heightCm;
    private String profileImageDataUrl;

    public ProfileResponse(User user) {
        this.username = user.getUsername();
        this.heightCm = user.getHeightCm();
        this.profileImageDataUrl = user.getProfileImageDataUrl();
    }

    public String getUsername() {
        return username;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public String getProfileImageDataUrl() {
        return profileImageDataUrl;
    }
}
