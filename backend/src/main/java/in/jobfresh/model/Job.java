package in.jobfresh.model;

import in.jobfresh.config.JsonListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_job_type",      columnList = "type"),
    @Index(name = "idx_job_active",    columnList = "active"),
    @Index(name = "idx_job_posted_at", columnList = "postedAt"),
    @Index(name = "idx_job_batch",     columnList = "batch"),
    @Index(name = "idx_job_deadline",  columnList = "lastDateToApply")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Core ─────────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private String title;

    private String logoUrl;

    @Column(nullable = false)
    private String company;

    /** Comma-separated cities: "Bangalore,Hyderabad,Pune" */
    @Column(nullable = false)
    private String location;

    /** Short summary / job description (plain text, ~200-500 chars) */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobType type;

    private String category;
    private String salary;
    private String applyUrl;

    // ── Eligibility ──────────────────────────────────────────────────────────
    private String qualification;

    @Enumerated(EnumType.STRING)
    private DegreeType degree;

    private String  branch;
    private String  batch;
    private String  experienceLevel;
    private Double  minPercentage;
    private String  bond;
    private String  ageLimit;

    // ── Dates ────────────────────────────────────────────────────────────────
    private LocalDate lastDateToApply;
    private String    examDate;

    // ── Rich Content (JSON columns in MySQL) ─────────────────────────────────

    /** Detailed paragraph about the company */
    @Column(columnDefinition = "TEXT")
    private String aboutCompany;

    /** Bullet list of responsibilities */
    @Convert(converter = JsonListConverter.StringListConverter.class)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private List<String> responsibilities = new ArrayList<>();

    /** Required technical/soft skills as chips */
    @Convert(converter = JsonListConverter.StringListConverter.class)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private List<String> requiredSkills = new ArrayList<>();

    /** Documents to bring/upload */
    @Convert(converter = JsonListConverter.StringListConverter.class)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private List<String> documentsRequired = new ArrayList<>();

    /** Step-by-step "How to Apply" */
    @Convert(converter = JsonListConverter.StringListConverter.class)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private List<String> howToApply = new ArrayList<>();

    /** Selection process rounds (timeline) */
    @Convert(converter = JsonListConverter.SelectionRoundListConverter.class)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private List<JobContent.SelectionRound> selectionRounds = new ArrayList<>();

    /** Q&A section */
    @Convert(converter = JsonListConverter.FaqListConverter.class)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private List<JobContent.Faq> faqs = new ArrayList<>();

    /** Important external links */
    @Convert(converter = JsonListConverter.ImportantLinkListConverter.class)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private List<JobContent.ImportantLink> importantLinks = new ArrayList<>();

    // ── Status ───────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private LocalDateTime postedAt;

    @PrePersist
    protected void onCreate() {
        this.postedAt = LocalDateTime.now();
    }

    // ── Enums ────────────────────────────────────────────────────────────────
    public enum JobType {
        FULL_TIME, PART_TIME, REMOTE, INTERNSHIP, CONTRACT, WORK_FROM_HOME
    }

    public enum DegreeType {
        BE_BTECH, ME_MTECH_MS, BCA_MCA, BSC, MBA_PGDM, BA_MA, DIPLOMA, ANY
    }
}
