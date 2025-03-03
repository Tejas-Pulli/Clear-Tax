package com.gov.tax.service.impl;

import com.gov.tax.dto.LoginRequestDTO;
import com.gov.tax.dto.LoginResponseDTO;
import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.entity.User;
import com.gov.tax.exception.InvalidCredentialException;
import com.gov.tax.exception.ResourceAlreadyExistsException;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.UserRepository;
import com.gov.tax.config.JwtTokenUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthServiceImplTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private UserMapper userMapper;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtTokenUtil jwtTokenUtil;

	@InjectMocks
	private AuthServiceImpl authService;

	private static final String TEST_NAME = "Dumy Test";
	private static final String TEST_EMAIL = "dumy1@gmail.com";
	private static final String TEST_PASSWORD = "Dumy@1234";
	private static final String TEST_GOVT_ID = "DUMYW1234R";

	private User testUser;
	private LoginRequestDTO loginRequestDTO;
	private RegisterUserDTO registerUserDTO;

	@BeforeEach
	public void setUp() {
		// Initialize test data
		testUser = User.builder().email(TEST_EMAIL).password(TEST_PASSWORD).governmentId(TEST_GOVT_ID).userRole("USER")
				.build();

		loginRequestDTO = new LoginRequestDTO();
		loginRequestDTO.setEmail(TEST_EMAIL);
		loginRequestDTO.setPassword(TEST_PASSWORD);

		registerUserDTO = RegisterUserDTO.builder().name(TEST_NAME).email(TEST_EMAIL).password(TEST_PASSWORD).governmentId(TEST_GOVT_ID).userRole("USER").build();
	}

	@Test
	 void testLoginUser_Success() {
		// Arrange
		when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
		when(passwordEncoder.matches(TEST_PASSWORD, TEST_PASSWORD)).thenReturn(true);
		when(jwtTokenUtil.generateToken(TEST_EMAIL)).thenReturn("fake-token");

		// Act
		LoginResponseDTO response = authService.loginUser(loginRequestDTO);

		// Assert
		assertEquals(TEST_EMAIL, response.getEmail());
		assertEquals("USER", response.getRole());
		assertEquals("fake-token", response.getToken());
	}

	@Test
	 void testLoginUser_UserNotFound() {
		// Arrange
		when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () -> authService.loginUser(loginRequestDTO));
	}

	@Test
	 void testLoginUser_InvalidPassword() {
		// Arrange
		when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
		when(passwordEncoder.matches(TEST_PASSWORD, "wrong-password")).thenReturn(false);

		// Act & Assert
		assertThrows(InvalidCredentialException.class, () -> authService.loginUser(loginRequestDTO));
	}

	@Test
	 void testRegisterUser_Success() {
		// Arrange
		when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
		when(userRepository.existsByGovernmentId(TEST_GOVT_ID)).thenReturn(false);
		when(userMapper.toRegisterUserDTO(any(User.class))).thenReturn(registerUserDTO);

		// Act
		RegisterUserDTO response = authService.registerUser(registerUserDTO);

		// Assert
		assertEquals(TEST_EMAIL, response.getEmail());
	}

	@Test
	 void testRegisterUser_EmailAlreadyExists() {
		// Arrange
		when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(true);

		// Act & Assert
		assertThrows(ResourceAlreadyExistsException.class, () -> authService.registerUser(registerUserDTO));
	}

	@Test
	 void testRegisterUser_GovtIdAlreadyExists() {
		// Arrange
		when(userRepository.existsByGovernmentId(TEST_GOVT_ID)).thenReturn(true);

		// Act & Assert
		assertThrows(ResourceAlreadyExistsException.class, () -> authService.registerUser(registerUserDTO));
	}

	@Test
	 void testAdminExists_ReturnTrue() {
		// Arrange
		when(userRepository.countByUserRole("ADMIN")).thenReturn(1);

		// Act
		boolean exists = authService.adminExists();

		// Assert
		assertTrue(exists);
	}

	@Test
	 void testAdminExists_ReturnFalse() {
		// Arrange
		when(userRepository.countByUserRole("ADMIN")).thenReturn(0);

		// Act
		boolean exists = authService.adminExists();

		// Assert
		assertFalse(exists);
	}

	@Test
	 void testInitializeAdmin_AdminNotExists() {
		// Arrange
		when(userRepository.countByUserRole("ADMIN")).thenReturn(0);
		when(userRepository.save(any(User.class))).thenReturn(testUser);

		// Act
		authService.initializeAdmin();

		// Assert
		verify(userRepository, times(1)).save(any(User.class));
	}

	@Test
	void testInitializeAdmin_AdminExists() {
		// Arrange
		when(userRepository.countByUserRole("ADMIN")).thenReturn(1);

		// Act
		authService.initializeAdmin();

		// Assert
		verify(userRepository, never()).save(any(User.class));
	}
}
