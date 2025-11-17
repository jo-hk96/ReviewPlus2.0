package com.review.controller; // 💡 패키지를 controller로 변경해야 합니다.

import com.review.service.NaverApiService;
import com.review.model.NaverResponse;
import com.nimbusds.jose.shaded.gson.Gson;
import com.review.model.Item;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

//@Controller
@RestController
public class NaverSearchController {

    @Autowired
    private NaverApiService naverApiService;


    @GetMapping("/api/naver/news") 
    // public String searchNews(@RequestParam(defaultValue = "영화") String query, Model model) {
    public List<Item> searchNews(@RequestParam(defaultValue = "영화추천") String query) {

        // 1. Service 호출: JSON 문자열 받기
        String jsonResult = naverApiService.searchNews(query);

        // 2. JSON 파싱 (GSON 사용)
        Gson gson = new Gson();
        NaverResponse response = gson.fromJson(jsonResult, NaverResponse.class);

        return response.getItems();
    }
}