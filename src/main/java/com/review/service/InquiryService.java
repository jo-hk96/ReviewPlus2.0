package com.review.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;


@Service
@RequiredArgsConstructor
public class InquiryService {

	private final JavaMailSender mailSender;
	//받을 이메일
    private static final String FROM_EMAIL = "slswk159@gmail.com"; 

    public void sendInquiryEmail(String fromUserEmail, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        //누가 누구에게 보낼 것인지 설정
        message.setFrom(FROM_EMAIL);                 // 발신자 (SMTP 계정)
        message.setTo("slswk159@gmail.com");     // 수신자 (실제 문의를 받을 관리자 이메일)
        
        //제목 설정 (사용자 정보 포함)
        message.setSubject("[리뷰플러스 문의] " + subject);
        
        //내용 설정 (사용자의 이메일 주소를 내용에 넣어 관리자가 답장할 수 있게 함)
        String content = "발신자 이메일: " + fromUserEmail + "\n\n" + 
                         "-------------- 리뷰플러스 문의 내용 ------------\n" + text;
        message.setText(content);

        mailSender.send(message);
    }

		
}
