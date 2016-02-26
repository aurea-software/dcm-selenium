#!/bin/bash
set -e

# set env variables
if [ -z "$SELENIUM_URL" ]; then
    echo "SELENIUM_URL environment variable required"
    exit 1
fi

if [ -z "$DCM_URL" ]; then
    echo "DCM_URL environment variable required"
    exit 1
fi

# patching config
sed -i "s#\"remote\":.*#\"remote\": \"${SELENIUM_URL}\",#g" test/lib/config.json
sed -i "s#\"url\":.*#\"url\": \"${DCM_URL}/DMS/dmswelcome.jsp\",#g" test/lib/config.json

echo "USING SELENIUM: ${SELENIUM_URL}"
echo "USING DCM: ${DCM_URL}"
echo "USING DCM: ${REPORTER}"

# execute mocha with parameters
exec mocha "$@"
