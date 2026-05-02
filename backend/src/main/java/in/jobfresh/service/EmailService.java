package in.jobfresh.service;

import in.jobfresh.model.Job;
import in.jobfresh.model.Subscriber;
import in.jobfresh.repository.SubscriberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@EnableAsync
public class EmailService {

    private final JavaMailSender mailSender;
    private final SubscriberRepository subscriberRepository;

    @Value("${app.name}")
    private String appName;

    @Value("${app.url}")
    private String appUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void notifySubscribers(Job job) {
        List<Subscriber> subscribers = subscriberRepository.findByActive(true);
        if (subscribers.isEmpty()) return;

        log.info("Sending job alert to {} subscribers", subscribers.size());

        for (Subscriber sub : subscribers) {
            // Filter by preference if set
            if (sub.getPreferredCategory() != null
                    && !sub.getPreferredCategory().isBlank()
                    && !sub.getPreferredCategory().equalsIgnoreCase(job.getCategory())) {
                continue;
            }
            try {
                sendJobAlertEmail(sub.getEmail(), job);
            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", sub.getEmail(), e.getMessage());
            }
        }
    }

    private void sendJobAlertEmail(String to, Job job) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, appName);
        helper.setTo(to);
        helper.setSubject("🚀 New Job: " + job.getTitle() + " at " + job.getCompany());
        helper.setText(buildJobAlertHtml(job), true);

        mailSender.send(message);
    }

    private String buildJobAlertHtml(Job job) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"/></head>
            <body style="font-family: 'Segoe UI', sans-serif; background:#f4f4f5; margin:0; padding:20px;">
              <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08);">
                <div style="background:#1a1a2e; padding:32px; text-align:center;">
                  <h1 style="color:#f97316; margin:0; font-size:28px;">JobFresh.in</h1>
                  <p style="color:#a1a1aa; margin:8px 0 0;">A fresh job just landed!</p>
                </div>
                <div style="padding:32px;">
                  <h2 style="color:#1a1a2e; margin:0 0 8px;">%s</h2>
                  <p style="color:#6b7280; margin:0 0 24px; font-size:16px;">%s &bull; %s</p>
                  <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px;">
                    <span style="background:#fff7ed; color:#f97316; padding:4px 12px; border-radius:999px; font-size:13px;">%s</span>
                    %s
                    %s
                  </div>
                  <p style="color:#374151; line-height:1.6; margin-bottom:32px;">%s</p>
                  <a href="%s/jobs/%d" style="display:inline-block; background:#f97316; color:#fff; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:16px;">View & Apply →</a>
                </div>
                <div style="background:#f9fafb; padding:20px 32px; border-top:1px solid #f3f4f6;">
                  <p style="color:#9ca3af; font-size:12px; margin:0;">
                    You're receiving this because you subscribed to JobFresh.in job alerts.<br>
                    <a href="%s/unsubscribe" style="color:#f97316;">Unsubscribe</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getType().name().replace("_", " "),
                job.getCategory() != null ? "<span style=\"background:#f0fdf4;color:#16a34a;padding:4px 12px;border-radius:999px;font-size:13px;\">" + job.getCategory() + "</span>" : "",
                job.getSalary() != null ? "<span style=\"background:#eff6ff;color:#2563eb;padding:4px 12px;border-radius:999px;font-size:13px;\">" + job.getSalary() + "</span>" : "",
                job.getDescription().length() > 200
                    ? job.getDescription().substring(0, 200) + "..."
                    : job.getDescription(),
                appUrl, job.getId(),
                appUrl
        );
    }

    public void sendWelcomeEmail(String to) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail, appName);
        helper.setTo(to);
        helper.setSubject("Welcome to JobFresh.in 🎉");
        helper.setText("""
            <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;">
              <h2 style="color:#f97316;">You're subscribed! 🚀</h2>
              <p>You'll now receive fresh job alerts directly in your inbox.</p>
              <p style="color:#6b7280;font-size:14px;">JobFresh.in — Fresh jobs, every day.</p>
            </div>
            """, true);
        mailSender.send(message);
    }
}
