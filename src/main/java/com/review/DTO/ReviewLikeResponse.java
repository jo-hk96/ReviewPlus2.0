package com.review.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewLikeResponse {
	private boolean isLiked;
	private int likeCount;
	
}
