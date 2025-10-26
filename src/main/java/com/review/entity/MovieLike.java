package com.review.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "MOVIE_LIKE")
@Data
public class MovieLike {

	
	
    @EmbeddedId // 복합 키를 사용
    private MovieLikeId id;

    @Column(name = "API_ID" , nullable = false)
    private Long apiId;
    
    @Column(name = "NICKNAME" , nullable = false)
    private String nickname;
    
    //nullable : null 삽입 방지 , updatable :수정 방지
    //현재시간이 자동으로 insert 됨
    @CreationTimestamp 
    @Column(name = "LIKE_AT" ,nullable = false , updatable = false)
    private LocalDateTime likeAt;
    
    @ManyToOne
    @MapsId("userId") // MovieLikeId의 memberId와 매핑
    @JoinColumn(name = "USER_ID")
    private userEntity userEntity;

    @ManyToOne
    @MapsId("movieId") // MovieLikeId의 movieId와 매핑
    @JoinColumn(name = "MOVIE_ID")
    private movieEntity movieEntity;
}