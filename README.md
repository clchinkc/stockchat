# StockChat

StockChat is a web application that combines real-time chat functionality with stock market analysis capabilities. The application is built using React for the frontend and FastAPI for the backend, with integrated DSPy for advanced stock analysis.

## Project Structure

- `/stockchat-frontend` - React + TypeScript frontend application
- `/stockchat-backend` - FastAPI + Python backend service

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd stockchat-backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # For Unix/MacOS
   # or
   .\venv\Scripts\activate  # For Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd stockchat-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Docker Deployment

For containerized deployment, use Docker Compose:

```bash
   docker-compose up --build
   ```


## Features

- Real-time chat functionality
- Stock market analysis integration
- Natural language processing capabilities via DSPy
- REST API endpoints for data communication

## Technical Stack

- Frontend:
  - React
  - TypeScript
  - TailwindCSS
  - Vite

- Backend:
  - Python
  - FastAPI
  - DSPy for analysis

- Deployment:
  - Docker
  - Docker Compose

## Development

The application can be run either in a local development environment (separate frontend and backend servers) or using Docker Compose for a containerized setup.
