package com.review.service;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



import com.review.DTO.UserDTO;
import com.review.DTO.UserEditDTO;
import com.review.config.CustomUserDetails;
import com.review.entity.userEntity;
import com.review.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements UserDetailsService {
	private final PasswordEncoder passwordEncoder;
	private final UserRepository userRepository;
	
	//전체 가입자 수
	public long getTotalJoinCount() {
		return userRepository.count();
	}
	
	//전체 휴면계정 수
	public long getDormantUserCount() {
		return userRepository.countByRole("ROLE_DORMANT");
	}
	
	//회원 프로필 사진 조회
	@Transactional(readOnly = true)
	public String getProfileImageUrl(Long userId) {
		userEntity user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 ID입니다:" + userId));
		return user.getProfileImageUrl();
	}
	
	//회원 프로필 이미지 URL 업데이트
	@Transactional 
	public void updateProfilImage(Long userId, String storeFileName) {
		userEntity user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 ID입니다:" + userId));
		user.updateProfileImage(storeFileName);
	}
	
	
	
	//userId
	public userEntity findById(Long userId) {
			return userRepository.findById(userId).orElseThrow(null);
		}
	
	
	
	//이메일 중복 검사
		 public boolean checkEmailDuplication(String email) {
		        return userRepository.existsByEmail(email);
		    }
		
	 //닉네임 중복검사
	 public boolean checkNicknameDuplication(String nickname) {
	        return userRepository.existsByNickname(nickname);
	    }
	
	
	
	
	
    // 사용자 이름(email)으로 사용자 정보를 가져오는 메소드
	@Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        userEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email + "을(를) 찾을 수 없습니다."));
        return new CustomUserDetails(user); 
    }
	
	//유저 회원가입
	public void joinUser(UserDTO userDto) {
	    // 1. DTO를 UserEntity로 변환
	    userEntity userEntity = userDto.toEntity(); 
	    // 2. 비밀번호 암호화
	    String encodedPassword = passwordEncoder.encode(userEntity.getPassword());
	    userEntity.setPassword(encodedPassword);
	    //admin 계정 부여
	    if ("1234@1234.com".equals(userEntity.getEmail())) {
	        // 특정 이메일 주소에만 ROLE_ADMIN을 부여
	        userEntity.setRole("ROLE_ADMIN"); //컬럼에 입력 
	        System.out.println("관리자 계정 생성: " + userEntity.getEmail());
	    } else {
	        // 그 외 모든 계정은 기본 ROLE_USER를 부여
	        userEntity.setRole("ROLE_USER"); 
	    }
	    // 4. DB에 저장
	    userRepository.save(userEntity);
	}
	
	
	//회원수정
	@Transactional
	public void updateUser(Long userId , UserEditDTO userDto) {
		userEntity user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
		//사용자가 입력한 현재비밀번호와 DB에 저장된 비밀번호를 비교
		if(!passwordEncoder.matches(userDto.getCurrentPassword(),user.getPassword())) {
			throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
		}
		
	
		//닉네임이 null이 아니거나 비어있지 않다면 수정
		String newNickname = userDto.getNickname();
	    if(newNickname != null && !newNickname.isEmpty()) {
	        // 현재 닉네임과 다르고, DB에 이미 존재하면 예외 발생
	        if(!newNickname.equals(user.getNickname()) && checkNicknameDuplication(newNickname)) {
	            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
	        }
	        user.setNickname(newNickname);
	    }
	    
	    
	    //생년월일 수정 처리
	    String newBirthdate = userDto.getBirthdate();
	    if (newBirthdate != null) {
	        user.setBirthdate(newBirthdate);
	    }
	    
	    
		//새 비밀번호가 null이 아니거나 비어 있지 않다면
		String newPwd = userDto.getNewPassword();
		String confirmPwd = userDto.getConfirmNewPassword();
			if(newPwd != null && !newPwd.isEmpty()) {
				if (newPwd.length() < 8) {
			        throw new IllegalArgumentException("비밀번호는 최소 8자 이상이어야 합니다.");
			    }
				if (confirmPwd == null || !newPwd.equals(confirmPwd)) {
					throw new IllegalArgumentException("비밀번호가 다릅니다.");
				}
				// 새 비밀번호가 현재 비밀번호와 같으면 예외 발생
		        if(passwordEncoder.matches(newPwd, user.getPassword())) {
		            throw new IllegalArgumentException("현재 비밀번호와 같습니다.");
		        }
				//새비밀번호 암호화
				String encpwd = passwordEncoder.encode(newPwd);
				//암호화한 비번 넣기
				user.setPassword(encpwd);
			}

		}
	
	
	
	
	
		//관리자 회원 정보 수정
		@Transactional 
		public void AdminupdateUser(Long userId , UserEditDTO userDto) {
			userEntity user = userRepository.findById(userId)
					.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
				//닉네임이 null이 아니거나 비어있지 않다면 수정
				String newNickname = userDto.getNickname();
			    if(newNickname != null && !newNickname.isEmpty()) {
			        // 현재 닉네임과 다르고, DB에 이미 존재하면 예외 발생
			        if(!newNickname.equals(user.getNickname()) && checkNicknameDuplication(newNickname)) {
			            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
			        }
			        user.setNickname(newNickname);
			    }
			    //이메일 수정 처리
			    String newEmail = userDto.getEmail();
			    if(newEmail != null) {
			    	user.setEmail(newEmail);
			    }
			    //이름 수정 처리
			    String newPname = userDto.getPname();
			    if (newPname != null) {
			        user.setPname(newPname);
			    }	
			    //생년월일 수정 처리
			    String newBirthdate = userDto.getBirthdate();
			    if (newBirthdate != null) {
			        user.setBirthdate(newBirthdate);
			    }
		}
		
		
		
		//관리자 회원 상태 수정
		//자동으로 save해줌
		@Transactional 
		public void updateUserStatus(Long userId , String newStatus) {
			userEntity user = userRepository.findById(userId)
							//IllegalArgumentException 유효하지않는 입력
				.orElseThrow(() -> new IllegalArgumentException("존재하지않는 사용자입니다."));
			user.setRole(newStatus); 
		}

		
		
	   @Transactional
	    public void completeRegistration(String email, String newNickname, String newBirthdate) {
	        userEntity user = userRepository.findByEmail(email)
	                              .orElseThrow(() -> new IllegalArgumentException ("로그인된 사용자를 찾을 수 없습니다."));
	        user.setNickname(newNickname); // userEntity의 set메서드나 update메서드 필요
	        user.setBirthdate(newBirthdate); 
	        // 필수 정보 입력 상태를 '완료'로 변경 set으로 가져올때는 함수이름에서 Is빼고 가져옴
	        user.setRequiredInfoMissing(false); 
	        // userEntity의 변경된 필드들을 저장 (JPA Dirty Checking으로 자동 저장되거나 save 호출)
	        userRepository.save(user); 
	    }
	
	
	
	    
}
	
