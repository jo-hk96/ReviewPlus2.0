			document.addEventListener('DOMContentLoaded', function() {
		    const form = document.getElementById('loginForm');
		
		    // 이메일 관련 요소
		    const emailInput = document.getElementById('email');
		    const emailError = document.getElementById('emailError');
		    const emailRegex = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
		
		    // 비밀번호 관련 요소
		    const passwordInput = document.getElementById('password');
		    const passwordError = document.getElementById('passwordError');
		
		
			//이메일유효성 검사
		    function validateEmail() {
		        const emailValue = emailInput.value.trim();
		
		        if (emailValue === "") {
		            emailError.textContent = "이메일이 입력되지 않았습니다.";
		            return 0; // 비어 있음
		        } else if (!emailRegex.test(emailValue)) {
		            emailError.textContent = "올바른 이메일 형식이 아닙니다.";
		            return 1; // 형식 오류
		        } else {
		            emailError.textContent = "";
		            return 2; // 유효함
		        }
		    }
		
		   
		   //비밀번호 빈값검사
		    function validatePassword() {
		        const passwordValue = passwordInput.value.trim();
		
		        if (passwordValue === "") {
		            passwordError.textContent = "비밀번호가 입력되지 않았습니다.";
		            return 0; // 비어 있음
		        } else {
		            // 비밀번호 길이 검사 요청이 없으므로, 비어 있지 않으면 유효한 것으로 처리
		            passwordError.textContent = "";
		            return 2; // 유효함
		        }
		    }
		
		    // --- 폼 제출(Submit) 이벤트 리스너 ---
		    form.addEventListener('submit', function(event) {
		        // 1. 유효성 검사 실행
		        const emailValidationResult = validateEmail();
		        const passwordValidationResult = validatePassword();
		
		        // 2. 하나라도 유효하지 않으면 폼 제출 중지 및 alert 실행
		        if (emailValidationResult !== 2 || passwordValidationResult !== 2) {
		            event.preventDefault(); // 폼 제출 중지
		
		            // ---비어 있을 때 alert 메시지 (우선순위 높음) ---
		            if (emailValidationResult === 0) {
		                alert('이메일을 입력해주세요.');
		                emailInput.focus();
		                return;
		            }
		
		            if (passwordValidationResult === 0) {
		                alert('비밀번호를 입력해주세요.');
		                passwordInput.focus();
		                return;
		            }
		
		            // 형식 오류 alert 메시지 (빈 값이 아닐 때)
		            if (emailValidationResult === 1) {
		                alert('이메일 형식이 올바르지 않습니다.');
		                emailInput.focus();
		                return;
		            }
		
		            return;
		        }
		    });
		
		    // blur 이벤트는 span에만 오류 메시지를 표시
		    emailInput.addEventListener('blur', validateEmail);
		    passwordInput.addEventListener('blur', validatePassword);
		});
