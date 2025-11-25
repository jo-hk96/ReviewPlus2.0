package com.review.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.review.DTO.UserReviewDTO;
import com.review.config.CustomUserDetails;
import com.review.entity.userReviewEntity;
import com.review.repository.UserRepository;
import com.review.service.FileStoreService;
import com.review.service.MovieLikeService;
import com.review.service.TmdbApiService;
import com.review.service.UserReviewService;
import com.review.service.UserService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class MovieController {
	
	private final UserReviewService userReviewService;
	private final MovieLikeService movieLikeService;
	
	
	//메인홈
	@GetMapping("/")
	public String Home(@AuthenticationPrincipal CustomUserDetails cud ,Principal principal, Model model) {
		 if (principal != null) {
	            // principal.getName()은 UserDetailsService에서 반환한 getUsername() 값,
	            //로그인 한 사용자의 이메일
	            String loggedInUserEmail = principal.getName();
	            model.addAttribute("username", loggedInUserEmail);
	        }
		 //사용자 리뷰리스트를 최신순으로 메인에 보내줌
		 List<UserReviewDTO> recentReviews = userReviewService.getRecentReviews();
		 model.addAttribute("recentReviews" , recentReviews);
		 return "index/index";
	}
	
	
	
		//영화검색,카테고리 변경
		@GetMapping("/MoviesList")
		public String handleMovieListing(@RequestParam(value = "movieSearch",required = false) String query,
					@RequestParam(value = "category",required = false) String category,Model model){
			//검색어 query를 담아서 list페이지에 넘김
			model.addAttribute("searchQuery" ,query);
			model.addAttribute("selectedCategory" ,category);
			return "movies/movies_list";
		}

			
	
	//영화 상세 정보
	@GetMapping("/detail/{apiId}")
	public String getMovieDetail(@PathVariable("apiId") Long id , 
						@AuthenticationPrincipal CustomUserDetails userDetails ,Model model){
		System.out.println("영화ID: " + id);
		//리뷰 목록 가져오기
		List<userReviewEntity> existingReviews = userReviewService.getReviewsByMovieId(id);
		System.out.println("대체 뭐가 나올까" + existingReviews);
		boolean isLiked = false;
		if(userDetails != null) {
			Long userId = userDetails.getUserId();
	        isLiked = movieLikeService.getLikeStatus(userId, id); 
		}
		System.out.println(id + "의 대한 영화 리뷰 갯수 : " + existingReviews.size()); 
		model.addAttribute("apiId", id );
		model.addAttribute("isLiked", isLiked);
		model.addAttribute("reviews", existingReviews );
		return "movies/movies_detail";
	}
	
}