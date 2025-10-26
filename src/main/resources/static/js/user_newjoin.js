document.addEventListener('DOMContentLoaded', function() {
    // 폼 요소와 필수 입력 필드 요소들을 가져옵니다.
    const form = document.getElementById('joinForm');
    const pnameInput = document.getElementById('pname');
    const nicknameInput = document.getElementById('nickname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const birthdateInput = document.getElementById('birthdate');

// user_newjoin.js 파일에 추가/수정

// 비밀번호 확인 관련 DOM 요소 가져오기
const password = document.getElementById('password');
const passwordConfirm = document.getElementById('passwordConfirm');
const passwordConfirmCheckResult = document.getElementById('passwordConfirmCheckResult');
const joinForm = document.getElementById('joinForm');

// 비밀번호 확인 유효성 검사 함수 호출
password.addEventListener('keyup', checkPasswordMatch);
passwordConfirm.addEventListener('keyup', checkPasswordMatch);
// 폼 제출 시 최종 확인
joinForm.addEventListener('submit', validateForm);

    // 메시지 출력 영역 요소들을 가져옵니다.
    const pnameCheckResult = document.getElementById('pnameCheckResult');
    const nicknameCheckResult = document.getElementById('nicknameCheckResult');
    const emailCheckResult = document.getElementById('emailCheckResult');
    const passwordCheckResult = document.getElementById('passwordCheckResult');
    const birthdateCheckResult = document.getElementById('birthdateCheckResult');
    
    // 중복 검사 상태를 저장하는 숨겨진 필드
    const nicknameChecked = document.getElementById('nicknameChecked');
    const emailChecked = document.getElementById('emailChecked'); 

    // 비밀번호 정규식 (최소 8자, 대문자, 소문자, 숫자, 특수문자 포함)
    const passwordStrongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // 비밀번호와 비밀번호 확인이 일치하는지 확인하는 함수
function checkPasswordMatch() {
    const passwordValue = password.value;
    const confirmValue = passwordConfirm.value;
    
    // 비밀번호 필드 또는 확인 필드 둘 중 하나라도 비어 있으면 메시지 출력 안 함 (다른 유효성 검사에서 처리)
    if (passwordValue === '' && confirmValue === '') {
        passwordConfirmCheckResult.textContent = '';
        return false;
    }

    if (passwordValue !== confirmValue) {
        passwordConfirmCheckResult.textContent = '❌ 비밀번호가 일치하지 않습니다.';
        return false;
    } else {
        // 비밀번호 필드에 이미 유효성 검사 결과가 있다면, 일치 시에는 이 메시지를 비워둡니다.
        // 또는, '✔️ 비밀번호가 일치합니다.' 메시지를 표시할 수도 있습니다. (선택)
        if (passwordValue.length > 0 && confirmValue.length > 0) {
            passwordConfirmCheckResult.textContent = '✔️ 비밀번호가 일치합니다.';
            passwordConfirmCheckResult.style.color = 'blue'; // 일치 시 파란색으로 변경
            return true;
        } else {
            passwordConfirmCheckResult.textContent = '';
            return false;
        }
    }
}

// (만약 기존 user_newjoin.js에 폼 유효성 검사 함수가 있다면)
// 폼 제출 처리 함수 (예시)
function validateForm(event) {
    let isValid = true;
    
    // ... 다른 모든 유효성 검사 로직 (이름, 닉네임, 이메일 등) ...
    
    // **비밀번호 일치 검사 추가**
    if (!checkPasswordMatch()) {
        passwordConfirmCheckResult.textContent = '❌ 비밀번호가 일치하는지 확인해 주세요.';
        passwordConfirmCheckResult.style.color = 'red';
        isValid = false;
    }

    // ... 다른 유효성 검사들 (예: 비밀번호 길이/형식 검사) ...
    
    if (!isValid) {
        event.preventDefault(); // 유효성 검사 실패 시 폼 제출 막기
    }
}
    // 메시지를 출력하고 색상을 변경하는 헬퍼 함수
    function displayMessage(messageElement, message, color) {
        messageElement.textContent = message;
        messageElement.style.color = color;
    }
    
    // 개별 필드 유효성 검사 함수 (submit 시 사용)
    function validatePname() {
        if (pnameInput.value.trim() === '') {
            displayMessage(pnameCheckResult, "이름을 입력해 주세요.", 'red');
            pnameInput.focus();
            return false;
        }
        displayMessage(pnameCheckResult, '', 'red');
        return true;
    }

    function validateNickname() {
        if (nicknameInput.value.trim() === '') {
            displayMessage(nicknameCheckResult, '닉네임을 입력해 주세요.', 'red');
            nicknameInput.focus();
            return false;
        } else if (nicknameChecked.value === 'false') {
             displayMessage(nicknameCheckResult, '닉네임 중복 확인을 완료해 주세요.', 'red');
             nicknameInput.focus();
             return false;
        }
        // 통과 시 메시지를 지우지 않고 중복 확인 성공 메시지(초록색)를 유지합니다.
        return true;
    }
    
    function validateEmail() {
        const emailValue = emailInput.value.trim();
        if (emailValue === '') {
            displayMessage(emailCheckResult, '이메일을 입력해 주세요.', 'red');
            emailInput.focus();
            return false;
        } else if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailValue)) {
            displayMessage(emailCheckResult, '유효하지 않은 이메일 형식입니다.', 'red');
            emailInput.focus();
            return false;
        } else if (emailChecked.value === 'false') {
             displayMessage(emailCheckResult, '이메일 중복 확인을 완료해 주세요.', 'red');
             emailInput.focus();
             return false;
        }
        // 통과 시 메시지를 지우지 않고 중복 확인 성공 메시지(초록색)를 유지합니다.
        return true;
    }

    function validatePassword() {
        if (passwordInput.value === '') {
            displayMessage(passwordCheckResult, "비밀번호를 입력해 주세요.", 'red');
            passwordInput.focus();
            return false;
        } else if (!passwordStrongRegex.test(passwordInput.value)) {
            displayMessage(passwordCheckResult, "비밀번호는 최소 8자, 대/소문자, 숫자, 특수문자를 포함해야 합니다.", 'red');
            passwordInput.focus();
            return false;
        }
        displayMessage(passwordCheckResult, '', 'red');
        return true;
    }

    function validateBirthdate() {
        if (birthdateInput.value.trim() === '') {
            displayMessage(birthdateCheckResult, "생년월일을 입력해 주세요.", 'red');
            birthdateInput.focus();
            return false;
        }
        displayMessage(birthdateCheckResult, '', 'red');
        return true;
    }


    
    // 중복 검사 로직 함수 (Blur 시 사용)

    // 닉네임 중복 검사
    async function checkNicknameAvailability() {
        const nicknameValue = nicknameInput.value.trim();

        if (nicknameValue === "") {
            nicknameChecked.value = 'false';
            displayMessage(nicknameCheckResult, '닉네임을 입력해 주세요.', 'red');
            return;
        }

        const checkUrl = `/check/nickname?value=${encodeURIComponent(nicknameValue)}`;
        
        try {
            const response = await fetch(checkUrl);
            const data = await response.json(); 

            if (data.isAvailable === true) {
                // 사용 가능 (중복 아님)
                displayMessage(nicknameCheckResult, '✅ 사용 가능한 닉네임입니다.', 'green');
                nicknameChecked.value = 'true';
                
                //기존 코드: 닉네임 사용 가능 시 alert 유지
                alert('사용 가능한 닉네임입니다.'); 
                
            } else {
                // 이미 사용 중 (중복)
                displayMessage(nicknameCheckResult, '❌ 이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해 주세요.', 'red');
                nicknameChecked.value = 'false';
            }

        } catch (error) {
            console.error('닉네임 중복 확인 중 오류 발생:', error);
            displayMessage(nicknameCheckResult, '사용가능한 닉네임입니다.', 'blue'); 
            nicknameChecked.value = 'true';
        }
    }
    
    // 이메일 중복 검사
    async function checkEmailAvailability() {
        const emailValue = emailInput.value.trim();
        
        if (emailValue === "") {
            emailChecked.value = 'false';
            displayMessage(emailCheckResult, '이메일을 입력해 주세요.', 'red');
            return;
        } 
        
        // 간단한 이메일 형식 검사
        if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailValue)) {
            emailChecked.value = 'false';
            displayMessage(emailCheckResult, '유효하지 않은 이메일 형식입니다.', 'red');
            return;
        }

        const checkUrl = `/check/email?value=${encodeURIComponent(emailValue)}`;
        
        try {
            const response = await fetch(checkUrl);
            const data = await response.json(); 

            if (data.isAvailable === true) {
                // 사용 가능
                displayMessage(emailCheckResult, '✅ 사용 가능한 이메일입니다.', 'green');
                emailChecked.value = 'true';
                
            } else {
                // 이미 사용 중
                displayMessage(emailCheckResult, '❌ 이미 사용 중인 이메일입니다. 다른 이메일을 사용해 주세요.', 'red');
                emailChecked.value = 'false';
            }

        } catch (error) {
            console.error('이메일 중복 확인 중 오류 발생:', error);
            displayMessage(emailCheckResult, '사용가능한 이메일입니다.', 'blue'); 
            emailChecked.value = 'true';
        }
    }

	
    
    
    //이벤트 리스너
   	// 닉네임 입력 변경 감지 및 blur 시 중복 검사
    nicknameInput.addEventListener('input', function() {
        nicknameChecked.value = 'false';
        displayMessage(nicknameCheckResult, '중복 확인이 필요합니다.', 'orange');
    });
    nicknameInput.addEventListener('blur', checkNicknameAvailability);
    
    
    // 이메일 입력 변경 감지 및 blur 시 중복 검사
    emailInput.addEventListener('input', function() {
        emailChecked.value = 'false';
        displayMessage(emailCheckResult, '중복 확인이 필요합니다.', 'orange');
    });
    emailInput.addEventListener('blur', checkEmailAvailability);


    // 폼 제출 (회원가입 버튼 클릭) 이벤트 리스너 - 요청에 따라 단계별 검사 및 즉시 반환 적용
    form.addEventListener('submit', function(event) {
        event.preventDefault(); 
        
        // 1. 이름 검사 (실패 시 즉시 중단 및 포커스)
        if (!validatePname()) {
            return; 
        }

        // 2. 닉네임 검사 (실패 시 즉시 중단 및 포커스)
        if (!validateNickname()) {
            return;
        }

        // 3. 이메일 검사 (실패 시 즉시 중단 및 포커스)
        if (!validateEmail()) {
            return;
        }


        // 4. 비밀번호 검사 (실패 시 즉시 중단 및 포커스)
        if (!validatePassword()) {
            return;
        }
        
        // 5. 생일 검사 (실패 시 즉시 중단 및 포커스)
        if (!validateBirthdate()) {
            return;
        }

        // 모든 검사를 통과했을 경우
        
        //모든 검사를 통과했을 때 alert 호출
        alert('회원가입이 완료되었습니다!'); 
        
        // 폼을 실제로 서버로 제출
        form.submit();
    });
});
