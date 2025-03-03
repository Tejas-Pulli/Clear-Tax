package com.gov.tax.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.razorpay.RazorpayException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<String> handleResourceNotFoundException(ResourceNotFoundException ex) {
		return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(ResourceAlreadyExistsException.class)
	public ResponseEntity<String> handleResourceAlreadyExistsException(ResourceAlreadyExistsException ex) {
		return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
	}

	@ExceptionHandler(InvalidCredentialException.class)
	public ResponseEntity<String> handleInvalidCredentialException(InvalidCredentialException ex) {
		return new ResponseEntity<>(ex.getMessage(), HttpStatus.UNAUTHORIZED);
	}

	@ExceptionHandler(ResourceNotChnagedException.class)
	public ResponseEntity<String> handleResourceNotChnagedException(ResourceNotChnagedException ex) {
		return new ResponseEntity<>(ex.getMessage(), HttpStatus.NO_CONTENT);
	}

	@ExceptionHandler(RazorpayException.class)
	public ResponseEntity<String> handleRazorpayException(RazorpayException ex) {
		return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_GATEWAY);
	}

	// handling general exceptions
	@ExceptionHandler(Exception.class)
	public ResponseEntity<String> handleGeneralException(Exception ex) {
		return new ResponseEntity<>("An error occured " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);

	}
}
