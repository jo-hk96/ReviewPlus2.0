package com.review.controller;

import java.io.IOException;
import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.review.DTO.UserDTO;
import com.review.DTO.UserEditDTO;
import com.review.config.CustomUserDetails;
import com.review.repository.UserRepository;
import com.review.service.FileStoreService;
import com.review.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class UserController {

	
	private final UserRepository userRepository;
	private final UserService userService;
	private final FileStoreService fileStoreService;
	
	
	//회원가입
	@PostMapping("/UserJoin")
	public String userJoin(UserDTO userDto , RedirectAttributes re) {
		userService.joinUser(userDto);
		return "redirect:/login";
	}
	
	
	//회원가입 폼으로 이동
	@GetMapping("/UserJoinForm")
	public String userJoinForm() {
		return "user/user_newjoin";
	}

		 // 이메일 중복 체크 텍스트 API
	    @GetMapping("/check/email")
	    @ResponseBody
	    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
	        boolean isDuplicated = userService.checkEmailDuplication(email);
	        return ResponseEntity.ok(isDuplicated);
	    }
	    
	    // 닉네임 중복 체크 텍스트 API 따로 텍스트만 바
	    @GetMapping("/check/nickname")
	    @ResponseBody
	    public ResponseEntity<Boolean> checkNickname(@RequestParam String nickname) {
	        boolean isDuplicated = userService.checkNicknameDuplication(nickname);
	        return ResponseEntity.ok(isDuplicated);
	    }
		
    //프로필 사진 업로드
    @PostMapping("/api/profile/upload")
    @ResponseBody
    public String uploadProfileImage(
        @AuthenticationPrincipal CustomUserDetails customUserDetails, // ⭐️ 로그인된 사용자 정보
        @RequestParam("file") MultipartFile imageFile
    ) throws IOException {
        
        if (customUserDetails == null) {
            // 로그인되지 않은 경우의 처리 (예: 401 Unathorized 반환)
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        
        // ⭐️ CustomUserDetails에서 DB 조회 없이 바로 Long 타입의 userId를 가져옴
        Long currentUserId = customUserDetails.getUserId(); 

        // 파일 저장 처리 (Service 호출)
        String storeFileName = fileStoreService.storeFile(imageFile);
        
        // DB 업데이트
        if(storeFileName != null) {
            userService.updateProfilImage(currentUserId, storeFileName); 
        }
        
        return "프로필 사진이 수정 되었습니다.";
    }
	 
	 //회원 프로필 사진 조회
	 @GetMapping("/api/profile/image/{userId}")
	 @ResponseBody
	 public String getProfileImageUrl(@PathVariable Long userId) {
		 String storedFileName = userService.getProfileImageUrl(userId);
		 return storedFileName;
	 }
	 
	//로그인 메인
	@GetMapping("/UserLoginMain")
	public String userLoginMain() {
		return "user/user_loginMain";
	}
	 
	 //로그인폼
	@GetMapping("/UserLoginForm")
	public String userLoginForm() {
		return "user/user_login";
	}
	
	//마이페이지
	@GetMapping("/UserMypage")
	public String userMypage() {
		return "user/user_mypage";
	}
	
	
	//회원정보수정폼으로 이동
	@GetMapping("/UserEditForm")
	public String userEditForm() {
		return "user/user_edit";
	}
	
	//회원정보수정
	@PostMapping("/UserEdit")
	public String userEdit(
			@AuthenticationPrincipal CustomUserDetails cud, 
			@ModelAttribute UserEditDTO userDto,
			RedirectAttributes re, HttpServletRequest request,HttpServletResponse response) {
		//userid 가져오기
		Long userid = cud.getUserId();
		try {
	        userService.updateUser(userid, userDto);
	        SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
	        //현재 인증 정보와 요청/응답을 사용해 로그아웃 처리
	        //세션 무효화 및 시큐리티 컨텍스트 클리어
	        logoutHandler.logout(request, response, SecurityContextHolder.getContext().getAuthentication());
	        re.addFlashAttribute("sucMsg","수정 하신 정보가 변경되었습니다.다시 로그인 해주세요.");
	        //에러
	    } catch (IllegalArgumentException e) {
	        re.addFlashAttribute("errorMessage", e.getMessage());
	        return "redirect:/UserEditForm";
	    }
	    return "redirect:/UserLoginForm";
	}
		
		
	//회원정보 삭제
	@PostMapping("/UserDelete")
	//@AuthenticationPrincipal 통해 CustomUserDetails에 잇는 세션정보를 불러옴
	public String userDelete(@AuthenticationPrincipal CustomUserDetails cud) {
		Long userId = cud.getUserId();
		userRepository.deleteById(userId);
		return "redirect:/logout";
		
	}
	
	
	//소셜가입 유저 회원수정 페이지
	@GetMapping("/SocialUserEditForm")
	public String SocialUserJoinInfoForm(@AuthenticationPrincipal CustomUserDetails cud, Model model) {
		 model.addAttribute("email" , cud.getUsername());
		 model.addAttribute("pname" , cud.getUserEntity().getPname());
		 model.addAttribute("nickname", cud.getNickname());
		 model.addAttribute("socialType", cud.getUserEntity().getSocialType()); 
		return "user/user_socialEdit";
	}
	
	//소셜 가입 유저 회원 수정
    @PostMapping("/SocialUserEdit")
    public String completeRegistration(@AuthenticationPrincipal CustomUserDetails cud,
                                       @RequestParam String newNickname,
                                       @RequestParam String newBirthdate,
                                       HttpServletRequest request,HttpServletResponse response,
                                       RedirectAttributes re) {
        
        // 현재 로그인된 사용자의 이메일을 가져와서 해당 계정을 찾게 함
        String email = cud.getUsername(); 
        
        
        String socialType = cud.getUserEntity().getSocialType().toString();       
        
        // 서비스 레이어에서 DB 업데이트 처리
        userService.completeRegistration(email, newNickname, newBirthdate);
        
        String socialName = "";
        if("GOOGLE".equalsIgnoreCase(socialType)) {
        	socialName = "구글";
        }else if("NAVER".equalsIgnoreCase(socialType)) {
        	socialName = "네이버";
        }else if("KAKAO".equalsIgnoreCase(socialType)){
        	socialName = "카카오";
        }else {
        	socialName = "소셜";
        }
        
        //로그아웃
        SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
        logoutHandler.logout(request, response, SecurityContextHolder.getContext().getAuthentication());
        re.addFlashAttribute("socialEditMsg",socialName + "회원가입이 완료 되었습니다.");
        // 모든 정보 입력이 완료되었으니 홈으로 이동
        return "redirect:/UserLoginMain";
    }
	
	
}