package com.kikiwiki.backend.wishlist;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;

// 상품 링크를 대신 열어서 Open Graph 메타태그(og:title, og:image)를 읽어옴
@Service
public class LinkPreviewService {

    public LinkPreviewResponse fetchPreview(String url) {
        URI uri = parseAndValidateUrl(url);

        try {
            Document doc = Jsoup.connect(uri.toString())
                    .userAgent("Mozilla/5.0 (compatible; kikiwiki-bot/1.0)")
                    .timeout(5000)
                    .get();

            String title = firstNonBlank(
                    metaContent(doc, "og:title"),
                    doc.title()
            );
            String imageUrl = metaContent(doc, "og:image");
            String price = firstNonBlank(
                    metaContent(doc, "og:price:amount"),
                    metaContent(doc, "product:price:amount")
            );

            return new LinkPreviewResponse(title, imageUrl, price);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "링크에서 정보를 가져오지 못했습니다: " + e.getMessage());
        }
    }

    private String metaContent(Document doc, String property) {
        var el = doc.selectFirst("meta[property=" + property + "]");
        return el != null ? el.attr("content") : null;
    }

    private String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    // 사설/루프백 IP로의 요청을 막음 (사용자가 임의의 URL을 넣을 수 있어 SSRF 방지 목적)
    private URI parseAndValidateUrl(String url) {
        URI uri;
        try {
            uri = URI.create(url);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바르지 않은 URL입니다.");
        }

        String scheme = uri.getScheme();
        if (scheme == null || !(scheme.equals("http") || scheme.equals("https"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "http/https URL만 허용됩니다.");
        }

        try {
            InetAddress address = InetAddress.getByName(uri.getHost());
            if (address.isLoopbackAddress() || address.isSiteLocalAddress()
                    || address.isLinkLocalAddress() || address.isAnyLocalAddress()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "허용되지 않는 주소입니다.");
            }
        } catch (UnknownHostException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "호스트를 찾을 수 없습니다.");
        }

        return uri;
    }
}
