package com.stayhub

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class StayHubApplication

fun main(args: Array<String>) {
    runApplication<StayHubApplication>(*args)
}
