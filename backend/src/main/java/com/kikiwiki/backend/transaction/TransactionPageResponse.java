package com.kikiwiki.backend.transaction;

import java.util.List;

// 페이징된 거래 목록 응답. Spring의 Page 객체를 직접 반환하면 프론트에서 다루기 번거로운 필드가 많이 섞여 나오므로,
// 필요한 정보만 담은 전용 응답 형태를 만듦
public class TransactionPageResponse {

    private List<TransactionResponse> items;
    private boolean hasMore;
    private long totalCount;

    public TransactionPageResponse(List<TransactionResponse> items, boolean hasMore, long totalCount) {
        this.items = items;
        this.hasMore = hasMore;
        this.totalCount = totalCount;
    }

    public List<TransactionResponse> getItems() {
        return items;
    }

    public boolean isHasMore() {
        return hasMore;
    }

    public long getTotalCount() {
        return totalCount;
    }
}
