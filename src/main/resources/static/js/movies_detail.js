    
    
    
    
    
    //함수정의
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 현재 URL 경로를 가져옴 (예: "/detail/1007734")
        const path = window.location.pathname; 

        // 2. 경로를 '/' 기준으로 쪼개고, 빈 문자열을 제거해서 배열을 깔끔하게 만듦
        // 예: ["detail", "1007734"]
        const cleanParts = path.split('/').filter(Boolean); 

        let movieId = null;

        // 3. ID는 배열의 '마지막' 요소에 있을 것으로 예상
        if (cleanParts.length > 0) {
            const lastPart = cleanParts[cleanParts.length - 1];
            // 마지막 요소가 숫자인지 확인해서 ID로 확정
            if (!isNaN(lastPart)) { 
                movieId = lastPart;
            }
        }
        
        const detailContainer = document.getElementById('movie-detail-container');

        // 4. 추출된 ID로 API 호출
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
			 	const ourRatingUrl = `/api/detail/${movieId}`; 
			    // Promise.all로 두 요청을 병렬로 처리
			     Promise.all([
		        fetch(detailUrl, options).then(res => res.json()), // 0: TMDB 상세
		        fetch(creditsUrl, options).then(res => res.json()), // 1: TMDB 크레딧
		        // 네 서버 API는 options 없이 호출 (토큰 필요 없음)
		        fetch(ourRatingUrl).then(res => res.json()) // 2: 네 서버 평점
		        
			    ])
			    .then(([detailData, creditsData, ourData]) => { 
        				
        				const averageRatingValue  = ourData.averageRating;
				        // ourRatingValue는 이제 Map이 아니라 순수한 숫자 값(double)입니다.
				        const combinedData = {
				            ...detailData, 
				            credits: creditsData,
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
	//수정된 renderMovieDetail 함수 (감독, 배우 추가 로직 포함)
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
	            <p style="margin: 5px 0 0; font-size: 0.9em;"><strong>${actor.name}</strong></p>
	            <p style="margin: 0; font-size: 0.8em; color: #777;">(${actor.character})</p>
	        </div>
	    `).join('');
	    

		//문자열로 찾아낸 감독들을 html형식으로 보여줌
	    const directorHTML = directors.map(directors => `
	        <div style="text-align: center; width: 100px;">
	            <img src="${basePosterUrl}${directors.profile_path}"alt="${directors.name}" 
	                 style="width: 100px; height: 150px; object-fit: cover; border-radius: 8px;">
	            <p style="margin: 5px 0 0; font-size: 0.9em;"><strong>${directors.name}</strong></p>
	            <p style="margin: 0; font-size: 0.8em; color: #777;">(${directors.job})</p>
	        </div>
	    `).join('');
	    
	    // ----------------------------------------------------
	   const detailHtml = `
	         <div class="backdrop-header" 
	             style="background-image: url('${backdropImage}'); 
	                    height: 600px; 
	                    background-size: cover; 
	                    background-position: center;
	                    display: flex; align-items: flex-end; padding: 20px; 
	                    color: white; text-shadow: 1px 1px 5px rgba(0,0,0,0.8);
	                    ${backdropImage}">
	            <header>
	                <h1>${data.title}</h1>
	                <p>(${data.original_title})</p>
	            </header>
	        </div>
	
	        <section style="display: flex; gap: 30px; margin-top: 20px; padding: 15px;">
	            <img src="${basePosterUrl}${data.poster_path}" alt="${data.title} 포스터" style="width: 400px; border-radius: 8px;">
	            <div style="flex-grow: 1;">
	                <h2>줄거리</h2>
	                <p>${data.overview || '줄거리 정보 없음'}</p>
	                
	                <h3>기본 정보</h3>
	                <p><strong>개봉일:</strong> ${data.release_date}</p>
	                <p><strong>러닝타임:</strong> ${data.runtime}분</p>
	                <p><strong>제작국가:</strong> ${production_countries}</p>
	                <p><strong>장르:</strong> ${genres}</p>
	                <p><strong>기획/제작:</strong> ${production_companies}</p>
	                <p><strong>태그라인:</strong> <em>${data.tagline || '태그 정보 없음'}</em></p>
	                <p><strong>외부평점:⭐</strong>  ${data.vote_average.toFixed(1)} / 10</p>
	                <p id="average-rating-display"></p>
	                <div id="like-button-placeholder"></div>
	            </div>
	        </section>
	        
	        <hr style="margin: 40px 0;">
	        <h2>감독 / 주요배우</h2>
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
	                <div style="padding: 10px; border: 1px dashed #ccc;">
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
    
    
