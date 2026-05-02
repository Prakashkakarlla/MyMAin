package in.jobfresh.controller;

import in.jobfresh.dto.ApiResponse;
import in.jobfresh.dto.JobDTO;
import in.jobfresh.model.Job;
import in.jobfresh.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public job endpoints.
 * Rule: nouns only in URLs, correct HTTP status codes, /v1/ versioning.
 */
@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    /**
     * GET /api/v1/jobs
     * Search + filter + sort + paginate. All params optional.
     *
     * ?keyword=java&category=Engineering&type=FULL_TIME
     * &location=Bangalore&batch=2026&degree=BE_BTECH
     * &sort=postedAt&order=desc&page=0&size=12
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobDTO.Response>>> listJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Job.JobType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String batch,
            @RequestParam(required = false) Job.DegreeType degree,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(defaultValue = "postedAt") String sort,
            @RequestParam(defaultValue = "desc")     String order,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<JobDTO.Response> jobs = jobService.searchJobs(
                keyword, category, type, location, batch, degree,
                experienceLevel, sort, order, page, size);
        return ResponseEntity.ok(ApiResponse.ok(jobs));
    }

    /**
     * GET /api/v1/jobs/{id}
     * Returns 404 if job not found or inactive.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDTO.Response>> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getJobById(id)));
    }

    /**
     * GET /api/v1/jobs/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getCategories()));
    }

    /**
     * GET /api/v1/jobs/batches
     */
    @GetMapping("/batches")
    public ResponseEntity<ApiResponse<List<String>>> getBatches() {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getBatches()));
    }
}
