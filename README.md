# AI Labor Market Impact Simulator

An interactive tool to simulate and analyze the potential impact of AI on labor markets using real economic data from government sources. Explore different scenarios, apply policy interventions, and visualize the outcomes with AI-powered analysis.

<p align="center">
  <a href="https://adamconner.github.io/adamconner-claude-laborsimulator/" target="_blank">
    <img src="https://img.shields.io/badge/Launch%20Simulator-Click%20Here-blue?style=for-the-badge&logo=rocket" alt="Launch Simulator">
  </a>
  &nbsp;&nbsp;
  <a href="mailto:your-email@example.com">
    <img src="https://img.shields.io/badge/Contact%20Me-Email-green?style=for-the-badge&logo=gmail" alt="Contact Me">
  </a>
</p>

---

## What is This?

The AI Labor Market Impact Simulator is a web-based tool that helps you understand how artificial intelligence might affect employment across different sectors of the economy. Using real economic data and established economic models, you can:

- **Explore current economic conditions** with live data from BLS and FRED
- **Run "what-if" simulations** to see how different AI adoption rates could impact jobs
- **Test policy interventions** like UBI, job retraining, or robot taxes
- **Compare multiple scenarios** side-by-side
- **Get AI-powered analysis** of your simulation results
- **Share your simulations** publicly with a unique URL

---

## Features

### Real Economic Data Integration
- **Bureau of Labor Statistics (BLS)**: Employment, unemployment, labor force participation
- **Federal Reserve Economic Data (FRED)**: GDP, productivity, wages, job openings
- Automatic daily updates via GitHub Actions
- Historical data for trend analysis

### AI Impact Indicators
- Automation exposure by sector and occupation
- AI adoption rates across industries
- Productivity-employment gap analysis
- Skills demand shifts tracking
- Wage polarization metrics

### Scenario Simulation
- Set target conditions (e.g., "10% unemployment in 5 years")
- Choose AI adoption curves (linear, exponential, S-curve, step)
- Sector-by-sector impact analysis
- Geographic breakdown options

### Policy Interventions
Test the effects of various policy responses:
- **Universal Basic Income (UBI)** - Direct payments to citizens
- **Job Retraining Programs** - Government-funded skill development
- **Education Subsidies** - Support for higher education
- **Reduced Work Weeks** - Shorter standard work weeks
- **Robot Taxes** - Taxation on automation
- **Wage Subsidies** - Support for low-wage workers

### AI-Powered Analysis
- Automatic narrative summaries of simulation results
- Key insights and policy implications
- Risk assessments and recommendations
- Powered by Google Gemini (free for all users)

### Scenario Comparison
- Compare up to 3 different scenarios side-by-side
- Visual charts showing outcome differences
- Ranking by key metrics (employment, GDP, wages)

### Share & Export
- **Public Sharing**: Save simulations with a unique URL to share with others
- **PDF Export**: Download professional reports of your results
- **Data Export**: Export raw data in JSON or CSV format

### Mobile Responsive
- Full functionality on tablets and phones
- Touch-optimized controls
- Collapsible sidebar navigation

---

## Getting Started

### Quick Start (No Installation Required)
1. Click the **Launch Simulator** button above
2. Review the current economic snapshot
3. Adjust simulation parameters in the sidebar
4. Click **Run Simulation**
5. Explore results and generate AI analysis

### Running Locally
```bash
# Clone the repository
git clone https://github.com/adamconner/adamconner-claude-laborsimulator.git

# Navigate to the simulator
cd adamconner-claude-laborsimulator/ai-labor-simulator

# Start a local server (choose one)
npm start
# or
python -m http.server 8080

# Open in browser
open http://localhost:8080
```

---

## How It Works

### The Simulation Model

The simulator uses a modified **Solow growth model** enhanced with:
- **AI capital accumulation** - Tracking investment in AI systems
- **Task-based labor demand** (Acemoglu & Restrepo framework) - Jobs broken into automatable tasks
- **Skill-biased technological change** - Different impacts by education level
- **Labor market frictions** - Realistic transition delays

### Key Equations

**Employment Demand**: `L = f(Y, w, K_AI, τ)`
- Y: Economic output
- w: Wage levels
- K_AI: AI capital stock
- τ: Automation threshold

**Automation Exposure**: `A_i = Σ(task_j × automation_probability_j)`

### Data Sources

| Source | Data | Update Frequency |
|--------|------|------------------|
| BLS | Employment, Unemployment, Labor Force | Monthly |
| FRED | GDP, Productivity, Wages | Varies |
| O*NET | Occupation automation risk | Annual |
| Census | Demographics, Education | Annual |

---

## Example Scenarios

### 1. Moderate Disruption
- 8% unemployment in 5 years
- Gradual AI adoption (linear curve)
- No policy interventions
- *Result: Slow but steady job displacement*

### 2. Rapid Automation
- 12% unemployment in 3 years
- Accelerated AI deployment (exponential curve)
- High productivity gains
- *Result: Sharp economic disruption*

### 3. Managed Transition
- 6% unemployment target
- S-curve adoption with plateau
- UBI + job retraining programs active
- *Result: Smoother transition with safety nets*

---

## FAQ

### General Questions

**Q: Is this simulator free to use?**
A: Yes, completely free. The AI analysis feature is also free (rate-limited to prevent abuse).

**Q: Where does the data come from?**
A: Real economic data from the Bureau of Labor Statistics (BLS) and Federal Reserve Economic Data (FRED). Data is updated daily via GitHub Actions.

**Q: How accurate are the predictions?**
A: This is a modeling tool, not a crystal ball. The simulations are based on established economic theories and real data, but actual outcomes depend on countless unpredictable factors. Use it to explore possibilities, not as definitive forecasts.

**Q: Can I use this for academic research?**
A: Yes! Please cite appropriately. The underlying models are based on peer-reviewed research (see References section).

### Technical Questions

**Q: Do I need to create an account?**
A: No account required. Your simulation settings are saved in your browser's local storage.

**Q: How do I share my simulation?**
A: After running a simulation, click "Share Publicly" to get a unique URL. Anyone with that link can view your exact scenario and results.

**Q: Can I add my own API keys?**
A: Yes, in the Settings tab you can add your own BLS, FRED, or Gemini API keys for unlimited access and on-demand data fetching.

**Q: Does it work on mobile?**
A: Yes, the simulator is fully responsive and works on phones and tablets.

### Simulation Questions

**Q: What do the different adoption curves mean?**
A:
- **Linear**: Steady, constant rate of AI adoption
- **Exponential**: Slow start, then rapid acceleration
- **S-Curve**: Slow start, rapid middle, then plateau
- **Step**: Sudden jumps in adoption (representing breakthrough moments)

**Q: How do interventions work?**
A: Each intervention has parameters you can adjust (e.g., UBI amount, retraining budget). They modify the simulation outcomes based on economic research about their effects.

**Q: What sectors are most affected?**
A: Manufacturing, Transportation, and Administrative roles typically show highest automation exposure. Professional services and Healthcare show lower exposure but aren't immune.

---

## Architecture

```
ai-labor-simulator/
├── index.html              # Main application
├── public/
│   └── styles.css          # Styling (responsive)
├── src/
│   ├── app.js              # Main application logic
│   ├── data/
│   │   └── economic-data.js    # Data fetching & caching
│   ├── models/
│   │   └── indicators.js       # Economic indicators
│   ├── simulation/
│   │   ├── engine.js           # Core simulation
│   │   └── interventions.js    # Policy modeling
│   ├── services/
│   │   ├── ai-summary.js       # AI analysis service
│   │   └── simulation-sharing.js # Public sharing
│   ├── features/
│   │   ├── scenario-comparison.js
│   │   └── pdf-export.js
│   └── components/
│       └── visualizations.js   # Charts & graphs
├── workers/
│   └── gemini-proxy.js     # Cloudflare Worker (API proxy)
└── data/
    ├── baseline-data.json  # Baseline economic snapshot
    └── live-data.json      # Auto-updated live data
```

---

## For Developers

### Setting Up Live Data Updates

To enable automatic data updates for your fork:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `BLS_API_KEY` - Get free at https://www.bls.gov/developers/
   - `FRED_API_KEY` - Get free at https://fred.stlouisfed.org/docs/api/api_key.html

3. The GitHub Action runs daily at 6 AM UTC

### Setting Up the Cloudflare Worker (for public AI/sharing)

If you want to host your own instance with public AI analysis:

1. Create a Cloudflare account
2. Create a Worker with the code from `workers/gemini-proxy.js`
3. Add environment variables:
   - `GEMINI_API_KEY` (secret)
   - `ALLOWED_ORIGIN` (your domain)
   - `DAILY_LIMIT` (e.g., 1000)
   - `SIM_DAILY_LIMIT` (e.g., 100)
4. Create KV namespaces: `RATE_LIMIT_KV` and `SIMULATIONS_KV`
5. Bind them to your worker

---

## Contributing

Contributions welcome! Areas of interest:
- Additional data sources (international labor markets)
- Improved simulation models
- New intervention types
- Enhanced visualizations
- Accessibility improvements

---

## References

- Acemoglu, D., & Restrepo, P. (2019). *Automation and New Tasks: How Technology Displaces and Reinstates Labor*
- Frey, C. B., & Osborne, M. A. (2017). *The Future of Employment: How Susceptible Are Jobs to Computerisation?*
- Autor, D. H. (2015). *Why Are There Still So Many Jobs? The History and Future of Workplace Automation*
- Brynjolfsson, E., & McAfee, A. (2014). *The Second Machine Age*

---

## License

MIT License - Feel free to use, modify, and distribute.
