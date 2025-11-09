package com.review.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Value("${file.dir}")
	private String fileDir;
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		
		// '/images' 경로로 요청이 들어오면 실제 fileDIr 경로를 찾아줌
		// 브라우저에서 http://localhost:9090/images/abc-123.png 요청 시 -> 
		//C:/dev/upload/abc-123.png 파일을 찾게 됨.
		registry.addResourceHandler("/images/profile/**")
		        .addResourceLocations("file:" + fileDir);
	}
}
