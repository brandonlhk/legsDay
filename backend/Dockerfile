# Use python 3.11.9 base image
FROM python:3.11.9

# Set non-interactive frontend for apt-get
ENV DEBIAN_FRONTEND=noninteractive

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED 1

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip

# Copy requirements.txt and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY /src /src

# Set working directory
WORKDIR /src