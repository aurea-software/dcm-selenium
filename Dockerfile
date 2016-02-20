FROM node:5-onbuild
MAINTAINER Alexey Melnikov <a.melnikov@clickberry.com>

# prepare env vars and run mocha
RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]

# default mocha command
CMD ["--recursive"]
