        let currentPage = 1;
		let isLoading = false;
		let totalPages = 500;
		let allMovies = [];
		
		const movieListContainer = document.getElementById('movie-list');
		const prevBtn = document.getElementById('prev-btn');
		const nextBtn = document.getElementById('next-btn');
		
		// 이 함수는 이제 스크롤 방식에서는 사용되지 않지만, 기존 항목 크기 계산용으로 유지
		function getItemsPerView() {
			  const width = window.innerWidth;
			  if (width <= 400) return 1;
			  if (width <= 600) return 2;
			  if (width <= 900) return 3;
			  if (width <= 1200) return 4;
			  return 5;
			}
		
		
		// 숫자에 맞게 별을 그려주는 함수 (유지)
		function generateOurStars(rating5) {
	    if (rating5 === null || rating5 === undefined || rating5 === 0) return 'N/A';
	    const fullStars = Math.floor(rating5);
	    return '⭐'.repeat(fullStars);
		}
		
		
		function renderMovies(newMovies) {
		  newMovies.forEach(movie => {
		    const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
		    
		    
		    //json 영화 정보에 있는 id 필드(영화 고유 ID)를 들고와 변수에 담음
		    const movieId = movie.id; 
		    //영화 평균 별점을 들고옴
		   	const ourRating = movie.ourAverageRating; 
		    //영화 카드 눌럿을때 movieId를 가지고 Api 컨트롤러로 보냄
    		const detailUrl = `/detail/${movieId}`;
		    const scoreText = ourRating > 0 ? ourRating.toFixed(1) : 'N/A';
		    const userStars = generateOurStars(ourRating);
		    const card = document.createElement('div');
		    card.className = 'movie-topRateCard';
		    card.innerHTML = `
		      <a href="${detailUrl}" class="movie-link">
			      <img src="${posterUrl}" alt="${movie.title} 포스터">
				      <div class="movie-info">
					        <h2 style = "color:white;">${movie.title}</h2>
					        ${scoreText !== 'N/A' ? `<h2>${userStars}${scoreText}</h2>` : `<h2>평점없음</h2>`}
					        <p>외부평점: ${movie.vote_average.toFixed(1)} / 10</p>
					        <p>최초개봉일: ${movie.release_date}</p>
				      </div>
		      </a>
		    `;
		    movieListContainer.appendChild(card);
		  });
		
		  // ❌ updateSlidePosition() 제거
		  // 새 영화 추가 후 버튼 상태 업데이트만 호출
		  updateButtonStates();
		}
		
		
		// 🟢 스크롤 기반에서는 위치 업데이트 대신 버튼 활성화/비활성화만 관리
		function updateButtonStates() {
		  // 스크롤 방식으로 바뀌었으므로 'disabled' 로직이 단순화됩니다.
		  // 스크롤바가 끝에 도달했는지 여부는 스크롤 이벤트 핸들러가 처리합니다.
		
		  const canScrollLeft = movieListContainer.scrollLeft > 0;
		  const scrollMax = movieListContainer.scrollWidth - movieListContainer.clientWidth;
		  const canScrollRight = movieListContainer.scrollLeft < scrollMax;
		  
		  prevBtn.disabled = !canScrollLeft || isLoading;
		  nextBtn.disabled = !canScrollRight || isLoading;
		}
		
		async function loadMovies(page) {
		  if (isLoading || page > totalPages) return;
		  isLoading = true;
		  document.getElementById('loading-indicator').style.display = 'block';
		
			const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyYmEwZmM1NDdkZGI5ZDA3ZGQ0ODhkZmRmOTEzZmZiZCIsIm5iZiI6MTc1ODc1ODkyMy44MzUsInN1YiI6IjY4ZDQ4ODBiNTRjYWJjY2VjYzRhOTFjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xDFPD2BRvK_XT3ITjx-q9u31nL4PJ-Y0w8MsLeNgiyg'
                }
            };
		
		  try {
		    const currentCategory2 = 'top_rated'; 
    		const url = `/api/movies/list?category=${currentCategory2}&page=${page}`;
		    const response = await fetch(url,options);
		    const data = await response.json();
		
		    totalPages = data.total_pages;
		    const newMovies = data.results || [];
		    allMovies = allMovies.concat(newMovies);
		    currentPage = page;
		
		    renderMovies(newMovies);
		  } catch (err) {
		    console.error("API 호출 중 오류 발생:", err);
		  } finally {
		    isLoading = false;
		    document.getElementById('loading-indicator').style.display = 'none';
		    updateButtonStates(); // 로딩 후 버튼 상태 갱신
		  }
		}
		
		// 🟢 이벤트 핸들러 수정: 버튼 클릭 시 부드러운 스크롤 (transform 대신)
		prevBtn.addEventListener('click', () => {
		  const firstCard = movieListContainer.querySelector('.movie-topRateCard');
		  const gap = 20; // CSS와 동일하게 유지
		  const cardWidth = firstCard ? firstCard.offsetWidth : 0;
		  
		  // 왼쪽으로 카드 하나 너비만큼 스크롤
		  movieListContainer.scrollBy({
		    left: -(cardWidth + gap),
		    behavior: 'smooth'
		  });
		  // 스크롤이 끝난 후 버튼 상태는 scroll 이벤트가 알아서 갱신합니다.
		});
		
		nextBtn.addEventListener('click', () => {
		  const firstCard = movieListContainer.querySelector('.movie-topRateCard');
		  const gap = 20; // CSS와 동일하게 유지
		  const cardWidth = firstCard ? firstCard.offsetWidth : 0;
		  
		  // 오른쪽으로 카드 하나 너비만큼 스크롤
		  movieListContainer.scrollBy({
		    left: cardWidth + gap,
		    behavior: 'smooth'
		  });
		  // 스크롤이 끝난 후 버튼 상태는 scroll 이벤트가 알아서 갱신합니다.
		});
		
		// 🟢 새로운 스크롤 이벤트 리스너 추가: 스크롤이 끝에 도달했는지 감지
		movieListContainer.addEventListener('scroll', () => {
		  updateButtonStates(); // 스크롤 중에도 버튼 상태 업데이트 (prev 버튼 활성화/비활성화)
		
		  const scrollMax = movieListContainer.scrollWidth - movieListContainer.clientWidth;
		  const scrollCurrent = movieListContainer.scrollLeft;
		
		  // 스크롤이 끝에 도달했거나 (스크롤 가능한 너비의 90% 이상)
		  // 다음 페이지가 있고, 현재 로딩 중이 아닐 때만 API 호출
		  const proximityThreshold = 0.9; // 끝에서 10% 남았을 때 로드 시작
		  
		  if (scrollMax > 0 && (scrollCurrent / scrollMax) >= proximityThreshold && currentPage < totalPages && !isLoading) {
		    console.log(`[SCROLL_TRIGGERED] 다음 페이지 ${currentPage + 1} 로드 요청`);
		    loadMovies(currentPage + 1);
		  }
		});
		
		// 리사이즈 시에는 버튼 상태만 업데이트
		window.addEventListener('resize', () => {
		  updateButtonStates();
		});
		
		// 초기 로드
		movieListContainer.innerHTML = '';
		loadMovies(currentPage);