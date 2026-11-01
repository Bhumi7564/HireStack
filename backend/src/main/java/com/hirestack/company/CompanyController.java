package com.hirestack.company;

import com.hirestack.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
@Tag(name = "Companies", description = "Endpoints for managing recruitment tenant companies")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    @Operation(summary = "Get all registered companies")
    public ResponseEntity<ApiResponse<List<CompanyDTO>>> getAllCompanies() {
        return ResponseEntity.ok(ApiResponse.ok(companyService.getAllCompanies()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company details by ID")
    public ResponseEntity<ApiResponse<CompanyDTO>> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(companyService.getCompanyById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Create a new company (HR Admin only)")
    public ResponseEntity<ApiResponse<CompanyDTO>> createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        CompanyDTO created = companyService.createCompany(request);
        return new ResponseEntity<>(ApiResponse.ok("Company created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Update company details (HR Admin only)")
    public ResponseEntity<ApiResponse<CompanyDTO>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CreateCompanyRequest request) {
        CompanyDTO updated = companyService.updateCompany(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Company updated successfully", updated));
    }
}

