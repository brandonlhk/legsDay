# AWS Lambda Python 3.11 base image
FROM public.ecr.aws/lambda/python:3.11

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE 1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED 1

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip

# Copy requirements.txt and install Python dependencies
COPY build/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY /src /src

# Set working directory
WORKDIR /src

# Lambda entry point, not used yet cos still in dev
# CMD ["src/userdbDriver.lambda_handler"]
