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


    @GetMapping("/api/naver/news") // 💡 이 URL로 요청이 들어오면 실행됩니다.
    // public String searchNews(@RequestParam(defaultValue = "영화") String query, Model model) {
    public List<Item> searchNews(@RequestParam(defaultValue = "영화") String query) {

        // 1. Service 호출: JSON 문자열 받기
        String jsonResult = naverApiService.searchNews(query);

        // 2. JSON 파싱 (GSON 사용)
        Gson gson = new Gson();
        NaverResponse response = gson.fromJson(jsonResult, NaverResponse.class);

        // 3. List<Item> 객체를 바로 리턴
        // Spring이 이 객체 리스트를 자동으로 JSON 형식으로 변환하여 응답합니다.
        return response.getItems();
    }
}