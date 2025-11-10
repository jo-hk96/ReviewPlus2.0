package com.review.model;

import java.util.List;

public class NaverResponse {

    // JSON의 최상위 필드들
    private String lastBuildDate;
    private int total;
    private int start;
    private int display;

    // 개별 뉴스 항목 리스트를 담는 필드 (핵심!)
    // JSON의 "items" 배열과 매칭됩니다.
    private List<Item> items;

    // **컨트롤러에서 사용된 getItems() 오류를 해결하기 위한 Getter**
    public List<Item> getItems() {
        return items;
    }

    // (옵션: 나머지 필드에 대한 Getter/Setter도 필요하다면 추가하세요)

}
