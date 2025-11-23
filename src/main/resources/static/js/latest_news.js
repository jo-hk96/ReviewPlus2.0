document.addEventListener('DOMContentLoaded', function() {
    
    const backgroundImages = [
        "/images/newsimg1.svg", 
    ];
    let imageIndex = 0;
    
    const newsListContainer = document.getElementById('naver-news-list');
    const apiUrl = '/api/naver/news?query=%EC%98%81%ED%99%94%7C%EA%B0%9C%EB%B4%89%7C%EA%B0%9C%EB%B4%89%EC%98%88%EC%A0%95%7C%EB%B0%95%EC%8A%A4%EC%98%A4%ED%94%BC%EC%8A%A4&display=5&sort=sim';

    // 1. AJAX 데이터 로딩 로직
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
                    const imageUrl = backgroundImages[imageIndex]; 
                    const cleanTitle = removeHtmlTags(item.title);
                    const formattedDate = formatDate(item.pubDate);

                    const itemContent = `
                        <img src="${imageUrl}" alt="${cleanTitle} 뉴스 이미지";>
                        <p class="title">${cleanTitle}</p>
                        <p class="date">${formattedDate}</p>
                    `;

                    const newsItemLink = document.createElement('a');
                    newsItemLink.href = item.link;         
                    newsItemLink.target = '_blank';        
                    
                    newsItemLink.className = 'news-item';  
                    
                    newsItemLink.innerHTML = itemContent;
                    newsListContainer.appendChild(newsItemLink);
                    
                    imageIndex = (imageIndex + 1) % backgroundImages.length;
                });

                initializeCarousel(); 
            } else {
                newsListContainer.innerHTML = '<p>검색된 뉴스 결과가 없습니다.</p>';
            }
        })
        .catch(error => {
            console.error('데이터 로딩 오류:', error);
            newsListContainer.innerHTML = '<p style="color: red;">데이터를 불러오는 중 오류가 발생했습니다.</p>';
        });

    function initializeCarousel() {
        const elem = document.getElementById('naver-news-list');
        if (!elem) return; // 요소가 없으면 종료

        const flkty = new Flickity(elem, {
            cellAlign: 'center', // 중앙 정렬 (가장 중요한 설정)
            contain: true,       // 슬라이드가 컨테이너를 벗어나지 않도록 함
            freeScroll: false,   // 자유 스크롤 비활성화 (착착 멈추게 함)
            wrapAround: true,    // 무한 루프
            gutter: 20,          // 슬라이드 간 간격 (CSS의 margin 대신 사용)
            pageDots: false, // 도트를 활성화 (4개가 생성되어야 함)
            prevNextButtons: true
        });
    }

    // 3. 날짜 형식 변환 함수 (기존 로직 유지)
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

    // 4. HTML 태그 제거 함수 (기존 로직 유지)
    function removeHtmlTags(htmlString) {
        if (!htmlString) return '';
        return htmlString.replace(/<[^>]*>?/gm, '');
    }
});