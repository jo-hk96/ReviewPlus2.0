const getElement = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
    const form = getElement("joinForm");
    const pnameInput = getElement("pname");
    const nicknameInput = getElement("nickname");
    const emailInput = getElement("email");
    const passwordInput = getElement("password");
    const passwordConfirmInput = getElement("passwordConfirm");
    const birthdateInput = getElement("birthdate");

    // 상태 플래그 (false = 통과, true = 실패)
    let checkPname = true;
    let checkNickname = true;
    let checkEmail = true;
    let checkPassword = true;

    // --- 이름 유효성 검사 ---
    const validatePname = () => {
        const pname = pnameInput.value.trim();
        const result = getElement("pnameCheckResult");

        if (!pname) {
            result.textContent = "이름을 입력하세요.";
            result.style.color = "red";
            checkPname = true;
            return false;
        }

        const nameRegex = /^[가-힣a-zA-Z]{2,10}$/;
        if (!nameRegex.test(pname)) {
            result.textContent = "이름은 2~10자의 한글 또는 영문만 가능합니다.";
            result.style.color = "red";
            checkPname = true;
            return false;
        }

        result.textContent = "사용 가능한 이름입니다.";
        result.style.color = "green";
        checkPname = false;
        return true;
    };

    // --- 비밀번호 유효성 검사 ---
    const validatePassword = () => {
        const password = passwordInput.value;
        const result = getElement("passwordCheckResult");

        const charTypeCount =
            [/[a-z]/, /[A-Z]/, /\d/, /[!@#$%^&*()_+]/].filter((r) =>
                r.test(password)
            ).length;

        if (password.length < 8 || password.length > 16) {
            result.textContent = "비밀번호는 8~16자여야 합니다.";
            result.style.color = "red";
            checkPassword = true;
            return;
        }

        if (charTypeCount < 3) {
            result.textContent =
                "영문 대/소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.";
            result.style.color = "red";
            checkPassword = true;
            return;
        }

        result.textContent = "사용 가능한 비밀번호입니다.";
        result.style.color = "green";
        checkPassword = false;

        checkPasswordMatch();
    };

    // --- 비밀번호 확인 ---
    const checkPasswordMatch = () => {
        const result = getElement("passwordConfirmCheckResult");
        const password = passwordInput.value;
        const confirm = passwordConfirmInput.value;

        if (!password && !confirm) {
            result.textContent = "";
            return;
        }

        if (!password) {
            result.textContent = "비밀번호를 먼저 입력하세요.";
            result.style.color = "red";
            return;
        }

        if (password === confirm) {
            result.textContent = "비밀번호가 일치합니다.";
            result.style.color = "green";
        } else {
            result.textContent = "비밀번호가 일치하지 않습니다.";
            result.style.color = "red";
        }
    };

    // --- 생년월일 검사 ---
    const validateBirthdate = () => {
        const result = getElement("birthdateCheckResult");
        const birthdate = birthdateInput.value;

        if (!birthdate) {
            result.textContent = "생년월일을 입력해주세요.";
            result.style.color = "red";
            return false;
        }

        const today = new Date();
        const inputDate = new Date(birthdate);
        today.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);

        if (inputDate > today) {
            result.textContent = "미래 날짜는 입력할 수 없습니다.";
            result.style.color = "red";
            return false;
        }

        result.textContent = "사용 가능한 생년월일입니다.";
        result.style.color = "green";
        return true;
    };

    // --- 이메일 중복 검사 ---
    const checkEmailDuplication = async () => {
        const email = emailInput.value.trim();
        const result = getElement("emailCheckResult");

        if (!email) {
            result.textContent = "이메일을 입력해주세요.";
            result.style.color = "white";
            checkEmail = true;
            return;
        }

        const emailRegex =
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            result.textContent = "이메일 형식이 올바르지 않습니다. (@와 도메인을 확인해 주세요)";
            result.style.color = "red";
            checkEmail = true;
            return;
        }

        try {
            const res = await fetch(`/check/email?email=${encodeURIComponent(email)}`);
            const data = await res.json();

            const isDuplicated =
                data?.duplicated ?? data?.isDuplicated ?? data === true;

            if (isDuplicated) {
                result.textContent = "이미 사용 중인 이메일입니다.";
                result.style.color = "red";
                checkEmail = true;
            } else {
                result.textContent = "사용 가능한 이메일입니다.";
                result.style.color = "green";
                checkEmail = false;
            }
        } catch (err) {
            console.error("이메일 검사 오류:", err);
            result.textContent = "이메일 검사 중 오류가 발생했습니다.";
            result.style.color = "orange";
            checkEmail = true;
        }
        return !checkEmail; // 비동기 검사 결과를 반환
    };

    // --- 닉네임 중복 검사 ---
    const checkNicknameDuplication = async () => {
        const nickname = nicknameInput.value.trim();
        const result = getElement("nicknameCheckResult");

        if (!nickname) {
            result.textContent = "닉네임을 입력해주세요.";
            result.style.color = "red";
            checkNickname = true;
            return;
        }

        try {
            const res = await fetch(
                `/check/nickname?nickname=${encodeURIComponent(nickname)}`
            );
            const data = await res.json();

            const isDuplicated =
                data?.duplicated ?? data?.isDuplicated ?? data === true;

            if (isDuplicated) {
                result.textContent = "이미 사용 중인 닉네임입니다.";
                result.style.color = "red";
                checkNickname = true;
            } else {
                result.textContent = "사용 가능한 닉네임입니다.";
                result.style.color = "green";
                checkNickname = false;
            }
        } catch (err) {
            console.error("닉네임 검사 오류:", err);
            result.textContent = "닉네임 검사 중 오류가 발생했습니다.";
            result.style.color = "orange";
            checkNickname = true;
        }
    };

    // --- 이벤트 등록 ---
    pnameInput.addEventListener("blur", validatePname);
    emailInput.addEventListener("blur", checkEmailDuplication);
    nicknameInput.addEventListener("blur", checkNicknameDuplication);
    passwordInput.addEventListener("keyup", validatePassword);
    passwordConfirmInput.addEventListener("keyup", checkPasswordMatch);
    passwordInput.addEventListener("keyup", checkPasswordMatch);
    birthdateInput.addEventListener("blur", validateBirthdate);

    // --- 최종 제출 ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
       
        validatePname();
        validatePassword();
        checkPasswordMatch();
        const birthValid = validateBirthdate();

        // 🚨 요청하신 수정 부분 (최종 제출 전 이메일 미입력 체크) 시작
        const email = emailInput.value.trim();
        if (!email) {
            alert("이메일을 입력하세요.");
            emailInput.focus(); // 사용자 편의를 위해 해당 필드로 포커스 이동
            return; // 제출 중단
        }

        // 이메일 및 닉네임 중복 검사 (비동기)
        await Promise.all([
            checkEmailDuplication(),
            checkNicknameDuplication(),
        ]);

        // 이후 검사 실패 시 alert 로직 (기존 코드)
        if (checkPname) {
            alert("이름을 2~10자의 한글 또는 영문으로 정확히 입력해주세요.");
            return;
        }

        if (checkPassword) {
            alert("비밀번호 조건을 확인해주세요. (8~16자, 3종류 문자 포함)");
            return;
        }

        if (passwordInput.value !== passwordConfirmInput.value) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!birthValid) {
            alert("생년월일을 정확히 입력해주세요. (미래 날짜 불가)");
            return;
        }

        if (checkNickname) {
            alert("닉네임 중복 검사에서 실패했습니다. 다시 시도해주세요.");
            return;
        }

        if (checkEmail) {
            alert("이메일 중복 검사에서 실패했습니다. 다시 시도해주세요.");
            return;
        }

        alert("회원가입이 완료되었습니다!");
        
         form.submit();
    });
});
