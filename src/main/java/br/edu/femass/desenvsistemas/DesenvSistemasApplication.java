package br.edu.femass.desenvsistemas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class DesenvSistemasApplication {

    public static void main(String[] args) {
        SpringApplication.run(DesenvSistemasApplication.class, args);
    }
}
