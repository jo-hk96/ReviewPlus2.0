package com.review.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.review.DTO.UserDTO;
import com.review.DTO.UserEditDTO;
import com.review.config.CustomUserDetails;
import com.review.repository.UserRepository;
import com.review.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Controller
public class UserController {

	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private UserService userService;
	
	
	 // 이메일 중복 체크 API
    @GetMapping("/check/email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        boolean isDuplicated = userService.checkEmailDuplication(email);
        // isDuplicated가 true면 중복, false면 사용 가능
        return ResponseEntity.ok(isDuplicated);
    }

    // 닉네임 중복 체크 API
    @GetMapping("/check/nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestParam String nickname) {
        boolean isDuplicated = userService.checkNicknameDuplication(nickname);
        return ResponseEntity.ok(isDuplicated);
    }
	
	
	//회원가입 폼으로 이동
	@GetMapping("/UserJoinForm")
	public String userJoinForm() {
		return "user/user_newjoin";
	}
	
	
	
	//회원가입
	 @PostMapping("/UserJoin")
	    public String userJoin(UserDTO userDto , RedirectAttributes re) {
		 
		   // 1. 이메일 중복 검사
	        if (userService.checkEmailDuplication(userDto.getEmail())) {
	            re.addFlashAttribute("errorMessage", "이미 사용 중인 이메일입니다.");
	            return "redirect:/UserJoinForm"; // 가입 폼으로 리다이렉트
	        }
	        
	        // 2. 닉네임 중복 검사
	        if (userService.checkNicknameDuplication(userDto.getNickname())) {
	            re.addFlashAttribute("errorMessage", "이미 사용 중인 닉네임입니다.");
	            return "redirect:/UserJoinForm"; // 가입 폼으로 리다이렉트
	        }
	        
	        // 3. 중복이 없으면 회원가입 진행
	        userService.joinUser(userDto);
	        
	        return "redirect:/login"; // 성공 후 로그인 페이지로 이동
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
			//Request, Reponse 를 주입 한다
			RedirectAttributes re, HttpServletRequest request,HttpServletResponse response) {
		
		//userid 가져오기
		Long userid = cud.getUserId();
		try {
	        userService.updateUser(userid, userDto);
	        //로그아웃 핸들러
	        SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
	        //현재 인증 정보와 요청/응답을 사용해 로그아웃 처리
	        // 세션 무효화 및 시큐리티 컨텍스트 클리어
	        logoutHandler.logout(request, response, SecurityContextHolder.getContext().getAuthentication());
	       re.addFlashAttribute("sucMsg","수정 하신 정보가 변경되었습니다.다시 로그인 해주세요.");
	    } catch (IllegalArgumentException e) {
	        re.addFlashAttribute("errorMessage", e.getMessage());
	        return "redirect:/UserEditForm";  // 수정 폼으로 다시 이동
	    }
	    return "redirect:/UserLoginForm";  // 정상 처리 후 페이지 이동
	}
		
		
	//회원정보 삭제
	@PostMapping("/UserDelete")
	//@AuthenticationPrincipal 통해 CustomUserDetails에 잇는 세션정보를 불러옴
	public String userDelete(@AuthenticationPrincipal CustomUserDetails cud) {
		Long userId = cud.getUserId();
		userRepository.deleteById(userId);
		return "redirect:/logout";
		
	}
	
	
	
	//소셜 로그인시 실제이름,이메일을 들고 user_newjoin 폼으로 이동
	@GetMapping("/SocialUserEditForm")
	public String SocialUserJoinInfoForm(@AuthenticationPrincipal CustomUserDetails cud, Model model) {
		
		 model.addAttribute("email" , cud.getUsername());
		 model.addAttribute("pname" , cud.getUserEntity().getPname());
		 model.addAttribute("nickname", cud.getNickname());
		 model.addAttribute("socialType", cud.getUserEntity().getSocialType()); 
		    
		return "user/user_socialEdit";
	}
	
	
	  //폼 데이터 받아서 저장하고 플래그 false로 변경
    @PostMapping("/SocialUserEdit")
    public String completeRegistration(@AuthenticationPrincipal CustomUserDetails cud,
                                       @RequestParam String newNickname,
                                       @RequestParam String newBirthdate,
                                       HttpServletRequest request,HttpServletResponse response,
                                       RedirectAttributes re) {
        
        // 현재 로그인된 사용자의 이메일을 가져와서 해당 계정을 찾게 함
        String email = cud.getUsername(); 
        
        // 서비스 레이어에서 DB 업데이트 처리
        userService.completeRegistration(email, newNickname, newBirthdate);
        
        SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
        //현재 인증 정보와 요청/응답을 사용해 로그아웃 처리
        // 세션 무효화 및 시큐리티 컨텍스트 클리어
        logoutHandler.logout(request, response, SecurityContextHolder.getContext().getAuthentication());
        re.addFlashAttribute("socialEditMsg","구글 회원가입이 완료 되었습니다.");
        // 모든 정보 입력이 완료되었으니 홈으로 이동
        return "redirect:/UserLoginMain";
    }
	
	
}