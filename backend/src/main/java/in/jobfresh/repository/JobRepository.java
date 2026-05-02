package in.jobfresh.repository;

import in.jobfresh.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("""
        SELECT j FROM Job j
        WHERE j.active = true
          AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%',:keyword,'%'))
               OR LOWER(j.company) LIKE LOWER(CONCAT('%',:keyword,'%'))
               OR LOWER(j.description) LIKE LOWER(CONCAT('%',:keyword,'%')))
          AND (:category IS NULL OR j.category = :category)
          AND (:type IS NULL OR j.type = :type)
          AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%',:location,'%')))
          AND (:batch IS NULL OR j.batch LIKE CONCAT('%',:batch,'%'))
          AND (:degree IS NULL OR j.degree = :degree)
          AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel)
        ORDER BY j.postedAt DESC
        """)
    Page<Job> searchJobs(
        @Param("keyword")         String keyword,
        @Param("category")        String category,
        @Param("type")            Job.JobType type,
        @Param("location")        String location,
        @Param("batch")           String batch,
        @Param("degree")          Job.DegreeType degree,
        @Param("experienceLevel") String experienceLevel,
        Pageable pageable
    );

    @Query("SELECT j FROM Job j WHERE j.active = true AND j.postedAt >= :since ORDER BY j.postedAt DESC")
    List<Job> findRecentJobs(@Param("since") java.time.LocalDateTime since);

    @Query("SELECT DISTINCT j.category FROM Job j WHERE j.active = true AND j.category IS NOT NULL")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT j.batch FROM Job j WHERE j.active = true AND j.batch IS NOT NULL")
    List<String> findDistinctBatches();

    long countByActive(boolean active);

    Page<Job> findAllByOrderByPostedAtDesc(Pageable pageable);
}
