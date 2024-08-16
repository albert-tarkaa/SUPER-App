# Build stage
# Use Maven with OpenJDK 17 (slim version) as the base image for building the application
FROM maven:3.8.4-openjdk-17-slim AS build

# Set the working directory for the build stage
WORKDIR /app

# Copy the Maven configuration file (pom.xml) into the build stage's working directory
COPY pom.xml .

# Copy the source code of the application into the build stage's working directory
COPY src ./src

# Build the application using Maven, targeting the 'prod' profile and skipping tests
RUN mvn clean package -Pprod -DskipTests


# Run stage
# Use Amazon Corretto as the base image for running the application (Amazon's distribution of OpenJDK)
FROM amazoncorretto:17

# Set the working directory in the container for the runtime stage
WORKDIR /app

# Copy the built JAR file from the build stage into the runtime stage's working directory
COPY --from=build app/target/*.jar app.jar

# Copy the JSON data file from the build stage into the runtime stage's working directory
COPY --from=build app/src/main/resources/parkData.json app/resources/parkData.json

# Copy the production properties file into the runtime stage's working directory
COPY --from=build app/src/main/resources/application-prod.properties /app/application-prod.properties

# Specify the command to run the application using the copied JAR file and the custom properties file
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.config.location=file:/app/application-prod.properties"]
