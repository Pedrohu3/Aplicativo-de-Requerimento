FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"] 

#Docker Comands#
#docker build -t desenv-sistemas .
#docker run -p 8081:8081 -e DATABASE_URL="jdbc:postgresql://host.docker.internal:5432/desenv_sistemas" -e DATABASE_PASSWORD="admin" desenv-sistemas