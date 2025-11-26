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
            //리뷰 등록 후 새로고침 없이 화면목록 추가
            document.getElementById('review-list').insertAdjacentHTML('afterbegin', reviewHtml);
            document.querySelector('textarea[name="comment"]').value = '';
            document.getElementById('selected-rating').value = '0';
            document.querySelectorAll('.rating-area .star').forEach(s => s.classList.remove('on'));
            alert('리뷰가 등록되었습니다.');
        })
        .catch(err => {
            console.error('리뷰 등록 중 오류 발생:', err);
            alert('리뷰 등록 실패');
        });``
    });
}

//==================리뷰 별점 Rating===============
const ratingStars = document.querySelectorAll('.rating-area .star');
if(ratingStars.length > 0){
   ratingStars.forEach(star => {
    // 클릭 이벤트: 숨겨진 input의 value를 업데이트하고 'on' 클래스 적용
    star.addEventListener('click', function() {
        const rating = this.getAttribute('data-rating');
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
    
   //--- 마우스 over 이벤트 
   star.addEventListener('mouseover',function(){
   const allStars = this.parentElement.querySelectorAll('.star');
    allStars.forEach(s => s.classList.remove('hover')); // hover 초기화
   
   let currentStar = this;
   while (currentStar){
      currentStar.classList.add('hover');
      currentStar = currentStar.previousElementSibling;
      }
   });
    

    // 마우스 leave 이벤트: 선택된 별점까지 색상을 유지하도록 처리
    star.parentElement.addEventListener('mouseleave', function() {
       const allStars = this.parentElement.querySelectorAll('.star');
       allStars.forEach(s => s.classList.remove('hover'));
        const selectedRating = parseInt(document.getElementById('selected-rating').value);
        
        document.querySelectorAll('.rating-area .star')
        allStars.forEach(s => {
            const starRating = parseInt(s.getAttribute('data-rating'));
            if (starRating <= selectedRating) {
                s.classList.add('on');
            } else {
                s.classList.remove('on');
               }
           });
       });
   });
}
    
});


//=========================리뷰 목록 데이터 내용을 불러오는 로직============================
function generateStars(rating) {
    const count = Math.round(rating); 
    const filledStars = '★'.repeat(count); // 별점 수만큼 ★ 반복
    return `<span style="color: gold;">${filledStars}</span>`; 
}

document.addEventListener('DOMContentLoaded', function() {
   const userIdInput = document.getElementById('loggedInUserId');
    if (userIdInput && userIdInput.value) {
        loggedInUserId = Number(userIdInput.value); 
    }
    const apiIdInput = document.getElementById('apiId');
    if (!apiIdInput || !apiIdInput.value) {
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
            return response.json();
        })
        .then(reviews => {
            // 3. 기존 컨테이너 내용 초기화
            reviewListContainer.innerHTML = ''; 
            
            if (reviews.length === 0) {
                 reviewListContainer.innerHTML = '<p class="no-reviews-message">아직 등록된 리뷰가 없습니다.</p>';
                 return;
            }
            reviews.forEach(review => {
                const reviewHtml = createReviewHtml(review);
                reviewListContainer.insertAdjacentHTML('beforeend', reviewHtml); 
                fetchReplies(review.reviewId);
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
    
    const storedFileName = review.profileImageUrl || 'default.png'; 
    let profileSrc = `/images/profile/${storedFileName}`;
    
    const isReviewLiked = review.reviewLiked; //좋아요 상태
   const likeCount = review.likeCount || 0; //초기 좋아요 개수
   const heartSymbol = isReviewLiked ? '❤' : '🤍';
   
    // 로그인한 사용자 ID (전역 변수 loggedInUserId를 사용한다고 가정)
    const currentUserId = (typeof loggedInUserId !== 'undefined' && loggedInUserId !== null) 
                          ? Number(loggedInUserId) 
                          : null;
    const reviewAuthorId = Number(review.userId);
    if (currentUserId && currentUserId === reviewAuthorId) {
        restrictedButtonsHtml = `
                <button type="button" class="edit-btn" onclick="openEditModal(${review.reviewId})">수정</button>
                <button type="button" class="delete-btn" onclick="deleteReview(${review.reviewId})">삭제</button>
        `;
    }
    
    
    //댓글(N)개 버튼
    const replyButtonHtml = `
       <span class="reply-toggleButton" id="reply-toggle-${review.reviewId}" onclick="replyReview(${review.reviewId}); toggleReplies(${review.reviewId})">
        댓글 <span id="reply-count-${review.reviewId}">0</span> 개
    </span>
    `;
   
   
   const likeButtonHtml = `
       <button type="button" class="Reviewlike-btn" 
           data-review-id="${review.reviewId}"
           onclick="ReviewtoggleLike(this)"
           style="background: none; 
           border: none;
           cursor: pointer;
           font-size: 1.2em;
          margin-right: 15px;">
               <span class="heart-symbol" style="color: ${isReviewLiked ? 'red' : 'black'};">
                  ${heartSymbol}
              </span>
                <span class="like-count" style="color: white; margin-left: 5px;"> 
                  ${likeCount}
              </span>
           </button>
    `;
    
    
    actionButtonsHtml = `
       <div class="review-actions">
          ${restrictedButtonsHtml}
       </div>
    `;

    const replySectionHtml = `
        <div id="reply-list-${review.reviewId}" class="reply-container reply-hidden"
              style = "color:white">
        </div>
    `;

     return `
         <div class = "review-box" id="review-${review.reviewId}" data-review-id="${review.reviewId}" 
                        style=" box-shadow:0 5px 8px rgba(0,0,0,0.2);  margin-bottom: 10px; padding: 10px;
                        color: white; border-radius: 15px; ">

                        
               <div class="review-profile-area" style="margin-right: 15px;">
                <span onclick="toggleActionButtons(this)" 
                style = "cursor:pointer; margin-left: 10px; margin-right:10px; font-size: 25px; color:gray;
                   border: 1px; width:20px;">
                   ⁝
                </span>
                
                    <div id="actionButtonsContainer" 
                 style="display: none; 
                        top: 100%; 
                        left: 0;
                        padding: 15px; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        z-index: 100;">
                ${actionButtonsHtml}
            </div>
                
                
                   <img id = "reviewUserProfile" class="profile-image" src="${profileSrc}" alt="${review.nickname}님의 프로필">
                   <div class="profile-info-text">
                       <table>
                            <tr>
                               <td><span>${review.nickname}</span></td>
                            </tr>
                               <tr><td><span id ="reviewsRating">${starHtml}</span></td></tr>
                            <tr><td><span style = "color:gray">${review.regDate}</span></td></tr>
                      </table>
                   </div>
             </div>
               <table>
                   <tr><td><p 
                   style="overflow-wrap: break-word; 
                     word-break: break-all;">${review.comment}</p></td></tr>
               </table>
               
               <div class="review-actions">
                    ${likeButtonHtml} 
                ${replyButtonHtml}
             </div>
         <div id="reply-form-for-${review.reviewId}" class="reply-form-container reply-form-hidden">
            <hr style="border:0.5px solid #565656;">
             <textarea class="ReplyComment" id="reply-comment-${review.reviewId}" placeholder="댓글을 작성해주세요.400자 제한"
                                                                   maxlength="400"></textarea>
             <button onclick="registerReply(${review.reviewId},'${review.nickname}')">등록</button>
         </div>
         ${replySectionHtml}
   `;
}



function ReviewtoggleLike(buttonEl){
   //리뷰 Id 가져오기
   const reviewId = buttonEl.getAttribute('data-review-id');
   const url = `/api/reviews/${reviewId}/likes`;
   
   
   //로딩 중임을 표시
   buttonEl.disabled = true;
   
   fetch(url,{
      method: 'POST',
      headers: {
         'Content-Type' : 'application/json',
      },
   })
   .then(response => {
      if(!response.ok){
         throw new Error(`HTTP 오류 발생: ${response.status}`);
      }
      return response.json();
   })
   .then(data => {
      const { isReviewLiked, likeCount } = data;
      //버튼 텍스트 (하트 모양 및 개수) 업데이트
      const heartSymbol = isReviewLiked ? '❤' : '🤍';
      buttonEl.innerHTML = `
        <span class="heart-symbol" style="color: ${isReviewLiked ? 'red' : 'black'};">
            ${heartSymbol}
        </span>
        <span class="like-count" style="color: white; margin-left: 5px;"> 
            ${likeCount}
        </span>
    `;
      buttonEl.disabled = false;
      
      //로그
      console.log(`좋아요 상태: ${isReviewLiked}, 총 개수: ${likeCount}`);
   })
   .catch(error => {
      console.error('좋아요 토글 중 에러 발생:', error);
      alert('좋아요 처리에 실패했습니다.');
      buttonEl.disabled = false;// 에러 발생 시 버튼 활성화
   })
}

//==========================================================
function toggleActionButtons(buttonElement) {
        const reviewArea = buttonElement.closest('.review-profile-area');
        const container = reviewArea.querySelector('#actionButtonsContainer');

        if (!container) {
            console.error("액션 버튼 컨테이너를 찾을 수 없습니다.");
            return;
        }

        if (container.style.display === 'none') {
            container.style.display = 'block'; 
        } else {
            container.style.display = 'none';
        }
    }


function toggleReplies(reviewId){
   const replyListContainer = document.getElementById(`reply-list-${reviewId}`);
   
   if (!replyListContainer) {
        console.error(`Error: 댓글 목록 컨테이너(reply-list-${reviewId})를 찾을 수 없습니다.`);
        return;
    }
    
    if(replyListContainer.style.display === 'none' || replyListContainer.classList.contains('reply-hidden')){
      //style = disply: none; 이거나 class가 reply hidden 일경우
   replyListContainer.style.display = 'block';
   replyListContainer.classList.remove('reply-hidden');
}else{
   replyListContainer.style.display = 'none';
   replyListContainer.classList.add('reply-hidden');
   
   }
}

//====================대댓글 등록 로직=======================
function registerReply(reviewId,nickname){
   const textarea = document.getElementById(`reply-comment-${reviewId}`);
   const comment = textarea.value.trim();
   
   if(!comment){
      alert('댓글 내용을 입력해주세요.');
      return;
   }
   
   const replyData = {
      reviewId: reviewId,
      comment: comment,
      nickname: nickname
   };
   
   fetch('/api/replies',{
      method: 'POST',
      headers:{
         'Content-Type': 'application/json' 
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
      textarea.value = '';
      const replyListContainer = document.getElementById(`reply-list-${reviewId}`);
      const newReplyHtml = createReplyHtml(newReply);
      replyListContainer.insertAdjacentHTML('afterbegin',newReplyHtml);
      alert('댓글이 등록 되었습니다.');
   })
   .catch(error => {
      console.error('댓글 등록 중 오류:', error);
      alert('댓글 등록에 실패했습니다.');
   })
}

//-----------------대댓글 목록조회------------------
document.addEventListener('DOMContentLoaded', () =>{
   const reviewElements = document.querySelectorAll('.individual-review');
    
    reviewElements.forEach(reviewDiv => {
        const reviewId = reviewDiv.getAttribute('data-review-id'); 
        
        if (reviewId) {
            fetchReplies(reviewId);
        }
    });
});

function fetchReplies(reviewId){
   const apiUrl = `/api/reviews/${reviewId}/replies`;
   
   fetch(apiUrl)
   .then(response =>{
      if(!response.ok){
         throw new Error('댓글 목록을 불러오는데 실패했습니다.');
      }
      return response.json();
   })
   .then(replies =>{
      // 1. 고유 ID로 컨테이너 찾기
      const replyListContainer = document.getElementById(`reply-list-${reviewId}`);
      const replyCountElement = document.getElementById(`reply-count-${reviewId}`);

      // 2. 요소가 존재하는지 확인 후 처리 (null 에러 방지)
      if (replyListContainer) {
            replyListContainer.innerHTML = ''; 
            
            replies.forEach(reply =>{
                const replyHtml = createReplyHtml(reply);
                replyListContainer.insertAdjacentHTML('afterbegin', replyHtml);
            });
            
            // 3. 댓글 개수 업데이트
            if (replyCountElement) {
                replyCountElement.textContent = replies.length;
            }
      }
   })
   .catch(error =>{
      console.error(`댓글 조회 중 오류 (Review ID: ${reviewId}):`, error);
        // 에러 메시지 표시 로직은 고유 ID를 사용하도록 수정 필요
      const errorContainer = document.getElementById(`reply-list-${reviewId}`);
        if(errorContainer) {
            errorContainer.innerHTML =
             `<p style="color:red;">댓글 목록을 불러올 수 없습니다.(${error.message})</p>`;
        }
   });
}


//===================대댓글 삭제======================
function deleteReviewReply(replyId){
    if (!confirm('댓글를 삭제하시겠습니까?')) {
        return;
    }
   fetch(`/api/userReviewReply/${replyId}`,{
      method: 'DELETE'
   })
   .then(response => {
      if(response.status === 204){
         const replyElement = document.querySelector(`.reply-item[data-reply-id="${replyId}"]`);
         
         if(replyElement){
            replyElement.remove();
            alert('댓글이 삭제되었습니다.');
         }
         
      }else if(response.status === 403){
         alert('삭제 권한이 없습니다.');
         
      }else{
         alert('대댓글 삭제에 실패했습니다.');
      }
   })   
   .catch(error => {
      console.error('삭제 요청 오류 발생:', error);
      alert('서버와의 통신에 문제가 발생했습니다.');
   });   
}

//==================대댓글 목록 화면 HTML====================
function createReplyHtml(replyData){
   let replyDeleteButtonHTML = '';
    const formattedDate = new Date(replyData.regDate).toLocaleString();
    const currentReplyUserId = (typeof loggedInUserId !== 'undefined' && loggedInUserId !== null) 
                          ? Number(loggedInUserId) 
                          : null;
    const replyAuthorId = Number(replyData.userId);
      if(currentReplyUserId && currentReplyUserId === replyAuthorId){
      replyDeleteButtonHTML =   `
            <button type="button" class="deleteReply-btn" onclick="deleteReviewReply(${replyData.replyId})">삭제</button>
         `;
    }
    return `
        <div class="reply-item" data-reply-id="${replyData.replyId}">
            <div class="reply-header">
                <span class="reply-nickname">${replyData.nickname}</span>
                <span class="reply-date">${formattedDate}</span>
                ${replyDeleteButtonHTML}
            </div>
            <div class="reply-comment">
                <p>${replyData.comment}</p>
            </div>      
        </div>
    `;
}


//댓글달기 토글
function replyReview(reviewId){
   const formId = `reply-form-for-${reviewId}`;
   const replyForm = document.getElementById(formId);
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

    fetch(`/api/userReview/${reviewId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.status === 204) { 
            // 2. HTML에서 해당 리뷰 요소 제거
            const reviewElement = document.querySelector(`div[data-review-id="${reviewId}"]`);
            
            if (reviewElement) {
                reviewElement.remove();
                alert('리뷰가 삭제되었습니다.');
            } else {
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
            
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                
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


    //수정 완료 이벤트 리스너
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