document.addEventListener("DOMContentLoaded", () => {
  const newsList = document.querySelector('.news-list');
  const items = document.querySelectorAll('.news-item');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  let currentIndex = 0;
  const totalItems = items.length;

  nextBtn.addEventListener('click', () => {
    if (currentIndex < totalItems - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateSlide();
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = totalItems - 1;
    }
    updateSlide();
  });

  function updateSlide() {
    const offset = -currentIndex * 100;
    newsList.style.transform = `translateX(${offset}%)`;
  }
});

    document.addEventListener('DOMContentLoaded', function() {
       const newsListContainer = document.getElementById('naver-news-list');
       // display=10으로 설정하여 10개의 뉴스를 가져옵니다.
       // 참고: 이 경로는 서버에서 네이버 API를 호출하는 엔드포인트여야 합니다.
       const apiUrl = '/api/naver/news?query=영화&display=10';

       // -----------------------------------------------------
       // 1. AJAX 데이터 로딩 로직
       // -----------------------------------------------------
       fetch(apiUrl)
           .then(response => {
               if (!response.ok) {
                   throw new Error('API 호출 실패: ' + response.status);
               }
               // 가정: 서버에서 네이버 API의 JSON 응답 중 'items' 배열을 그대로 반환한다고 가정
               return response.json();
           })
           .then(data => {
               // 'data'가 네이버 API 응답의 'items' 배열이라고 가정
               const newsItems = Array.isArray(data) ? data : (data.items || []);

               // "불러오는 중..." 메시지 제거 및 HTML 생성
               newsListContainer.innerHTML = '';

               if (newsItems.length > 0) {
                   newsItems.forEach(item => {
                       // 네이버 API에 이미지가 제공되지 않으므로, 플레이스홀더 사용
                       const imageUrl = "https://via.placeholder.com/300x180?text=Movie+News";

                       // 네이버 API의 title에서 <b> 태그를 제거하여 순수 텍스트로 변환
                       const cleanTitle = removeHtmlTags(item.title);
                       const formattedDate = formatDate(item.pubDate);

                       // 기존 HTML 구조에 맞춘 동적 아이템 생성
                       const itemHtml = `
                   <a href="${item.link}" target="_blank">
                       <img src="${imageUrl}" alt="${cleanTitle} 뉴스 이미지">
                   </a>
                   <p class="title">${cleanTitle}</p>
                   <p class="date">${formattedDate}</p>
               `;

                       const newsItemDiv = document.createElement('div');
                       newsItemDiv.className = 'news-item';
                       newsItemDiv.innerHTML = itemHtml;
                       newsListContainer.appendChild(newsItemDiv);
                   });

                   // 💡 데이터 로드가 완료된 후, 캐러셀 초기화 함수 호출
                   initializeCarousel();
               } else {
                   newsListContainer.innerHTML = '<p>검색된 뉴스 결과가 없습니다.</p>';
               }
           })
           .catch(error => {
               console.error('데이터 로딩 오류:', error);
               newsListContainer.innerHTML = '<p style="color: red;">데이터를 불러오는 중 오류가 발생했습니다.</p>';
           });

       // -----------------------------------------------------
       // 2. 캐러셀 제어 로직 (기존 로직 유지)
       // -----------------------------------------------------
       function initializeCarousel() {
           const newsList = document.getElementById('naver-news-list');
           const prevBtn = document.querySelector('.prev-btn');
           const nextBtn = document.querySelector('.next-btn');
           const items = newsList.querySelectorAll('.news-item');

           if (items.length === 0) return;

           let currentIndex = 0;
           const totalItems = items.length;

           // 캐러셀 너비 설정 (아이템 개수만큼)
           newsList.style.width = `${totalItems * 100}%`;

           function updateCarousel() {
               // 아이템 하나를 100%로 가정하고 이동
               const offset = currentIndex * -100;
               newsList.style.transform = `translateX(${offset / totalItems}%)`; // 전체 너비 대비 비율로 조정해야 함. (개선 필요: CSS에서 news-list-container의 overflow를 hidden으로 설정하고, news-list의 width를 totalItems * [아이템 너비]로 설정해야 정확합니다.)

               // 임시로 news-list의 transform을 아이템 단위로 처리 (정확한 캐러셀 로직은 CSS에 따라 달라집니다.)
               const itemWidth = newsList.querySelector('.news-item').offsetWidth;
               newsList.style.transform = `translateX(-${currentIndex * itemWidth}px)`;


               prevBtn.disabled = currentIndex === 0;
               nextBtn.disabled = currentIndex === totalItems - 1;
           }

           prevBtn.addEventListener('click', () => {
               if (currentIndex > 0) {
                   currentIndex--;
                   updateCarousel();
               }
           });

           nextBtn.addEventListener('click', () => {
               if (currentIndex < totalItems - 1) {
                   currentIndex++;
                   updateCarousel();
               }
           });

           updateCarousel();
       }

       // -----------------------------------------------------
       // 3. 날짜 형식 변환 함수 (기존 로직 유지)
       // -----------------------------------------------------
       function formatDate(pubDate) {
           try {
               const dateObj = new Date(pubDate);
               const year = dateObj.getFullYear();
               const month = String(dateObj.getMonth() + 1).padStart(2, '0');
               const day = String(dateObj.getDate()).padStart(2, '0');
               return `${year}-${month}-${day}`;
           } catch (e) {
               // 변환 실패 시 원래 값 반환
               return pubDate;
           }
       }

       // -----------------------------------------------------
       // 4. HTML 태그 제거 함수 (네이버 API title용)
       // -----------------------------------------------------
       function removeHtmlTags(htmlString) {
           if (!htmlString) return '';
           // 정규 표현식을 사용하여 <...> 형태의 모든 HTML 태그를 제거
           return htmlString.replace(/<[^>]*>?/gm, '');
       }
   });


