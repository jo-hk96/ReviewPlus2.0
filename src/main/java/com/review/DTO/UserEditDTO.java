package com.review.DTO;

import lombok.Data;

@Data
public class UserEditDTO {
	private String email;      	// 로그인 식별자 (이메일)
	private String currentPassword;// 현재비밀번호
    private String newPassword; //새 비밀번호
    private String confirmNewPassword; //새 비밀번호 확인
    private String nickname; //닉네임
    private String birthdate; //생년월일
	private String pname;
}
