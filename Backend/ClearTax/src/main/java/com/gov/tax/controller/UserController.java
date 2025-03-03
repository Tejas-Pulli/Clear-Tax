package com.gov.tax.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.dto.UpdateUserDTO;
import com.gov.tax.dto.UserDTO;
import com.gov.tax.service.UserService;

import lombok.RequiredArgsConstructor;

/**
 * Controller for user-related operations such as retrieving, registering, and
 * updating user details.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	/**
	 * Retrieves user details by user ID.
	 *
	 * @param id The user ID.
	 * @return ResponseEntity containing user details.
	 */
	@GetMapping("/id/{id}")
	public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
		return ResponseEntity.ok(userService.getUserById(id));
	}

	/**
	 * Retrieves user details by email.
	 *
	 * @param email The user's email.
	 * @return ResponseEntity containing user details.
	 */
	@GetMapping("/email/{email}")
	public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
		return ResponseEntity.ok(userService.getUserByEmail(email));
	}

	/**
	 * Retrieves a list of all registered users.
	 *
	 * @return ResponseEntity containing a list of users.
	 */
	@GetMapping("/all")
	public ResponseEntity<List<UserDTO>> getAllUsers() {
		return ResponseEntity.ok(userService.getAllUsers());
	}

	/**
	 * Creates a new user (for admin use, future implementation).
	 *
	 * @param registerUserDTO The user registration details.
	 * @return ResponseEntity containing the created user details.
	 */
	@PostMapping
	public ResponseEntity<UserDTO> createUser(@RequestBody RegisterUserDTO registerUserDTO) {
		return new ResponseEntity<>(userService.createUser(registerUserDTO), HttpStatus.CREATED);
	}

	/**
	 * Updates a user's profile based on email.
	 *
	 * @param email         The email of the user.
	 * @param updateUserDTO The updated user details.
	 * @return ResponseEntity containing updated user details.
	 */
	@PutMapping("/email/{email}/updateProfile")
	public ResponseEntity<UserDTO> updateUserProfile(@PathVariable String email,
			@RequestBody UpdateUserDTO updateUserDTO) {
		return new ResponseEntity<>(userService.updateUserProfile(email, updateUserDTO), HttpStatus.ACCEPTED);
	}
}
