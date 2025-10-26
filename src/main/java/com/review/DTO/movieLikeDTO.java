package com.review.DTO;

import java.time.LocalDateTime;

import com.review.entity.MovieLike;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class movieLikeDTO {
	    private Long apiId;
	    private String nickname;
	    private LocalDateTime likeAt;
	    private Long userId;
	    private Long movieId;
	    
	    
	    
	    //entity 를 DTO로 만들어줌
	    public static movieLikeDTO fromEntity(MovieLike entity) {
	    	return movieLikeDTO.builder()
	    			.apiId(entity.getApiId())
	    			.nickname(entity.getNickname())
	    			.likeAt(entity.getLikeAt())
	    			.userId(entity.getId().getUserId())
	    			.movieId(entity.getId().getMovieId())
	    			.build();
	    	
	    }
	
}
