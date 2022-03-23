FROM maven:3-openjdk-8-slim AS build-java
COPY source/cdk-stack/common-functions/jdbc-query-runner/src /usr/src/app/src
COPY source/cdk-stack/common-functions/jdbc-query-runner/pom.xml /usr/src/app
RUN mvn -f /usr/src/app/pom.xml clean package

FROM node:17-alpine AS build-cdk
COPY source/cdk-stack /build/cdk-stack
COPY source/cli-wizard /build/cli-wizard
COPY --from=build-java /usr/src/app/target/dependency /build/cdk-stack/common-functions/jdbc-query-runner/target/
COPY --from=build-java /usr/src/app/target/jdbc-query-runner-1.0.0.jar /build/cdk-stack/common-functions/jdbc-query-runner/target/
COPY source/cdk-stack/platforms/athena/driver/* /build/cdk-stack/common-functions/jdbc-query-runner/target/dependency/
COPY source/cdk-stack/platforms/redshift/driver/* /build/cdk-stack/common-functions/jdbc-query-runner/target/dependency/
COPY deployment/deploy-docker.sh /build
WORKDIR /build/cli-wizard
RUN apk add docker && apk add bash && npm install -g aws-cdk && npm install && npm run build && mkdir /root/.aws
VOLUME ["/root/.aws"]
WORKDIR /build/cdk-stack
RUN npm install
ENTRYPOINT ["/build/deploy-docker.sh"]
