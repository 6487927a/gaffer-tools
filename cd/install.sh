#!/usr/bin/env bash

set -e

if [ "$TRAVIS_BRANCH" != 'master' ] || [ "$TRAVIS_PULL_REQUEST" == 'true' ]; then
    if [ "$MODULES" == '' ] || [[ $MODULES == *'!'* ]]; then
        echo "Running install script: mvn -q install -P quick,travis,build-extras -B -V"
        mvn -q install -P quick,travis,build-extras -B -V
    else
        echo "Running install script: mvn -q install -P quick,travis,build-extras -B -V -pl $MODULES -am"
        mvn -q install -P quick,travis,build-extras -B -V -pl $MODULES -am
    fi
fi