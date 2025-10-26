let loggedInUserId = null; 


const apiIdInput = document.getElementById('apiId');
const movieApiId = apiIdInput ? apiIdInput.value : null;

//=====================리뷰 등록 로직 ====================================
   document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submit-review-btn');
    
    //핵심 수정: submitBtn이 있을 때만 로직 실행
    if (submitBtn){ 
        submitBtn.addEventListener('click', function() {
            // 닉네임 요소도 안전하게 가져옵니다.
            const nicknameElement = document.getElementById('nickname');
            const nickname = nicknameElement ? nicknameElement.textContent : '알 수 없음';
            
            const apiIdValue = document.getElementById('apiId').value;
            const comment = document.querySelector('textarea[name="comment"]').value;
            const rating = document.getElementById('selected-rating').value;

            if (comment.trim() === '' || rating === '0') {
                alert('리뷰 내용과 별점을 모두 입력해 주세요.');
                return;
            }

            const reviewData = {
                apiId: apiIdValue,
                nickname,
                comment,
                rating: parseInt(rating)
            };

            fetch('/api/userReview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            })
        .then(res => {
            if (!res.ok) throw new Error('리뷰 전송 실패: ' + res.status);
            return res.json();
        })
        .then(newReview => {
            const reviewHtml = createReviewHtml(newReview);
            document.getElementById('review-list').insertAdjacentHTML('afterbegin', reviewHtml);
            document.querySelector('textarea[name="comment"]').value = '';
            document.getElementById('selected-rating').value = '0';
            document.querySelectorAll('.rating-area .star').forEach(s => s.classList.remove('on'));
            alert('리뷰가 등록되었습니다.');
        })
        .catch(err => {
            console.error('리뷰 등록 중 오류 발생:', err);
            alert('리뷰 등록 실패');
        });
    });
    
    }
    
    const ratingStars = document.querySelectorAll('.rating-area .star');


if(ratingStars.length > 0){
	ratingStars.forEach(star => {
    // 클릭 이벤트: 숨겨진 input의 value를 업데이트하고 'on' 클래스 적용
    star.addEventListener('click', function() {
        const rating = this.getAttribute('data-rating');
        
        // 숨겨진 input 필드에 값 저장
        document.getElementById('selected-rating').value = rating; 
        
        // 'on' 클래스 초기화 및 재적용
        const allStars = this.parentElement.querySelectorAll('.star');
        allStars.forEach(s => s.classList.remove('on'));
        
        let currentStar = this;
        while (currentStar) {
            currentStar.classList.add('on');
            currentStar = currentStar.previousElementSibling; 
        }
    });

    // 마우스 leave 이벤트: 선택된 별점까지 색상을 유지하도록 처리
    star.parentElement.addEventListener('mouseleave', function() {
        const selectedRating = parseInt(document.getElementById('selected-rating').value);
        
        document.querySelectorAll('.rating-area .star').forEach(s => {
            const starRating = parseInt(s.getAttribute('data-rating'));
            if (starRating <= selectedRating) {
                s.classList.add('on');
            } else {
                s.classList.remove('on');
            }
        });
    });
    
	    // 마우스 enter 이벤트: 호버 시 모든 별 색칠
	    star.parentElement.addEventListener('mouseenter', function() {
	        document.querySelectorAll('.rating-area .star').forEach(s => s.classList.remove('on'));
	    });
	});
}

    
    
});

//=========================리뷰 목록 데이터 내용을 불러오는 로직============================
function generateStars(rating) {
    const count = Math.round(rating); 
    const filledStars = '★'.repeat(count); // 별점 수만큼 ★ 반복
    
    // 스타일을 gold로 지정하여 별점이 눈에 띄게
    return `<span style="color: gold;">${filledStars}</span>`; 
}



document.addEventListener('DOMContentLoaded', function() {
	const userIdInput = document.getElementById('loggedInUserId');
    if (userIdInput && userIdInput.value) {
        loggedInUserId = Number(userIdInput.value); 
    }
    const apiIdInput = document.getElementById('apiId');
    if (!apiIdInput || !apiIdInput.value) {
        // console.warn("apiId를 찾을 수 없습니다. 리뷰 로딩을 건너뜁니다.");
        return; 
    }
    
    const movieApiId = apiIdInput.value;
    const reviewListContainer = document.getElementById('review-list');
    
    // Thymeleaf로 넣은 초기 메시지 제거
    reviewListContainer.innerHTML = ''; 
    reviewListContainer.innerHTML = '<p>리뷰 목록을 불러오는 중입니다...</p>';

    // 2. 서버의 GET API를 호출하여 리뷰 목록을 가져옴
    fetch(`/api/reviews?apiId=${movieApiId}`) 
        .then(response => {
            if (!response.ok) {
                throw new Error('리뷰 목록 로딩 실패: ' + response.status);
            }
            return response.json(); // 서버가 보낸 JSON 배열 (리뷰 목록)
        })
        .then(reviews => {
            // 3. 기존 컨테이너 내용 초기화
            reviewListContainer.innerHTML = ''; 
            
            if (reviews.length === 0) {
                 reviewListContainer.innerHTML = '<p class="no-reviews-message">아직 등록된 리뷰가 없습니다.</p>';
                 return;
            }
            // 4. 각 리뷰를 HTML로 만들고 컨테이너에 추가
            reviews.forEach(review => {
                const reviewHtml = createReviewHtml(review); // 기존 함수 사용
                // 목록의 끝(가장 아래)에 추가합니다.
                reviewListContainer.insertAdjacentHTML('beforeend', reviewHtml); 
            });
            scrollToAnchor();
        })
        .catch(error => {
            console.error('리뷰 목록 로드 중 오류 발생:', error);
            reviewListContainer.innerHTML = '<p style="color: red;">리뷰를 불러오는 데 실패했습니다.</p>';
        });
});


//===============리뷰 목록 생성====================
function createReviewHtml(review) {
    const starHtml = generateStars(review.rating);
    let actionButtonsHtml = '';
    let restrictedButtonsHtml = '';
    
    const currentUserId = (typeof loggedInUserId !== 'undefined' && loggedInUserId !== null) 
                          ? Number(loggedInUserId) 
                          : null; 
    const reviewAuthorId = Number(review.userId); // 서버에서 넘어온 review.userId를 숫자로 강제 변환
    
   
    if (currentUserId && currentUserId === reviewAuthorId) { 
        restrictedButtonsHtml = `
                <button type="button" class="edit-btn" onclick="openEditModal(${review.reviewId})">수정</button>
                <button type="button" class="delete-btn" onclick="deleteReview(${review.reviewId})">삭제</button>
        `;
    }
    
    const replyButtonHtml = `
    	<button type="button" class="reply" onclick="replyReview(${review.reviewId})">댓글달기</button>
    `;
    
    actionButtonsHtml = `
    	<div class="review-actions">
    		${restrictedButtonsHtml}
    		${replyButtonHtml}
    	</div>
    `;
     return `
         <div class = "review-box" id="review-${review.reviewId}" data-review-id="${review.reviewId}" style="border: 1px solid #ccc; margin-bottom: 10px; padding: 10px;">
	            <table>
	                <tr>
	                    <td>
	               	 		<b><span>${review.nickname}</span></b>
	                    </td>
	                </tr>
	                <tr>
	                    <td>
	                        <p>${review.comment}</p>
	                    </td>
	                </tr>
		            <tr>
			            <td="reviewsRegdate">
			                작성일: <span>${review.regDate}</span>
			            </td>
	           		 </tr>
	                 <tr>
	                    <td id="reviewsRating">
	                        <span>${starHtml}</span> 
	                    </td>
	                </tr>
	            </table>
	            ${actionButtonsHtml}
           </div>
           
           
			<div id="reply-form-for-${review.reviewId}" class="reply-form-container reply-form-hidden">
			    <span style="
			        font-size: 1.5em;
			        color: #CCC; 
			        margin-top:10px;
			        margin-right: 24px; 
			        display: inline-block; 
			        transform: rotate(360deg) scaleY(2.5) scaleX(2.5); 
			        vertical-align: top;
			    ">└</span>
			    <textarea id="reply-comment-${review.reviewId}" placeholder="댓글을 작성해주세요." style="width: 50%;" rows="5" cols="100"></textarea>
			    <button onclick="registerReply(${review.reviewId})">등록</button>
			</div>
	    `;
	}


//대댓글 등록 로직
function registerReply(reviewId){
	//대댓글 내용 가져오기
	const textarea = document.getElementById(`reply-comment-${reviewId}`);
	const comment = textarea.value.trim();
	
	//내용 비었는지 확인
	if(!comment){
		alert('댓글 내용을 입력해주세요.');
		return;
	}
	
	//서버로 보내기 위한 내용 (JSON형식)
	const replyData = {
		reviewId: reviewId,
		comment: comment,
		userId: loggedInUserId
	};
	
	//RestAPI로 컨트롤러에 보냄
	fetch('/api/replies',{
		method: 'POST',
		headers:{
			'Content-Type': 'application/json' //json 형식으로 명시
		},
		body: JSON.stringify(replyData)
	})
	.then(response =>{
		if(response.ok){
			return response.json();
		}
		throw new Error('댓글 등록 실패:' + response.statusText);
	})
	.then(newReply => {
		//성공 시 처리(화면 갱신)
		alert('댓글이 등록 되었습니다.');
		textarea.value = ''; //입력창 초기화
		//newReply안에 있는 객체들을 꺼내서 보여주기...
		//.....
		//.....
		
		
	})
	.catch(error => {
		console.error('댓글 등록 중 오류:', error);
		alert('댓글 등록에 실패했습니다.');
	})
}





//댓글달기 토글
function replyReview(reviewId){
	//formId를 만들어줌
	const formId = `reply-form-for-${reviewId}`;
	//formId를 불러와서 replyForm 변수저장
	const replyForm = document.getElementById(formId);
	//reply
	if(replyForm){
		replyForm.classList.toggle('reply-form-hidden');
	}
}


//==============리뷰 삭제 로직===============================
function deleteReview(reviewId) {
    if (!confirm('리뷰를 삭제하시겠습니까?')) {
        return;
    }

    //reviewId가 유효한지 확인
    if (!reviewId || isNaN(Number(reviewId))) {
        console.error("유효하지 않은 reviewId:", reviewId);
        alert('삭제할 리뷰 정보를 찾을 수 없습니다.');
        return;
    }

    // 1. DELETE API 호출 (이 로직은 서버 응답이 성공(204)했다고 가정)
    fetch(`/api/userReview/${reviewId}`, {
        method: 'DELETE' 
    })
    .then(response => {
        if (response.status === 204) { 
            // 2. HTML에서 해당 리뷰 요소 제거
            // ⭐⭐ 요소 검색 코드: 정확한 셀렉터를 사용하고 null 체크 ⭐⭐
            const reviewElement = document.querySelector(`div[data-review-id="${reviewId}"]`);
            
            if (reviewElement) {
                reviewElement.remove(); // 여기서 에러가 나지 않도록 null 체크
                alert('리뷰가 삭제되었습니다.');
            } else {
                // 서버는 삭제되었으나 화면에서 찾지 못했을 때
                alert('리뷰는 삭제되었으나, 화면 갱신에 문제가 발생했습니다.');
            }
        } else if (response.status === 403) {
            alert('삭제 권한이 없습니다.');
        } else {
            throw new Error('리뷰 삭제 실패: ' + response.status);
        }
    })
    .catch(error => {
        console.error('리뷰 삭제 중 오류 발생:', error);
        alert('리뷰 삭제 중 오류가 발생했습니다. 로그를 확인하세요.');
    });
}




//================리뷰 수정 로직=============================
//--------------------리뷰 수정 모달-----------------------
function openEditModal(reviewId) {
    // 1. 현재 리뷰 요소 찾기
    const reviewElement = document.querySelector(`div[data-review-id="${reviewId}"]`);
    if (!reviewElement) {
        alert('수정할 리뷰를 찾을 수 없습니다.');
        return;
    }
    
    // 2. 현재 댓글과 평점 파싱
    const currentComment = reviewElement.querySelector('td p').textContent.trim();
    const starHtml = reviewElement.querySelector('#reviewsRating span').innerHTML;
    const currentRating = starHtml.split('★').length - 1; 

    // 3. 모달 입력 필드에 값 채우기
    document.getElementById('editingReviewId').value = reviewId; // 리뷰 ID 저장
    document.getElementById('editComment').value = currentComment; // 댓글 채우기
    document.getElementById('editSelectedRating').value = currentRating.toString(); // 별점 값 저장

    // 4. 별점 시각적으로 표시 (openEditModal에서 별점 클릭/leave 로직을 그대로 재활용)
    const allEditStars = document.getElementById('editRatingArea').querySelectorAll('.star');
    allEditStars.forEach(s => s.classList.remove('on'));
    allEditStars.forEach(s => {
        const starRating = parseInt(s.getAttribute('data-rating'));
        if (starRating <= currentRating) {
            s.classList.add('on');
        }
    });

    // 5. 모달 표시
    document.getElementById('editReviewModal').style.display = 'block';
}




//-------------리뷰 수정 별점 이벤트리스너----------------
document.addEventListener('DOMContentLoaded', function() {
    
    const editRatingArea = document.getElementById('editRatingArea');
    const editRatingInput = document.getElementById('editSelectedRating'); 
    
    if (editRatingArea) {
        editRatingArea.querySelectorAll('.star').forEach(star => {
            
            // 별점 클릭 시 'editSelectedRating' 값을 업데이트하는 이벤트 리스너
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                
                // 1. 숨겨진 input 값 업데이트 (API 전송을 위한 데이터 저장)
                editRatingInput.value = rating; 
                
                // 2. 시각화 로직
                const allStars = this.parentElement.querySelectorAll('.star');
                allStars.forEach(s => s.classList.remove('on'));
                let currentStar = this;
                while (currentStar) {
                    currentStar.classList.add('on');
                    currentStar = currentStar.previousElementSibling; 
                }
            });
        });
    }


    //'수정 완료' 버튼 (saveEditBtn) 클릭 이벤트 리스너
    document.getElementById('saveEditBtn')?.addEventListener('click', function() {
        
        // 1. 필요한 데이터 가져오기 및 유효성 검사
        // 이 시점에서 editSelectedRating에는 사용자가 모달에서 클릭한 최종 평점 값이 들어 있어야 합니다.
        const reviewId = document.getElementById('editingReviewId').value;
        const comment = document.getElementById('editComment').value;
        const rating = document.getElementById('editSelectedRating').value;
        
        // ... (유효성 검사 및 에러 체크 로직 유지) ...
        if (comment.trim() === '' || rating === '0') {
            alert('수정 내용과 별점을 모두 입력해 주세요.');
            return;
        }
        if (!reviewId || isNaN(Number(reviewId))) {
            console.error("유효하지 않은 reviewId:", reviewId);
            alert('수정할 리뷰 정보를 찾을 수 없습니다.');
            return;
        }
        
        
        const updatedData = { comment: comment, rating: parseInt(rating) };
        
        // 2. PATCH API 호출 (리뷰 수정)
        fetch(`/api/userReview/${reviewId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 403) {
                    alert('수정 권한이 없습니다. 본인이 작성한 리뷰만 수정할 수 있습니다.');
                }
                throw new Error('리뷰 수정 실패: ' + response.status);
            }
            return response.json(); 
        })
        .then(updatedReview => {
            const reviewElement = document.querySelector(`div[data-review-id="${reviewId}"]`);
            if (reviewElement) {
                // 댓글 업데이트
                reviewElement.querySelector('td p').textContent = updatedReview.comment;
                
                // 평점 업데이트
                const newStarHtml = generateStars(updatedReview.rating);
                const ratingSpan = reviewElement.querySelector('#reviewsRating span');
                if (ratingSpan) {
                     ratingSpan.innerHTML = newStarHtml;
                }
                
                alert('리뷰가 성공적으로 수정되었습니다.');
                document.getElementById('editReviewModal').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('리뷰 수정 중 오류 발생:', error);
            alert('리뷰 수정 중 알 수 없는 오류가 발생했습니다. 로그를 확인하세요.');
        });
    });
});

//--------------앵커--------------------
function scrollToAnchor() {
    const hash = window.location.hash;
    if (hash) {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start' 
            });
        }
    }
}
