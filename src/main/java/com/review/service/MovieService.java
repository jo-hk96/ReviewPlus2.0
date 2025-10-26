package com.review.service;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.review.DTO.movieDTO;
import com.review.entity.MovieLike;
import com.review.entity.movieEntity;
import com.review.repository.MovieLikeRepository;
import com.review.repository.MovieRepository;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class MovieService {

    
    private final MovieLikeRepository movieLikeRepository;
    private final MovieRepository movieRepository;
    private final TmdbApiService tmdbApiService;
    
    
    
    //좋아요 눌렀을때 영화 정보 저장
    public List<movieDTO> getLikeMoviesByUserId(Long userId){
    	if(userId == null) {
    		Collections.emptyList();    		
    	}
    	//DB에서 좋아요 기록 조회: userId에 해당하는 모든 MovieLike 기록을 조회
    	List<MovieLike> likedRecords = movieLikeRepository.findById_UserId(userId);
    	if(likedRecords.isEmpty()) {
    		return Collections.emptyList();
    	}
    	//좋아요 기록에서 TMDB 영화 ID 목록 추출
    	List<Long> likedTmdbIds = likedRecords.stream()
    			// MovieLike 엔티티의 복합 키(Id)에서 movieId를 추출
    			.map(movieLike -> movieLike.getApiId())
    			.collect(Collectors.toList());
    	//api를 통해 영화 상세 정보 조회 및 매핑
    	//각 ID별로 API를 호출하여 상세 정보를 가져와야 함
    	List<movieDTO> likedMovies = likedTmdbIds.stream()
    			.map(tmdbApiService::getMovieDetail)// (TMDBapiservice에 구현된 상세 정보 함수)
    			.filter(dto -> dto != null)
    			.collect(Collectors.toList());
    	return likedMovies;
    }
    
    
    //저장된 영화 좋아요 목록
    public List<movieDTO> allMovie(){
    	List<movieEntity> MovieEntity = movieRepository.findAll();
    	List<movieDTO> moviedto = MovieEntity.stream()
    							.map(movieDTO::fromEntity)
    							.collect(Collectors.toList());
    	return moviedto;
    }
    
    //영화 검색
    public List<movieDTO> movieSearch(String title){
    	List<movieEntity> MovieSearchTitle = movieRepository.findByTitleContaining(title);
    	List<movieDTO> moviedto = MovieSearchTitle.stream()
    			.map(movieDTO::fromEntity)
    			.collect(Collectors.toList());
    	return moviedto;
    }
    
    //apiId 해당 영화 상세 정보
    public movieDTO movieDetails(Long apiId){
    	return movieRepository.findByApiId(apiId)
    			.map(movieDTO::fromEntity)
    			.orElseThrow(() -> new IllegalArgumentException("해당하는 영화 정보 없음"));
    }
}    
    
		
