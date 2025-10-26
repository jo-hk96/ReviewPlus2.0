async function handleMovieSearch(event){
			//폼의 기본 제출(페이지이동)을 막음
			event.preventDefault();
			
			//검색 입력 필드의 값을 가져옴
			const searchInput = document.getElementById('movieSearch');
			const query = searchInput.value.trim();
			const movieListContainer = document.getElementById('movieListContainer');
			
			//검색어가 비어 있으면 경고 후 목록을 비움
			if(!query){
				alert("검색어를 입력해 주세요.");
				movieListContainer.innerHTML = ''; //기존 목록을 비움
				return;
			}
			
			//백엔드 API URL을 정확히 'query' 파라미터로 설정함
			const url = `/api/movies/search?query=${encodeURIComponent(query)}`;
			
			try{
				const response = await fetch(url);
				
				if(response.ok){
					const searchResults = await response.json();
					
					//기존 목록을 비우고 새로운 결과를 렌더링
					movieListContainer.innerHTML = '';
					
					if(searchResults && searchResults.length > 0 ){
						renderMovies(searchResults); // 렌더링함수 호출
					}else{
						movieListContainer.innerHTML = '<p>일치하는 영화 검색 결과가 없습니다.</p>'
					}
				}else {
					// 서버 응답 오류 처리
					console.error("검색 API 응답 오류:", response.status);
					movieListContainer.innerHTML = `<p>검색 중 오류가 발생했습니다(코드: ${response.status}).</p>`;
					}
				}catch(error){
					//네트워크 연결 실패 등 오류 처리
					console.error("네트워크 오류:", error);
					movieListContainer.innerHTML = '<p>서버 연결에 실패했습니다.</p>';
				}
				
			}