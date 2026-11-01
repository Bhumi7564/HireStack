package com.hirestack.company;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateCompanyRequest {
    @NotBlank(message = "Company name is required")
    private String name;

    private String industry;
    private String website;
    private String description;
    private String location;
}

