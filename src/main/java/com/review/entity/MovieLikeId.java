package com.review.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieLikeId implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
    private Long userId;
    private Long movieId;
}