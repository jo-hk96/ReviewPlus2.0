const getElement = (id) => document.getElementById(id);


document.addEventListener('DOMContentLoaded', function() {
    // 폼 요소와 필수 입력 필드 요소들을 가져옵니다.
    const form = document.getElementById('joinForm');
    const pnameInput = document.getElementById('pname');
    const nicknameInput = document.getElementById('nickname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = getElement('passwordConfirm');
    const birthdateInput = document.getElementById('birthdate'); // ⭐️ 생년월일 입력 필드
    
    let checkNickname = true;
    let checkEmail = true; 
    let checkPname = true;
    let checkPassword = true;       
    // checkBirthdate 플래그는 필요 없으며, 함수 리턴 값으로 처리합니다.
    
    // --- 이름 유효성 검사 함수 (validationPname) - 2~10자 한글/영문만 허용 ---
    function validationPname() {
        const pnameCheckResult = getElement('pnameCheckResult'); 
        const pname = pnameInput.value.trim();
        
        // 1. 미입력 검사
        if (pname.length === 0) {
            pnameCheckResult.textContent = "이름을 입력하세요.";
            pnameCheckResult.style.color = 'red';
            checkPname = true; 
            return false;
        } 
        
        // 2. 길이 및 문자 형식 검사: 2~10자의 한글 또는 영문만 허용
        const nameRegex = /^[가-힣a-zA-Z]{2,10}$/; 
        
        if (!nameRegex.test(pname)) {
            pnameCheckResult.textContent = "이름은 2~10자의 한글 또는 영문만 가능합니다.";
            pnameCheckResult.style.color = 'red';
            checkPname = true; // 실패
            return false;
        }
        
        // 모든 검사 통과
        pnameCheckResult.textContent = ""; 
        pnameCheckResult.style.color = 'green';
        checkPname = false; // 성공
        return true;
    }
    // ------------------------------------
    
 
    
    // --- 비밀번호 유효성 검사 함수 ---
    function validatePassword() {
        const passwordCheckResult = getElement('passwordCheckResult');
        const password = passwordInput.value;
        const passwordLength = password.length;

      
        let charTypeCount = 0;
        if (/[a-z]/.test(password)) charTypeCount++;    // 소문자
        if (/[A-Z]/.test(password)) charTypeCount++;    // 대문자
        if (/\d/.test(password)) charTypeCount++;       // 숫자
        if (/[!@#$%^&*()_+]/.test(password)) charTypeCount++; // 특수문자 (예시)

        // 1. 길이 검사
        if (passwordLength < 8 || passwordLength > 16) {
            passwordCheckResult.textContent = "비밀번호는 8자 이상 16자 이하로 설정해야 합니다.";
            passwordCheckResult.style.color = 'red';
            checkPassword = true;
            return;
        }

        // 2. 복잡성 검사 (3가지 이상 포함)
        if (charTypeCount < 3) {
            passwordCheckResult.textContent = "영문 대/소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.";
            passwordCheckResult.style.color = 'red';
            checkPassword = true;
            return;
        }
        
        // 모든 검사 통과
        passwordCheckResult.textContent = "사용 가능한 비밀번호입니다.";
        passwordCheckResult.style.color = 'green';
        checkPassword = false;
        
        // 비밀번호가 유효해졌으므로, 비밀번호 확인 필드의 일치 여부도 다시 검사합니다.
        checkPasswordMatch();
    }
    // ------------------------------------
    
    // --- 생년월일 유효성 검사 함수 (새로 추가) ---
  function validateBirthdate() {
        const birthdateCheckResult = getElement('birthdateCheckResult'); 
        const birthdate = birthdateInput.value;
        
        // 1. 미입력 검사
        if (!birthdate) {
            birthdateCheckResult.textContent = "생년월일을 입력해주세요.";
            birthdateCheckResult.style.color = 'red';
            return false;
        }

        // 2. 미래 날짜 검사
        const today = new Date();
        const inputDate = new Date(birthdate);
        
        // 시간 부분을 제거하여 날짜만 비교
        today.setHours(0, 0, 0, 0); 
        inputDate.setHours(0, 0, 0, 0); 

        if (inputDate > today) {
            birthdateCheckResult.textContent = "생년월일은 미래 날짜일 수 없습니다.";
            birthdateCheckResult.style.color = 'red';
            return false;
        }
        
        // 3. 모든 검사 통과 (추가/수정된 부분)
        birthdateCheckResult.textContent = "사용 가능한 생년월일입니다."; // ⭐️ 긍정 메시지 표시
        birthdateCheckResult.style.color = 'green';
        return true;
    }
    // ------------------------------------
    
    // 이메일 중복 검사 함수
    async function checkEmailDuplication() {
        const emailCheckResult = getElement('emailCheckResult');
        const email = emailInput.value;
        
        // 이메일 빈값 체크
        if (!email) {
            emailCheckResult.textContent = "이메일을 입력해주세요.";
            emailCheckResult.style.color = 'red';
            checkEmail = true; // 실패
            return;
        }
        
        
        // 2. 이메일 형식 유효성 검사 (정규 표현식)
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        
        if (!emailRegex.test(email)) {
            emailCheckResult.textContent = "유효하지 않은 이메일 형식입니다. (@와 도메인을 확인해 주세요)";
            emailCheckResult.style.color = 'red';
            checkEmail = true; // 실패
            return;
        }
        
        try {
            const response = await fetch(`/check/email?email=${encodeURIComponent(email)}`);
            
            if (!response.ok) {
                throw new Error(`API 통신 오류: ${response.status}`);
            }

            const isDuplicated = await response.json(); 

            if (isDuplicated === true) {
                emailCheckResult.textContent = " 이미 사용 중인 이메일입니다.";
                emailCheckResult.style.color = 'red';
                checkEmail = true; // 중복(실패)
            } else {
                emailCheckResult.textContent = " 사용 가능한 이메일입니다.";
                emailCheckResult.style.color = 'green';
                checkEmail = false; // 중복 아님(성공)
            }
        } catch (error) {
            console.error("이메일 검사 오류:", error);
            emailCheckResult.textContent = "이메일 검사 중 오류가 발생했습니다.";
            emailCheckResult.style.color = 'orange';
            checkEmail = true; // 오류 발생 시 실패 처리
        }
    }
   
  

    
    // 닉네임 중복 검사
    async function checkNicknameDuplication() {
            const nicknameCheckResult = getElement('nicknameCheckResult');
            const nickname = nicknameInput.value;

            if (!nickname) {
                nicknameCheckResult.textContent = "닉네임을 입력해주세요.";
                nicknameCheckResult.style.color = 'red';
                checkNickname = true; // 실패
                return;
            }

            try {
                const response = await fetch(`/check/nickname?nickname=${encodeURIComponent(nickname)}`);
                
                if (!response.ok) {
                    throw new Error('API 통신 오류');
                }
                
                const isDuplicated = await response.json();

                if (isDuplicated === true) {
                    nicknameCheckResult.textContent = " 이미 사용 중인 닉네임입니다.";
                    nicknameCheckResult.style.color = 'red';
	                checkNickname = true; // 중복(실패)
                } else {
                    nicknameCheckResult.textContent = " 사용 가능한 닉네임입니다.";
                    nicknameCheckResult.style.color = 'green';
                    checkNickname = false; // 중복 아님(성공)
                }
            } catch (error) {
                console.error("닉네임 검사 오류:", error);
                nicknameCheckResult.textContent = "닉네임 검사 중 오류가 발생했습니다.";
                nicknameCheckResult.style.color = 'orange';
                checkNickname = true; // 오류 발생 시 실패 처리
            }
        }
        
        
        function checkPasswordMatch() {
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;
            const resultSpan = getElement('passwordConfirmCheckResult');
            
            if (password.length === 0 && passwordConfirm.length === 0) {
                resultSpan.textContent = "";
                resultSpan.style.color = 'black';
                return;
            }
            
            if (password.length === 0) {
                 resultSpan.textContent = "비밀번호를 먼저 입력하세요.";
                 resultSpan.style.color = 'red';
            } else if (password === passwordConfirm) {
                resultSpan.textContent = "비밀번호가 일치합니다.";
                resultSpan.style.color = 'green';
            } else {
                resultSpan.textContent = "비밀번호가 일치하지 않습니다.";
                resultSpan.style.color = 'red';
            }
        }
    
        // --- 이벤트 리스너 등록 ---
    
        // 이름: 포커스를 잃었을 때 유효성 검사 실행
        pnameInput.addEventListener('blur', validationPname);
    
        // 이메일: 포커스를 잃었을 때 (입력이 끝났을 때) 중복 검사
        emailInput.addEventListener('blur', checkEmailDuplication);
        
        // 닉네임: 포커스를 잃었을 때 중복 검사
        nicknameInput.addEventListener('blur', checkNicknameDuplication);
        
        // 비밀번호: 키를 누를 때마다 유효성 검사 실행
        passwordInput.addEventListener('keyup', validatePassword);
        
        // 비밀번호 확인: 키를 누를 때마다 일치 여부 확인
        passwordConfirmInput.addEventListener('keyup', checkPasswordMatch);
        passwordInput.addEventListener('keyup', checkPasswordMatch); 
        
        // ⭐️ 생년월일: 포커스를 잃었을 때 유효성 검사 실행
        birthdateInput.addEventListener('blur', validateBirthdate);
        
        
        // 최종 폼 제출 시 전체 유효성 검사
        form.addEventListener('submit', async function(e) {   
	    
	    // 1. 제출 전에 모든 유효성 검사 함수를 강제 실행하여 최종 상태를 업데이트합니다.
        validationPname();
        validatePassword(); 
        checkPasswordMatch();
        // ⭐️ 생년월일 유효성 검사 실행
        const isBirthdateValid = validateBirthdate();
        
        // API 호출 함수는 await으로 상태를 최종 업데이트합니다.
        await checkEmailDuplication();
        await checkNicknameDuplication();
        
        // --- 최종 검사 ---
        
        // 2. 이름 미입력/유효성 검사
        if (checkPname) {
            alert('이름을 2~10자의 한글 또는 영문으로 정확히 입력해주세요.');
            e.preventDefault(); 
            return;
        }
        
        // 3. 비밀번호 유효성 검사
        if (checkPassword) {
            alert('비밀번호가 유효성 조건을 만족하지 못합니다. (8~16자, 3종류 문자 포함)');
            e.preventDefault();
            return;
        }
        
       // 4. 비밀번호 일치 검사
        if (passwordInput.value !== passwordConfirmInput.value || passwordConfirmInput.value === '') {
            alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            e.preventDefault(); 
            return;
        }
        
        // ⭐️ 5. 생년월일 유효성 검사
        if (!isBirthdateValid) {
            alert('생년월일을 정확히 입력해주세요. (미래 날짜 불가)');
            e.preventDefault(); 
            return;
        }
            
        // 6. 닉네임 중복 검사 상태 확인 (API 결과)
			if(checkNickname) {
				alert('이미 존재하는 닉네임 이거나 닉네임 검사에 오류가 발생했습니다.');
				e.preventDefault();
                return;
			}
			
		// 7. 이메일 중복 검사 상태 확인 (API 결과)
        if(checkEmail) {
            alert('이미 존재하는 이메일 이거나 이메일 검사에 오류가 발생했습니다.');
            e.preventDefault();
            return;
        }
        
        // 모든 검사 통과 시 폼 제출 (서버로 데이터 전송)
        alert('모든 유효성 검사를 통과했습니다. 회원가입을 완료되었습니다.'); 
       
        });

    });