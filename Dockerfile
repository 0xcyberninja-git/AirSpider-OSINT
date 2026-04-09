# AirSpider Dockerfile for Render/Production
FROM python:3.9-slim-buster

# Install system dependencies
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
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create data directories
RUN mkdir -p /var/lib/airspider/log /var/lib/airspider/cache
ENV SPIDERFOOT_DATA /var/lib/airspider
ENV SPIDERFOOT_LOGS /var/lib/airspider/log
ENV SPIDERFOOT_CACHE /var/lib/airspider/cache

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Set permissions
RUN useradd -m airspider && \
    chown -R airspider:airspider /app /var/lib/airspider
USER airspider

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=5001

EXPOSE 5001

# Run AirSpider
CMD ["python", "sf.py", "-l", "0.0.0.0:5001"]
