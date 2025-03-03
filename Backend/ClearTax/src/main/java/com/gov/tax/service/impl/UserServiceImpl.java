package com.gov.tax.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.dto.UpdateUserDTO;
import com.gov.tax.dto.UserDTO;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceAlreadyExistsException;
import com.gov.tax.exception.ResourceNotChnagedException;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.UserRepository;
import com.gov.tax.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@ComponentScan
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final UserMapper userMapper;
	private final PasswordEncoder passwordEncoder;

	/**
	 * Retrieves user details by user ID.
	 *
	 * @param userId The ID of the user.
	 * @return The user details as a {@link UserDTO}.
	 * @throws ResourceNotFoundException if the user is not found.
	 */
	@Override
	public UserDTO getUserById(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
		return userMapper.toDTO(user);
	}

	/**
	 * Creates a new user based on the provided registration details.
	 *
	 * @param registerUserDTO The user registration details.
	 * @return The created user as a {@link UserDTO}.
	 */
	@Override
	public UserDTO createUser(RegisterUserDTO registerUserDTO) {
		User savedUser = saveUser(registerUserDTO);
		return userMapper.toDTO(savedUser);
	}

	/**
	 * Registers a new user after validating email and government ID.
	 *
	 * @param registerUserDTO The user registration details.
	 * @return The registered user as a {@link UserDTO}.
	 * @throws ResourceAlreadyExistsException if the email or government ID already
	 *                                        exists.
	 */
	@Override
	public UserDTO registerUser(RegisterUserDTO registerUserDTO) {
		validateEmailAndGovernmentId(registerUserDTO);
		User savedUser = saveUser(registerUserDTO);
		return userMapper.toDTO(savedUser);
	}

	/**
	 * Retrieves a list of all users.
	 *
	 * @return A list of {@link UserDTO} containing all users.
	 */
	@Override
	public List<UserDTO> getAllUsers() {
		return userRepository.findAll().stream().map(userMapper::toDTO).toList();
	}

	/**
	 * Updates a user's profile based on the provided email.
	 *
	 * @param email         The email of the user to update.
	 * @param updateUserDTO The updated user details.
	 * @return The updated user as a {@link UserDTO}.
	 * @throws ResourceNotFoundException      if the user is not found.
	 * @throws ResourceNotChnagedException    if no changes were detected in the
	 *                                        update request.
	 * @throws ResourceAlreadyExistsException if the updated email is already in
	 *                                        use.
	 */
	@Override
	public UserDTO updateUserProfile(String email, UpdateUserDTO updateUserDTO) {
		// First, find the user by email
		User existingUser = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

		// Check if any changes were actually made
		if (!hasChanges(existingUser, updateUserDTO)) {
			throw new ResourceNotChnagedException("No changes were made. The details are the same as before.");
		}

		// Update the user details
		updateUserDetails(existingUser, updateUserDTO);
		User updatedUser = userRepository.save(existingUser);
		return userMapper.toDTO(updatedUser);
	}

	/**
	 * Retrieves user details by email.
	 *
	 * @param email The email of the user.
	 * @return The user details as a {@link UserDTO}.
	 * @throws ResourceNotFoundException if the user is not found.
	 */
	@Override
	public UserDTO getUserByEmail(String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with Email " + email));
		return userMapper.toDTO(user);
	}

	/**
	 * Checks if the provided update data differs from the existing user data.
	 *
	 * @param existingUser  The existing user details.
	 * @param updateUserDTO The updated user details.
	 * @return {@code true} if changes exist, {@code false} otherwise.
	 */
	boolean hasChanges(User existingUser, UpdateUserDTO updateUserDTO) {
		boolean isNoChange = true;

		if ((updateUserDTO.getEmail() != null && !updateUserDTO.getEmail().equals(existingUser.getEmail()))
				|| (updateUserDTO.getName() != null && !updateUserDTO.getName().equals(existingUser.getName()))
				|| (updateUserDTO.getPassword() != null
						&& !passwordEncoder.matches(updateUserDTO.getPassword(), existingUser.getPassword()))) {
			isNoChange = false;
		}

		return !isNoChange; // Returns true if there are changes
	}

	/**
	 * Updates the user details based on the provided update request.
	 *
	 * @param existingUser  The user entity to update.
	 * @param updateUserDTO The updated user details.
	 * @throws ResourceAlreadyExistsException if the email is changed and already
	 *                                        exists.
	 */
	private void updateUserDetails(User existingUser, UpdateUserDTO updateUserDTO) {
		// Check if the email is changed and if it is already taken
		if (updateUserDTO.getEmail() != null && !updateUserDTO.getEmail().equals(existingUser.getEmail())) {
			if (userRepository.existsByEmail(updateUserDTO.getEmail())) {
				throw new ResourceAlreadyExistsException("Email is already taken. Please use a different email.");
			}
			existingUser.setEmail(updateUserDTO.getEmail());
		}

		// Update name if provided
		if (updateUserDTO.getName() != null) {
			existingUser.setName(updateUserDTO.getName());
		}

		// Update password if provided
		if (updateUserDTO.getPassword() != null && !updateUserDTO.getPassword().isEmpty()) {
			existingUser.setPassword(passwordEncoder.encode(updateUserDTO.getPassword()));
		}
	}

	/**
	 * Creates and saves a new user entity in the database.
	 *
	 * @param registerUserDTO The user registration details.
	 * @return The newly created user entity.
	 */
	private User saveUser(RegisterUserDTO registerUserDTO) {
		User user = User.builder().name(registerUserDTO.getName()).email(registerUserDTO.getEmail())
				.governmentId(registerUserDTO.getGovernmentId())
				.password(passwordEncoder.encode(registerUserDTO.getPassword())).userRole(registerUserDTO.getUserRole())
				.createdDate(LocalDateTime.now()).build();

		return userRepository.save(user);
	}

	/**
	 * Validates whether the given email or government ID already exists in the
	 * database.
	 *
	 * @param registerUserDTO The user registration details.
	 * @throws ResourceAlreadyExistsException if the email or government ID is
	 *                                        already registered.
	 */
	private void validateEmailAndGovernmentId(RegisterUserDTO registerUserDTO) {
		if (userRepository.existsByEmail(registerUserDTO.getEmail())) {
			throw new ResourceAlreadyExistsException("Email is already registered.");
		}

		if (userRepository.existsByGovernmentId(registerUserDTO.getGovernmentId())) {
			throw new ResourceAlreadyExistsException("Government ID is already registered.");
		}
	}
}
