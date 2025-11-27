# -------- 1단계: JAR 빌드 --------
FROM gradle:8.6-jdk17 AS builder
WORKDIR /app

#----실행 권한---
RUN chmod +x gradlew


# Gradle 캐싱 최적화
COPY gradle gradle
COPY gradlew .
COPY build.gradle settings.gradle ./
RUN ./gradlew --version

# 소스 복사
COPY src ./src

# JAR 파일 빌드
RUN ./gradlew clean bootJar -x test

# -------- 2단계: 실행 --------
FROM eclipse-temurin:17-jre

WORKDIR /app

# 빌드된 JAR 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 환경 변수 (Render에서 prod 활성화)
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
