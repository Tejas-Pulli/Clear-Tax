package com.gov.tax.service.impl;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gov.tax.config.JwtTokenUtil;
import com.gov.tax.dto.LoginRequestDTO;
import com.gov.tax.dto.LoginResponseDTO;
import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.entity.User;
import com.gov.tax.exception.InvalidCredentialException;
import com.gov.tax.exception.ResourceAlreadyExistsException;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.UserRepository;
import com.gov.tax.service.AuthService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

/**
 * Implementation of the authentication service. This service handles user
 * registration, login, and initialization of an admin user.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final UserRepository userRepository;
	private final UserMapper userMapper;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenUtil jwtTokenUtil;

	// Constants for default admin details
	private static final String ADMIN_EMAIL = "admin@gmail.com";
	private static final String ADMIN_ROLE = "ADMIN";
	private static final String ADMIN_GOVT_ID = "ADMIN1234Z";
	private static final String DEFAULT_ADMIN_PASSWORD = "Admin@1234";

	/**
	 * This method runs when the application starts. It checks if an admin user
	 * exists, and if not, it creates one.
	 */
	@PostConstruct
	public void initializeAdmin() {
		if (!adminExists()) {
			saveUser(createAdminUser());
		}
	}

	/**
	 * Handles user login. It checks if the user exists and validates their
	 * password. If successful, it generates a JWT token and returns user details.
	 *
	 * @param loginRequestDTO The login request containing user credentials.
	 * @return LoginResponseDTO containing user details and a JWT token.
	 * @throws ResourceNotFoundException  if the user is not found.
	 * @throws InvalidCredentialException if the password is incorrect.
	 */
	@Override
	public LoginResponseDTO loginUser(LoginRequestDTO loginRequestDTO) {
		User user = userRepository.findByEmail(loginRequestDTO.getEmail())
				.orElseThrow(() -> new ResourceNotFoundException("User with email not registered"));

		if (!passwordEncoder.matches(loginRequestDTO.getPassword(), user.getPassword())) {
			throw new InvalidCredentialException("Invalid password");
		}

		return LoginResponseDTO.builder().email(user.getEmail()).name(user.getName()).role(user.getUserRole())
				.token(jwtTokenUtil.generateToken(user.getEmail())).build();
	}

	/**
	 * Handles user registration. It checks if the user already exists based on
	 * email and government ID. If it's an admin registration, it ensures only one
	 * admin can exist. Finally, it saves the new user in the database.
	 *
	 * @param registerUserDTO The user registration details.
	 * @return RegisterUserDTO containing registered user information.
	 * @throws ResourceAlreadyExistsException if the email, government ID, or admin
	 *                                        already exists.
	 */
	@Override
	public RegisterUserDTO registerUser(RegisterUserDTO registerUserDTO) {
		validateUserRegistration(registerUserDTO);

		User user = registerUserDTO.getEmail().equalsIgnoreCase(ADMIN_EMAIL)
				&& registerUserDTO.getUserRole().equalsIgnoreCase(ADMIN_ROLE) ? createAdminUser()
						: createUser(registerUserDTO);

		saveUser(user);

		return userMapper.toRegisterUserDTO(user);
	}

	/**
	 * Validates user registration by checking if the email, government ID, or admin
	 * already exists.
	 *
	 * @param registerUserDTO The registration details to validate.
	 * @throws ResourceAlreadyExistsException if the user details are already in
	 *                                        use.
	 */
	private void validateUserRegistration(RegisterUserDTO registerUserDTO) {
		if (registerUserDTO.getUserRole().equalsIgnoreCase(ADMIN_ROLE) && adminExists()) {
			throw new ResourceAlreadyExistsException("An admin already exists. Only one admin is allowed.");
		}

		if (userRepository.existsByEmail(registerUserDTO.getEmail())) {
			throw new ResourceAlreadyExistsException("Email already in use. Please use a different email.");
		}

		if (userRepository.existsByGovernmentId(registerUserDTO.getGovernmentId())) {
			throw new ResourceAlreadyExistsException("Government ID already in use. Please use a different ID.");
		}
	}

	/**
	 * Creates the default admin user with predefined values.
	 *
	 * @return A User entity representing the admin user.
	 */
	private User createAdminUser() {
		return User.builder().name("Admin").email(ADMIN_EMAIL).password(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
				.governmentId(ADMIN_GOVT_ID).userRole(ADMIN_ROLE).createdDate(LocalDateTime.now()).build();
	}

	/**
	 * Creates a regular user based on registration details.
	 *
	 * @param registerUserDTO The registration details of the user.
	 * @return A User entity representing the registered user.
	 */
	private User createUser(RegisterUserDTO registerUserDTO) {
		return User.builder().name(registerUserDTO.getName()).email(registerUserDTO.getEmail())
				.password(passwordEncoder.encode(registerUserDTO.getPassword()))
				.governmentId(registerUserDTO.getGovernmentId()).userRole(registerUserDTO.getUserRole())
				.createdDate(LocalDateTime.now()).build();
	}

	/**
	 * Saves a user entity to the database.
	 *
	 * @param user The user entity to be saved.
	 */
	private void saveUser(User user) {
		userRepository.save(user);
	}

	/**
	 * Checks if an admin user already exists in the system.
	 *
	 * @return true if an admin exists, false otherwise.
	 */
	boolean adminExists() {
		return userRepository.countByUserRole(ADMIN_ROLE) > 0;
	}

}
