#!/bin/bash

CONTAINER_NAME="dockeeper.postgres"


if [ "$(docker ps -a -q -f name=^/${CONTAINER_NAME}$)" ]; then
    # ถ้า container มีอยู่แล้ว
    if [ "$(docker ps -q -f name=^/${CONTAINER_NAME}$)" ]; then
        echo "Container '$CONTAINER_NAME' is already running."
    else
        echo "Starting existing container '$CONTAINER_NAME'..."
        docker start "$CONTAINER_NAME"
    fi

else
    echo "Create and Running Container '$CONTAINER_NAME'..."
    docker run -d \
    --name "$CONTAINER_NAME" \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=admin1234 \
    -e POSTGRES_DB=dockeeper \
    -p 5434:5432 \
    postgres
fi