package com.review.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.review.entity.userEntity;


//사용자 정보 레포지토리
@Repository
public interface UserRepository extends JpaRepository<userEntity, Long> {

	
	List<userEntity> findTop10ByOrderByCreatedAtDesc();
	
	//유저엔티티의 전체 사용자 목록
	List<userEntity> findAllByOrderByUserIdAsc();
	
	//해당하는 UserId 사용자 정보
	Optional<userEntity> findByUserId(Long userId);
	
	//이메일로 사용자 찾기
	Optional<userEntity> findByEmail(String email); 
	
	//닉네임으로 사용자 찾기
	Optional<userEntity> findByNickname(String nickname); 
	
	// 이메일 존재 여부만 boolean으로 확인
    boolean existsByEmail(String email); 
    
    // 닉네임 존재 여부만 boolean으로 확인
    boolean existsByNickname(String nickname);
    
    //회원 검색
    List<userEntity> findByEmailContaining(String email);
	
}
