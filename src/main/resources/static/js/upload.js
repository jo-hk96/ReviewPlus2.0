document.getElementById('profileUploadForm').addEventListener('submit' ,function(event){
	event.preventDefault();
	const form = event.currentTarget;
	const fileInput = document.getElementById('profileImageInput');
	const resultDiv = document.getElementById('resultMessage');
	
	//파일이 선택되었는지 확인
	if(fileInput.files.length === 0){
		alert('업로드할 파일을 선택해 주세요');
		return;
	}
	
	const uploadUrl = `/api/profile/upload`;
	
	const formData = new FormData();
	formData.append('file',fileInput.files[0]);
	
	
	fetch(uploadUrl,{
		method: 'POST',
		body:formData
	})
	.then(response => {
		if(!response.ok){
			throw new Error('서버 응답 오류:' + response.status);
		}
		return response.text();
	})
	.then(data => {
		console.log('업로드 성공:', data);
		resultDiv.style.color = 'green';
		resultDiv.innerText = data;
		loadProfileImage(LOGGED_IN_USER_ID);
		fileInput.value = '';
	})
	.catch(error => {
		console.error('업로드 중 에러 발생:', error);
		resultDiv.style.color = 'red';
		resultDiv.innerText = '업로드 실패: 서버 또는 네트워크 오류';
	});
});



function loadProfileImage(userId) {
    fetch(`/api/profile/image/${userId}`)
        .then(response => response.text()) 
        .then(storedFileName => {
            const imageUrl = '/images/profile/' + storedFileName; // 최종 이미지 URL 생성
            
            const profileImgElement = document.getElementById('userProfilePicture'); 
            
            if (profileImgElement) {
                profileImgElement.src = imageUrl;
            }
        })
        .catch(error => {
            console.error('프로필 이미지 로드 실패:', error);
        });
}
loadProfileImage(currentUserId);