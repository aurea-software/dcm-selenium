FROM node:5-onbuild
MAINTAINER Alexey Melnikov <a.melnikov@clickberry.com>

# mocha
RUN npm install -g mocha

# prepare env vars and run mocha
RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh", "--reporter", "mocha-teamcity-reporter"]

# default mocha command
CMD ["--recursive"]
