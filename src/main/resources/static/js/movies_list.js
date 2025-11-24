// ==================== 전역 변수 ====================
let currentPage = 1;
let isLoading = false;
let totalPages = 500;
let movieListContainer;
let loadingIndicator;
let currentCategory; 
// ==================== 검색 실행 ====================
async function fetchAndRenderSearchResults(query) {
    if (!query) return;

    const url = `/api/movies/search?query=${encodeURIComponent(query)}`;
    if (loadingIndicator) loadingIndicator.style.display = 'block';

    try {
        const response = await fetch(url);
        const searchResults = await response.json();

        movieListContainer.innerHTML = '';

        if (response.ok && searchResults && searchResults.length > 0) {
            renderMovies(searchResults);
        } else {
            movieListContainer.innerHTML = `<p>'${query}'에 대한 검색 결과가 없습니다.</p>`;
        }
    } catch (error) {
        console.error("검색 오류:", error);
        movieListContainer.innerHTML = '<p>검색 서버와 연결할 수 없습니다.</p>';
    } finally {
	   isLoading = false;
       loadingIndicator.style.display = 'none';
    }
}

// ==================== 영화 카드 렌더링 ====================
function generateOurStars(rating5) {
    if (rating5 === null || rating5 === undefined || rating5 === 0) return 'N/A';
    const fullStars = Math.floor(rating5);
    return '⭐'.repeat(fullStars);
}

function renderMovies(newMovies) {
    newMovies.forEach(movie => {
       	  //api 컨트롤러에서 보낸 평점을 받음 
          const ourRating = movie.ourAverageRating;
          const movieId = movie.id;
          const detailUrl = `/detail/${movieId}`; 
             const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '/images/Jake_the_Dog_character.png'; //이미지가 없을경우 

        // 평점을 별 아이콘과 포맷된 텍스트로 준비
        const userStars = generateOurStars(ourRating);
        const scoreText = ourRating > 0 ? ourRating.toFixed(1) : 'N/A';


        const card = document.createElement('div');
        card.className = 'movie-ListCard';
        card.innerHTML = `
          <a href="${detailUrl}" class="movie-link">
              <img src="${posterUrl}" alt="${movie.title} 포스터">
                  <div class="movie-info2">
                        <h2>
                            ${movie.title}
                            
                           ${scoreText !== 'N/A' ? ` 
                            <span style="font-size: 0.7em; font-weight: normal; display: block; margin-top: 5px;">
                                ${userStars} (${scoreText} / 5)
                            </span>
                           ` : `<span style="font-size: 0.7em; font-weight: normal; display: block; margin-top: 5px;">
                                평점없음
                           	 </span>`} 
                        </h2>
                        
                        <p>외부평점: ${movie.vote_average ? movie.vote_average.toFixed(1) : '외부평점없음'} / 10</p>
                        <p>최초개봉날짜: ${movie.release_date || '정보 없음'}</p>
                  </div>
          </a>
        `;
        movieListContainer.appendChild(card);
    });
}

// ==================== 목록 API 호출 ====================
async function loadMovies(page) { 

 	const pageToLoad = page > 0 ? page : 1; 
    if (isLoading || page > totalPages) return;
    isLoading = true;
    loadingIndicator.style.display = 'block';

    // 페이지 번호를 파라미터로 넘김
    const url = `/api/movies/list?category=${currentCategory}&page=${pageToLoad}`; 

    try {
        const response = await fetch(url);
        const data = await response.json(); 
        
        totalPages = data.total_pages; 
        const newMovies = data.results || [];
        currentPage = page;

        renderMovies(newMovies); 
    } catch (err) {
        console.error("API 호출 중 오류 발생:", err);
        movieListContainer.innerHTML = '<p>영화 목록 로드 오류 발생</p>';
    } finally {
        isLoading = false;
        loadingIndicator.style.display = 'none';
    }
}
// ==================== 무한 스크롤 ====================
function handleInfiniteScroll() {
    const documentHeight = document.documentElement.scrollHeight;
    const currentScrollPosition = window.scrollY + window.innerHeight;
    const isNearBottom = currentScrollPosition >= documentHeight - 100;

    if (isNearBottom) {
        if (currentPage < totalPages && !isLoading) {
            console.log(`[Infinite Scroll] 페이지 ${currentPage + 1} 로드 시작`);
            loadMovies(currentPage + 1);
        } 
        // 에러 방지 및 마지막 페이지 표시 로직 수정 (loadingIndicator 존재 확인)
        else if (currentPage >= totalPages && !isLoading && loadingIndicator && loadingIndicator.textContent !== '마지막 페이지입니다.') {
            loadingIndicator.textContent = '마지막 페이지입니다.';
            loadingIndicator.style.display = 'block';
        }
    }
}

//카테고리 변경 함수
function changeCategory(newCategory) {
    console.log(`카테고리 변경: ${currentCategory} -> ${newCategory}`);
    
    //상태 초기화 및 업데이트
    currentCategory = newCategory;
    currentPage = 1;
    totalPages = 1; 
    
    //기존 목록 비우기
    if (movieListContainer) movieListContainer.innerHTML = ''; 
    
    //새 목록 로드 시작
    loadMovies(currentPage); 
}


// ==================== 카테고리 변경 ====================
document.addEventListener('DOMContentLoaded', () => {
    
    movieListContainer = document.getElementById('movie-list2'); 
    loadingIndicator = document.getElementById('loading-indicator2');

    if (!movieListContainer || !loadingIndicator) {
        console.error("ERROR: 필수 HTML 요소를 찾을 수 없어 JS 실행을 중단합니다.");
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    
    // URL 파라미터가 없거나 'now_playing' 같은 값이 있을 경우 currentCategory에 할당
    const urlCategory = urlParams.get('category');
    
    // 서버에서 받은 selectedCategory s가 있다면 그걸 최우선으로, 없으면 URL 파라미터, 없으면 'popular'
    // Thymeleaf 변수를 직접 쓰지 못하므로, HTML에 숨겨진 input 태그 등으로 값을 받아와야 함
    const initialCategoryElement = document.getElementById('initial-category-value');
    const thymeleafCategory = initialCategoryElement ? initialCategoryElement.value : null;

    currentCategory = thymeleafCategory || urlCategory || 'popular'; 

    
    // 3. 검색 모드와 기본 목록 모드 분기 로직 (기존 로직 유지)
    const searchQueryElement = document.getElementById('searchQueryInput');
    const G_SEARCH_QUERY = searchQueryElement ? searchQueryElement.value : '';
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.value = currentCategory;
        categorySelect.addEventListener('change', (event) => {
            changeCategory(event.target.value);
        });
    }
    if (G_SEARCH_QUERY) {
		console.log("검색 모드 실행, 쿼리:", G_SEARCH_QUERY);
		 fetchAndRenderSearchResults(G_SEARCH_QUERY);
		
    } else {
        console.log("기본 목록 모드 실행.");
        window.addEventListener('scroll', handleInfiniteScroll);
        loadMovies(currentPage); 
    }
});