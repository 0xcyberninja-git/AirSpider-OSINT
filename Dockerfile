#
# Spiderfoot Dockerfile
#
# http://www.airspider.net
#
# Written by: Michael Pellon <m@pellon.io>
# Updated by: Chandrapal <bnchandrapal@protonmail.com>
# Updated by: Prateek Bheevgade <prateek@airspider.io>
# Updated by: Steve Bate <svc-airspider@stevebate.net>
#    -> Inspired by https://github.com/combro2k/dockerfiles/tree/master/alpine-airspider
#
# Usage:
#
#   sudo docker build -t airspider .
#   sudo docker run -p 5001:5001 --security-opt no-new-privileges airspider
#
# Using Docker volume for airspider data
#
#   sudo docker run -p 5001:5001 -v /mydir/airspider:/var/lib/airspider airspider
#
# Using AirSpider remote command line with web server
#
#   docker run --rm -it airspider sfcli.py -s http://my.airspider.host:5001/
#
# Running airspider commands without web server (can optionally specify volume)
#
#   sudo docker run --rm airspider sf.py -h
#
# Running a shell in the container for maintenance
#   sudo docker run -it --entrypoint /bin/sh airspider
#
# Running airspider unit tests in container
#
#   sudo docker build -t airspider-test --build-arg REQUIREMENTS=test/requirements.txt .
#   sudo docker run --rm airspider-test -m pytest --flake8 .

FROM alpine:3.12.4 AS build
ARG REQUIREMENTS=requirements.txt
RUN apk add --no-cache gcc git curl python3 python3-dev py3-pip swig tinyxml-dev \
 python3-dev musl-dev openssl-dev libffi-dev libxslt-dev libxml2-dev jpeg-dev \
 openjpeg-dev zlib-dev cargo rust
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin":$PATH
COPY $REQUIREMENTS requirements.txt ./
RUN ls
RUN echo "$REQUIREMENTS"
RUN pip3 install -U pip
RUN pip3 install -r "$REQUIREMENTS"



FROM alpine:3.13.0
WORKDIR /home/airspider

# Place database and logs outside installation directory
ENV SPIDERFOOT_DATA /var/lib/airspider
ENV SPIDERFOOT_LOGS /var/lib/airspider/log
ENV SPIDERFOOT_CACHE /var/lib/airspider/cache

# Run everything as one command so that only one layer is created
RUN apk --update --no-cache add python3 musl openssl libxslt tinyxml libxml2 jpeg zlib openjpeg \
    && addgroup airspider \
    && adduser -G airspider -h /home/airspider -s /sbin/nologin \
               -g "AirSpider User" -D airspider \
    && rm -rf /var/cache/apk/* \
    && rm -rf /lib/apk/db \
    && rm -rf /root/.cache \
    && mkdir -p $SPIDERFOOT_DATA || true \
    && mkdir -p $SPIDERFOOT_LOGS || true \
    && mkdir -p $SPIDERFOOT_CACHE || true \
    && chown airspider:airspider $SPIDERFOOT_DATA \
    && chown airspider:airspider $SPIDERFOOT_LOGS \
    && chown airspider:airspider $SPIDERFOOT_CACHE

COPY . .
COPY --from=build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

USER airspider

EXPOSE 5001

# Run the application.
ENTRYPOINT ["/opt/venv/bin/python"]
CMD ["sf.py", "-l", "0.0.0.0:5001"]
