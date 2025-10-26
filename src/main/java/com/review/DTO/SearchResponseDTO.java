package com.review.DTO;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;


@Data
public class SearchResponseDTO {
	// TMDB의 루트 필드
    @JsonProperty("page")
    private int page;
    
    @JsonProperty("total_pages")
    private int totalPages;
    
    @JsonProperty("total_results")
    private int totalResults;

    @JsonProperty("results") 
    private List<movieDTO> results; 
	
}
