package com.gov.tax.mapper;

import com.gov.tax.dto.RegisterUserDTO;
import com.gov.tax.dto.UserDTO;
import com.gov.tax.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);

    User toEntity(UserDTO userDTO);

	RegisterUserDTO toRegisterUserDTO(User user);
}
