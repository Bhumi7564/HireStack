package com.hirestack.company;

import com.hirestack.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDTO getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        return toDTO(company);
    }

    @Transactional
    public CompanyDTO createCompany(CreateCompanyRequest request) {
        Company company = Company.builder()
                .name(request.getName())
                .industry(request.getIndustry())
                .website(request.getWebsite())
                .description(request.getDescription())
                .location(request.getLocation())
                .build();

        company = companyRepository.save(company);
        return toDTO(company);
    }

    @Transactional
    public CompanyDTO updateCompany(Long id, CreateCompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        company.setName(request.getName());
        company.setIndustry(request.getIndustry());
        company.setWebsite(request.getWebsite());
        company.setDescription(request.getDescription());
        company.setLocation(request.getLocation());

        company = companyRepository.save(company);
        return toDTO(company);
    }

    private CompanyDTO toDTO(Company company) {
        return CompanyDTO.builder()
                .id(company.getId())
                .name(company.getName())
                .industry(company.getIndustry())
                .website(company.getWebsite())
                .description(company.getDescription())
                .location(company.getLocation())
                .createdAt(company.getCreatedAt())
                .build();
    }
}

