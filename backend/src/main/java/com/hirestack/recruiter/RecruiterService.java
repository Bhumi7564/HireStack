package com.hirestack.recruiter;

import com.hirestack.auth.User;
import com.hirestack.auth.UserRepository;
import com.hirestack.common.BadRequestException;
import com.hirestack.common.ResourceNotFoundException;
import com.hirestack.company.Company;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterRepository recruiterRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RecruiterDTO> getRecruitersByCompany(Long companyId) {
        return recruiterRepository.findByCompanyId(companyId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecruiterDTO getRecruiterById(Long id) {
        Recruiter recruiter = recruiterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter", "id", id));
        return toDTO(recruiter);
    }

    @Transactional(readOnly = true)
    public RecruiterDTO getRecruiterByUserId(Long userId) {
        Recruiter recruiter = recruiterRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter", "userId", userId));
        return toDTO(recruiter);
    }

    @Transactional
    public RecruiterDTO createRecruiter(Long companyId, CreateRecruiterRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        if (recruiterRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new BadRequestException("Recruiter profile already exists for user ID: " + request.getUserId());
        }

        Company company = user.getCompany();
        if (company == null || !company.getId().equals(companyId)) {
            throw new BadRequestException("User does not belong to the authorized company");
        }

        Recruiter recruiter = Recruiter.builder()
                .user(user)
                .company(company)
                .department(request.getDepartment())
                .title(request.getTitle())
                .maxActiveJobs(request.getMaxActiveJobs() != null ? request.getMaxActiveJobs() : 10)
                .build();

        recruiter = recruiterRepository.save(recruiter);
        return toDTO(recruiter);
    }

    public RecruiterDTO toDTO(Recruiter recruiter) {
        User user = recruiter.getUser();
        return RecruiterDTO.builder()
                .id(recruiter.getId())
                .userId(user.getId())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .companyId(recruiter.getCompany().getId())
                .department(recruiter.getDepartment())
                .title(recruiter.getTitle())
                .maxActiveJobs(recruiter.getMaxActiveJobs())
                .createdAt(recruiter.getCreatedAt())
                .build();
    }
}

