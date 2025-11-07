
const getElement = (id) => document.getElementById(id);


document.addEventListener('DOMContentLoaded', function() {
    // 폼 요소와 필수 입력 필드 요소들을 가져옵니다.
    const form = document.getElementById('joinForm');
    const pnameInput = document.getElementById('pname');
    const pnameConfirmInput = document.getElementById('pnameCheckResult');
    const nicknameInput = document.getElementById('nickname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = getElement('passwordConfirm');
    const birthdateInput = document.getElementById('birthdate');
    
    //이메일 정규표현식
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    let checkNickname = false;
    let checkEmail = false;
    let checkEmailRegex = false;
    
    
    
    //이름 빈값
    function CheckPname(){
		const pname = pnameInput.value;
		const pnameResultSpan = getElement('pnameCheckResult');
		
		if(panem.length === 0){
			pnameResultSpan.textContent
			
		}
		
	}
     function checkPasswordMatch() {
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;
            const resultSpan = getElement('passwordConfirmCheckResult');
            
            if (password.length === 0) {
                resultSpan.textContent = "";
                resultSpan.style.color = 'black';
            } else if (password === passwordConfirm) {
                resultSpan.textContent = "비밀번호가 일치합니다.";
                resultSpan.style.color = 'green';
            } else {
                resultSpan.textContent = "비밀번호가 일치하지 않습니다.";
                resultSpan.style.color = 'red';
            }
        }

    
    //이메일 중복 검사 함수
    async function checkEmailDuplication() {
        const emailCheckResult = getElement('emailCheckResult');
        const email = emailInput.value;

        // 빈값 체크
        if (!email) {
            emailCheckResult.textContent = "이메일을 입력해주세요.";
            emailCheckResult.style.color = 'red';
            return;
        }
        
       	if(!emailRegex.test(email)){
			emailCheckResult.textContent = "올바른 이메일 형식이 아닙니다.";
			emailCheckResult.style.color = 'red';
			checkEmailRegex = true;
			return;
		} 
        
        try {
            const response = await fetch(`/check/email?email=${encodeURIComponent(email)}`);
            
            if (!response.ok) {
                throw new Error('API 통신 오류');
            }

            const isDuplicated = await response.json(); 
			
            if (isDuplicated === true) {
                emailCheckResult.textContent = "이미 사용 중인 이메일입니다.";
                emailCheckResult.style.color = 'red';
                checkEmail = true;
            } else {
                emailCheckResult.textContent = "사용 가능한 이메일입니다.";
                emailCheckResult.style.color = 'blue';
                checkEmail = false;
            }
        } catch (error) {
            console.error("이메일 검사 오류:", error);
            emailCheckResult.textContent = "이메일 검사 중 오류가 발생했습니다.";
            emailCheckResult.style.color = 'orange';
        }
    }
    
    
    
    //닉네임 중복 검사
    async function checkNicknameDuplication() {
            const nicknameCheckResult = getElement('nicknameCheckResult');
            const nickname = nicknameInput.value;

            if (!nickname) {
                nicknameCheckResult.textContent = "닉네임을 입력해주세요.";
                nicknameCheckResult.style.color = 'red';
                return;
            }

            try {
                const response = await fetch(`/check/nickname?nickname=${encodeURIComponent(nickname)}`);
                
                if (!response.ok) {
                    throw new Error('API 통신 오류');
                }
                
                const isDuplicated = await response.json();

                if (isDuplicated === true) {
                    nicknameCheckResult.textContent = "이미 사용 중인 닉네임입니다.";
                    nicknameCheckResult.style.color = 'red';
	                checkNickname = true;
                } else {
                    nicknameCheckResult.textContent = "사용 가능한 닉네임입니다.";
                    nicknameCheckResult.style.color = 'blue';
                    checkNickname = false;
                }
            } catch (error) {
                console.error("닉네임 검사 오류:", error);
                nicknameCheckResult.textContent = "닉네임 검사 중 오류가 발생했습니다.";
                nicknameCheckResult.style.color = 'orange';
            }
        }
        
        
        
        //비밀번호 유효성
        function checkPasswordMatch() {
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;
            const resultSpan = getElement('passwordConfirmCheckResult');
            
            if (password.length === 0) {
                resultSpan.textContent = "";
                resultSpan.style.color = 'black';
            } else if (password === passwordConfirm) {
                resultSpan.textContent = "비밀번호가 일치합니다.";
                resultSpan.style.color = 'green';
            } else {
                resultSpan.textContent = "비밀번호가 일치하지 않습니다.";
                resultSpan.style.color = 'red';
            }
        }

       
        // 이메일: 포커스를 잃었을 때 (입력이 끝났을 때) 중복 검사
        emailInput.addEventListener('blur', checkEmailDuplication);
        
        // 닉네임: 포커스를 잃었을 때 중복 검사
        nicknameInput.addEventListener('blur', checkNicknameDuplication);
        
        // 비밀번호 확인: 키를 누를 때마다 일치 여부 확인
        passwordConfirmInput.addEventListener('keyup', checkPasswordMatch);
        passwordInput.addEventListener('keyup', checkPasswordMatch); 
        
        // 최종 폼 제출 시 비밀번호 일치 검사만 남김
        form.addEventListener('submit', function(e) {
            if (passwordInput.value !== passwordConfirmInput.value || passwordInput.value.length === 0) {
                alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
                e.preventDefault();
            }
            //닉네임 중복 검사
			if(checkNickname) {
				alert('중복된 닉네임입니다.');
				e.preventDefault();
				nicknameInput.focus();
			}
			if(checkEmail){
				alert('중복된 이메일입니다.')
				e.preventDefault();
				emailInput.focus();
			}
			if(checkEmailRegex){
				alert('올바른 이메일 형식이 아닙니다.')
				e.preventDefault();
				emailInput.focus();
			}
        });

    });
    