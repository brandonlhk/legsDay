# Use Ubuntu Jammy as base image
FROM ubuntu:jammy

# Set non-interactive frontend for apt-get
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies and Python 3.11.9
RUN apt-get update && \
    apt-get install -y \
    software-properties-common \
    wget \
    curl \
    gnupg \
    lsb-release

# Add Python PPA and install Python 3.11.9
RUN add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install MongoDB 6.0
RUN wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-org

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE 1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED 1

# Upgrade pip and install Python dependencies
RUN pip3 install --upgrade pip

# Copy requirements.txt and install Python dependencies
# Adjust the path to copy from /backend/build/requirements.txt
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy source code
# Adjust the path to copy from /backend/src to /src in the container
COPY /src /src

# Set working directory
WORKDIR /src

# Expose MongoDB port
EXPOSE 27017

# Lambda entry point, not used yet cos still in dev
# CMD ["src/userdbDriver.lambda_handler"]
