package com.gov.tax.service;

import java.util.List;

import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.dto.UpdateUserDTO;
import com.gov.tax.dto.UserDTO;

public interface UserService {

    UserDTO getUserById(Long userId);

    UserDTO createUser(RegisterUserDTO registerUserDTO);

    UserDTO registerUser(RegisterUserDTO registerUserDTO);

    List<UserDTO> getAllUsers();

    UserDTO updateUserProfile(String email, UpdateUserDTO updateUserDTO);

	UserDTO getUserByEmail(String email);

}
