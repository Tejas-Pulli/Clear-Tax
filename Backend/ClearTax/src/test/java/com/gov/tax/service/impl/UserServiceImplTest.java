package com.gov.tax.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.dto.UpdateUserDTO;
import com.gov.tax.dto.UserDTO;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceAlreadyExistsException;
import com.gov.tax.exception.ResourceNotChnagedException;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private UserMapper userMapper;

	@Mock
	private PasswordEncoder passwordEncoder;

	@InjectMocks
	@Spy
	private UserServiceImpl userService;

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
	public void setUp() {
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
	void testCreateUser_Success() {
		// Arrange
		when(userRepository.save(any(User.class))).thenReturn(testUser);
		when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

		// Act
		UserDTO createdUser = userService.createUser(registerUserDTO);

		// Assert
		assertEquals(TEST_EMAIL, createdUser.getEmail());
		assertEquals(TEST_NAME, createdUser.getName());
		verify(userRepository, times(1)).save(any(User.class));
	}

	@Test
	void testRegisterUser_Success() {
		// Arrange
		when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
		when(userRepository.existsByGovernmentId(TEST_GOVT_ID)).thenReturn(false);
		when(userRepository.save(any(User.class))).thenReturn(testUser);
		when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

		// Act
		UserDTO registeredUser = userService.registerUser(registerUserDTO);

		// Assert
		assertEquals(TEST_EMAIL, registeredUser.getEmail());
		assertEquals(TEST_NAME, registeredUser.getName());
		verify(userRepository, times(1)).save(any(User.class));
	}

	@Test
	void testRegisterUser_EmailAlreadyExists() {
		// Arrange
		when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(true);

		// Act & Assert
		assertThrows(ResourceAlreadyExistsException.class, () -> userService.registerUser(registerUserDTO));
	}

	@Test
	void testRegisterUser_GovIdAlreadyExists() {
		// Arrange
		when(userRepository.existsByGovernmentId(TEST_GOVT_ID)).thenReturn(true);

		// Act & Assert
		assertThrows(ResourceAlreadyExistsException.class, () -> userService.registerUser(registerUserDTO));
	}

	@Test
	void testGetUserById_Success() {
		// Arrange
		when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.of(testUser));
		when(userMapper.toDTO(testUser)).thenReturn(userDTO);

		// Act
		UserDTO foundUser = userService.getUserById(TEST_USER_ID);

		// Assert
		assertEquals(TEST_EMAIL, foundUser.getEmail());
		assertEquals(TEST_NAME, foundUser.getName());
	}

	@Test
	void testGetUserById_UserNotFound() {
		// Arrange
		when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.empty());

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(TEST_USER_ID));
	}

	@Test
	void testGetAllUsers_Success() {
		// Arrange
		when(userRepository.findAll()).thenReturn(List.of(testUser));
		when(userMapper.toDTO(testUser)).thenReturn(userDTO);

		// Act
		List<UserDTO> users = userService.getAllUsers();

		// Assert
		assertFalse(users.isEmpty());
		assertEquals(1, users.size());
		assertEquals(TEST_EMAIL, users.get(0).getEmail());
	}

	@Test
	void testGetAllUsers_EmptyList() {
		// Arrange
		when(userRepository.findAll()).thenReturn(Collections.emptyList());

		// Act
		List<UserDTO> users = userService.getAllUsers();

		// Assert
		assertTrue(users.isEmpty());
	}

	@Test
	void testUpdateUserProfile_Success() {
		// Arrange
		when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
		when(userRepository.save(any(User.class))).thenReturn(testUser);
		when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

		// Act
		UserDTO updatedUser = userService.updateUserProfile(TEST_EMAIL, updateUserDTO);

		// Assert
		assertEquals(TEST_NAME, updatedUser.getName());
		verify(userRepository, times(1)).save(any(User.class));
	}

	@Test
	void testUpdateUserProfile_UserNotFound() {
		// Arrange
		when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () -> userService.updateUserProfile(TEST_EMAIL, updateUserDTO));
	}

	@Test
	void testUpdateUserProfile_NoChangesMade() {
		// Arrange
		when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
		doReturn(false).when(userService).hasChanges(testUser, updateUserDTO); // Mock hasChanges to return false

		// Act & Assert
		assertThrows(ResourceNotChnagedException.class, () -> userService.updateUserProfile(TEST_EMAIL, updateUserDTO));

		// Verify save was never called
		verify(userRepository, never()).save(any(User.class));
	}

	@Test
	void testGetUserByEmail_Success() {
		// Arrange
		when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
		when(userMapper.toDTO(testUser)).thenReturn(userDTO);

		// Act
		UserDTO foundUser = userService.getUserByEmail(TEST_EMAIL);

		// Assert
		assertEquals(TEST_EMAIL, foundUser.getEmail());
	}

	@Test
	void testGetUserByEmail_UserNotFound() {
		// Arrange
		when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () -> userService.getUserByEmail(TEST_EMAIL));
	}
}
