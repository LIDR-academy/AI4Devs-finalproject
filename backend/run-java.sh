#!/bin/sh

Color_Off='\033[0m'
Blue='\033[0;34m'

echo -e "${Blue}Ejecutando jar: $GR_JAR con la configuración: $GR_CONFIG_DIRECTORY ${Color_Off}"
java -jar $GR_JAR --spring.config.location=$GR_CONFIG_DIRECTORY