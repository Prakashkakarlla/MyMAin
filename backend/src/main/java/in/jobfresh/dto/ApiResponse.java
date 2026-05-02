package in.jobfresh.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Every API response uses this envelope.
 *
 * Success:  { success, status, message, data, timestamp }
 * Error:    { success, status, message, errors, timestamp }
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean          success;
    private int              status;
    private String           message;
    private T                data;
    private List<FieldError> errors;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // ── Factories ────────────────────────────────────────────────────────────

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .success(true).status(200).message("OK").data(data).build();
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true).status(200).message(message).data(data).build();
    }

    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
                .success(true).status(201).message("Created").data(data).build();
    }

    public static <T> ApiResponse<T> error(int status, String message) {
        return ApiResponse.<T>builder()
                .success(false).status(status).message(message).build();
    }

    public static <T> ApiResponse<T> validationError(List<FieldError> errors) {
        return ApiResponse.<T>builder()
                .success(false).status(422).message("Validation failed").errors(errors).build();
    }

    // ── Field error ──────────────────────────────────────────────────────────

    @Data
    @Builder
    public static class FieldError {
        private String field;
        private String message;
    }
}
