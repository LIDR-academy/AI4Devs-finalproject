package com.ai4devs.wealthtrack.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

public class HelloControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HelloController helloController;

    @Test
    public void testSayHello() throws Exception {

    }
}
