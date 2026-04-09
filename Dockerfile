# AirSpider Dockerfile for Render/Production
FROM python:3.9-slim

# Install system dependencies (including tinyxml which is used by some modules)
RUN apt-get update && apt-get install -y \
    gcc \
    git \
    curl \
    swig \
    libssl-dev \
    libffi-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    libtinyxml-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create necessary directories and set ownership
RUN mkdir -p /var/lib/airspider && \
    useradd -m airspider && \
    chown -R airspider:airspider /app /var/lib/airspider

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -U pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .
RUN chown -R airspider:airspider /app

USER airspider

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=5001
ENV HOME=/home/airspider

EXPOSE 5001

# Use shell form to allow environment variable expansion for PORT
CMD python sf.py -l 0.0.0.0:$PORT
