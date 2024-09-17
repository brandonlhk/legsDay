# Use python 3.11.9 base image
FROM python:3.11.9

# Set non-interactive frontend for apt-get
ENV DEBIAN_FRONTEND=noninteractive

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip
RUN python -m pip install "pymongo[srv]"==3.11
RUN pip install pydantic[email]

# Copy requirements.txt and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY /src /src

# Set working directory
WORKDIR /src

# Expose port 5000 for the FastAPI app
EXPOSE 8080

CMD [ "uvicorn", "app:app", "--reload", "--host", "0.0.0.0", "--port", "8080" ]