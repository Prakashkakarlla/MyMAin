package in.jobfresh.repository;

import in.jobfresh.model.Subscriber;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    Optional<Subscriber> findByEmail(String email);
    List<Subscriber> findByActive(boolean active);
}
