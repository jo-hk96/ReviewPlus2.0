// 기존의 submit 리스너를 fetch 로직으로 대체하는 코드입니다.

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('profileImageInput');
    // form 변수는 더 이상 submit() 용도로 필요 없지만, 구조를 위해 남겨둡니다.
    const form = document.getElementById('profileUploadForm'); 
    
    // Flutter 환경이 아닐 때만 작동
    if (fileInput && form && typeof ProfileChannel === 'undefined') {
        
        fileInput.addEventListener('change', () => {
            const resultDiv = document.getElementById('resultMessage');
            
            if (fileInput.files.length === 0) {
                // 파일이 선택되지 않은 경우
                return;
            }
            
            // ⭐️ 기존 form.submit() 대신 AJAX(fetch) 실행 로직 ⭐️
            const uploadUrl = `/api/profile/upload`; 
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            
            fetch(uploadUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => {
	                if (!response.ok) {
	                    throw new Error(`서버 응답 오류: ${response.status}`);
	                }
	                return response.json(); // 응답을 JSON 객체로 파싱
	            })
	            .then(data => {
	                // 성공적으로 JSON 데이터를 받은 경우
	                if (data.success) {
	                    const newImageUrl = data.newImageUrl;
				        
				        // 2. 타임스탬프를 쿼리 파라미터로 추가
				        const cacheBustingUrl = newImageUrl + '?t=' + new Date().getTime();
	                    updateProfileImage(data.newImageUrl);
	                    
	                    
	                    //마이페이지 프로필사진 이미지 갱신
	                    const profileImgElement = document.getElementById('userProfilePicture'); 
				        if (profileImgElement) {
				            profileImgElement.src = cacheBustingUrl; 
				        }
				        
				        const allReviewImages = document.querySelectorAll(`.profile-image`); 
        
				        allReviewImages.forEach(img => {
				            // 이 이미지가 현재 로그인 사용자의 이미지인지 확인하는 로직이 필요할 수 있지만,
				            // 일단 모든 프로필 이미지를 갱신하는 게 가장 간단함.
				            if (img.src.includes(newImageUrl.split('?')[0])) { // 기존 src가 새로운 파일명을 포함한다면
				                img.src = cacheBustingUrl;
				            }
				        });
				        
				        const resultDiv = document.getElementById('resultMessage'); 
				        if (resultDiv) {
				            resultDiv.innerText = "프로필 사진이 변경 되었습니다.";
				            resultDiv.style.color = 'white';
				        }
				        
					        document.getElementById('profileImageInput').value = '';
	                } else {
	                    resultDiv.style.color = 'red';
	                    resultDiv.innerText = data.message || '파일 업로드 실패.';
	                }
	                fileInput.value = ''; // input 초기화
	            })
            .catch(error => {
                console.error('업로드 중 에러 발생:', error);
                const resultDiv = document.getElementById('resultMessage');
                resultDiv.style.color = 'red';
                resultDiv.innerText = '업로드 실패: 네트워크 또는 서버 오류';
            });
        });
    }
});

function startUpload() {
	    if (typeof ProfileChannel !== 'undefined') {
	        // ⭐️ 1. Flutter 웹뷰 환경: Flutter 로직 호출
	        ProfileChannel.postMessage('upload_start'); 
	    } else {
	        // ⭐️ 2. 일반 웹 환경: 숨겨진 파일 선택창을 클릭
	        const fileInput = document.getElementById('profileImageInput');
	        fileInput.click();
	        
	        console.log('일반 웹 환경: 파일 선택창을 엽니다.');
	    }
	}
	
	function updateProfileImage(newUrl) {
        const imgElement = document.getElementById('userProfilePicture');
        const resultDiv = document.getElementById('resultMessage'); 

        if (imgElement) {
            imgElement.src = newUrl;
            if (resultDiv) {
                resultDiv.innerText = "프로필 사진이 성공적으로 변경되었습니다.";
                resultDiv.style.color = 'green';
            }
        }
    }