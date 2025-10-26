package com.review.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.review.DTO.movieDTO;
import com.review.DTO.movieLikeDTO;
import com.review.entity.MovieLike;
import com.review.entity.MovieLikeId;
import com.review.entity.movieEntity;
import com.review.entity.userEntity;
import com.review.repository.MovieLikeRepository;
import com.review.repository.MovieRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovieLikeService {
	
	
	private final MovieRepository movieRepository;
	private final UserService userService;
	//apiID 상세정보를 가져오기위한 service
	private final TmdbApiService tmdbApiService;
	private final MovieLikeRepository movieLikeRepository; 
	
	
	
	
	//영화 좋아요 로직
	public boolean toggleLike(Long userId , Long apiId) {
		
		//MovieEntity에 정보가 없다면 api 호출후 DB에 저장
		movieEntity movieEntity = movieRepository.findByApiId(apiId).orElseGet(() ->{
			return saveMovieFromApi(apiId);
			
		});
		
		//userEntity 확보
		userEntity userEntity = userService.findById(userId);
		
		//좋아요 복합 키 생성:DB에 저장된 MovieEntity의 PK를 사용
		Long dbMovieId = movieEntity.getMovieId();
		MovieLikeId likeId = new MovieLikeId(userId, dbMovieId);
		
		Optional<MovieLike> existingLike = movieLikeRepository.findById(likeId);
		
		if(existingLike.isPresent()) {
			//좋아요 했으면 : Movie_like DB에서 삭제
			movieLikeRepository.delete(existingLike.get());
			return false; //좋아요 취소됨
		}else {
			//좋아요 하지 않았으면 : MovieLike 엔티티 DB에 저장
			MovieLike newLike = new MovieLike();
			newLike.setApiId(apiId);
			newLike.setNickname(userEntity.getNickname());
			newLike.setId(likeId);
			newLike.setUserEntity(userEntity);
			newLike.setMovieEntity(movieEntity);
			movieLikeRepository.save(newLike);//DB에 저장됨
			return true; //좋아요 설정됨
			
		}
		
	}
	
	
	@Transactional
	private movieEntity saveMovieFromApi(Long apiId) {
		
		 // 1. TMDB API 호출 (TmdbApiService 사용)
	    movieDTO apiData = tmdbApiService.getMovieDetail(apiId);
	    if (apiData == null) {
	        // API에서 영화 정보를 찾지 못하면 예외 처리
	        throw new RuntimeException("TMDB API에서 ID [" + apiId + "]에 대한 정보를 찾을 수 없습니다.");
	    }
	    
	    // 2. DTO -> Entity 변환
	    movieEntity newMovie = new movieEntity();
	    newMovie.setApiId(apiId); // TMDB ID
	    newMovie.setTitle(apiData.getTitle());
	    newMovie.setOriginalTitle(apiData.getOriginalTitle());
	    newMovie.setOverview(apiData.getOverview());
	    newMovie.setPosterPath(apiData.getPosterPath());
	    newMovie.setReleaseDate(apiData.getReleaseDate());
	    
	    // 3. MovieRepository를 사용하여 DB에 저장
	    return movieRepository.save(newMovie); 
	}
	
	
	
	//사용자ID ,영화 API ID를 받아서 해당 MovieLike 기록이 DB에 존재하는지 확인
	public boolean getLikeStatus(Long userId, Long apiId) {
	    
	    //MovieEntity 확보 (DB에 있어야만 좋아요를 누를 수 있음)
	    // MovieRepository를 사용해야 합니다.
	    movieEntity movieEntity = movieRepository.findByApiId(apiId).orElse(null);
	    
	    // DB에 영화 정보 자체가 없으면, 좋아요를 눌렀을 리가 없으니 false 반환
	    if (movieEntity == null) {
	        return false;
	    }

	    //좋아요 복합 키 생성
	    Long dbMovieId = movieEntity.getMovieId();
	    MovieLikeId likeId = new MovieLikeId(userId, dbMovieId);

	    //MovieLikeRepository를 사용해 해당 복합 키가 DB에 존재하는지 확인
	    return movieLikeRepository.existsById(likeId); 
	}

    	
		//apiId해당 좋아요 목록
		public List<movieLikeDTO> useMovieLikes(Long apiId) {
			List<MovieLike> movieLikeUser = movieLikeRepository.findAllByApiId(apiId);
			return movieLikeUser.stream()
					.map(movieLikeDTO::fromEntity)
					.collect(Collectors.toList());
		}

}
