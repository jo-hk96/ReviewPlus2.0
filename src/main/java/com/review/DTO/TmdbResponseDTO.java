package com.review.DTO;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmdbResponseDTO {
	
	 	@JsonProperty("total_pages")
	    private int total_pages; 
	    
	    @JsonProperty("total_results")
	    private int total_results;
	    
	    @JsonProperty("results")
	    private List<movieDTO> results;
	    
	    
	
}
