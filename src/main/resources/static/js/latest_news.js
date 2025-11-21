document.addEventListener('DOMContentLoaded', function() {
    // ⚠️ 경고: 최상단에 중복된 DOMContentLoaded 리스너는 삭제해야 합니다!
    
    // 👇 이미지 목록 정의와 인덱스 추적 변수를 여기에 추가하세요!
    const backgroundImages = [
        "/images/newsimg1.png", 
        "/images/newsimg2.png",
        "/images/newsimg3.png",
        "/images/newsimg4.png",
        "/images/newsimg5.png"
    ];
    let imageIndex = 0; // 이 변수를 전역(DOMContentLoaded 내부)에서 관리해야 합니다.
    
    const newsListContainer = document.getElementById('naver-news-list');
    const apiUrl = '/api/naver/news?query=%EC%98%81%ED%99%94%7C%EA%B0%9C%EB%B4%89%7C%EA%B0%9C%EB%B4%89%EC%98%88%EC%A0%95%7C%EB%B0%95%EC%8A%A4%EC%98%A4%ED%94%BC%EC%8A%A4&display=10&sort=sim';

    // -----------------------------------------------------
    // 1. AJAX 데이터 로딩 로직
    // -----------------------------------------------------
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('API 호출 실패: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const newsItems = Array.isArray(data) ? data : (data.items || []);

            newsListContainer.innerHTML = '';

            if (newsItems.length > 0) {
                newsItems.forEach(item => {
                   // 👇 1. 이미지 URL 변수 선언 부분을 순환 로직으로 대체합니다.
                    const imageUrl = backgroundImages[imageIndex]; 

                    const cleanTitle = removeHtmlTags(item.title);
                    const formattedDate = formatDate(item.pubDate);

                    const itemContent = `
                        <img src="${imageUrl}" alt="${cleanTitle} 뉴스 이미지";>
                        <p class="title">${cleanTitle}</p>
                        <p class="date">${formattedDate}</p>
                    `;

                    // ... (newsItemLink 생성 및 추가 로직) ...
                    const newsItemLink = document.createElement('a');
                    newsItemLink.href = item.link;         
                    newsItemLink.target = '_blank';        
                    newsItemLink.className = 'news-item';  
                    newsItemLink.innerHTML = itemContent;
                    newsListContainer.appendChild(newsItemLink);
                    
                    // 👇 2. 다음 항목을 위해 인덱스를 순환 증가시킵니다.
                    imageIndex = (imageIndex + 1) % backgroundImages.length;
                });

                // 데이터 로드 후 캐러셀 초기화
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
    // 2. 캐러셀 제어 로직 (수정된 로직)
    // -----------------------------------------------------
    function initializeCarousel() {
        const newsList = document.getElementById('naver-news-list');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const items = newsList.querySelectorAll('.news-item');

        if (items.length === 0 || !newsList) return;

        let currentIndex = 0;
        const totalItems = items.length;

        // 1. newsList의 너비 설정 (이전에 했던 필수 단계)
        newsList.style.width = `${totalItems * 100}%`;

        // 2. 슬라이드 업데이트 함수 (✅ 계산 오류 수정)
        function updateCarousel() {
            // 각 아이템이 100% 너비를 차지하므로, 이동 거리는 '현재 인덱스 * -100%'
            const offset = currentIndex * -100;
            
            // newsList 전체 너비는 totalItems * 100% 이므로,
            // newsList.style.transform = `translateX(${offset}%)`를 적용해야 함
            newsList.style.transform = `translateX(${offset}%)`; 

            // ❌ 기존에 혼재되어 있던 잘못된 계산은 모두 제거 (아래 두 줄)
            // newsList.style.transform = `translateX(${offset / totalItems}%)`; 
            // newsList.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

            // 버튼 상태 업데이트
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

        updateCarousel(); // 초기 로드 시 버튼 상태 반영 및 0 위치로 설정
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
            return pubDate;
        }
    }

    // -----------------------------------------------------
    // 4. HTML 태그 제거 함수 (기존 로직 유지)
    // -----------------------------------------------------
    function removeHtmlTags(htmlString) {
        if (!htmlString) return '';
        return htmlString.replace(/<[^>]*>?/gm, '');
    }
});