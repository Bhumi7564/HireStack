package com.hirestack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HireStackApplication {

    public static void main(String[] args) {
        SpringApplication.run(HireStackApplication.class, args);
    }
}

