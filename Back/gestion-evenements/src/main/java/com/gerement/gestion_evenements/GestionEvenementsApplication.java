package com.gerement.gestion_evenements;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling 
public class GestionEvenementsApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestionEvenementsApplication.class, args);
	}

}
