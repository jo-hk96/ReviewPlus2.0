package com.review.entity;

import java.io.Serializable;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "USER_REVIEW_LIKE") 
@Data 
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(userReviewLikeEntity.UserReviewLikeId.class) //복합키
public class userReviewLikeEntity {
	
	
	//복합키: 좋아요를 누른 유저
	@Id
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "USER_ID", nullable = false)
	private userEntity userEntity;
	
	//복합키: 좋아요를 받은 리뷰
	@Id
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "REVIEWID", nullable = false)
	private userReviewEntity reviewEntity;
	
	//좋아요 누른 시점 (Optional)
	@Column(name = "REGDATE", updatable = false)
	private LocalDateTime regDate;
	
	//빌더 생성자
	@Builder
	public userReviewLikeEntity(userEntity userEntity, userReviewEntity reviewEntity) {
		this.userEntity = userEntity;
		this.reviewEntity = reviewEntity;
		this.regDate = LocalDateTime.now();
	}
	
	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	@EqualsAndHashCode
	public static class UserReviewLikeId implements Serializable{
		private static final long serialVersionUID = 1L;
		private Long userEntity;
		private Long reviewEntity;
	}
}