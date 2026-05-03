package com.provx.driving_test.services;

import com.provx.driving_test.dtos.request.QuestionRequest;
import com.provx.driving_test.dtos.response.OptionResponse;
import com.provx.driving_test.dtos.response.QuestionResponse;
import com.provx.driving_test.exceptions.ApiException;
import com.provx.driving_test.models.Question;
import com.provx.driving_test.models.QuestionOption;
import com.provx.driving_test.Repository.QuestionOptionRepository;
import com.provx.driving_test.Repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;

    @Value("${app.image-base-url:/images/signs/}")
    private String imageBaseUrl;

    private String normalizeImageBaseUrl() {
        if (imageBaseUrl == null || imageBaseUrl.isBlank()) {
            return "/images/signs/";
        }
        return imageBaseUrl.endsWith("/") ? imageBaseUrl : imageBaseUrl + "/";
    }

    // -------------------------------------------------------
    // Draw 20 random questions for a new session
    // Called by PracticeService and ExamService
    // -------------------------------------------------------
    public List<Question> draw20Random() {
        List<Question> questions = questionRepository.findRandom20Active();
        if (questions.size() < 20) {
            throw ApiException.badRequest(
                    "Not enough active questions in the bank. Found: " + questions.size() + ", need: 20");
        }
        return questions;
    }

    // -------------------------------------------------------
    // Map a Question entity to a QuestionResponse DTO
    // includeCorrect = false during active exam/practice
    // includeCorrect = true for admin, review, and practice feedback
    // -------------------------------------------------------
    public QuestionResponse toResponse(Question question, int position, boolean includeCorrect) {
        List<OptionResponse> options = question.getOptions().stream()
                .map(opt -> OptionResponse.builder()
                        .id(opt.getId().toString())
                        .optionLetter(opt.getOptionLetter())
                        .textRw(opt.getTextRw())
                        // Only expose isCorrect when explicitly requested
                        .isCorrect(includeCorrect ? opt.getIsCorrect() : null)
                        .build())
                .collect(Collectors.toList());

        return QuestionResponse.builder()
                .id(question.getId().toString())
                .questionNumber(question.getQuestionNumber())
                .textRw(question.getTextRw())
                .isImageBased(question.getIsImageBased())
                .imageUrl(buildImageUrl(question.getImageFilename()))
                .options(options)
                .position(position)
                .build();
    }

    // -------------------------------------------------------
    // ADMIN — Get all questions
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public List<QuestionResponse> getAllQuestions() {
        return questionRepository.findByIsActiveTrue().stream()
                .map(q -> toResponse(q, q.getQuestionNumber(), true))
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // ADMIN — Get one question by id
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public QuestionResponse getById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Question", id));
        return toResponse(question, question.getQuestionNumber(), true);
    }

    // -------------------------------------------------------
    // ADMIN — Create a new question
    // -------------------------------------------------------
    @Transactional
    public QuestionResponse create(QuestionRequest request) {
        if (questionRepository.existsByQuestionNumber(request.getQuestionNumber())) {
            throw ApiException.conflict(
                    "A question with number " + request.getQuestionNumber() + " already exists");
        }

        // Validate exactly one correct answer
        long correctCount = request.getOptions().stream()
                .filter(QuestionRequest.OptionRequest::getIsCorrect).count();
        if (correctCount != 1) {
            throw ApiException.badRequest("Exactly one option must be marked as correct");
        }

        Question question = Question.builder()
                .questionNumber(request.getQuestionNumber())
                .textRw(request.getTextRw())
                .isImageBased(request.getIsImageBased())
                .imageFilename(request.getImageFilename())
                .isActive(true)
                .build();

        question = questionRepository.save(question);

        // Save options
        final Question savedQuestion = question;
        List<QuestionOption> options = request.getOptions().stream()
                .map(opt -> QuestionOption.builder()
                        .question(savedQuestion)
                        .optionLetter(opt.getOptionLetter())
                        .textRw(opt.getTextRw())
                        .isCorrect(opt.getIsCorrect())
                        .build())
                .collect(Collectors.toList());

        List<QuestionOption> savedOptions = questionOptionRepository.saveAll(options);

        // Set options on question entity
        question.setOptions(savedOptions);

        return toResponse(question, question.getQuestionNumber(), true);
    }

    // -------------------------------------------------------
    // ADMIN — Update a question
    // -------------------------------------------------------
    @Transactional
    public QuestionResponse update(Long id, QuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Question", id));

        // Validate exactly one correct answer
        long correctCount = request.getOptions().stream()
                .filter(QuestionRequest.OptionRequest::getIsCorrect).count();
        if (correctCount != 1) {
            throw ApiException.badRequest("Exactly one option must be marked as correct");
        }

        question.setTextRw(request.getTextRw());
        question.setIsImageBased(request.getIsImageBased());
        question.setImageFilename(request.getImageFilename());
        questionRepository.save(question);

        // Replace all options
        questionOptionRepository.deleteByQuestionId(id);
        final Question updatedQuestion = question;
        List<QuestionOption> options = request.getOptions().stream()
                .map(opt -> QuestionOption.builder()
                        .question(updatedQuestion)
                        .optionLetter(opt.getOptionLetter())
                        .textRw(opt.getTextRw())
                        .isCorrect(opt.getIsCorrect())
                        .build())
                .collect(Collectors.toList());
        List<QuestionOption> savedOptions = questionOptionRepository.saveAll(options);

        // Set options on question entity
        question.setOptions(savedOptions);

        return toResponse(question, question.getQuestionNumber(), true);
    }

    // -------------------------------------------------------
    // ADMIN — Soft delete (deactivate) a question
    // -------------------------------------------------------
    @Transactional
    public void deactivate(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Question", id));
        question.setIsActive(false);
        questionRepository.save(question);
    }

    // -------------------------------------------------------
    // Helper method to build full image URLs
    // -------------------------------------------------------
    public String buildImageUrl(String filename) {
        return filename != null ? normalizeImageBaseUrl() + filename : null;
    }
}
