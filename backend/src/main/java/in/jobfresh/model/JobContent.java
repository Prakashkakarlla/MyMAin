package in.jobfresh.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Embeddable types stored as JSON in the jobs table.
 * Kept as separate top-level classes (not records) so Jackson + JPA's
 * JSON converter can deserialize them cleanly and Lombok @Data gives us
 * proper equals/hashCode (important for cache invalidation).
 */
public class JobContent {

    @Data @NoArgsConstructor @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SelectionRound implements Serializable {
        /** 1, 2, 3 ... */
        private Integer roundNumber;
        /** "Online Test", "Technical Interview", "HR Interview" */
        private String  name;
        /** Full description of what happens in this round */
        private String  description;
        /** "60 minutes", "45 minutes", "Approx 30 mins" */
        private String  duration;
        /** Optional preparation tips for this round */
        private String  tips;
        /** Lucide icon name — the frontend renders it. e.g. "FileText", "Code", "Users", "MessageCircle" */
        private String  icon;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Faq implements Serializable {
        private String question;
        private String answer;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ImportantLink implements Serializable {
        private String label;   // e.g. "Apply Online", "Official Website", "Syllabus PDF"
        private String url;
    }

    private JobContent() {}   // utility holder
}
