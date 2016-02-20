# Dockerized selenium UI tests
DCM UI auto-tests powered by Node.js WD

# Environment Variables
The container should be properly configured with following environment variables.

Key | Value | Description
:-- | :-- | :-- 
SELENIUM_URL | http://192.168.99.100:4444/wd/hub | Selenium node URL.
DCM_URL | http://192.168.99.100:8081 | DCM application base URL.

## Run Selenium container
```
docker run -d --name standalone-chrome -p 4444:4444 selenium/standalone-chrome
```

## RUN DCM container
```
docker run --name dcm-selenium -e SELENIUM_URL=http://192.168.99.100:4444/wd/hub -e DCM_URL=http://192.168.99.100:8081 --rm dcm-selenium
```
