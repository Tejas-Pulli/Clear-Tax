package com.gov.tax.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, 
                         org.springframework.security.core.AuthenticationException authException) 
                         throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, 
                           "Unauthorized: Authentication token was either missing or invalid.");
    }
}
