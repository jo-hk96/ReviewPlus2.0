package com.review.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.review.entity.userEntity;
import com.review.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DormantUserService {
	private final UserRepository userRepository;
	private final long DORMANT_DURATION_MINUTES = 5;
	
	
	//정해진 시간에 로직 실행
	@Scheduled(cron = "0 * * * * *")
	@Transactional
	public void convertToDormantUsers() {
			//LocalDateTime dormantThreshold = LocalDateTime.now().minusDays(DORMANT_DURATION_DAYS);
			LocalDateTime dormantThreshold = LocalDateTime.now().minusMinutes(DORMANT_DURATION_MINUTES);
			//일정 시간 동안 활동이 없고 현제 ROLE_DORMANT 가 아닌 사용자들 조회
			List<userEntity> usersToDormant = userRepository.findDormantUsers(dormantThreshold,"ROLE_DORMANT");
		     List<userEntity> userToSave = new ArrayList<>();
		for(userEntity user : usersToDormant) {
			if("ROLE_ADMIN".equals(user.getRole())){
			continue;
		}
			user.setRole("ROLE_DORMANT");
		userRepository.saveAll(userToSave);
		}
		System.out.println("휴면 계정" + userToSave.size() +  "건 전환 완료.");
		}
}