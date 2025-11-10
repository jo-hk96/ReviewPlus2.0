package com.review.model;

import lombok.Getter; // 💡 Lombok import 필요

@Getter // 💡 이 애너테이션 하나로 모든 Getter가 생성됩니다.
public class Item {
    private String title;
    private String originallink;
    private String link;
    private String description;
    private String pubDate;
}