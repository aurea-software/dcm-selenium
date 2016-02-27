FROM node:5-onbuild
MAINTAINER Alexey Melnikov <a.melnikov@clickberry.com> - Aly Saleh <aly.saleh@aurea.com>

# mocha
RUN npm install -g mocha

# prepare env vars and run mocha
RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh", "--reporter"]

# default mocha command
CMD ["min", "--recursive"]
