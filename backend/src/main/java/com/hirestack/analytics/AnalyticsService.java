package com.hirestack.analytics;

import com.hirestack.application.Application;
import com.hirestack.application.ApplicationRepository;
import com.hirestack.application.ApplicationStatus;
import com.hirestack.candidate.Candidate;
import com.hirestack.candidate.CandidateRepository;
import com.hirestack.interview.InterviewRepository;
import com.hirestack.interview.InterviewStatus;
import com.hirestack.job.JobOpening;
import com.hirestack.job.JobRepository;
import com.hirestack.job.JobStatus;
import com.hirestack.recruiter.Recruiter;
import com.hirestack.recruiter.RecruiterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final RecruiterRepository recruiterRepository;

    @Transactional(readOnly = true)
    public OverviewStatsDTO getOverviewStats(Long companyId) {
        long totalJobs = jobRepository.countByCompanyId(companyId);
        long activeJobs = jobRepository.countByCompanyIdAndStatus(companyId, JobStatus.OPEN);
        long totalCandidates = candidateRepository.countByCompanyId(companyId);
        long totalApplications = applicationRepository.countByJobCompanyId(companyId);
        long activeInterviews = interviewRepository.countByApplicationJobCompanyIdAndStatus(companyId,
                InterviewStatus.SCHEDULED);
        long hiredCount = applicationRepository.countByJobCompanyIdAndCurrentStage(companyId, ApplicationStatus.HIRED);

        Map<String, Long> stageDist = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = applicationRepository.countByJobCompanyIdAndCurrentStage(companyId, status);
            stageDist.put(status.name(), count);
        }

        // Calculate average time to hire in days for hired candidates
        List<Application> allApps = applicationRepository.findAllByCompanyId(companyId);
        double avgDays = allApps.stream()
                .filter(a -> a.getCurrentStage() == ApplicationStatus.HIRED && a.getHiredDate() != null
                        && a.getAppliedDate() != null)
                .mapToLong(a -> Math.max(1, Duration.between(a.getAppliedDate(), a.getHiredDate()).toDays()))
                .average()
                .orElse(18.5);

        return OverviewStatsDTO.builder()
                .totalJobs(totalJobs)
                .activeJobs(activeJobs)
                .totalCandidates(totalCandidates)
                .totalApplications(totalApplications)
                .activeInterviews(activeInterviews)
                .hiredCount(hiredCount)
                .averageTimeToHireDays(Math.round(avgDays * 10.0) / 10.0)
                .stageDistribution(stageDist)
                .build();
    }

    @Transactional(readOnly = true)
    public List<PipelineStatsDTO> getPipelineFunnel(Long companyId) {
        long total = applicationRepository.countByJobCompanyId(companyId);
        List<PipelineStatsDTO> list = new ArrayList<>();

        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = applicationRepository.countByJobCompanyIdAndCurrentStage(companyId, status);
            double pct = (total > 0) ? (count * 100.0) / total : 0.0;

            list.add(PipelineStatsDTO.builder()
                    .stage(status.name())
                    .count(count)
                    .percentageOfTotal(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<RecruiterStatsDTO> getRecruiterStats(Long companyId) {
        List<Recruiter> recruiters = recruiterRepository.findByCompanyId(companyId);
        List<Application> allApps = applicationRepository.findAllByCompanyId(companyId);

        return recruiters.stream().map(r -> {
            String name = r.getUser().getFirstName() + " " + r.getUser().getLastName();
            List<JobOpening> jobs = jobRepository.findByRecruiterId(r.getId());
            long activeJobs = jobs.stream().filter(j -> j.getStatus() == JobStatus.OPEN).count();

            List<Application> recruiterApps = allApps.stream()
                    .filter(a -> a.getJob().getRecruiter() != null
                            && a.getJob().getRecruiter().getId().equals(r.getId()))
                    .collect(Collectors.toList());

            long totalApps = recruiterApps.size();
            long hired = recruiterApps.stream().filter(a -> a.getCurrentStage() == ApplicationStatus.HIRED).count();
            long interviews = recruiterApps.stream()
                    .filter(a -> a.getCurrentStage() == ApplicationStatus.INTERVIEW
                            || a.getCurrentStage() == ApplicationStatus.OFFER
                            || a.getCurrentStage() == ApplicationStatus.HIRED)
                    .count();

            return RecruiterStatsDTO.builder()
                    .recruiterId(r.getId())
                    .recruiterName(name)
                    .department(r.getDepartment())
                    .activeJobs(activeJobs)
                    .totalApplications(totalApps)
                    .interviewsConducted(interviews)
                    .hiredCount(hired)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeToHireDTO> getTimeToHireStats(Long companyId) {
        List<JobOpening> jobs = jobRepository.findByCompanyId(companyId);
        List<Application> allApps = applicationRepository.findAllByCompanyId(companyId);

        return jobs.stream().map(job -> {
            List<Application> hiredApps = allApps.stream()
                    .filter(a -> a.getJob().getId().equals(job.getId())
                            && a.getCurrentStage() == ApplicationStatus.HIRED)
                    .collect(Collectors.toList());

            double avgDays = hiredApps.stream()
                    .filter(a -> a.getHiredDate() != null && a.getAppliedDate() != null)
                    .mapToLong(a -> Math.max(1, Duration.between(a.getAppliedDate(), a.getHiredDate()).toDays()))
                    .average()
                    .orElse(0.0);

            return TimeToHireDTO.builder()
                    .jobId(job.getId())
                    .jobTitle(job.getTitle())
                    .department(job.getDepartment())
                    .averageDaysToHire(Math.round(avgDays * 10.0) / 10.0)
                    .totalHired(hiredApps.size())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SourceStatsDTO> getSourceEffectiveness(Long companyId) {
        List<Application> allApps = applicationRepository.findAllByCompanyId(companyId);
        Map<String, List<Application>> bySource = allApps.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCandidate().getSource() != null ? a.getCandidate().getSource() : "DIRECT"));

        return bySource.entrySet().stream().map(entry -> {
            String source = entry.getKey();
            List<Application> apps = entry.getValue();
            long total = apps.size();
            long hired = apps.stream().filter(a -> a.getCurrentStage() == ApplicationStatus.HIRED).count();
            double conv = (total > 0) ? (hired * 100.0) / total : 0.0;

            return SourceStatsDTO.builder()
                    .source(source)
                    .candidateCount(total)
                    .hiredCount(hired)
                    .conversionRatePercentage(Math.round(conv * 10.0) / 10.0)
                    .build();
        }).sorted(Comparator.comparingLong(SourceStatsDTO::getCandidateCount).reversed())
                .collect(Collectors.toList());
    }
}
