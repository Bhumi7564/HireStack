package com.hirestack.feedback;

import com.hirestack.auth.User;
import com.hirestack.auth.UserRepository;
import com.hirestack.common.BadRequestException;
import com.hirestack.common.ResourceNotFoundException;
import com.hirestack.interview.Interview;
import com.hirestack.interview.InterviewRepository;
import com.hirestack.interview.InterviewStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final InterviewFeedbackRepository feedbackRepository;
    private final EvaluationScoreRepository scoreRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbackByInterview(Long interviewId) {
        return feedbackRepository.findByInterviewId(interviewId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackDTO submitFeedback(Long currentUserId, SubmitFeedbackRequest request) {
        if (feedbackRepository.existsByInterviewIdAndInterviewerId(request.getInterviewId(), currentUserId)) {
            throw new BadRequestException("You have already submitted feedback for this interview.");
        }

        Interview interview = interviewRepository.findById(request.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", request.getInterviewId()));

        User interviewer = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        InterviewFeedback feedback = InterviewFeedback.builder()
                .interview(interview)
                .interviewer(interviewer)
                .overallRating(request.getOverallRating())
                .technicalSkillsRating(request.getTechnicalSkillsRating())
                .communicationRating(request.getCommunicationRating())
                .problemSolvingRating(request.getProblemSolvingRating())
                .culturalFitRating(request.getCulturalFitRating())
                .recommendation(request.getRecommendation())
                .strengths(request.getStrengths())
                .weaknesses(request.getWeaknesses())
                .summaryComments(request.getSummaryComments())
                .submittedAt(Instant.now())
                .evaluationScores(new ArrayList<>())
                .build();

        feedback = feedbackRepository.save(feedback);

        if (request.getCriteriaScores() != null) {
            for (EvaluationScoreDTO scoreDTO : request.getCriteriaScores()) {
                EvaluationScore score = EvaluationScore.builder()
                        .feedback(feedback)
                        .criterionName(scoreDTO.getCriterionName())
                        .score(scoreDTO.getScore())
                        .weight(scoreDTO.getWeight())
                        .comments(scoreDTO.getComments())
                        .build();
                scoreRepository.save(score);
                feedback.getEvaluationScores().add(score);
            }
        }

        // Mark interview as COMPLETED if not already
        if (interview.getStatus() == InterviewStatus.SCHEDULED || interview.getStatus() == InterviewStatus.IN_PROGRESS) {
            interview.setStatus(InterviewStatus.COMPLETED);
            interviewRepository.save(interview);
        }

        return toDTO(feedback);
    }

    public FeedbackDTO toDTO(InterviewFeedback feedback) {
        List<EvaluationScoreDTO> scoreDTOs = feedback.getEvaluationScores() != null ?
                feedback.getEvaluationScores().stream()
                        .map(s -> EvaluationScoreDTO.builder()
                                .id(s.getId())
                                .criterionName(s.getCriterionName())
                                .score(s.getScore())
                                .weight(s.getWeight())
                                .comments(s.getComments())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>();

        User interviewer = feedback.getInterviewer();

        return FeedbackDTO.builder()
                .id(feedback.getId())
                .interviewId(feedback.getInterview().getId())
                .interviewTitle(feedback.getInterview().getTitle())
                .interviewerId(interviewer.getId())
                .interviewerName(interviewer.getFirstName() + " " + interviewer.getLastName())
                .overallRating(feedback.getOverallRating())
                .technicalSkillsRating(feedback.getTechnicalSkillsRating())
                .communicationRating(feedback.getCommunicationRating())
                .problemSolvingRating(feedback.getProblemSolvingRating())
                .culturalFitRating(feedback.getCulturalFitRating())
                .recommendation(feedback.getRecommendation())
                .strengths(feedback.getStrengths())
                .weaknesses(feedback.getWeaknesses())
                .summaryComments(feedback.getSummaryComments())
                .submittedAt(feedback.getSubmittedAt())
                .scores(scoreDTOs)
                .build();
    }
}

