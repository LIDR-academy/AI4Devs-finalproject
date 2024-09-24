package com.ai4devs.wealthtrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableAutoConfiguration
@ComponentScan
//@EnableJpaRepositories("com.ai4devs.wealthtrack.repository")
public class WealthTrackBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WealthTrackBackendApplication.class, args);
	}

}
