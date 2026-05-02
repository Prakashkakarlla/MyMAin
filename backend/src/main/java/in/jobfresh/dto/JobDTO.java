package in.jobfresh.dto;

import in.jobfresh.model.Job;
import in.jobfresh.model.JobContent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class JobDTO {

    @Data
    public static class Request {
        // ── Core ────────────────────────────────────────────────
        @NotBlank private String title;
        @NotBlank private String company;
        @NotBlank private String location;
        @NotBlank private String description;
        @NotNull  private Job.JobType type;
        private String category;
        private String salary;
        private String applyUrl;
        private String logoUrl;

        // ── Eligibility ─────────────────────────────────────────
        private String          qualification;
        private Job.DegreeType  degree;
        private String          branch;
        private String          batch;
        private String          experienceLevel;
        private Double          minPercentage;
        private String          bond;
        private String          ageLimit;

        // ── Dates ───────────────────────────────────────────────
        private LocalDate lastDateToApply;
        private String    examDate;

        // ── Rich content ────────────────────────────────────────
        private String                            aboutCompany;
        private List<String>                      responsibilities  = new ArrayList<>();
        private List<String>                      requiredSkills    = new ArrayList<>();
        private List<String>                      documentsRequired = new ArrayList<>();
        private List<String>                      howToApply        = new ArrayList<>();
        private List<JobContent.SelectionRound>   selectionRounds   = new ArrayList<>();
        private List<JobContent.Faq>              faqs              = new ArrayList<>();
        private List<JobContent.ImportantLink>    importantLinks    = new ArrayList<>();
    }

    @Data
    public static class Response {
        private Long id;
        // Core
        private String title;
        private String company;
        private String location;
        private String description;
        private Job.JobType type;
        private String category;
        private String salary;
        private String applyUrl;
        private String logoUrl;
        private boolean active;
        private LocalDateTime postedAt;

        // Eligibility
        private String          qualification;
        private Job.DegreeType  degree;
        private String          branch;
        private String          batch;
        private String          experienceLevel;
        private Double          minPercentage;
        private String          bond;
        private String          ageLimit;

        // Dates
        private LocalDate lastDateToApply;
        private String    examDate;

        // Rich content
        private String                            aboutCompany;
        private List<String>                      responsibilities;
        private List<String>                      requiredSkills;
        private List<String>                      documentsRequired;
        private List<String>                      howToApply;
        private List<JobContent.SelectionRound>   selectionRounds;
        private List<JobContent.Faq>              faqs;
        private List<JobContent.ImportantLink>    importantLinks;

        public static Response from(Job job) {
            Response r = new Response();
            // Core
            r.id              = job.getId();
            r.title           = job.getTitle();
            r.company         = job.getCompany();
            r.location        = job.getLocation();
            r.description     = job.getDescription();
            r.type            = job.getType();
            r.category        = job.getCategory();
            r.salary          = job.getSalary();
            r.applyUrl        = job.getApplyUrl();
            r.logoUrl         = job.getLogoUrl();
            r.active          = job.isActive();
            r.postedAt        = job.getPostedAt();

            // Eligibility
            r.qualification   = job.getQualification();
            r.degree          = job.getDegree();
            r.branch          = job.getBranch();
            r.batch           = job.getBatch();
            r.experienceLevel = job.getExperienceLevel();
            r.minPercentage   = job.getMinPercentage();
            r.bond            = job.getBond();
            r.ageLimit        = job.getAgeLimit();

            // Dates
            r.lastDateToApply = job.getLastDateToApply();
            r.examDate        = job.getExamDate();

            // Content
            r.aboutCompany      = job.getAboutCompany();
            r.responsibilities  = job.getResponsibilities();
            r.requiredSkills    = job.getRequiredSkills();
            r.documentsRequired = job.getDocumentsRequired();
            r.howToApply        = job.getHowToApply();
            r.selectionRounds   = job.getSelectionRounds();
            r.faqs              = job.getFaqs();
            r.importantLinks    = job.getImportantLinks();
            return r;
        }
    }
}
