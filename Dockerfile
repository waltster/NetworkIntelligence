FROM ubuntu:latest
USER root

RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_19.x | bash -
RUN apt-get -y install nodejs make build-essential libpcap-dev

COPY . /app
WORKDIR /app

RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
