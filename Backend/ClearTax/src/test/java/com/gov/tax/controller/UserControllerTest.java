package com.gov.tax.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.List;

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
import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.dto.UpdateUserDTO;
import com.gov.tax.dto.UserDTO;
import com.gov.tax.entity.User;
import com.gov.tax.service.UserService;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

	private MockMvc mockMvc;

	@Mock
	private UserService userService;

	@InjectMocks
	private UserController userController;

	private static final Long TEST_USER_ID = 1L;
	private static final String TEST_NAME = "Updated User";
	private static final String TEST_EMAIL = "dumy1@gmail.com";
	private static final String TEST_PASSWORD = "Dumy@1234";
	private static final String TEST_GOVT_ID = "DUMYW1234R";

	private User testUser;
	private RegisterUserDTO registerUserDTO;
	private UpdateUserDTO updateUserDTO;
	private UserDTO userDTO;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
		testUser = new User();
		testUser.setUserId(TEST_USER_ID);
		testUser.setName(TEST_NAME);
		testUser.setEmail(TEST_EMAIL);
		testUser.setPassword(TEST_PASSWORD);
		testUser.setGovernmentId(TEST_GOVT_ID);
		testUser.setUserRole("USER");

		registerUserDTO = RegisterUserDTO.builder().name(TEST_NAME).email(TEST_EMAIL).password(TEST_PASSWORD)
				.governmentId(TEST_GOVT_ID).userRole("USER").build();

		updateUserDTO = UpdateUserDTO.builder().name(TEST_NAME).password(TEST_PASSWORD).email(TEST_EMAIL).build();

		userDTO = UserDTO.builder().userId(1).name(TEST_NAME).email(TEST_EMAIL).governmentId(TEST_GOVT_ID)
				.userRole("USER").build();

	}

	@Test
	void testGetUserById() throws Exception {
		when(userService.getUserById(1L)).thenReturn(userDTO);

		mockMvc.perform(get("/api/users/id/1")).andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Updated User"))
				.andExpect(jsonPath("$.email").value("dumy1@gmail.com"));
	}

	@Test
	void testGetUserByEmail() throws Exception {
		when(userService.getUserByEmail("dumy1@gmail.com")).thenReturn(userDTO);

		mockMvc.perform(get("/api/users/email/dumy1@gmail.com")).andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("dumy1@gmail.com"));
	}

	@Test
	void testGetAllUsers() throws Exception {
		List<UserDTO> users = Arrays.asList(userDTO);
		when(userService.getAllUsers()).thenReturn(users);

		mockMvc.perform(get("/api/users/all")).andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value("Updated User"));
	}

	@Test
	void testCreateUser() throws Exception {
		when(userService.createUser(any(RegisterUserDTO.class))).thenReturn(userDTO);

		mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
				.content(new ObjectMapper().writeValueAsString(registerUserDTO))).andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("Updated User"));
	}

	@Test
	void testUpdateUserProfile() throws Exception {
		when(userService.updateUserProfile(eq("dumy1@gmail.com"), any(UpdateUserDTO.class))).thenReturn(userDTO);

		mockMvc.perform(put("/api/users/email/dumy1@gmail.com/updateProfile").contentType(MediaType.APPLICATION_JSON)
				.content(new ObjectMapper().writeValueAsString(updateUserDTO))).andExpect(status().isAccepted())
				.andExpect(jsonPath("$.name").value("Updated User"));
	}
}
