# 1) Gradle 빌드 스테이지
FROM gradle:8.6-jdk17 AS builder

WORKDIR /app

# Gradle wrapper 관련 파일 복사
COPY gradlew .
COPY gradlew.bat .
COPY gradle ./gradle

# 프로젝트 전체 복사
COPY . .

# gradlew 실행 권한 부여
RUN chmod +x gradlew

# build (jar 생성)
RUN ./gradlew clean build -x test

#---------------------------------------------------------

# 2) 런타임 스테이지
FROM eclipse-temurin:17-jdk

WORKDIR /app

# 빌드된 JAR 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 실행
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
