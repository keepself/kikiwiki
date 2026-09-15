# ---- Build stage ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN ./gradlew dependencies --no-daemon || true

COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# ---- Run stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 컨테이너 기본 타임존이 UTC라 LocalDate.now() 등이 한국 자정~오전 9시 사이엔 "어제"로
# 계산되는 문제가 있었음 - tzdata 설치 + TZ 환경변수로 컨테이너/JVM 둘 다 KST로 고정
RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
# 서버 메모리가 1GB(+swap 2GB)라 힙을 명시적으로 제한 (기본값은 남은 메모리를 과하게 잡아서 OOM 위험)
ENV JAVA_OPTS="-Xmx384m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
