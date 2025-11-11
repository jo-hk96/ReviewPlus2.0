package com.review.model;

import java.util.List;

public class NaverResponse {

    // JSON의 최상위 필드들
    private String lastBuildDate;
    private int total;
    private int start;
    private int display;

    private List<Item> items;

    public List<Item> getItems() {
        return items;
    }

}
