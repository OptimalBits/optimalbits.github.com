FROM	ubuntu:12.10
RUN	apt-get update
RUN apt-get update
RUN apt-get install -y python-software-properties python g++ make
RUN apt-get install software-properties-common
RUN add-apt-repository ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get install nodejs
RUN npm install -g pm2
ADD . /optimalbits.com
RUN cd /optimalbits.com; npm install
EXPOSE  8000
ENTRYPOINT ["pm2 start optimalbits.com/server.js"]
