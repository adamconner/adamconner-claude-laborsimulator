# AI Labor Market Impact Simulator

An interactive tool to simulate and analyze the potential impact of AI on labor markets using real economic data from government sources.

<p align="center">
  <a href="https://adamconner.github.io/adamconner-claude-laborsimulator/ai-labor-simulator/" target="_blank">
    <img src="https://img.shields.io/badge/Launch%20Simulator-Click%20Here-blue?style=for-the-badge&logo=rocket" alt="Launch Simulator">
  </a>
  &nbsp;&nbsp;
  <a href="mailto:your-email@example.com">
    <img src="https://img.shields.io/badge/Contact%20Me-Email-green?style=for-the-badge&logo=gmail" alt="Contact Me">
  </a>
</p>

---

**[Launch the AI Labor Market Simulator](https://adamconner.github.io/adamconner-claude-laborsimulator/ai-labor-simulator/)**

---

## Features

### 1. Real Economic Data Integration
- **Bureau of Labor Statistics (BLS)**: Employment, unemployment, labor force participation
- **Federal Reserve Economic Data (FRED)**: GDP, productivity, wages, job openings
- Historical data for trend analysis

### 2. AI Impact Indicators
- Automation exposure by sector/occupation
- AI adoption rates
- Productivity-employment gap analysis
- Skills demand shifts
- Wage polarization metrics

### 3. Scenario Simulation
- Set target conditions (e.g., "10% unemployment in 5 years")
- Model different AI adoption curves
- Sector-by-sector impact analysis
- Geographic breakdown

### 4. Policy Interventions
- Universal Basic Income (UBI)
- Job retraining programs
- Education subsidies
- Reduced work weeks
- Robot taxes
- Wage subsidies

## Getting Started

### Quick Start (No Installation Required)
Simply open `index.html` in a modern web browser.

### With Local Server (Recommended)
```bash
# Using npm
npm start

# Or using Python
python -m http.server 8080
```

Then open http://localhost:8080 in your browser.

## Data Sources

| Source | Data | Update Frequency |
|--------|------|------------------|
| BLS | Employment, Unemployment, Labor Force | Monthly |
| FRED | GDP, Productivity, Wages | Varies |
| O*NET | Occupation automation risk | Annual |
| Census | Demographics, Education | Annual |

## Architecture

```
ai-labor-market-simulator/
├── index.html              # Main application
├── public/
│   └── styles.css          # Styling
├── src/
│   ├── data/
│   │   └── economic-data.js    # Data fetching & caching
│   ├── models/
│   │   └── indicators.js       # Economic indicators
│   ├── simulation/
│   │   ├── engine.js           # Core simulation
│   │   └── interventions.js    # Policy modeling
│   ├── components/
│   │   └── visualizations.js   # Charts & graphs
│   └── utils/
│       └── calculations.js     # Economic formulas
└── data/
    └── baseline-data.json      # Baseline economic snapshot
```

## Simulation Model

The simulator uses a modified Solow growth model enhanced with:
- AI capital accumulation
- Task-based labor demand (Acemoglu & Restrepo framework)
- Skill-biased technological change
- Labor market frictions

### Key Equations

**Employment Demand**: `L = f(Y, w, K_AI, τ)`
- Y: Output
- w: Wages
- K_AI: AI capital stock
- τ: Automation threshold

**Automation Exposure**: `A_i = Σ(task_j × automation_probability_j)`

## Usage Guide

### Setting Up a Simulation

1. **Current Snapshot**: Review baseline economic data
2. **Set Conditions**: Define target scenario (unemployment rate, timeframe)
3. **Adjust Inputs**: Modify AI adoption rate, sector exposure, etc.
4. **Add Interventions**: Apply policy measures
5. **Run Simulation**: Generate projections
6. **Analyze Results**: Review indicator breakdowns

### Example Scenarios

1. **Moderate Disruption**: 8% unemployment in 5 years, gradual AI adoption
2. **Rapid Automation**: 12% unemployment in 3 years, accelerated AI deployment
3. **Managed Transition**: 6% unemployment with UBI and retraining programs

## Live Data

The simulator automatically receives daily updates from BLS and FRED via GitHub Actions. No API keys required for users.

### For Repository Owners

To enable automatic data updates, add these secrets to your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `BLS_API_KEY` - Get free at https://www.bls.gov/developers/
   - `FRED_API_KEY` - Get free at https://fred.stlouisfed.org/docs/api/api_key.html

3. The GitHub Action runs daily at 6 AM UTC and updates `ai-labor-simulator/data/live-data.json`

4. You can also trigger it manually: **Actions** → **Update Economic Data** → **Run workflow**

### For Individual Users

Users can optionally add their own API keys in the Settings tab to fetch data on demand.

## Contributing

Contributions welcome! Areas of interest:
- Additional data sources
- Improved simulation models
- New intervention types
- Enhanced visualizations

## References

- Acemoglu, D., & Restrepo, P. (2019). Automation and New Tasks
- Frey, C. B., & Osborne, M. A. (2017). The Future of Employment
- Autor, D. H. (2015). Why Are There Still So Many Jobs?
- Brynjolfsson, E., & McAfee, A. (2014). The Second Machine Age

## License

MIT License
