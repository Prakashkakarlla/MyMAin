package in.jobfresh;

import in.jobfresh.model.AdminUser;
import in.jobfresh.model.Job;
import in.jobfresh.model.JobContent;
import in.jobfresh.repository.AdminUserRepository;
import in.jobfresh.repository.JobRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@SpringBootApplication
@EnableCaching
@org.springframework.scheduling.annotation.EnableAsync
public class JobFreshApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobFreshApplication.class, args);
    }

    // Seed default admin on first startup
    @Bean
    CommandLineRunner seedAdmin(AdminUserRepository repo,
                                PasswordEncoder encoder,
                                org.springframework.core.env.Environment env) {
        return args -> {
            String email = env.getProperty("app.admin.email", "admin@jobfresh.in");
            if (repo.findByEmail(email).isEmpty()) {
                String rawPwd = env.getProperty("app.admin.password", "Admin@123");
                AdminUser admin = new AdminUser();
                admin.setEmail(email);
                admin.setPassword(encoder.encode(rawPwd));
                admin.setName("Admin");
                repo.save(admin);
                System.out.println("✅ Default admin created: " + email);
            }
        };
    }

    @Bean
    CommandLineRunner seedJobs(JobRepository repo) {
        return args -> {
            if (repo.count() > 0) return;

            repo.saveAll(List.of(

                Job.builder()
                    .title("Software Engineer")
                    .company("Tata Consultancy Services")
                    .location("Bangalore,Hyderabad,Pune,Chennai")
                    .description("TCS is hiring Software Engineers for its NextStep programme. " +
                                 "Join one of India's largest IT companies and work on cutting-edge " +
                                 "enterprise projects across banking, retail, and telecom domains.")
                    .type(Job.JobType.FULL_TIME)
                    .category("IT / Software")
                    .salary("3.5 – 7 LPA")
                    .applyUrl("https://www.tcs.com/careers")
                    .degree(Job.DegreeType.BE_BTECH)
                    .branch("CS,IT,ECE,EEE,Mechanical")
                    .batch("2023,2024,2025")
                    .experienceLevel("Fresher")
                    .minPercentage(60.0)
                    .lastDateToApply(LocalDate.now().plusDays(30))
                    .aboutCompany("Tata Consultancy Services (TCS) is an Indian multinational IT services " +
                                  "and consulting company headquartered in Mumbai. It is a subsidiary of the " +
                                  "Tata Group and operates in 46 countries.")
                    .responsibilities(List.of(
                        "Develop and maintain web/mobile applications using Java, Python, or .NET",
                        "Collaborate with cross-functional teams to define and design new features",
                        "Write clean, well-documented, and testable code",
                        "Participate in code reviews and contribute to team best practices",
                        "Troubleshoot, debug, and resolve software defects"
                    ))
                    .requiredSkills(List.of("Java", "Python", "SQL", "Git", "Problem Solving", "OOP"))
                    .howToApply(List.of(
                        "Visit the TCS NextStep portal and register",
                        "Fill in your academic and personal details",
                        "Upload your resume (PDF only, max 2 MB)",
                        "Appear for the TCS National Qualifier Test (NQT) online",
                        "Shortlisted candidates will be called for interviews"
                    ))
                    .selectionRounds(List.of(
                        new JobContent.SelectionRound(1, "TCS NQT", "Online aptitude and coding test covering quantitative ability, verbal, and programming logic", "180 minutes", "Practice on TCS iON portal", "FileText"),
                        new JobContent.SelectionRound(2, "Technical Interview", "Deep dive into data structures, algorithms, and your preferred programming language", "60 minutes", "Revise DSA, Java/Python basics", "Code"),
                        new JobContent.SelectionRound(3, "HR Interview", "Discussion on career goals, relocation preference, and TCS culture", "30 minutes", "Research TCS values and recent news", "Users")
                    ))
                    .faqs(List.of(
                        new JobContent.Faq("Is there a bond or service agreement?", "Yes, TCS has an initial learning period policy. Breaking it before 1 year attracts a recovery of training costs."),
                        new JobContent.Faq("Can I choose my work location?", "Location is subject to project requirements. You can state your preference during onboarding.")
                    ))
                    .importantLinks(List.of(
                        new JobContent.ImportantLink("Apply on TCS NextStep", "https://www.tcs.com/careers"),
                        new JobContent.ImportantLink("TCS NQT Practice", "https://learning.tcsionhub.in")
                    ))
                    .active(true)
                    .build(),

                Job.builder()
                    .title("Systems Engineer")
                    .company("Infosys")
                    .location("Bangalore,Mysore,Pune,Hyderabad,Chennai")
                    .description("Infosys invites applications from engineering graduates for the role of " +
                                 "Systems Engineer. You will go through the Infosys Global Agile Developer " +
                                 "Certification training before being deployed on live client projects.")
                    .type(Job.JobType.FULL_TIME)
                    .category("IT / Software")
                    .salary("3.6 – 6.5 LPA")
                    .applyUrl("https://career.infosys.com")
                    .degree(Job.DegreeType.BE_BTECH)
                    .branch("CS,IT,ECE,EEE,Civil,Mechanical")
                    .batch("2024,2025")
                    .experienceLevel("Fresher")
                    .minPercentage(65.0)
                    .lastDateToApply(LocalDate.now().plusDays(20))
                    .aboutCompany("Infosys Limited is an Indian multinational IT company offering business " +
                                  "consulting, information technology, and outsourcing services. Founded in 1981, " +
                                  "it is headquartered in Bangalore and employs over 3 lakh professionals.")
                    .responsibilities(List.of(
                        "Analyse client requirements and translate them into technical specifications",
                        "Develop, test, and deploy software modules in an Agile environment",
                        "Maintain and enhance existing enterprise applications",
                        "Prepare technical documentation and unit test cases",
                        "Work closely with onshore teams across different time zones"
                    ))
                    .requiredSkills(List.of("C / C++", "Java", "DBMS", "OS Concepts", "Analytical Thinking", "Communication"))
                    .howToApply(List.of(
                        "Register on the Infosys careers portal",
                        "Complete the online application form with academic details",
                        "Take the InfyTQ assessment (if applicable for your batch)",
                        "Attend the campus or off-campus drive as communicated",
                        "Complete HR formalities after offer letter receipt"
                    ))
                    .selectionRounds(List.of(
                        new JobContent.SelectionRound(1, "Online Assessment", "Aptitude, logical reasoning, and verbal ability test on HackerRank", "95 minutes", "Practice aptitude on IndiaBix and HackerRank", "FileText"),
                        new JobContent.SelectionRound(2, "Technical Interview", "Questions on programming fundamentals, DBMS, OS, and a coding problem", "45 minutes", "Focus on C/Java basics and SQL queries", "Code"),
                        new JobContent.SelectionRound(3, "HR Interview", "Behavioural questions, relocation flexibility, and joining timeline", "20 minutes", "Prepare STAR-format answers for common HR questions", "MessageCircle")
                    ))
                    .faqs(List.of(
                        new JobContent.Faq("What is the training duration at Infosys?", "New hires undergo a 5-month residential training programme at the Infosys Global Education Centre in Mysore."),
                        new JobContent.Faq("Is the Mysore training mandatory?", "Yes, all freshers are required to complete the foundation training before project deployment.")
                    ))
                    .importantLinks(List.of(
                        new JobContent.ImportantLink("Apply on Infosys Careers", "https://career.infosys.com"),
                        new JobContent.ImportantLink("InfyTQ Platform", "https://infytq.onlineinfytq.in")
                    ))
                    .active(true)
                    .build(),

                Job.builder()
                    .title("Project Engineer Intern")
                    .company("Wipro")
                    .location("Bangalore,Hyderabad,Chennai,Kolkata")
                    .description("Wipro's 6-month internship programme gives pre-final year students hands-on " +
                                 "experience on real enterprise projects. Interns receive a monthly stipend " +
                                 "and a Pre-Placement Offer (PPO) on successful completion.")
                    .type(Job.JobType.INTERNSHIP)
                    .category("IT / Software")
                    .salary("₹15,000 – ₹20,000 / month")
                    .applyUrl("https://careers.wipro.com")
                    .degree(Job.DegreeType.BE_BTECH)
                    .branch("CS,IT,ECE")
                    .batch("2026")
                    .experienceLevel("Fresher")
                    .minPercentage(60.0)
                    .lastDateToApply(LocalDate.now().plusDays(15))
                    .aboutCompany("Wipro Limited is a leading global information technology, consulting, " +
                                  "and business process services company. Headquartered in Bangalore, Wipro " +
                                  "has a strong presence in over 65 countries with 2.5 lakh+ employees.")
                    .responsibilities(List.of(
                        "Assist in development of web or mobile features under senior guidance",
                        "Write and execute unit and integration tests",
                        "Participate in daily stand-ups and sprint planning meetings",
                        "Document code changes and contribute to knowledge base",
                        "Present intern project work at end-of-programme demo day"
                    ))
                    .requiredSkills(List.of("HTML/CSS", "JavaScript", "React or Angular", "REST APIs", "Git", "Teamwork"))
                    .howToApply(List.of(
                        "Apply through the Wipro careers page or your campus placement cell",
                        "Complete the online screening form with CGPA and project details",
                        "Appear for the online coding test (HackerEarth)",
                        "Attend virtual technical and HR interviews",
                        "Receive offer letter and complete document verification"
                    ))
                    .selectionRounds(List.of(
                        new JobContent.SelectionRound(1, "Coding Test", "Two coding problems (easy–medium) on HackerEarth; 90-minute window", "90 minutes", "Practice arrays, strings, and basic DP on LeetCode", "Code"),
                        new JobContent.SelectionRound(2, "Technical Interview", "Discussion of your projects, internship expectations, and a short live-coding exercise", "40 minutes", "Be ready to walk through any project on your resume", "Users"),
                        new JobContent.SelectionRound(3, "HR Interview", "Internship timelines, location preference, and PPO eligibility criteria", "15 minutes", "Know Wipro's recent initiatives and values", "MessageCircle")
                    ))
                    .faqs(List.of(
                        new JobContent.Faq("Is there a PPO at the end of the internship?", "Yes, interns who meet the performance benchmarks receive a Pre-Placement Offer for the Systems Engineer role."),
                        new JobContent.Faq("Is the internship work-from-office?", "Wipro internships are primarily office-based. Remote or hybrid arrangements depend on the project team.")
                    ))
                    .importantLinks(List.of(
                        new JobContent.ImportantLink("Apply on Wipro Careers", "https://careers.wipro.com"),
                        new JobContent.ImportantLink("Wipro Elite NTH Programme", "https://www.wipro.com/careers/wipro-elite-nth/")
                    ))
                    .active(true)
                    .build(),

                Job.builder()
                    .title("Associate Software Engineer")
                    .company("HCLTech")
                    .location("Noida,Chennai,Hyderabad,Bangalore")
                    .description("HCLTech is recruiting Associate Software Engineers through its TechBee and " +
                                 "campus hiring programmes. Selected candidates will receive structured onboarding " +
                                 "and work on digital transformation projects for global Fortune 500 clients.")
                    .type(Job.JobType.FULL_TIME)
                    .category("IT / Software")
                    .salary("4 – 7 LPA")
                    .applyUrl("https://www.hcltech.com/careers")
                    .degree(Job.DegreeType.BE_BTECH)
                    .branch("CS,IT,ECE,EEE")
                    .batch("2023,2024,2025")
                    .experienceLevel("Fresher")
                    .minPercentage(60.0)
                    .lastDateToApply(LocalDate.now().plusDays(25))
                    .aboutCompany("HCLTech is a global technology company, home to 220,000+ people across 60 " +
                                  "countries. It delivers industry-leading capabilities centred around digital, " +
                                  "engineering, cloud, and AI powered by a broad portfolio of technology services.")
                    .responsibilities(List.of(
                        "Design and develop software components as per client specifications",
                        "Participate in Agile sprints — daily scrums, sprint planning, and retrospectives",
                        "Perform root cause analysis on production defects and implement fixes",
                        "Collaborate with QA engineers to ensure high software quality",
                        "Learn and adopt new technologies as required by projects"
                    ))
                    .requiredSkills(List.of("Java / Python", "Spring Boot", "MySQL", "REST APIs", "Agile", "Communication"))
                    .howToApply(List.of(
                        "Visit the HCLTech careers page and search for 'Associate Software Engineer'",
                        "Register and submit your profile with updated resume",
                        "Complete the online aptitude and coding assessment",
                        "Attend the technical and managerial interview rounds",
                        "Complete background verification and document submission after offer"
                    ))
                    .selectionRounds(List.of(
                        new JobContent.SelectionRound(1, "Online Assessment", "Quantitative aptitude, logical reasoning, verbal, and 2 coding questions", "120 minutes", "Practice on HackerRank and IndiaBix", "FileText"),
                        new JobContent.SelectionRound(2, "Technical Interview – 1", "Core CS concepts: OOP, DBMS, OS, and programming questions", "45 minutes", "Revise DBMS normalization and OS scheduling algorithms", "Code"),
                        new JobContent.SelectionRound(3, "Technical Interview – 2", "Project discussion and advanced coding or design question", "40 minutes", "Be thorough with your final year project", "Code"),
                        new JobContent.SelectionRound(4, "HR Interview", "Culture fit, relocation, salary expectations, and joining date", "20 minutes", "Know HCLTech's 'Ideapreneurship' culture", "Users")
                    ))
                    .faqs(List.of(
                        new JobContent.Faq("What is the work culture like at HCLTech?", "HCLTech follows an 'Employee First, Customer Second' philosophy emphasising innovation and employee autonomy."),
                        new JobContent.Faq("Is there a return-to-office policy?", "Most project teams work in a hybrid model — 3 days office, 2 days remote — subject to client and project needs.")
                    ))
                    .importantLinks(List.of(
                        new JobContent.ImportantLink("Apply on HCLTech Careers", "https://www.hcltech.com/careers"),
                        new JobContent.ImportantLink("HCLTech TechBee Programme", "https://www.hcltech.com/careers/techbee")
                    ))
                    .active(true)
                    .build()

            ));

            System.out.println("✅ Sample jobs seeded (4 records)");
        };
    }
}
