# Base image
FROM python:3.9-bullseye

# Set the working directory
WORKDIR /server

# Copy requirements.txt
COPY /server/requirements.txt ./

# Install dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application files
COPY . .

# Set the command to run when a container of this image is started
CMD ["python", "main.py"]
