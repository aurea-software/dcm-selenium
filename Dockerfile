FROM node:5-onbuild
MAINTAINER Alexey Melnikov <a.melnikov@clickberry.com> - Aly Saleh <aly.saleh@aurea.com>

ARG REPORTER="mocha-teamcity-reporter"

# mocha
RUN npm install -g mocha

# prepare env vars and run mocha
RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh", "--reporter", $REPORTER]

# default mocha command
CMD ["--recursive"]
