#!/bin/sh

Color_Off='\033[0m'
Blue='\033[0;34m'

echo -e "${Blue}Ejecutando jar: $JAR_FILE con la configuración: $CONFIG_DIRECTORY ${Color_Off}"
java -jar $JAR_FILE --spring.config.location=$CONFIG_DIRECTORY