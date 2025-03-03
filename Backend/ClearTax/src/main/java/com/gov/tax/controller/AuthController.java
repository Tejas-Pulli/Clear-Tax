package com.gov.tax.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gov.tax.dto.LoginRequestDTO;
import com.gov.tax.dto.LoginResponseDTO;
import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.service.AuthService;

import lombok.RequiredArgsConstructor;

/**
 * Controller class for handling authentication-related operations like
 * registration and login.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	/**
	 * Register a new user.
	 * 
	 * @param registerUserDTO The DTO containing user registration details.
	 * @return ResponseEntity containing the registered user details and HTTP status
	 *         CREATED (201).
	 */
	@PostMapping("/register")
	public ResponseEntity<RegisterUserDTO> registerUser(@RequestBody RegisterUserDTO registerUserDTO) {
		return new ResponseEntity<>(authService.registerUser(registerUserDTO), HttpStatus.CREATED);
	}

	/**
	 * Login user Authenticate user and returns a JWT token upon successful login.
	 * 
	 * @param loginRequestDTO The DTO containing user login credentials (email and
	 *                        password).
	 * @return ResponseEntity containing user details and JWT token if
	 *         authentication is successful.
	 */
	@PostMapping("/login")
	public ResponseEntity<LoginResponseDTO> loginUser(@RequestBody LoginRequestDTO loginRequestDTO) {
		return ResponseEntity.ok(authService.loginUser(loginRequestDTO));
	}
}
