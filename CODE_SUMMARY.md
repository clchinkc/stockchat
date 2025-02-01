# StockChat Code Summary

## Project Overview
StockChat is an AI-driven web application that provides real-time stock analysis and financial insights. The system combines natural language processing for query understanding with technical/fundamental analysis generation. Key features include interactive charts, AI-generated reports, and shareable analysis links.

## Architecture

### Frontend (React + TypeScript)
- Located in `/stockchat-frontend`
- Component-based architecture using Shadcn UI components
- State management with Zustand for theme preferences
- Charting with Recharts and react-chartjs-2
- Routing with React Router DOM
- Containerized using multi-stage Docker build with Nginx

### Backend (Python + FastAPI)
- Located in `/stockchat-backend`
- Modular architecture with service/repository pattern
- SQLAlchemy ORM for SQLite database operations
- DSPy pipelines for AI analysis generation
- yfinance integration for real stock data
- REST API endpoints with Jiter JSON parsing
- Integrated TA-Lib for professional-grade technical indicators

### AI Layer
- Multi-LLM support (OpenAI, DeepSeek, Gemini via DSPy)
- Structured output generation using Pydantic models
- Analysis teleprompter for few-shot learning
- Technical/fundamental factor extraction pipelines

## Key Components

### Frontend Components
- `App.tsx`: Main application orchestrator with page transitions
- `StockChart.tsx`: Interactive price chart with MA toggles
- `TradingSignal.tsx`: AI-generated buy/sell recommendations
- `MetricCard.tsx`: Financial metric visualization component
- `AnalysisText.tsx`: Formatted AI analysis output
- `ShareButton.tsx`: Analysis sharing functionality

### Backend Services
- `dspy_service.py`: LLM orchestration with fallback providers
- `stock_service.py`: yfinance data fetcher + metrics calculator
- `AnalysisRepository.py`: SQLite CRUD operations for analyses
- API Endpoints:
  - `POST /api/v1/stock`: Stock analysis generation
  - `GET /api/v1/stock/share/{id}`: Shared analysis retrieval

## Technical Stack
- **Frontend**: 
  - React 18, TypeScript 5.6, Vite 5.4
  - Recharts 2.13, react-chartjs-2 5.2
  - Shadcn UI, Framer Motion 11.12, Zustand 5.0
  - TailwindCSS 3.4 with Dark Mode support

- **Backend**:
  - FastAPI 0.111, Python 3.11, SQLAlchemy 2.0
  - DSPy 2.5, yfinance 0.2.51, pandas 2.2.3
  - Uvicorn 0.22, Pydantic 2.10, Logging
  - TA-Lib for technical analysis

- **AI**:
  - Multi-LLM fallback strategy
  - Structured output validation
  - Technical analysis pipelines

- **Infrastructure**:
  - Docker 20+ with multi-stage builds
  - Nginx reverse proxy with React Router support
  - SQLite 3.45 for analysis storage

## System Flow
1. User submits query → Frontend POSTs to `/api/v1/stock`
2. Backend uses DSPy to parse query → yfinance data fetch
3. StockService calculates metrics → DSPy generates analysis
4. Analysis stored in SQLite → UUID returned to frontend
5. Frontend displays interactive charts + AI insights
6. Shareable links persist analysis via UUID

## Development Setup
- Frontend: Vite dev server + ESLint/TypeScript
- Backend: Uvicorn hot-reload + SQLite migrations
- Docker-compose for full stack local development
- Environment variables for LLM API keys
