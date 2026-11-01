package com.hirestack.candidate;

import com.hirestack.application.ApplicationRepository;
import com.hirestack.common.BadRequestException;
import com.hirestack.common.PagedResponse;
import com.hirestack.common.ResourceNotFoundException;
import com.hirestack.company.Company;
import com.hirestack.company.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public PagedResponse<CandidateDTO> getCandidatesWithFilters(
            Long companyId,
            String source,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Candidate> candidatePage = candidateRepository.findWithFilters(companyId, source, search, pageable);

        List<CandidateDTO> content = candidatePage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<CandidateDTO>builder()
                .content(content)
                .page(candidatePage.getNumber())
                .size(candidatePage.getSize())
                .totalElements(candidatePage.getTotalElements())
                .totalPages(candidatePage.getTotalPages())
                .last(candidatePage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public CandidateDTO getCandidateById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));
        return toDTO(candidate);
    }

    @Transactional
    public CandidateDTO createCandidate(Long companyId, CreateCandidateRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (candidateRepository.existsByCompanyIdAndEmail(companyId, normalizedEmail)) {
            throw new BadRequestException(
                    "Candidate with email '" + request.getEmail() + "' already exists for this organization.");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        Candidate candidate = Candidate.builder()
                .company(company)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .phone(request.getPhone())
                .currentCompany(request.getCurrentCompany())
                .currentTitle(request.getCurrentTitle())
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : BigDecimal.ZERO)
                .location(request.getLocation())
                .skills(request.getSkills())
                .linkedinUrl(request.getLinkedinUrl())
                .source(request.getSource() != null ? request.getSource() : "CAREER_PORTAL")
                .notes(request.getNotes())
                .build();

        candidate = candidateRepository.save(candidate);
        return toDTO(candidate);
    }

    @Transactional
    public CandidateDTO updateCandidate(Long id, CreateCandidateRequest request) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));

        // If email changed, check uniqueness
        String normalizedNewEmail = request.getEmail().toLowerCase().trim();
        if (!candidate.getEmail().equalsIgnoreCase(normalizedNewEmail) &&
                candidateRepository.existsByCompanyIdAndEmail(candidate.getCompany().getId(), normalizedNewEmail)) {
            throw new BadRequestException(
                    "Candidate with email '" + request.getEmail() + "' already exists for this organization.");
        }

        candidate.setFirstName(request.getFirstName());
        candidate.setLastName(request.getLastName());
        candidate.setEmail(normalizedNewEmail);
        candidate.setPhone(request.getPhone());
        candidate.setCurrentCompany(request.getCurrentCompany());
        candidate.setCurrentTitle(request.getCurrentTitle());
        if (request.getExperienceYears() != null) {
            candidate.setExperienceYears(request.getExperienceYears());
        }
        candidate.setLocation(request.getLocation());
        candidate.setSkills(request.getSkills());
        candidate.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getSource() != null) {
            candidate.setSource(request.getSource());
        }
        candidate.setNotes(request.getNotes());

        candidate = candidateRepository.save(candidate);
        return toDTO(candidate);
    }

    @Transactional
    public void deleteCandidate(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));
        candidateRepository.delete(candidate);
    }

    public CandidateDTO toDTO(Candidate candidate) {
        long appCount = 0;
        try {
            appCount = applicationRepository.countByCandidateId(candidate.getId());
        } catch (Exception ignored) { }

        return CandidateDTO.builder()
                .id(candidate.getId())
                .companyId(candidate.getCompany().getId())
                .firstName(candidate.getFirstName())
                .lastName(candidate.getLastName())
                .fullName(candidate.getFirstName() + " " + candidate.getLastName())
                .email(candidate.getEmail())
                .phone(candidate.getPhone())
                .currentCompany(candidate.getCurrentCompany())
                .currentTitle(candidate.getCurrentTitle())
                .experienceYears(candidate.getExperienceYears())
                .location(candidate.getLocation())
                .skills(candidate.getSkills())
                .linkedinUrl(candidate.getLinkedinUrl())
                .source(candidate.getSource())
                .notes(candidate.getNotes())
                .applicationCount(appCount)
                .createdAt(candidate.getCreatedAt())
                .build();
    }
}
