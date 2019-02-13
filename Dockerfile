FROM node:10-alpine

RUN mkdir -p /opt/bluehousegallery
WORKDIR /opt/bluehousegallery
ADD * /opt/bluehousegallery/
RUN npm i

CMD ["node", "index.js"]
