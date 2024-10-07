FROM amazoncorretto:22-al2023

WORKDIR /survey

ENV JAR_FILE surveyve-0.0.1-SNAPSHOT.jar
ENV CONFIG_DIRECTORY=/survey/

COPY run-java.sh /usr/local/bin
COPY ./build/libs/surveyve-0.0.1-SNAPSHOT.jar /survey
COPY ./src/main/resources/application.properties /survey
RUN chmod +x /usr/local/bin/run-java.sh

ENTRYPOINT ["run-java.sh"]
CMD ["$JAR_FILE", "$CONFIG_DIRECTORY"]
