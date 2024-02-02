FROM node

COPY . /usr/src/app/

RUN chmod -R 777 /usr/src/app

WORKDIR /usr/src/app

RUN curl -fsSL https://bun.sh/install | bash
CMD [ "bun", "install" ]

EXPOSE 8000