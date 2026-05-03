package com.provx.driving_test.services;

import com.provx.driving_test.dtos.request.AnswerRequest;
import com.provx.driving_test.dtos.response.ExamAnswerResponse;
import com.provx.driving_test.dtos.response.ExamResponse;
import com.provx.driving_test.dtos.response.OptionResponse;
import com.provx.driving_test.dtos.response.QuestionResponse;
import com.provx.driving_test.enums.ExamStatus;
import com.provx.driving_test.enums.SessionType;
import com.provx.driving_test.exceptions.ApiException;
import com.provx.driving_test.models.*;
import com.provx.driving_test.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

        private final ExamRepository examRepository;
        private final ExamAnswerRepository examAnswerRepository;
        private final SessionQuestionRepository sessionQuestionRepository;
        private final QuestionOptionRepository questionOptionRepository;
        private final UserRepository userRepository;
        private final QuestionService questionService;

        private static final BigDecimal PASS_THRESHOLD = new BigDecimal("60.00");
        private static final int DURATION_SECONDS = 1200; // 20 minutes

        // -------------------------------------------------------
        // START a new exam
        // Draws 20 random questions, pre-creates all ExamAnswer rows
        // with correct option already stored (needed for review later)
        // -------------------------------------------------------
        @Transactional
        public ExamResponse startExam(Long userId) {
                // Block if there's already an active exam
                examRepository.findByUserIdAndStatus(userId, ExamStatus.IN_PROGRESS)
                                .ifPresent(active -> {
                                        // Auto-expire if timer has passed
                                        if (LocalDateTime.now().isAfter(active.getExpiresAt())) {
                                                gradeAndClose(active, ExamStatus.TIMED_OUT);
                                        } else {
                                                throw ApiException.conflict(
                                                                "You already have an exam in progress. Please submit or wait for it to expire.");
                                        }
                                });

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> ApiException.notFound("User", userId));

                // Draw 20 random questions
                List<Question> questions = questionService.draw20Random();

                // Create the exam
                LocalDateTime now = LocalDateTime.now();
                Exam exam = Exam.builder()
                                .user(user)
                                .status(ExamStatus.IN_PROGRESS)
                                .totalQuestions(20)
                                .passThreshold(PASS_THRESHOLD)
                                .durationSeconds(DURATION_SECONDS)
                                .startedAt(now)
                                .expiresAt(now.plusSeconds(DURATION_SECONDS))
                                .build();
                exam = examRepository.save(exam);

                // Store question order in session_questions
                List<SessionQuestion> sessionQuestions = new ArrayList<>();
                List<ExamAnswer> examAnswers = new ArrayList<>();

                for (int i = 0; i < questions.size(); i++) {
                        Question q = questions.get(i);

                        // Store position
                        sessionQuestions.add(SessionQuestion.builder()
                                        .sessionType(SessionType.EXAM)
                                        .sessionId(exam.getId())
                                        .question(q)
                                        .position(i + 1)
                                        .build());

                        // Pre-create answer row with correct option — selectedOption is null
                        // (unanswered)
                        QuestionOption correctOption = questionOptionRepository
                                        .findByQuestionIdAndIsCorrectTrue(q.getId())
                                        .orElseThrow(() -> ApiException.notFound("Correct option for question",
                                                        q.getId()));

                        examAnswers.add(ExamAnswer.builder()
                                        .exam(exam)
                                        .question(q)
                                        .selectedOption(null) // student hasn't answered yet
                                        .correctOption(correctOption)
                                        .isCorrect(null) // graded on submit
                                        .build());
                }

                sessionQuestionRepository.saveAll(sessionQuestions);
                examAnswerRepository.saveAll(examAnswers);

                // Build response — isCorrect NOT included in options
                List<QuestionResponse> questionResponses = new ArrayList<>();
                for (int i = 0; i < questions.size(); i++) {
                        questionResponses.add(questionService.toResponse(questions.get(i), i + 1, false));
                }

                return buildExamResponse(exam, questionResponses, null, null);
        }

        // -------------------------------------------------------
        // SAVE a single answer mid-exam (student selects an option)
        // Does NOT grade — just stores the selection
        // -------------------------------------------------------
        @Transactional
        public ExamAnswerResponse saveAnswer(Long examId, Long userId, AnswerRequest request) {
                Exam exam = getValidActiveExam(examId, userId);

                // Get the pre-created answer row for this question
                ExamAnswer answer = examAnswerRepository
                                .findByExamIdAndQuestionId(examId, request.getQuestionId())
                                .orElseThrow(() -> ApiException.badRequest(
                                                "Question " + request.getQuestionId() + " is not part of this exam"));

                // Update selected option
                if (request.getSelectedOptionId() != null) {
                        QuestionOption selected = questionOptionRepository
                                        .findById(request.getSelectedOptionId())
                                        .orElseThrow(() -> ApiException.notFound("Option",
                                                        request.getSelectedOptionId()));
                        answer.setSelectedOption(selected);
                } else {
                        answer.setSelectedOption(null); // allow un-selecting
                }

                examAnswerRepository.save(answer);

                return ExamAnswerResponse.builder()
                                .questionId(request.getQuestionId())
                                .selectedOptionId(request.getSelectedOptionId())
                                .isCorrect(null) // not graded yet
                                .build();
        }

        // -------------------------------------------------------
        // SUBMIT the exam — grade all answers, calculate score
        // -------------------------------------------------------
        @Transactional
        public ExamResponse submitExam(Long examId, Long userId) {
                Exam exam = getValidActiveExam(examId, userId);
                return gradeAndClose(exam, ExamStatus.SUBMITTED);
        }

        // -------------------------------------------------------
        // GET exam state — used to restore if student refreshes
        // -------------------------------------------------------
        @Transactional
        public ExamResponse getExam(Long examId, Long userId) {
                Exam exam = examRepository.findById(examId)
                                .orElseThrow(() -> ApiException.notFound("Exam", examId));

                if (!exam.getUser().getId().equals(userId)) {
                        throw ApiException.forbidden("This exam does not belong to you");
                }

                // Auto-expire if timer ran out
                if (exam.getStatus() == ExamStatus.IN_PROGRESS &&
                                LocalDateTime.now().isAfter(exam.getExpiresAt())) {
                        exam = examRepository.findById(examId).orElseThrow();
                        gradeAndClose(exam, ExamStatus.TIMED_OUT);
                        exam = examRepository.findById(examId).orElseThrow();
                }

                // Get questions in order
                List<SessionQuestion> sessionQuestions = sessionQuestionRepository
                                .findBySessionTypeAndSessionIdOrderByPositionAsc(SessionType.EXAM, examId);

                List<QuestionResponse> questionResponses = sessionQuestions.stream()
                                .map(sq -> questionService.toResponse(sq.getQuestion(), sq.getPosition(), false))
                                .collect(Collectors.toList());

                // Get current answer state (for navigator grid)
                List<ExamAnswerResponse> answers = examAnswerRepository.findByExamId(examId).stream()
                                .map(a -> ExamAnswerResponse.builder()
                                                .questionId(a.getQuestion().getId())
                                                .selectedOptionId(a.getSelectedOption() != null
                                                                ? a.getSelectedOption().getId()
                                                                : null)
                                                .isCorrect(null) // hidden until submitted
                                                .build())
                                .collect(Collectors.toList());

                return buildExamResponse(exam, questionResponses, answers, null);
        }

        // -------------------------------------------------------
        // GET review — full post-exam review with correct answers
        // Only available after exam is SUBMITTED or TIMED_OUT
        // -------------------------------------------------------
        @Transactional
        public ExamResponse getReview(Long examId, Long userId) {
                Exam exam = examRepository.findById(examId)
                                .orElseThrow(() -> ApiException.notFound("Exam", examId));

                if (!exam.getUser().getId().equals(userId)) {
                        throw ApiException.forbidden("This exam does not belong to you");
                }
                if (exam.getStatus() == ExamStatus.IN_PROGRESS) {
                        throw ApiException.badRequest("Exam must be submitted before reviewing");
                }

                // Get questions with position map
                List<SessionQuestion> sessionQuestions = sessionQuestionRepository
                                .findBySessionTypeAndSessionIdOrderByPositionAsc(SessionType.EXAM, examId);
                Map<Long, Integer> questionPositions = sessionQuestions.stream()
                                .collect(Collectors.toMap(
                                                sq -> sq.getQuestion().getId(),
                                                SessionQuestion::getPosition));

                // Build full review with correct answers revealed
                List<ExamAnswerResponse> review = examAnswerRepository.findByExamId(examId).stream()
                                .map(a -> {
                                        List<OptionResponse> options = a.getQuestion().getOptions().stream()
                                                        .map(opt -> OptionResponse.builder()
                                                                        .id(opt.getId())
                                                                        .optionLetter(opt.getOptionLetter())
                                                                        .textRw(opt.getTextRw())
                                                                        .isCorrect(opt.getIsCorrect()) // revealed in
                                                                                                       // review
                                                                        .build())
                                                        .collect(Collectors.toList());

                                        return ExamAnswerResponse.builder()
                                                        .questionId(a.getQuestion().getId())
                                                        .position(questionPositions.get(a.getQuestion().getId()))
                                                        .selectedOptionId(a.getSelectedOption() != null
                                                                        ? a.getSelectedOption().getId()
                                                                        : null)
                                                        .isCorrect(a.getIsCorrect())
                                                        .correctOptionId(a.getCorrectOption().getId())
                                                        .correctOptionText(a.getCorrectOption().getTextRw())
                                                        .questionTextRw(a.getQuestion().getTextRw())
                                                        .imageUrl(questionService.buildImageUrl(
                                                                        a.getQuestion().getImageFilename()))
                                                        .options(options)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                return buildExamResponse(exam, null, null, review);
        }

        // -------------------------------------------------------
        // GET student's exam history
        // -------------------------------------------------------
        @Transactional
        public List<ExamResponse> getHistory(Long userId) {
                return examRepository.findByUserIdOrderByStartedAtDesc(userId).stream()
                                .map(e -> buildExamResponse(e, null, null, null))
                                .collect(Collectors.toList());
        }

        // -------------------------------------------------------
        // Private — validate exam is active and belongs to user
        // -------------------------------------------------------
        private Exam getValidActiveExam(Long examId, Long userId) {
                Exam exam = examRepository.findById(examId)
                                .orElseThrow(() -> ApiException.notFound("Exam", examId));

                if (!exam.getUser().getId().equals(userId)) {
                        throw ApiException.forbidden("This exam does not belong to you");
                }
                if (exam.getStatus() != ExamStatus.IN_PROGRESS) {
                        throw ApiException.badRequest("This exam is already " + exam.getStatus().name().toLowerCase());
                }
                // Check timer
                if (LocalDateTime.now().isAfter(exam.getExpiresAt())) {
                        gradeAndClose(exam, ExamStatus.TIMED_OUT);
                        throw ApiException.gone("Your exam time has expired. The exam has been auto-submitted.");
                }
                return exam;
        }

        // -------------------------------------------------------
        // Private — grade all answers and close the exam
        // -------------------------------------------------------
        @Transactional
        private ExamResponse gradeAndClose(Exam exam, ExamStatus finalStatus) {
                List<ExamAnswer> answers = examAnswerRepository.findByExamId(exam.getId());

                int correct = 0;
                for (ExamAnswer answer : answers) {
                        boolean isCorrect = answer.getSelectedOption() != null &&
                                        answer.getSelectedOption().getId().equals(answer.getCorrectOption().getId());
                        answer.setIsCorrect(isCorrect);
                        if (isCorrect)
                                correct++;
                }
                examAnswerRepository.saveAll(answers);

                BigDecimal score = BigDecimal.valueOf(correct)
                                .divide(BigDecimal.valueOf(exam.getTotalQuestions()), 2, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100));

                exam.setCorrectCount(correct);
                exam.setScorePercent(score);
                exam.setPassed(score.compareTo(PASS_THRESHOLD) >= 0);
                exam.setStatus(finalStatus);
                exam.setSubmittedAt(LocalDateTime.now());
                exam.setDurationSeconds((int) Math.max(0,
                                Duration.between(exam.getStartedAt(), exam.getSubmittedAt()).getSeconds()));
                examRepository.save(exam);

                return buildExamResponse(exam, null, null, null);
        }

        // -------------------------------------------------------
        // Private — shared response builder
        // -------------------------------------------------------
        private ExamResponse buildExamResponse(Exam exam,
                        List<QuestionResponse> questions,
                        List<ExamAnswerResponse> answers,
                        List<ExamAnswerResponse> review) {
                return ExamResponse.builder()
                                .id(exam.getId())
                                .status(exam.getStatus())
                                .totalQuestions(exam.getTotalQuestions())
                                .correctCount(exam.getCorrectCount())
                                .scorePercent(exam.getScorePercent())
                                .passed(exam.getPassed())
                                .passThreshold(exam.getPassThreshold())
                                .durationSeconds(exam.getDurationSeconds())
                                .startedAt(exam.getStartedAt())
                                .submittedAt(exam.getSubmittedAt())
                                .expiresAt(exam.getExpiresAt())
                                .questions(questions)
                                .answers(answers)
                                .review(review)
                                .build();
        }
}
