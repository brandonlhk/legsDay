### Proposed folder directory structure for Backend:
```
backend/  
│  
├── Dockerfile                   # Dockerfile for the MongoDB driver service  
├── docker-compose.yml           # Docker Compose to run MongoDB and any related configurations  
├── .env                         # environment variables  
└── other_config_files           # Any additional config files   
└── src/  
│   ├── userdbDriver.py              # Code to manage userDB operations  
│   └── exercisedbDriver.py          # Code to manage exerciseDB operations  
```

## Instructions for Setting Up Docker Environment

### Prerequisites
- **Install Docker for Windows**: Follow the instructions [here](https://docs.docker.com/desktop/install/windows-install/).
- **Optional**: Install the Docker plugin for Visual Studio Code for easier management.
- **Docker Tutorial**: Review a quick tutorial on Docker and Docker Compose [here](https://www.educative.io/blog/docker-compose-tutorial).

### Helpful Concepts
- Familiarity with Docker client, architecture, and Daemon is helpful but not required.
- Key concepts to understand:
  - Writing a `Dockerfile`
  - Using `docker-compose` and knowing when it is appropriate

## Quick Setup

1. Navigate to the MongoDriver build directory:
   ```bash
   cd backend/
2. Start the Docker services using Docker Compose:
    ```bash
    docker build . --tag "bfg-backend"
3. Access the MongoDriver container:
    ```bash
    docker run -it bfg-backend bash

# Notes
Notes
- For local development, we are using the Dockerfile.dev, which allows more flexibility for testing and experimentation.  
- The docker-compose.yml may need to be duplicated or amended during production, especially when setting up the AWS Lambda endpoint. The current setup focuses on local development.  
- The folder structure, docker-compose.yml, and Dockerfile can be referenced for building future backend containers and services.  