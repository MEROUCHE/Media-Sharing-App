package com.idk.Media_Sharing_App;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MediaSharingAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(MediaSharingAppApplication.class, args);
	}

}
