package com.hirestack.auth;

import com.hirestack.common.ApiResponse;
import com.hirestack.common.BadRequestException;
import com.hirestack.common.ResourceNotFoundException;
import com.hirestack.company.Company;
import com.hirestack.company.CompanyRepository;
import com.hirestack.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for HR Admins to manage system users and roles")
public class UserController {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "List all company users (HR Admin only)")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getCompanyUsers(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        List<UserSummaryResponse> users = userRepository.findByCompanyId(principal.getCompanyId()).stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/interviewers")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "List all active users eligible for interview panel assignment")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getInterviewerUsers(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        List<UserSummaryResponse> users = userRepository.findByCompanyId(principal.getCompanyId()).stream()
                .filter(User::isActive)
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Transactional
    @Operation(summary = "Create a new organization user (HR Admin only)")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> createUser(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateUserRequest request) {

        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("User with email '" + request.getEmail() + "' already exists.");
        }

        Company company = companyRepository.findById(principal.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", principal.getCompanyId()));

        String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank())
                ? request.getPassword()
                : "password123";

        User user = User.builder()
                .company(company)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(request.getRole())
                .phone(request.getPhone())
                .active(true)
                .build();

        user = userRepository.save(user);
        return new ResponseEntity<>(ApiResponse.ok("User created successfully", toSummaryResponse(user)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Transactional
    @Operation(summary = "Update user role and phone (HR Admin only)")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().isBlank() ? null : request.getPhone().trim());
        }

        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully", toSummaryResponse(user)));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Transactional
    @Operation(summary = "Toggle user active/inactive status (HR Admin only)")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> toggleUserActive(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setActive(!user.isActive());
        user = userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.ok("User status updated", toSummaryResponse(user)));
    }

    private UserSummaryResponse toSummaryResponse(User u) {
        return UserSummaryResponse.builder()
                .id(u.getId())
                .companyId(u.getCompany() != null ? u.getCompany().getId() : null)
                .companyName(u.getCompany() != null ? u.getCompany().getName() : null)
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .role(u.getRole())
                .phone(u.getPhone())
                .active(u.isActive())
                .build();
    }
}
