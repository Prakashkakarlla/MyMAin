package in.jobfresh.service;

import in.jobfresh.dto.JobDTO;
import in.jobfresh.exception.ResourceNotFoundException;
import in.jobfresh.model.Job;
import in.jobfresh.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final EmailService  emailService;

    // Allowed sort fields — whitelist prevents SQL injection via sort param
    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of("postedAt", "salary", "company", "title", "lastDateToApply");

    // ── Public API ──────────────────────────────────────────────────────────

    // Not cached — Page<> contains Spring internals (PageRequest, Sort) that
    // Jackson cannot reconstruct. DB query is fast; per-param key hit rate is low.
    public Page<JobDTO.Response> searchJobs(String keyword, String category,
                                            Job.JobType type, String location,
                                            String batch, Job.DegreeType degree,
                                            String experienceLevel,
                                            String sort, String order,
                                            int page, int size) {

        int safeSize = Math.min(size, 50);
        String sortField = ALLOWED_SORT_FIELDS.contains(sort) ? sort : "postedAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(order)
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        PageRequest pageable = PageRequest.of(page, safeSize, Sort.by(dir, sortField));

        return jobRepository.searchJobs(
                blank(keyword) ? null : keyword.trim(),
                blank(category) ? null : category.trim(),
                type,
                blank(location) ? null : location.trim(),
                blank(batch) ? null : batch.trim(),
                degree,
                blank(experienceLevel) ? null : experienceLevel.trim(),
                pageable
        ).map(JobDTO.Response::from);
    }

    @Cacheable(value = "jobDetail", key = "#id")
    public JobDTO.Response getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .filter(Job::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Job", id));
        return JobDTO.Response.from(job);
    }

    @Cacheable(value = "categories")
    public List<String> getCategories() {
        return jobRepository.findDistinctCategories();
    }

    @Cacheable(value = "categories", key = "'batches'")
    public List<String> getBatches() {
        return jobRepository.findDistinctBatches();
    }

    // ── Admin API ───────────────────────────────────────────────────────────

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "jobDetail",  allEntries = true),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public JobDTO.Response createJob(JobDTO.Request req) {
        Job job = Job.builder()
                .title(req.getTitle())
                .company(req.getCompany())
                .location(req.getLocation())
                .description(req.getDescription())
                .type(req.getType())
                .category(req.getCategory())
                .salary(req.getSalary())
                .applyUrl(req.getApplyUrl())
                .logoUrl(req.getLogoUrl())
                .qualification(req.getQualification())
                .degree(req.getDegree())
                .branch(req.getBranch())
                .batch(req.getBatch())
                .experienceLevel(req.getExperienceLevel())
                .minPercentage(req.getMinPercentage())
                .bond(req.getBond())
                .ageLimit(req.getAgeLimit())
                .lastDateToApply(req.getLastDateToApply())
                .examDate(req.getExamDate())
                .aboutCompany(req.getAboutCompany())
                .responsibilities(req.getResponsibilities())
                .requiredSkills(req.getRequiredSkills())
                .documentsRequired(req.getDocumentsRequired())
                .howToApply(req.getHowToApply())
                .selectionRounds(req.getSelectionRounds())
                .faqs(req.getFaqs())
                .importantLinks(req.getImportantLinks())
                .active(true)
                .build();

        Job saved = jobRepository.save(job);
        emailService.notifySubscribers(saved);
        return JobDTO.Response.from(saved);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "jobDetail",  key = "#id"),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public JobDTO.Response updateJob(Long id, JobDTO.Request req) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", id));

        job.setTitle(req.getTitle());
        job.setCompany(req.getCompany());
        job.setLocation(req.getLocation());
        job.setDescription(req.getDescription());
        job.setType(req.getType());
        job.setCategory(req.getCategory());
        job.setSalary(req.getSalary());
        job.setApplyUrl(req.getApplyUrl());
        job.setLogoUrl(req.getLogoUrl());
        job.setQualification(req.getQualification());
        job.setDegree(req.getDegree());
        job.setBranch(req.getBranch());
        job.setBatch(req.getBatch());
        job.setExperienceLevel(req.getExperienceLevel());
        job.setMinPercentage(req.getMinPercentage());
        job.setBond(req.getBond());
        job.setAgeLimit(req.getAgeLimit());
        job.setLastDateToApply(req.getLastDateToApply());
        job.setExamDate(req.getExamDate());
        job.setAboutCompany(req.getAboutCompany());
        job.setResponsibilities(req.getResponsibilities());
        job.setRequiredSkills(req.getRequiredSkills());
        job.setDocumentsRequired(req.getDocumentsRequired());
        job.setHowToApply(req.getHowToApply());
        job.setSelectionRounds(req.getSelectionRounds());
        job.setFaqs(req.getFaqs());
        job.setImportantLinks(req.getImportantLinks());

        return JobDTO.Response.from(jobRepository.save(job));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "jobDetail",  key = "#id"),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", id));
        jobRepository.delete(job);
    }

    public Page<JobDTO.Response> adminListJobs(int page, int size) {
        return jobRepository
                .findAllByOrderByPostedAtDesc(PageRequest.of(page, Math.min(size, 100)))
                .map(JobDTO.Response::from);
    }

    public DashboardStats getDashboardStats() {
        return new DashboardStats(jobRepository.count(), jobRepository.countByActive(true));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private boolean blank(String s) { return s == null || s.isBlank(); }

    public record DashboardStats(long totalJobs, long activeJobs) {}
}
