#!/bin/bash

CONTAINER_NAME="dockeeper.postgres"

if [ "$(docker ps -a -q -f name=${CONTAINER_NAME})" ]; then
    echo "Delete Container '$CONTAINER_NAME'..."
    docker rm -f "$CONTAINER_NAME"
else
    echo "Container '$CONTAINER_NAME' is not found!!"
fi
