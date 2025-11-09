package com.review.service;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStoreService {

	@Value("${file.dir}")
	private String fileDir;
	
	// 파일 저장 경로 반환
	public String getFullPath(String filename) {
		return fileDir + filename;
	}
	
	//파일을 저장하고 저장된 파일의 이름을 반환(DB에 저장할 이름)
	public String storeFile(MultipartFile multipartFile) throws IllegalStateException, IOException {
		//파일이 없다면 null 반환
		if(multipartFile.isEmpty()) {
			return null;
		}
		
		//원래 파일 이름 추출
		String originalFilename = multipartFile.getOriginalFilename();
		
		//서버에 저장할 고유한 파일 이름 생성 UUID 사용
		String storeFilename = createStoreFileName(originalFilename);
		
		//파일을 실제 로컬 경로에 저장
		multipartFile.transferTo(new File(getFullPath(storeFilename)));
		
		//DB에 저장할 파일 이름(URL 역할) 반환
		return storeFilename;
		}
	
	private String createStoreFileName(String originalFilename) {
		//확장자를 추출
		String ext = extractExt(originalFilename);
		
		//UUID + 확장자로 고유한 이름 생성
		String uuid = UUID.randomUUID().toString();
		return uuid + "." + ext;
		}
		
	
	//파일 이름에서 확장자를 추출
	private String extractExt(String originalFilename) {
		int pos = originalFilename.lastIndexOf(".");
		return originalFilename.substring(pos + 1 );
	}
	
	
	
	
}
