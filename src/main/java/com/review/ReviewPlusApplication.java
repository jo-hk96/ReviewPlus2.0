package com.review;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;



@EnableScheduling
@SpringBootApplication
public class ReviewPlusApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReviewPlusApplication.class, args);
	}

}
