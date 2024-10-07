#!/bin/sh


docker buildx use grbuilder

docker buildx build --platform linux/amd64,linux/arm64/v8 -t sysdent/survey-engine:latest --push .