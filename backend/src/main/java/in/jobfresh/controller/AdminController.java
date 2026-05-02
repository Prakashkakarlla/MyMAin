package in.jobfresh.controller;

import in.jobfresh.dto.ApiResponse;
import in.jobfresh.dto.JobDTO;
import in.jobfresh.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Admin-only endpoints. All require ROLE_ADMIN (JWT).
 *
 * Rule: 201 Created for POST, 204 No Content for DELETE.
 * No verbs in URL — use HTTP methods to express the action.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final JobService jobService;

    /** GET /api/v1/admin/dashboard */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<JobService.DashboardStats>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getDashboardStats()));
    }

    /** GET /api/v1/admin/jobs?page=0&size=20 */
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobDTO.Response>>> listJobs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.adminListJobs(page, size)));
    }

    /**
     * POST /api/v1/admin/jobs
     * → 201 Created with new resource in body.
     * → 422 Unprocessable if @Valid fails (handled globally).
     */
    @PostMapping("/jobs")
    public ResponseEntity<ApiResponse<JobDTO.Response>> createJob(
            @Valid @RequestBody JobDTO.Request request) {
        JobDTO.Response created = jobService.createJob(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(created));
    }

    /**
     * PUT /api/v1/admin/jobs/{id}
     * → 200 OK with updated resource.
     * → 404 if job doesn't exist (thrown in service).
     */
    @PutMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<JobDTO.Response>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobDTO.Request request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Job updated", jobService.updateJob(id, request)));
    }

    /**
     * DELETE /api/v1/admin/jobs/{id}
     * → 204 No Content. No body. That's the standard.
     * → 404 if job doesn't exist.
     */
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();    // 204, no body
    }
}
