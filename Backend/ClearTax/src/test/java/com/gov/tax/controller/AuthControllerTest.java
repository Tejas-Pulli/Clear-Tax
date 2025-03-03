package com.gov.tax.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gov.tax.dto.LoginRequestDTO;
import com.gov.tax.dto.LoginResponseDTO;
import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.service.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

	private MockMvc mockMvc;

	@Mock
	private AuthService authService;

	@InjectMocks
	private AuthController authController;

	private static final String TEST_NAME = "Dumy Test";
	private static final String TEST_EMAIL = "dumy1@gmail.com";
	private static final String TEST_PASSWORD = "Dumy@1234";
	private static final String TEST_GOVT_ID = "DUMYW1234R";

	private LoginRequestDTO loginRequestDTO;
	private RegisterUserDTO registerUserDTO;
	private LoginResponseDTO loginResponseDTO;

	@BeforeEach
	public void setUp() {
		// Initialize test data

		loginRequestDTO = new LoginRequestDTO();
		loginRequestDTO.setEmail(TEST_EMAIL);
		loginRequestDTO.setPassword(TEST_PASSWORD);

		loginResponseDTO = LoginResponseDTO.builder().email(TEST_EMAIL).name(TEST_NAME).token("JWT_TOKEN").role("USER")
				.build();

		registerUserDTO = RegisterUserDTO.builder().name(TEST_NAME).email(TEST_EMAIL).password(TEST_PASSWORD)
				.governmentId(TEST_GOVT_ID).userRole("USER").build();


		mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
	}
 
	@Test
	void testRegisterUser() throws Exception {
		when(authService.registerUser(any(RegisterUserDTO.class))).thenReturn(registerUserDTO);

		mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
				.content(new ObjectMapper().writeValueAsString(registerUserDTO))).andExpect(status().isCreated());
	}

	@Test
	void testLoginUser() throws Exception {
		when(authService.loginUser(any(LoginRequestDTO.class))).thenReturn(loginResponseDTO);

		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content(new ObjectMapper().writeValueAsString(loginRequestDTO))).andExpect(status().isOk());
	}
}
