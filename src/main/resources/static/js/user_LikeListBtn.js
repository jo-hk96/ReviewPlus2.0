	//좋아요 목록 가져오기
	function loadLikedMovies(){
		const likedMoviesContainer = document.getElementById('likedMoviesContainer');
		const emptyMessage = document.getElementById('emptyMessage');
	    
	    if (!likedMoviesContainer || !emptyMessage) {
	        console.error("좋아요 모달의 컨테이너 요소를 찾을 수 없습니다.");
	        return; 
	    }
	
	
	// 로딩 메시지 표시
	likedMoviesContainer.innerHTML = '<p>영화 좋아요 목록을 가져오고있습니다...</p>';
	emptyMessage.style.display = 'none'; 
	
	
	// 좋아요 목록을 JSON으로 반환하는 Controller API 엔드포인트로 요청
	fetch('/api/user/likedMovies')
		.then(response =>{
			if(!response.ok){
				throw new Error('좋아요 목록 가져오기 실패' + response.status + ')');
			}
			return response.json();			
		})
		.then(data => {
			renderLikeMovies(data); // 성공적으로 데이터를 받으면 렌더링
		})	
		.catch(error =>{
			console.error('영화 좋아요 목록 에러:', error);
			likedMoviesContainer.innerHTML = '<p style = "color:red;">데이터 로딩 오류. 다시시도해주세요.</p>';	
		});
	}
	
	//목록을 모달에 렌더링하는 함수
	function renderLikeMovies(movies) {
	    const likedMoviesContainer = document.getElementById('likedMoviesContainer');
	    const emptyMessage = document.getElementById('emptyMessage');
	    
	    if (!likedMoviesContainer || !emptyMessage) return;
	
	    if(movies && movies.length > 0){
	        let html = '<ul>';
	        movies.forEach(movie =>{
	            // DTO 구조에 맞춰 영화 제목과 개봉일 정보를 사용합니다.
	            html += `
	            <li>
	            	  <a href="/detail/${movie.id}">
	            		<strong>${movie.title}</strong> (${movie.release_date})
	            	  </a>
	            </li>`; 
	        });
	        html += '</ul>'; 
	        
	        likedMoviesContainer.innerHTML = html;
	        emptyMessage.style.display = 'none';
	        }else{
	            // 좋아요 목록이 비어있을 경우
	            likedMoviesContainer.innerHTML ='';
	            emptyMessage.style.display = 'block';
	        }
		}


	//버튼 클릭 핸들러 (openLikeModal)
	function openLikeModal(){
	    const likeModal = document.getElementById('likeModal');
	    
	    if(likeModal){
	        likeModal.style.display = 'block';
	        loadLikedMovies(); 
	    }else{
	        console.error("모달을 찾을수없습니다.");
	    }
	}
	
	
	//이벤트 리스너 등록 (DOMContentLoaded)
	document.addEventListener('DOMContentLoaded', function() {
	    const likeModal = document.getElementById('likeModal');
	    const closeBtn = document.querySelector('.close-btn');
	    if (!likeModal || !closeBtn) return; 
	    closeBtn.onclick = function() {
	        likeModal.style.display = 'none';
	    };	
	    window.onclick = function(event) {
	        if (event.target === likeModal) {
	            likeModal.style.display = 'none';
	        }
	    };	
	});