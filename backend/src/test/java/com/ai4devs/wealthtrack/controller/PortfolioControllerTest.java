package com.ai4devs.wealthtrack.controller;

import com.ai4devs.wealthtrack.data.Portfolio;
import com.ai4devs.wealthtrack.service.PortfolioService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(PortfolioController.class)
public class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PortfolioService portfolioService;

    @Test
    void testGetPortfolio() throws Exception {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(1L);
        portfolio.setNombre("Mi Portfolio");
        
        Mockito.when(portfolioService.getPortfolioById(anyLong()))
                .thenReturn(Optional.of(portfolio));
        
        
        mockMvc.perform(get("/portfolio")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Mi Portfolio"));
        
        Mockito.verify(portfolioService, Mockito.times(1)).getPortfolioById(anyLong());
    }
}
