package com.review.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "MOVIE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class movieEntity {
	  
	
		//기본키 시퀀스
		@SequenceGenerator(
		    name = "MOVIE_SEQ_GENERATOR", 
		    sequenceName = "MOVIE_SEQ",   // 오라클 DB에 미리 생성할 시퀀스 이름
		    allocationSize = 1           
		)
		@GeneratedValue(
		    strategy = GenerationType.SEQUENCE, 
		    generator = "MOVIE_SEQ_GENERATOR"
		)
		
		//DB 영화 번호 ID *기본키
		@Id
		@Column(name = "MOVIE_ID")
	    private Long movieId; 
		
		//API 고유 영화 ID
		@Column(name = "MOVIE_SAVE_ID", unique = true, nullable = false)
		private Long apiId;
		
		@Column(name = "ORIGINAL_TITLE")
	    private String originalTitle; //원제
		
		@Column(name = "MOVIE_TITLE")
		private String title; //제목
		
		@Column(name = "MOVIE_OVERVIEW" , length = 4000)
		private String overview; //줄거리
		
		@Column(name = "MOVIE_POSTER")
		private String posterPath; //포스터
		
		@Column(name = "MOVIE_RELEASEDATE")
		private LocalDate releaseDate; // 개봉날짜
}
