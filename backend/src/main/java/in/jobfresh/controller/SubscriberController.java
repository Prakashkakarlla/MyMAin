package in.jobfresh.controller;

import in.jobfresh.dto.ApiResponse;
import in.jobfresh.model.Subscriber;
import in.jobfresh.repository.SubscriberRepository;
import in.jobfresh.service.EmailService;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Subscriber management.
 * POST   /api/v1/subscribers   → 201 Created
 * DELETE /api/v1/subscribers   → 204 No Content
 */
@RestController
@RequestMapping("/api/v1/subscribers")
@RequiredArgsConstructor
@Validated
@Slf4j
public class SubscriberController {

    private final SubscriberRepository subscriberRepo;
    private final EmailService         emailService;

    @PostMapping
    public ResponseEntity<ApiResponse<String>> subscribe(
            @RequestParam @Email(message = "Must be a valid email address") String email,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location) {

        if (subscriberRepo.findByEmail(email).isPresent()) {
            // 200 OK — not an error, idempotent
            return ResponseEntity.ok(ApiResponse.ok("Already subscribed", null));
        }

        Subscriber subscriber = Subscriber.builder()
                .email(email)
                .preferredCategory(category)
                .preferredLocation(location)
                .active(true)
                .build();
        subscriberRepo.save(subscriber);

        try {
            emailService.sendWelcomeEmail(email);
        } catch (Exception e) {
            log.warn("Welcome email failed for {}: {}", email, e.getMessage());
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Subscribed successfully"));
    }

    @DeleteMapping
    public ResponseEntity<Void> unsubscribe(
            @RequestParam @Email String email) {
        subscriberRepo.findByEmail(email).ifPresent(sub -> {
            sub.setActive(false);
            subscriberRepo.save(sub);
        });
        return ResponseEntity.noContent().build();   // 204
    }
}
