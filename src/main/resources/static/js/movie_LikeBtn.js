  		
  		// toggleLike 함수
        async function toggleLike(buttonElement){
            const apiId = buttonElement.getAttribute('data-api-id');
            const isCurrentlyLiked = buttonElement.getAttribute('data-liked') === 'true';

            //좋아요 API URL 설정
            const url = `/api/MovieLike/${apiId}`;

            try{
                const response = await fetch(url,{
                    method : 'POST',
                    headers: {
                        'Content-Type' : 'application/json'

                    },
                });
                if(response.ok){
                    //서버응답(좋아요 상태:true/false) 받기
                    const isLiked = await response.json();
                    //HTML 요소(버튼)의 상태 업데이트(사용자 피드백)
                    updateLikeBtnState(buttonElement, isLiked);
                }else if(response.status === 401){
                    //비로그인 사용자 처리
                    alert("로그인 후 이용가능합니다.");
                    window.location.href = '/login'
                }else {
                    alert("오류발생");
                    console.error("좋아요 API 오류:" , response.status);

                }
            }catch(error){
                console.error("네트워크 오류:", error);
                alert("서버 연결 실패.");
            }
        }
        //버튼 상태 변경
        function updateLikeBtnState(buttonElement, isLiked){
            //data-liked 속성 값 변경
            buttonElement.setAttribute('data-liked', isLiked);

            if(isLiked){
                //좋아요 상태: 하트와 '취소' 텍스트로 변경
                buttonElement.innerHTML = '♥ 좋아요';
                buttonElement.classList.add ('liked');// CSS 클래스 추가
            }else {
                //취소 상태: 빈 하트 '하기' 텍스트로 변경
                buttonElement.innerHTML = '♡ 좋아요';
                buttonElement.classList.remove('liked'); //CSS 클래스 제거
            }
        }