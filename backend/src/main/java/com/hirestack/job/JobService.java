package com.hirestack.job;

import com.hirestack.application.ApplicationRepository;
import com.hirestack.common.PagedResponse;
import com.hirestack.common.ResourceNotFoundException;
import com.hirestack.company.Company;
import com.hirestack.company.CompanyRepository;
import com.hirestack.recruiter.Recruiter;
import com.hirestack.recruiter.RecruiterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterRepository recruiterRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public PagedResponse<JobDTO> getJobsWithFilters(
            Long companyId,
            String department,
            String location,
            JobStatus status,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<JobOpening> jobPage = jobRepository.findWithFilters(companyId, department, location, status, search, pageable);

        List<JobDTO> content = jobPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<JobDTO>builder()
                .content(content)
                .page(jobPage.getNumber())
                .size(jobPage.getSize())
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .last(jobPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public JobDTO getJobById(Long id) {
        JobOpening job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobOpening", "id", id));
        return toDTO(job);
    }

    @Transactional
    public JobDTO createJob(Long companyId, CreateJobRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        Recruiter recruiter = null;
        if (request.getRecruiterId() != null) {
            recruiter = recruiterRepository.findById(request.getRecruiterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Recruiter", "id", request.getRecruiterId()));
        }

        JobOpening job = JobOpening.builder()
                .company(company)
                .recruiter(recruiter)
                .title(request.getTitle())
                .department(request.getDepartment())
                .location(request.getLocation())
                .employmentType(request.getEmploymentType() != null ? request.getEmploymentType() : "FULL_TIME")
                .experienceLevel(request.getExperienceLevel() != null ? request.getExperienceLevel() : "MID_LEVEL")
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .responsibilities(request.getResponsibilities())
                .salaryRangeMin(request.getSalaryRangeMin())
                .salaryRangeMax(request.getSalaryRangeMax())
                .status(request.getStatus() != null ? request.getStatus() : JobStatus.OPEN)
                .openingsCount(request.getOpeningsCount() != null ? request.getOpeningsCount() : 1)
                .closingDate(request.getClosingDate())
                .build();

        job = jobRepository.save(job);
        return toDTO(job);
    }

    @Transactional
    public JobDTO updateJob(Long id, CreateJobRequest request) {
        JobOpening job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobOpening", "id", id));

        if (request.getRecruiterId() != null) {
            Recruiter recruiter = recruiterRepository.findById(request.getRecruiterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Recruiter", "id", request.getRecruiterId()));
            job.setRecruiter(recruiter);
        } else {
            job.setRecruiter(null);
        }

        job.setTitle(request.getTitle());
        job.setDepartment(request.getDepartment());
        job.setLocation(request.getLocation());
        job.setEmploymentType(request.getEmploymentType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setResponsibilities(request.getResponsibilities());
        job.setSalaryRangeMin(request.getSalaryRangeMin());
        job.setSalaryRangeMax(request.getSalaryRangeMax());
        if (request.getStatus() != null) {
            job.setStatus(request.getStatus());
        }
        job.setOpeningsCount(request.getOpeningsCount());
        job.setClosingDate(request.getClosingDate());

        job = jobRepository.save(job);
        return toDTO(job);
    }

    @Transactional
    public JobDTO closeJob(Long id) {
        JobOpening job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobOpening", "id", id));

        job.setStatus(JobStatus.CLOSED);
        job = jobRepository.save(job);
        return toDTO(job);
    }

    @Transactional
    public void deleteJob(Long id) {
        JobOpening job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobOpening", "id", id));
        jobRepository.delete(job);
    }

    public JobDTO toDTO(JobOpening job) {
        String recruiterName = null;
        Long recruiterId = null;
        if (job.getRecruiter() != null && job.getRecruiter().getUser() != null) {
            recruiterId = job.getRecruiter().getId();
            recruiterName = job.getRecruiter().getUser().getFirstName() + " " + job.getRecruiter().getUser().getLastName();
        }

        long appCount = 0;
        try {
            appCount = applicationRepository.countByJobId(job.getId());
        } catch (Exception ignored) { }

        return JobDTO.builder()
                .id(job.getId())
                .companyId(job.getCompany().getId())
                .companyName(job.getCompany().getName())
                .recruiterId(recruiterId)
                .recruiterName(recruiterName)
                .title(job.getTitle())
                .department(job.getDepartment())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType())
                .experienceLevel(job.getExperienceLevel())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .responsibilities(job.getResponsibilities())
                .salaryRangeMin(job.getSalaryRangeMin())
                .salaryRangeMax(job.getSalaryRangeMax())
                .status(job.getStatus())
                .openingsCount(job.getOpeningsCount())
                .applicationCount(appCount)
                .postedDate(job.getPostedDate())
                .closingDate(job.getClosingDate())
                .createdAt(job.getCreatedAt())
                .build();
    }
}

