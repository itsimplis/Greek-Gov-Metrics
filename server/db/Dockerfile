FROM postgres:latest

ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD password

COPY ./create_schema.sql /docker-entrypoint-initdb.d/
COPY ./insert_data.sql /docker-entrypoint-initdb.d/

RUN mkdir /data && chown postgres /data

VOLUME /data

EXPOSE 5432