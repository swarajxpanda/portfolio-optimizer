# portfolio-optimizer

A full-stack portfolio analytics and optimization platform built for analyzing live brokerage portfolios, portfolio risk, and allocation insights using Zerodha’s Kite Connect API.

## Features

- **Portfolio Overview**: Monitor holdings, invested capital, current portfolio value, and overall P&L in real time.
- **Diversification Analytics**: Analyze portfolio diversification, asset concentration, and allocation exposure across holdings.
- **Fragility Engine**: Identify portfolio concentration risks and exposure dependencies.
- **Exit Engine**: Generate rule-based exit insights and position monitoring workflows.
- **Real-Time Brokerage Integration**: Integrated with Zerodha’s Kite Connect API for live portfolio and holdings data.
- **Interactive Dashboard**: Responsive analytics dashboard built with React, Vite, and Tailwind CSS.

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- FastAPI
- Python
- Pandas
- NumPy
- SQLite

### APIs & Integrations
- Zerodha Kite Connect API

## Project Structure

- `backend/` — FastAPI backend handling analytics, portfolio processing, and API integrations.
- `frontend/` — React frontend for portfolio visualization and dashboard analytics.

## Setup and Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

   On Windows:
   ```bash
   .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:
   ```env
   KITE_API_KEY=your_api_key
   KITE_API_SECRET=your_api_secret
   REDIRECT_URL=your_redirect_url
   ```

5. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Future Improvements

- Strategy backtesting modules
- Risk-adjusted performance metrics
- Automated alert systems
- Portfolio optimization models
- Machine learning based analytics