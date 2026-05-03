package com.provx.driving_test.services;

import com.provx.driving_test.dtos.request.AnswerRequest;
import com.provx.driving_test.dtos.response.PracticeAnswerResponse;
import com.provx.driving_test.dtos.response.PracticeSessionResponse;
import com.provx.driving_test.dtos.response.QuestionResponse;
import com.provx.driving_test.enums.SessionStatus;
import com.provx.driving_test.enums.SessionType;
import com.provx.driving_test.exceptions.ApiException;
import com.provx.driving_test.models.*;
import com.provx.driving_test.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PracticeService {

    private final PracticeSessionRepository practiceSessionRepository;
    private final PracticeAnswerRepository practiceAnswerRepository;
    private final SessionQuestionRepository sessionQuestionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final UserRepository userRepository;
    private final QuestionService questionService;

    // -------------------------------------------------------
    // START a new practice session
    // Draws 20 random questions, stores them in session_questions
    // -------------------------------------------------------
    @Transactional
    public PracticeSessionResponse startSession(Long userId) {
        // Prevent double sessions — complete any stale in-progress session first
        practiceSessionRepository.findByUserIdAndStatus(userId, SessionStatus.IN_PROGRESS)
                .ifPresent(stale -> {
                    stale.setStatus(SessionStatus.COMPLETED);
                    stale.setCompletedAt(LocalDateTime.now());
                    practiceSessionRepository.save(stale);
                });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User", userId));

        // Draw 20 random questions
        List<Question> questions = questionService.draw20Random();

        // Create the session
        PracticeSession session = PracticeSession.builder()
                .user(user)
                .status(SessionStatus.IN_PROGRESS)
                .totalQuestions(20)
                .correctCount(0)
                .build();
        session = practiceSessionRepository.save(session);

        // Store question order in session_questions
        List<SessionQuestion> sessionQuestions = new ArrayList<>();
        for (int i = 0; i < questions.size(); i++) {
            sessionQuestions.add(SessionQuestion.builder()
                    .sessionType(SessionType.PRACTICE)
                    .sessionId(session.getId())
                    .question(questions.get(i))
                    .position(i + 1)
                    .build());
        }
        sessionQuestionRepository.saveAll(sessionQuestions);

        // Build response — isCorrect is NOT included in options
        List<QuestionResponse> questionResponses = new ArrayList<>();
        for (int i = 0; i < questions.size(); i++) {
            questionResponses.add(questionService.toResponse(questions.get(i), i + 1, false));
        }

        return PracticeSessionResponse.builder()
                .id(session.getId().toString())
                .status(session.getStatus())
                .totalQuestions(20)
                .correctCount(0)
                .startedAt(session.getStartedAt())
                .questions(questionResponses)
                .build();
    }

    // -------------------------------------------------------
    // SUBMIT a single answer during practice
    // Returns instant feedback: correct/wrong + correct option
    // -------------------------------------------------------
    @Transactional
    public PracticeAnswerResponse submitAnswer(Long sessionId, Long userId, AnswerRequest request) {
        // Validate session belongs to user and is still in progress
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> ApiException.notFound("Practice session", sessionId));

        if (!session.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("This session does not belong to you");
        }
        if (session.getStatus() != SessionStatus.IN_PROGRESS) {
            throw ApiException.badRequest("This practice session is already completed");
        }

        // Check question hasn't already been answered
        if (practiceAnswerRepository.findBySessionIdAndQuestionId(
                sessionId, request.getQuestionId()).isPresent()) {
            throw ApiException.badRequest("This question has already been answered");
        }

        // Get the correct option for this question
        QuestionOption correctOption = questionOptionRepository
                .findByQuestionIdAndIsCorrectTrue(request.getQuestionId())
                .orElseThrow(() -> ApiException.notFound(
                        "Correct option for question", request.getQuestionId()));

        // Determine if the selected answer is correct
        boolean isCorrect = request.getSelectedOptionId() != null &&
                request.getSelectedOptionId().equals(correctOption.getId());

        // Get selected option entity if provided
        QuestionOption selectedOption = null;
        if (request.getSelectedOptionId() != null) {
            selectedOption = questionOptionRepository.findById(request.getSelectedOptionId())
                    .orElseThrow(() -> ApiException.notFound("Option", request.getSelectedOptionId()));
        }

        // Save the answer
        PracticeAnswer answer = PracticeAnswer.builder()
                .session(session)
                .question(correctOption.getQuestion())
                .selectedOption(selectedOption)
                .isCorrect(isCorrect)
                .build();
        practiceAnswerRepository.save(answer);

        // Update correct count on session
        if (isCorrect) {
            session.setCorrectCount(session.getCorrectCount() + 1);
            practiceSessionRepository.save(session);
        }

        // Check if all 20 questions have been answered — auto-complete session
        long answeredCount = practiceAnswerRepository.countBySessionIdAndIsCorrectTrue(sessionId) +
                practiceAnswerRepository.findBySessionId(sessionId).stream()
                        .filter(a -> !a.getIsCorrect()).count();

        // Total answers regardless of correct/wrong
        long totalAnswered = practiceAnswerRepository.findBySessionId(sessionId).size();
        if (totalAnswered >= session.getTotalQuestions()) {
            completeSession(session);
        }

        // Return instant feedback
        return PracticeAnswerResponse.builder()
                .questionId(request.getQuestionId().toString())
                .selectedOptionId(request.getSelectedOptionId() != null ? request.getSelectedOptionId().toString() : null)
                .isCorrect(isCorrect)
                .correctOptionId(correctOption.getId().toString())
                .correctOptionText(correctOption.getTextRw())
                .build();
    }

    // -------------------------------------------------------
    // GET session with current state
    // Used if student refreshes mid-practice
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public PracticeSessionResponse getSession(Long sessionId, Long userId) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> ApiException.notFound("Practice session", sessionId));

        if (!session.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("This session does not belong to you");
        }

        // Get the 20 questions in order
        List<SessionQuestion> sessionQuestions = sessionQuestionRepository
                .findBySessionTypeAndSessionIdOrderByPositionAsc(SessionType.PRACTICE, sessionId);

        List<QuestionResponse> questionResponses = sessionQuestions.stream()
                .map(sq -> questionService.toResponse(sq.getQuestion(), sq.getPosition(), false))
                .collect(Collectors.toList());

        return PracticeSessionResponse.builder()
                .id(session.getId().toString())
                .status(session.getStatus())
                .totalQuestions(session.getTotalQuestions())
                .correctCount(session.getCorrectCount())
                .scorePercent(session.getScorePercent())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .questions(questionResponses)
                .build();
    }

    // -------------------------------------------------------
    // GET student's practice history
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public List<PracticeSessionResponse> getHistory(Long userId) {
        return practiceSessionRepository.findByUserIdOrderByStartedAtDesc(userId).stream()
                .map(s -> PracticeSessionResponse.builder()
                        .id(s.getId())
                        .status(s.getStatus())
                        .totalQuestions(s.getTotalQuestions())
                        .correctCount(s.getCorrectCount())
                        .scorePercent(s.getScorePercent())
                        .startedAt(s.getStartedAt())
                        .completedAt(s.getCompletedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // Private — complete a session and calculate final score
    // -------------------------------------------------------
    private void completeSession(PracticeSession session) {
        long correct = practiceAnswerRepository.countBySessionIdAndIsCorrectTrue(session.getId());
        BigDecimal score = BigDecimal.valueOf(correct)
                .divide(BigDecimal.valueOf(session.getTotalQuestions()), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        session.setCorrectCount((int) correct);
        session.setScorePercent(score);
        session.setStatus(SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        practiceSessionRepository.save(session);
    }
}