package com.gov.tax.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterUserDTO {
    private String name;
    private String email;
    private String password;
    private String governmentId;
    private String userRole;
}
