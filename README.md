# portfolio-optimizer

## Intro
portfolio-optimizer is a full-stack portfolio analytics system for analyzing live brokerage holdings, measuring concentration risk, and generating rule-based exit and fragility insights from Zerodha Kite Connect data.

It uses the finance formulas and methods we actually built into the project:

- `portfolio value = last_price * quantity`
- `invested capital = average_price * quantity`
- `P&L = current value - invested capital`
- `return % = P&L / invested capital * 100`
- `portfolio weight % = holding value / total portfolio value * 100`
- `Herfindahl Index (HHI) = sum(weight_i^2)` for concentration and diversification analysis
- `volatility-threshold exit logic` for rule-based position monitoring
- `Ledoit-Wolf shrinkage covariance` for more stable correlation and fragility analysis

This project helps turn raw brokerage data into a structured decision-making workflow for portfolio review, concentration control, diversification analysis, and exit planning.

## Tech Stack

- Backend: FastAPI, Python, Pandas, NumPy, SciPy, scikit-learn
- Frontend: React, Vite, Axios
- Broker integration: Zerodha Kite Connect API

## How to Run

### Backend

1. Go to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
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

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Go to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend:
   ```bash
   npm run dev
   ```
