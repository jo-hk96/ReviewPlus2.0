	
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
		if(!MailModal || !closeBtn) return;
		closeBtn.onclick = function(){
			MailModal.style.display = 'none';
		};
		window.onclick = function(event){
			if(event.target === MailModal){
				MailModal.style.display = 'none';
			}
		};
	})