package com.review.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.review.DTO.UserDTO;
import com.review.DTO.UserEditDTO;
import com.review.DTO.UserReviewDTO;
import com.review.DTO.movieDTO;
import com.review.DTO.movieLikeDTO;
import com.review.config.CustomUserDetails;
import com.review.entity.userEntity;
import com.review.entity.userReviewEntity;
import com.review.repository.UserRepository;
import com.review.repository.UserReviewRepository;
import com.review.service.InquiryService;
import com.review.service.MovieLikeService;
import com.review.service.MovieService;
import com.review.service.UserReviewService;
import com.review.service.UserService;

import lombok.RequiredArgsConstructor;



@Controller
@RequiredArgsConstructor
public class adminController {
	private final UserRepository userRepository;
	private final UserReviewService userReviewService;
	private final UserReviewRepository userReviewRepository;
	private final UserService userService;
	private final MovieService movieService;
	private final MovieLikeService movieLikeService;
	private final InquiryService inquiryService;
	private final PasswordEncoder passwordEncoder;
	
	
	//권한없는 페이지 접속페이지
	@GetMapping("/access-error")
	public String accessError() {
		return "admin/access-error";
	}
	
	
	
	//휴면계정 페이지
	@GetMapping("/UserDormantAccess")
	public String UserDormant() {
		return "admin/user_dormant_access";
		
	}
	
		//휴면계정 비밀번호 검사
		@PostMapping("/UserDormant/activate")
		public String activateDormantUser(@RequestParam String password,@AuthenticationPrincipal CustomUserDetails cud) {
			
			userEntity user = cud.getUserEntity();
					if(!passwordEncoder.matches(password,user.getPassword())) {
						
						return "redirect:/UserDormantAccess?error";
					}
				user.setRole("ROLE_USER");
				user.setLastActivityAt(LocalDateTime.now());
				userRepository.save(user);
				Authentication newAuth = new UsernamePasswordAuthenticationToken(
						cud,
						null,
						List.of(new SimpleGrantedAuthority("ROLE_USER"))
						);
				SecurityContextHolder.getContext().setAuthentication(newAuth);
				return "redirect:/";
		}
	
	
	//관리자 홈
	@GetMapping("/Admin/AdminHome")
	public String adminHome(Model model) {
		//유저 최근가입자 10명
		List<userEntity> UserList = userRepository.findTop10ByOrderByCreatedAtDesc();
		List<UserDTO> allUserList = UserList.stream()
											.map(UserDTO::new)
											.collect(Collectors.toList());
		
		//유저 최근 리뷰 10개
		List<UserReviewDTO> allUserReviewList = userReviewService.getAllUserReviews();
		model.addAttribute("allUserReview" , allUserReviewList);
		model.addAttribute("allUserList" , allUserList);
		return "admin/admin";
	}
	
	
	//회원관리
	@GetMapping("/Admin/AdminUser")
	//required = false
	public String adminPage(@RequestParam(value = "userEmail" , required = false) String Email , Model model) {
	    List<userEntity> finalUserList;
	    //Email 검색이 없다면
	    if (Email == null || Email.trim().isEmpty()) {
	        finalUserList = userRepository.findAllByOrderByUserIdAsc();
	    } 
	    //Email 검색이 있다면
	    else {
	        finalUserList = userRepository.findByEmailContaining(Email);
	        model.addAttribute("searchEmail", Email);
	        }
	    model.addAttribute("allUser", finalUserList);
	    return "admin/admin_user";
	}
	
		//회원상세
		@GetMapping("Admin/AdminUserDetail/{userId}")
		public String AdminUserDetail(@PathVariable("userId") Long userId , Model model) {
			Optional <userEntity> userDetails = userRepository.findByUserId(userId);
			userEntity entity = userDetails.orElseThrow( () -> new NoSuchElementException("유저ID" + userId + "를찾을수없습니다"));
			UserDTO allUserDetails = new  UserDTO(entity);
			List<UserReviewDTO> allUserReviews = userReviewService.getReviewsByUserId(userId);
			model.addAttribute("allUserReviews",allUserReviews);
			model.addAttribute("userDetails", allUserDetails);
			return "admin/admin_user_detail";
		}
		
		
		//회원 정보 수정
		@PostMapping("Admin/userEdit")	
		public String AdminupdateUser(@RequestParam("userId") Long userId , 
									  @ModelAttribute UserEditDTO userDto,
									  RedirectAttributes re
										) {
		try {
			userService.AdminupdateUser(userId, userDto);
			re.addFlashAttribute("suc" ,"회원수정완료");
			
			System.out.println("넘어온 닉네임: " + userDto.getNickname());
		    System.out.println("넘어온 이메일: " + userDto.getEmail());
			return "redirect:/Admin/AdminUserDetail/" + userId;
		}catch(IllegalArgumentException e) {
			re.addFlashAttribute("userEditError", e.getMessage());
			return "redirect:/Admin/AdminUserDetail/" + userId;
		}
		
	}
		
		//회원상태수정
		@PostMapping("Admin/updateUserStatus")
		public String updateUserStatus(@RequestParam("userId") Long userId , 
									  @RequestParam("status") String newStatus,
									        RedirectAttributes re
									        ) {
			userService.updateUserStatus(userId,newStatus);
			String UserStatus = getStatusName(newStatus);
			re.addFlashAttribute("sucStatus" ,"회원상태" + UserStatus + " 변경되었습니다.");
			return "redirect:/Admin/AdminUserDetail/" + userId;
		}
		private String getStatusName(String roleKey) {
		    return switch (roleKey) {
		        case "ROLE_ADMIN" -> "관리자";
		        case "ROLE_USER" -> "일반회원";
		        case "ROLE_DORMANT" -> "휴면유저";
		        default -> roleKey;
		    };
		}

	//영화 목록
	@GetMapping("/Admin/AdminMovie")
	public String AdminMovie(@RequestParam(value = "title" , required = false) String title  ,Model model) {
			List<movieDTO> moviesList;
		if(title == null || title.trim().isEmpty()) {
			moviesList =  movieService.allMovie();
			moviesList =  userReviewService.applyUserRatings(moviesList);
		}else {
			moviesList =  movieService.movieSearch(title);
			model.addAttribute("searchTitle", title);
		}
		model.addAttribute("moviesList", moviesList);
		return "admin/admin_movie";
	}
	
	
		//영화상세
		@GetMapping("/Admin/AdminMovieDetail/{apiId}")
		public String AdminMovieDetail(@PathVariable("apiId")Long apiId,Model model) {
			movieDTO movieDetail =  movieService.movieDetails(apiId);
			
			List<movieLikeDTO> movieUserLikeList = movieLikeService.useMovieLikes(apiId);
			
			model.addAttribute("moviesDetail", movieDetail);
			model.addAttribute("movieUserLikeList", movieUserLikeList);
			return "admin/admin_movie_detail";
		}
		
		
		
	
	//리뷰관리
	@GetMapping("/Admin/AdminReview")
	public String AdminReview(@RequestParam(value = "reviewUserSearch" , required = false) String RUS ,Model model) {
		List<UserReviewDTO> recentReviews;
		if(RUS == null || RUS.trim().isEmpty()) {
			recentReviews = userReviewService.getAllRecentReviews();
		}else {
			recentReviews = userReviewService.getAllReviewsSearch(RUS);
			model.addAttribute("searchKeyword", RUS);
		}
		model.addAttribute("recentReviews" , recentReviews);
		return "admin/admin_review";
	}
	
	
		//리뷰상세
		@GetMapping("/Admin/AdminReviewDetail/{reviewId}")
		public String AdminReviewDetail(@PathVariable("reviewId") Long reviewId , Model model) {
			Optional<userReviewEntity> UserReviewDetail =  userReviewRepository.findByReviewId(reviewId);
			userReviewEntity entity = UserReviewDetail.orElseThrow(
			        () -> new NoSuchElementException("리뷰 ID [" + reviewId + "]를 찾을 수 없습니다.")
			);
			UserReviewDTO userReviewDTO = UserReviewDTO.fromEntity(entity);
			model.addAttribute("urd" , userReviewDTO);
			return "admin/admin_review_detail";
		}
		
			//회원 리뷰 수정
			@PostMapping("/Admin/userReviewEdit")
			public String userReviewEdit(@ModelAttribute UserReviewDTO reviewDto , RedirectAttributes re) {
				Long reviewId = reviewDto.getReviewId();
				userReviewService.userReviewUpdate(reviewDto);
				re.addFlashAttribute("sucReviewUpdate" , "리뷰번호:" + reviewId +"번 수정 완료");
				return "redirect:/Admin/AdminReviewDetail/" + reviewId;
			}
			
			//회원 리뷰 삭제
			@GetMapping("/Admin/deleteReview{reviewId}")
			public String userReviewDelete(@ModelAttribute UserReviewDTO urd , RedirectAttributes re) {
				Long reviewId = urd.getReviewId();				
				try {
				userReviewService.userReviewDelete(urd);
					re.addFlashAttribute("sucReviewDelete" , "회원 리뷰 번호 :" + reviewId  +"번 삭제완료");
				
				}catch(IllegalArgumentException e){
					re.addFlashAttribute("userReviewdelError", "회원삭제 오류발생"+e.getMessage());
				}
				return "redirect:/Admin/AdminReview";
			}
			
	
	//휴면계정이메일 문의		
	@PostMapping("/inquiry")
	public String handleInquiry(@RequestParam("email")String email,
								@RequestParam("subject") String subject,
								@RequestParam("content") String content,
								RedirectAttributes re) {
		try {
			inquiryService.sendInquiryEmail(email, subject,content);
			re.addFlashAttribute("sucMail","계정문의접수가 완료되었습니다");
		}catch(Exception e) {
			//메일 전송 실패시
			e.printStackTrace();
			re.addFlashAttribute("failMail","메일 전송이 실패했습니다");
		}
		return "redirect:/UserDormant";
	}
}
