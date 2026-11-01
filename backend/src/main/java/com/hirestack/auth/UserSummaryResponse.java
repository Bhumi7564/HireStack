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
public class UserSummaryResponse {
    private Long id;
    private Long companyId;
    private String companyName;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String phone;
    private boolean active;
}

