package com.hirestack.auth;

import com.hirestack.security.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long id;
    private Long companyId;
    private String companyName;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
}

