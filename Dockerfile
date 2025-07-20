FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/requirements.txt ./backend/

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm install
COPY frontend/ ./
RUN npm run build

# Install backend dependencies
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy the main app file
WORKDIR /app
COPY app.py ./

# Expose port
EXPOSE 5000

# Start the application
CMD ["python", "app.py"] 