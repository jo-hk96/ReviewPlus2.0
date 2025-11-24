    
    
    
    
    
    //함수정의
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 현재 URL 경로를 가져옴 (예: "/detail/1007734")
        const path = window.location.pathname; 

        // 2. 경로를 '/' 기준으로 쪼개고, 빈 문자열을 제거해서 배열을 깔끔하게 만듦
        //["detail", "1007734"]
        const cleanParts = path.split('/').filter(Boolean); 

        let movieId = null;

        if (cleanParts.length > 0) {
            const lastPart = cleanParts[cleanParts.length - 1];
            // 마지막 요소가 숫자인지 확인해서 ID로 확정
            if (!isNaN(lastPart)) { 
                movieId = lastPart;
            }
        }
        
        const detailContainer = document.getElementById('movie-detail-container');
        if (movieId) {
            console.log("추출된 영화 ID:", movieId);
            fetchMovieDetail(movieId); 
        } else {
            console.error("URL에서 유효한 영화 ID를 추출하지 못했습니다.");
            detailContainer.innerHTML = "영화 ID를 찾을 수 없습니다.";
        }
    });
    
    
    
      function fetchMovieDetail(movieId) {
			    const options = {
			        method: 'GET',
			        headers: {
			            accept: 'application/json',
			            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyYmEwZmM1NDdkZGI5ZDA3ZGQ0ODhkZmRmOTEzZmZiZCIsIm5iZiI6MTc1ODc1ODkyMy44MzUsInN1YiI6IjY4ZDQ4ODBiNTRjYWJjY2VjYzRhOTFjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xDFPD2BRvK_XT3ITjx-q9u31nL4PJ-Y0w8MsLeNgiyg' 
			        }
			    };
			    
			    // 영화 상세 정보 요청 URL
			    const detailUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=ko-KR`;
			    // 출연진/제작진 정보 요청 URL
			    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=ko-KR`;
			 	//트레일러 URL
			 	const videosUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=ko-KR`;
			 	//영화 이미지 주소
			 	const stillCutUrl = `https://api.themoviedb.org/3/movie/${movieId}/images`;
			 	
			 	
			 	const ourRatingUrl = `/api/detail/${movieId}`; 
			    // Promise.all로 두 요청을 병렬로 처리
			     Promise.all([
			        fetch(detailUrl, options).then(res => res.json()), // TMDB 상세
			        fetch(creditsUrl, options).then(res => res.json()), // TMDB 크레딧
			        fetch(videosUrl, options).then(res => res.json()),
			        fetch(stillCutUrl, options).then(res => res.json()),
			        fetch(ourRatingUrl).then(res => res.json()) // 리뷰플러스 사이트 평점
			    ])
			    .then(([detailData, creditsData, videosData,stillCutData, ourData]) => {
						//응답 배열 순서 detail, credits, videos, ourData
        				const averageRatingValue  = ourData.averageRating;
        				
				        const combinedData = {
				            ...detailData, 
				            credits: creditsData, //크레딧
				            videos: videosData.results, //비디오
				            stillCut: stillCutData,
				            ourAverageRating: averageRatingValue  
				        };
			        //combinedData 변수를 renderMovieDetail 함수에 전달
			        renderMovieDetail(combinedData); 
			    })
			    .catch(err => {
			        console.error("API 호출 실패:", err);
			        document.getElementById('movie-detail-container').innerHTML = `
			            <p>영화 정보를 불러오는 데 실패했습니다. (${err.message})</p>
			        `;
			    });
	}
    
    
    
    // 3. 영화 상세 정보를 HTML로 표시하는 함수
	function renderMovieDetail(data) {
	    const detailContainer = document.getElementById('movie-detail-container');
	    const basePosterUrl = "https://image.tmdb.org/t/p/w500"; 
	    const baseBackdropUrl = "https://image.tmdb.org/t/p/w1280"; 
	    
	    //장르
	    const genres = data.genres.map(g => g.name).join(', ') || '정보 없음';
	    
	    //기획,제작사
	    const production_companies = data.production_companies.map(p => p.name).join(', ');
	    
	    //영화 뒷배경
	    const backdropImage = data.backdrop_path 
	        ? `${baseBackdropUrl}${data.backdrop_path}` 
	        : '';
		//제작국가
		const production_countries = data.production_countries.map(co => co.name).join(', ');
	    
	    // 1. 감독 정보 추출
	    // job이 'Director'인 crew만 찾는다
	    const directors = data.credits.crew.filter(c => c.job === 'Director');
	
	
	    // 2. 주연 배우 5명 추출 (cast 배열의 order는 출연 비중에 따라 정렬됨)
	    // 최대 5명만 잘라서 사용한다.
	    const topCast = data.credits.cast.slice(0, 5); 
	    // 주연 배우들을 HTML 문자열로 만든다.
	    const castHTML = topCast.map(actor => `
	        <div style="text-align: center; width: 100px;">
	            <img src="${basePosterUrl}${actor.profile_path}"alt="${actor.name}" 
	                 style="width: 100px; height: 150px; object-fit: cover; border-radius: 8px;">
	            <p style="margin: 5px 0 0; font-size: 0.9em; color:white;"><b>${actor.name}</b></p>
	            <p style="margin: 0; font-size: 0.8em; color: #777;">(${actor.character})</p>
	        </div>
	    `).join('');
	    

		//문자열로 찾아낸 감독들을 html형식으로 보여줌
	    const directorHTML = directors.map(directors => `
	        <div style="text-align: center; width: 100px;">
	            <img src="${basePosterUrl}${directors.profile_path}"alt="${directors.name}" 
	                 style="width: 100px; height: 150px; object-fit: cover; border-radius: 8px;">
	            <p style="margin: 5px 0 0; font-size: 0.9em; color: white;"><b>${directors.name}</b></p>
	            <p style="margin: 0; font-size: 0.8em; color: #777;">(${directors.job})</p>
	        </div>
	    `).join('');
	    
	    //비디오 트레일러 HTML 처리 로직 
	    let trailerHTML = '';
	    
	    //data.videos 는 fetchMovieDetail에서 videosData.results로 저장된 배열
	    if(data.videos && data.videos.length > 0){
			const trailer = data.videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
			
			if(trailer){
				const youtubeEmbedUrl = `https://www.youtube.com/embed/${trailer.key}?rel=0&amp;showinfo=0&amp;modestbranding=1`;
				
				trailerHTML = `
					<h2 style="color:white; margin-top: 40px;">예고편</h2>
	                <div style="margin: 20px 0;
	                	 width:92%;
	                	 max-width: 650px;
	                	 padding:15px;
	                	 ">
	                    <iframe
	                        width="100%"
	                        src="${youtubeEmbedUrl}"
	                        frameborder="0" 
	                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
	                        allowfullscreen 
	                        style="border-radius: 10px; height:100%; min-height:450px;">
	                    </iframe>
	                </div>
				`;
			}
		}
		const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w1280"; 

		const backdrops = data.stillCut.backdrops || []; 
		const limitedStills = backdrops.slice(0, 10); 
		
		const stillCutItemsHtml = limitedStills.map(backdrop => {
		    const imageUrl = BASE_IMAGE_URL + backdrop.file_path;
		    
		    return `
		        <div class="stillcut-item">
		            <img src="${imageUrl}" alt="영화 스틸컷" class="stillcut-image">
		        </div>
		    `; 
		}).join(''); 
		
		const imageGalleryHTML = `
		    <h2 style="color:white; margin-top: 40px; padding: 0 15px;">스틸컷</h2>
		    <div class="stillcut-gallery-wrapper" style="display: flex; gap: 10px; overflow-x: auto; padding: 15px;">
		        ${stillCutItemsHtml}
		    </div>
		`;
		
		
		
		
	    // ----------------------------------------------------
	   const detailHtml = `
	         <div class="backdrop-header" 
	             style="background-image: url('${backdropImage}');
	             		height:100%;
	                    min-height:500px;
	                    background-size: cover; 
	                    background-position: center;
	                    display: flex; 
	                    align-items: flex-end; 
	                    padding: 20px;
	                    color: white;
	                    text-shadow: 1px 1px 5px rgba(0,0,0,0.8);
	                    ${backdropImage}">
	            <header>
	                <h1>${data.title}</h1>
	                <p>(${data.original_title})</p>
	            </header>
	        </div>
	
	        <section class = "movie-info-section">
	            <img id="MoviePosterMain" src="${basePosterUrl}${data.poster_path}" alt="${data.title} 포스터">
	            <div class = "info-details">
	                <h2 style = "color:white;">줄거리</h2>
	                <p>${data.overview || '줄거리 정보 없음'}</p>
	                <h3 style="color: white;">기본 정보</h3>
	                <p><b>개봉일:</b> ${data.release_date}</p>
	                <p><b>러닝타임:</b> ${data.runtime}분</p>
	                <p><b>제작국가:</b> ${production_countries}</p>
	                <p><b>장르:</b> ${genres}</p>
	                <p><b>기획/제작:</b> ${production_companies}</p>
	                <p><b>태그라인:</b> <em>${data.tagline || '태그 정보 없음'}</em></p>
	                <p><b>TMDB평점:⭐</b>  ${data.vote_average.toFixed(1)} / 10</p>
	                <p id="average-rating-display"></p>
	                <div id="like-button-placeholder"></div>
	            </div>
	        </section>
	        
	        ${trailerHTML}
	        ${imageGalleryHTML}
	        
	        <hr style="margin: 40px 0;">
	        <h2 style="color:white">감독 / 주요배우</h2>
	        <div style="display: flex; gap: 15px; overflow-x: auto; padding: 15px;">
	            ${directorHTML} ${castHTML || '<p>출연진 정보가 없습니다.</p>'}
	        </div>
	    `;
	    
	    detailContainer.innerHTML = detailHtml; //수정된 템플릿 리터널을 html에 대입
		//좋아요 버튼을 새로운 위치로 이동
		const likeButtonSection = document.querySelector('.movie-actions'); // Thymeleaf가 만든 전체 좋아요 섹션
		const placeholder = document.getElementById('like-button-placeholder'); // JS 템플릿 리터럴에 만든 새 영역
		
		if (likeButtonSection && placeholder) {
		    // 템플릿 리터럴이 만든 새 영역 안으로 HTML에 이미 존재하는 좋아요 섹션 이동
		    placeholder.appendChild(likeButtonSection);
		}
	    const averageRatingValue = data.ourAverageRating || 0;
	    displayAverageRating(averageRatingValue);
	}

    
    	//영화 상세 정보 리뷰플러스 평점 HTML 
		function displayAverageRating(rating){
			const displayElement = document.getElementById('average-rating-display');
			
			
			//average-rating-display 가 없 	을경우
			if(!displayElement){
				console.error("평균 별점을 표시할 요소를 찾을 수 없습니다 average-rating-display")
				return;
			}
			
			//리뷰가없거나 점수가 0일경우
			   if (rating <= 0 || isNaN(rating)) {
	            displayElement.innerHTML = `
	                <div style="padding: 10px; border: 1px solid; width:120px; border-radius: 15px;">
	                    평점이 없습니다.
	                </div>`;
	            return;
	        }
			    // 별점 문자열 생성 로직 (정수 별만 표시)
		        // Math.floor(4.5) -> 4개의 ⭐
		        const fullStars = Math.floor(rating);
		        const starString = '⭐'.repeat(fullStars);
		        
		        // 최종 HTML 내용을 구성하여 삽입
		        displayElement.innerHTML = `
		            <div style="display: flex; align-items: center; gap: 10px;">
		                <strong>리뷰플러스 평균 별점:</strong>
		                <span style=" color: gold;">
		                    ${starString}
		                </span>
		                <span>
		                    (${rating.toFixed(1)} / 5점)
		                </span>
		            </div>
		        `;
		    }
    
    
