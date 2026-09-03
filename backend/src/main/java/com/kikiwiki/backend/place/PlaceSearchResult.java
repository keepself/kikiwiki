package com.kikiwiki.backend.place;

public class PlaceSearchResult {

    private final String placeName;
    private final String address;
    private final String category;
    private final String placeUrl;
    private final double lat;
    private final double lng;

    public PlaceSearchResult(String placeName, String address, String category, String placeUrl, double lat, double lng) {
        this.placeName = placeName;
        this.address = address;
        this.category = category;
        this.placeUrl = placeUrl;
        this.lat = lat;
        this.lng = lng;
    }

    public String getPlaceName() {
        return placeName;
    }

    public String getAddress() {
        return address;
    }

    public String getCategory() {
        return category;
    }

    public String getPlaceUrl() {
        return placeUrl;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }
}
