document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('profileImageInput');
    const form = document.getElementById('profileUploadForm');
    
    // Flutter 환경이 아닐 때만 작동
    if (fileInput && form && typeof ProfileChannel === 'undefined') {
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length === 0) {
                return;
            }
            
            const uploadUrl = `/api/profile/upload`; 
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            
            // 로딩 상태 표시 (선택 사항)
            const resultDiv = document.getElementById('resultMessage');
            if (resultDiv) {
                resultDiv.innerText = "업로드 중...";
                resultDiv.style.color = 'yellow';
            }

            fetch(uploadUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => {
	            if (!response.ok) {
	                // HTTP 오류 상태 코드 처리
	                throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
	            }
	            return response.json(); 
	        })
	        .then(data => {
                if (data.success) {
                    const newImageUrl = data.newImageUrl;
                    // 1. 캐시 버스팅 URL 생성
                    const cacheBustingUrl = newImageUrl + '?t=' + new Date().getTime();
                    
                    // 2. 마이페이지 프로필 사진 갱신 (ID 선택자)
                    const profileImgElement = document.getElementById('userProfilePicture'); 
                    if (profileImgElement) {
                        profileImgElement.src = cacheBustingUrl; 
                    }
                    
                    // 3. 모든 리뷰/댓글 프로필 이미지 갱신 (클래스 선택자)
                    const allReviewImages = document.querySelectorAll(`.profile-image`); 
                    allReviewImages.forEach(img => {
                        // 기존 src가 새로운 파일명(캐시버스팅 제거된)을 포함하는 경우에만 갱신
                        if (img.src.includes(newImageUrl.split('?')[0])) { 
                            img.src = cacheBustingUrl;
                        }
                    });

                    // 4. 결과 메시지 표시
                    if (resultDiv) {
                        resultDiv.innerText = "프로필 사진이 성공적으로 변경되었습니다.";
                        resultDiv.style.color = 'white'; // 성공 시 흰색
                    }
                } else {
                    // 서버에서 success: false를 보냈을 때
                    if (resultDiv) {
                        resultDiv.style.color = 'red';
                        resultDiv.innerText = data.message || '파일 업로드 실패.';
                    }
                }
                
                // 5. input 초기화 (성공/실패 모두)
                document.getElementById('profileImageInput').value = ''; 
	        })
            .catch(error => {
                // 네트워크 오류, 파싱 오류, throw된 서버 응답 오류 처리
                console.error('업로드 중 에러 발생:', error);
                if (resultDiv) {
                    resultDiv.style.color = 'red';
                    resultDiv.innerText = `업로드 실패: ${error.message}`;
                }
                document.getElementById('profileImageInput').value = '';
            });
        });
    }
});

function startUpload() {
    if (typeof ProfileChannel !== 'undefined') {
        ProfileChannel.postMessage('upload_start'); 
    } else {
        // 일반 웹 환경에서는 파일 인풋을 클릭
        document.getElementById('profileImageInput').click();
    }
}