package com.review.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Entity
@Table(name = "USER_REVIEW_REPLY") //대댓글테이블
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class userReviewReplyEntity {
	   
    // 댓글 기본키 (REVIEWID와는 별개)
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "REPLY_SEQ_GENERATOR")
    @Column(name = "REPLYID")
    private Long replyId;

    // 댓글은 하나인데 리뷰는 여러 개일 수 없으므로 [다대일]
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "REVIEW_ID") // 외래키 컬럼명
    private userReviewEntity reviewEntity; // Review 엔티티 참조

    // 2. 댓글 작성자 참조	
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    private userEntity userEntity;

    // 3. 댓글 내용
    @Column(name = "COMMENT", nullable = false)
    private String comment;

    // 4. 작성일
    @Builder.Default
    @Column(name = "REGDATE", updatable = false)
    private LocalDateTime regDate = LocalDateTime.now();

    
	
}
