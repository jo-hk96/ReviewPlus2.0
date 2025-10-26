package com.review.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.review.DTO.SearchResponseDTO;
import com.review.DTO.TmdbResponseDTO;
import com.review.DTO.movieDTO;

@Service
public class TmdbApiService {
	
	private final WebClient webClient;
	private final String bearerToken;
	private final String BASE_URL = "https://api.themoviedb.org/3/movie/";
	private final RestTemplate restTemplate = new RestTemplate();
	
	//properties 에 있는 tmdb.api.base-url :api url , tmdb.api.bearer-token : bearer token
	public TmdbApiService(WebClient.Builder webClientBuilder,
						@Value("${tmdb.api.base-url}") String baseUrl,
						@Value("${tmdb.api.bearer-token}") String bearerToken) {
		
		
		this.webClient = webClientBuilder.baseUrl(baseUrl).build();
		this.bearerToken = bearerToken;
	}
	
	
	
	
	public movieDTO getMovieDetail(Long apiId) {
		String trimmedToken = bearerToken.trim();
		try {
			return webClient.get()
					.uri("/movie/{apiId}?language=ko-KR" , apiId)
					.header("Authorization", "Bearer " + trimmedToken)
					.retrieve() 
					.bodyToMono(movieDTO.class)
					.block(); 
			
		}catch(WebClientResponseException e) {
			//API에서 에러 응답
			System.err.println("TMDB API 오류 발생: " + e.getStatusCode() + " - " + e.getMessage());
            // 해당 영화가 존재하지 않거나(404) 다른 문제 발생 시 null 반환 또는 사용자 정의 예외 던지기
            return null; 
		}catch(Exception e) {
			System.err.println("API 호출 중 오류 발생:" + e.getMessage());
			return null;
		}
		
	}
	
	//API에서 영화 제목으로 검색하는 함수
	//movieDTO에 담긴 영화 정보들을 불러옴
	public List<movieDTO> searchMovies(String query) {
	    // 1. 검색어가 없으면 빈 목록 반환 (API 호출 필요 없음)
	    if (query == null || query.trim().isEmpty()) {
	        return Collections.emptyList();
	    }
	    //WebClient의 자동 인코딩 무시
		//"반지의 제왕" -> "반지의+제왕" 으로 변경
	    String searchKeyword = query.trim().replace(" ", "+");
	   
	    // 2. 토큰 앞뒤 공백 제거
	    String trimmedToken = bearerToken.trim();
	    
	    try {
	        SearchResponseDTO responseDto = webClient.get()
	            // .uri() 대신 .uriBuilder()를 사용합니다.
	            .uri(uriBuilder -> uriBuilder
	                .path("/search/movie")              // API 경로
	                .queryParam("query", searchKeyword)        
	                .queryParam("language", "ko-KR")    // 언어 설정
	                .build())
	            .header("Authorization", "Bearer " + trimmedToken)
	            .retrieve()
	            .bodyToMono(SearchResponseDTO.class) 
	            .block();

	        // 3. 결과 추출 후 반환
	        if (responseDto != null && responseDto.getResults() != null) {
	            return responseDto.getResults(); // MovieDTO 목록 반환
	        }
	        return Collections.emptyList();
	        
	    } catch (WebClientResponseException e) {
	        // HTTP 4xx, 5xx 에러 처리 (TMDB API 검색 오류)
	        System.out.println("TMDB API 검색 오류: " + e.getStatusCode() + " - " + e.getMessage());
	        return Collections.emptyList();
	    } catch (Exception e) {
	        // 기타 연결 오류 처리
	        System.err.println("API 호출 중 오류 발생: " + e.getMessage());
	        return Collections.emptyList();
	    }
	}
	
		public String getMovieTitle(Long apiId) {
			// /movie/{movie_id}
			String path = "/movie/" + apiId;
			
			//API 호출 및 응답 처리
			return webClient.get()
					.uri(uriBuilder -> uriBuilder
							.path(path)
							.queryParam("language" , "ko-KR")
							.build())
					.header("Authorization", "Bearer " + bearerToken)
					.retrieve()	
					.bodyToMono(movieDTO.class)
					.map(movieDTO::getTitle)
					.block();
			}
	


	public TmdbResponseDTO getMoviesByCategory(String category, int page) {
		 // 1. URL 생성 (토큰은 URL에 포함하지 않습니다.)
	    String url = String.format(
	        "%s%s?language=ko-KR&page=%d&region=KR", 
	        BASE_URL, category, page
	    );

	    // 2. ⭐⭐ HTTP 헤더에 토큰 설정 (인증) ⭐⭐
	    HttpHeaders headers = new HttpHeaders();
	    headers.setBearerAuth(bearerToken); // 네 토큰 변수명을 사용해야 함 (예: tmdbToken)
	    headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
	    
	    HttpEntity<String> entity = new HttpEntity<>(headers); // 요청 본문 없이 헤더만 설정

	    try {
	        // 3.exchange() 사용: 요청을 보내고 응답을 DTO로 받습니다.
	        ResponseEntity<TmdbResponseDTO> response = restTemplate.exchange(
	            url, 
	            HttpMethod.GET, 
	            entity, // 토큰이 담긴 헤더 포함
	            TmdbResponseDTO.class
	        );
	        
	        // 4. 응답 본문을 반환
	        return response.getBody(); 

	    } catch (HttpStatusCodeException e) {
	        System.err.println("TMDB API 호출 실패 (상태 코드: " + e.getStatusCode() + "): " + e.getResponseBodyAsString());
	        return new TmdbResponseDTO(); 
	    }
	}
    
	
	
}
