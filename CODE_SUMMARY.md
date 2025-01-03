# StockChat Code Summary

## Project Overview
StockChat is a web application that combines chat functionality with stock market analysis capabilities. The project is structured with a frontend React application and a backend FastAPI service.

## Architecture

### Frontend (React + TypeScript)
- Located in `/stockchat-frontend`
- Built with React and TypeScript
- Main component: `App.tsx` handles the core application logic

### Backend (Python + FastAPI)
- Located in `/stockchat-backend`
- Built with FastAPI framework
- Includes DSPy integration for advanced analysis
- Provides REST API endpoints for the frontend

### Docker Support
- Containerized application setup
- Multi-container architecture using docker-compose
- Separate Dockerfiles for frontend and backend services

## Key Components

### Frontend Components
- Main application interface in `App.tsx`
- Handles user interactions and chat display
- Communicates with backend API

### Backend Services
- DSPy Service (`dspy_service.py`): Handles stock analysis and natural language processing
- FastAPI application (`main.py`): Provides REST API endpoints

## Development Setup
The project can be run either locally with separate frontend and backend servers, or using Docker Compose for a containerized environment. 