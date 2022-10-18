FROM openjdk:8-jre-slim
COPY target/classes /usr/src/app
COPY target/dependency/* /usr/src/app/lib/
WORKDIR /usr/src/app
CMD ["java", "-classpath", "lib/*:.", "com.aws.benchmarking.jdbcqueryrunner.ContainerHandler"]