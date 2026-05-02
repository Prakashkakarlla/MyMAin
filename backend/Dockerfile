# ── Build stage ───────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests -q

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add a non-root user
RUN addgroup -S jobfresh && adduser -S jobfresh -G jobfresh
USER jobfresh

COPY --from=build /app/target/*.jar app.jar

# JVM tuned for 1GB VPS: 256MB max heap, G1GC for low pause
ENTRYPOINT ["java", \
  "-Xms128m", "-Xmx256m", \
  "-XX:+UseG1GC", \
  "-XX:MaxGCPauseMillis=200", \
  "-XX:+UseContainerSupport", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
