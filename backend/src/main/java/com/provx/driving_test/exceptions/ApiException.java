package com.provx.driving_test.exceptions;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String message;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
        this.message = message;
    }

    // -------------------------------------------------------
    // Static factory methods — use these everywhere in services
    // -------------------------------------------------------

    // 404
    public static ApiException notFound(String resource, Object id) {
        return new ApiException(HttpStatus.NOT_FOUND,
                resource + " with id '" + id + "' not found");
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    // 400
    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    // 401
    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, message);
    }

    // 403
    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, message);
    }

    // 409
    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message);
    }

    // 410 — used when exam timer has expired
    public static ApiException gone(String message) {
        return new ApiException(HttpStatus.GONE, message);
    }

    public HttpStatus getStatus() {
        return status;
    }

    @Override
    public String getMessage() {
        return message;
    }
}