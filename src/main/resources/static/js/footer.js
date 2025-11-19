// 기존 openMailModal() 함수는 그대로 둡니다.
function openMailModal(){
	const MailModal = document.getElementById('MailForwarding');
	if(MailModal){
		MailModal.style.display = 'block';
	}else{
		console.error("모달을 찾을수 없음");
	}
}

document.addEventListener('DOMContentLoaded', function(){
    const MailModal = document.getElementById('MailForwarding');
    const closeBtn = document.querySelector('.MailCloseBtn');
    
    // 폼 요소(id="MailForm")를 가져옵니다.
    const mailForm = document.getElementById('MailForm');
    
    // HTML에 SuccessScreen이 있다면 가져옵니다. (없어도 이 로직은 작동하지만, 이전 SuccessScreen 관련 코드는 제거해야 합니다.)
    // 이 예시에서는 SuccessScreen 관련 요소를 사용하지 않습니다.
    
    if(!MailModal || !closeBtn || !mailForm) return;

    // [⭐ 폼 제출 로직을 AJAX(Fetch)로 변경합니다.]
    mailForm.addEventListener('submit', function(event) {
        // 1. 폼의 기본 제출 동작(페이지 전환)을 막습니다.
        event.preventDefault(); 

        const isConfirmed = confirm("정말로 문의를 전송하시겠습니까? 전송 후에는 수정할 수 없습니다.");

        if (isConfirmed) {
            
            const formData = new FormData(mailForm);
            
            // Fetch API를 사용하여 AJAX 요청을 보냅니다.
            fetch(mailForm.action, { 
                method: mailForm.method, 
                body: formData, 
            })
            .then(response => {
                // 서버 응답이 성공(HTTP 200-299)인지 확인합니다.
                if (!response.ok) {
                    // 서버 응답은 왔지만 실패 상태 코드(4xx, 5xx)인 경우
                    throw new Error(`문의 전송 실패: ${response.status}`);
                }
                return response.text(); 
            })
            .then(data => {
                // 전송 성공 처리
                console.log("문의 전송 성공!", data);
                
                // 1. 모달 닫기
                MailModal.style.display = 'none';

                // 2. ⭐ 성공 Alert 메시지 표시
                alert("문의가 성공적으로 전송되었습니다! ✅"); 

                // 3. 폼 내용 초기화
                mailForm.reset();
            })
            .catch(error => {
                // 전송 실패 처리 (네트워크 오류, fetch 오류, 서버 실패 상태 코드 등)
                console.error("전송 중 오류 발생:", error);
                
                // ⭐ 실패 Alert 메시지 표시
                alert("문의 전송에 실패했습니다! ❌ 다시 시도해 주세요.");
            });

        } else {
            // 사용자가 취소한 경우
            console.log("문의 전송 취소됨");
        }
    });

    // 기존 모달 닫기 로직
    closeBtn.onclick = function(){
        MailModal.style.display = 'none';
    };
    
    window.onclick = function(event){
        if(event.target === MailModal){
            MailModal.style.display = 'none';
        }
    };
});