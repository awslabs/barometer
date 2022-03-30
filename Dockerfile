FROM maven:3-openjdk-8 AS build-java
COPY source/cdk-stack/common-functions/jdbc-query-runner/src /usr/src/app/src
COPY source/cdk-stack/common-functions/jdbc-query-runner/pom.xml /usr/src/app
RUN mvn -f /usr/src/app/pom.xml clean package && \
 wget -P /usr/src/app/target/dependency/ https://s3.amazonaws.com/athena-downloads/drivers/JDBC/SimbaAthenaJDBC-2.0.27.1001/AthenaJDBC42_2.0.27.1001.jar && \
    wget -P /usr/src/app/target/dependency/ https://repo1.maven.org/maven2/com/amazon/redshift/redshift-jdbc42/2.1.0.5/redshift-jdbc42-2.1.0.5.jar

FROM node:17-alpine AS build-cdk
COPY source/cdk-stack /build/cdk-stack
COPY source/cli-wizard /build/cli-wizard
COPY source/tools /build/tools
COPY deployment/deploy-docker.sh /build
WORKDIR /build/cdk-stack
RUN npm install && apk -v --no-cache add zip bash wget && /bin/bash zip-source.sh
WORKDIR /build/cli-wizard
RUN npm install && npm run build
WORKDIR /build
RUN npm install aws-cdk

FROM alpine:3.15
COPY --from=build-cdk /build /build
COPY --from=build-java /usr/src/app/target /build/cdk-stack/common-functions/jdbc-query-runner/target
RUN apk -v --no-cache add nodejs npm bash docker-cli aws-cli jq
VOLUME ["/root/.aws"]
VOLUME ["/build/cli-wizard/storage"]
ENTRYPOINT ["/build/deploy-docker.sh"]