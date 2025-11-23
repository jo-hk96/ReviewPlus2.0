package com.review.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewLikeResponse {
	@JsonProperty("isReviewLiked")
	private boolean isReviewLiked;
	private int likeCount;
}
