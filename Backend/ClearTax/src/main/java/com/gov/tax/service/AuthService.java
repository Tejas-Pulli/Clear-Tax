package com.gov.tax.service;

import com.gov.tax.dto.LoginRequestDTO;
import com.gov.tax.dto.LoginResponseDTO;
import com.gov.tax.dto.RegisterUserDTO;

public interface AuthService {
    RegisterUserDTO registerUser(RegisterUserDTO registerUserDTO);
	LoginResponseDTO loginUser(LoginRequestDTO loginRequestDTO);
	
}
