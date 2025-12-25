/**
 * Script to fetch live economic data from BLS and FRED APIs
 * Run by GitHub Actions to update the live-data.json file
 */

const fs = require('fs');
const path = require('path');

// API Keys from environment variables (set by GitHub Secrets)
const BLS_API_KEY = process.env.BLS_API_KEY;
const FRED_API_KEY = process.env.FRED_API_KEY;

// BLS Series IDs
const BLS_SERIES = {
    unemployment_rate: 'LNS14000000',
    total_employment: 'CES0000000001',
    labor_force_participation: 'LNS11300000',
    average_hourly_earnings: 'CES0500000003',
    job_openings: 'JTS000000000000000JOL',
    quits_rate: 'JTS000000000000000QUR',
    hires_rate: 'JTS000000000000000HIR'
};

// FRED Series IDs
const FRED_SERIES = {
    real_gdp_growth: 'A191RL1Q225SBEA',
    productivity_growth: 'OPHNFB',
    unit_labor_costs: 'ULCNFB',
    employment_cost_index: 'ECIALLCIV',
    cpi_inflation: 'CPIAUCSL',
    real_median_income: 'MEHOINUSA672N',
    labor_share: 'LABSHPUSA156NRUG'
};

/**
 * Fetch data from BLS API
 */
async function fetchBLSData() {
    if (!BLS_API_KEY) {
        console.log('BLS_API_KEY not set, skipping BLS data fetch');
        return null;
    }

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2;

    const seriesIds = Object.values(BLS_SERIES);

    console.log(`Fetching BLS data for ${seriesIds.length} series...`);

    try {
        const response = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                seriesid: seriesIds,
                startyear: startYear.toString(),
                endyear: currentYear.toString(),
                registrationkey: BLS_API_KEY
            })
        });

        if (!response.ok) {
            throw new Error(`BLS API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status !== 'REQUEST_SUCCEEDED') {
            throw new Error(`BLS API request failed: ${data.message || 'Unknown error'}`);
        }

        console.log(`Successfully fetched ${data.Results.series.length} BLS series`);
        return data.Results.series;
    } catch (error) {
        console.error('Error fetching BLS data:', error.message);
        return null;
    }
}

/**
 * Fetch data from FRED API
 */
async function fetchFREDData() {
    if (!FRED_API_KEY) {
        console.log('FRED_API_KEY not set, skipping FRED data fetch');
        return null;
    }

    console.log(`Fetching FRED data for ${Object.keys(FRED_SERIES).length} series...`);

    const results = {};

    for (const [name, seriesId] of Object.entries(FRED_SERIES)) {
        try {
            const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=24`;

            const response = await fetch(url);

            if (!response.ok) {
                console.error(`FRED API error for ${seriesId}: ${response.status}`);
                continue;
            }

            const data = await response.json();

            if (data.observations && data.observations.length > 0) {
                results[name] = {
                    seriesId: seriesId,
                    data: data.observations.map(obs => ({
                        date: obs.date,
                        value: obs.value !== '.' ? parseFloat(obs.value) : null
                    })).filter(obs => obs.value !== null)
                };
            }
        } catch (error) {
            console.error(`Error fetching FRED series ${seriesId}:`, error.message);
        }
    }

    console.log(`Successfully fetched ${Object.keys(results).length} FRED series`);
    return results;
}

/**
 * Process BLS data into a structured format
 */
function processBLSData(blsData) {
    if (!blsData) return null;

    const processed = {};

    // Create reverse mapping
    const seriesNameMap = {};
    for (const [name, id] of Object.entries(BLS_SERIES)) {
        seriesNameMap[id] = name;
    }

    for (const series of blsData) {
        const name = seriesNameMap[series.seriesID];
        if (name && series.data && series.data.length > 0) {
            // Get the most recent value
            const latestData = series.data[0];
            let value = parseFloat(latestData.value);

            // Convert employment figures from thousands to actual numbers
            if (name === 'total_employment' || name === 'job_openings') {
                value = value * 1000;
            }

            processed[name] = {
                seriesId: series.seriesID,
                value: value,
                period: latestData.period,
                year: latestData.year,
                date: `${latestData.year}-${latestData.periodName}`,
                history: series.data.slice(0, 12).map(d => ({
                    period: d.period,
                    year: d.year,
                    value: parseFloat(d.value) * (name === 'total_employment' || name === 'job_openings' ? 1000 : 1)
                }))
            };
        }
    }

    return processed;
}

/**
 * Main function to fetch and save data
 */
async function main() {
    console.log('Starting economic data fetch...');
    console.log(`BLS API Key: ${BLS_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`FRED API Key: ${FRED_API_KEY ? 'Set' : 'Not set'}`);

    const timestamp = new Date().toISOString();

    // Fetch data from both sources
    const [blsRawData, fredData] = await Promise.all([
        fetchBLSData(),
        fetchFREDData()
    ]);

    // Process BLS data
    const blsData = processBLSData(blsRawData);

    // Build the live data object
    const liveData = {
        lastUpdated: timestamp,
        sources: {
            bls: blsData ? 'success' : 'failed',
            fred: fredData ? 'success' : 'failed'
        },
        bls: blsData || {},
        fred: fredData || {}
    };

    // Compute summary metrics for easy access
    if (blsData) {
        liveData.summary = {
            unemployment_rate: blsData.unemployment_rate?.value,
            total_employment: blsData.total_employment?.value,
            labor_force_participation: blsData.labor_force_participation?.value,
            average_hourly_earnings: blsData.average_hourly_earnings?.value,
            job_openings: blsData.job_openings?.value,
            data_date: blsData.unemployment_rate?.date
        };
    }

    // Add FRED summary data
    if (fredData) {
        liveData.summary = liveData.summary || {};
        if (fredData.real_gdp_growth?.data?.[0]) {
            liveData.summary.real_gdp_growth = fredData.real_gdp_growth.data[0].value;
        }
        if (fredData.productivity_growth?.data?.[0]) {
            liveData.summary.productivity_growth = fredData.productivity_growth.data[0].value;
        }
        if (fredData.cpi_inflation?.data?.[0]) {
            liveData.summary.cpi_inflation = fredData.cpi_inflation.data[0].value;
        }
    }

    // Write to file
    const outputPath = path.join(__dirname, '..', 'ai-labor-simulator', 'public', 'data', 'live-data.json');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(liveData, null, 2));

    console.log(`\nLive data saved to: ${outputPath}`);
    console.log(`Last updated: ${timestamp}`);

    if (liveData.summary) {
        console.log('\nSummary:');
        console.log(`  Unemployment Rate: ${liveData.summary.unemployment_rate}%`);
        console.log(`  Total Employment: ${(liveData.summary.total_employment / 1e6).toFixed(1)}M`);
        console.log(`  Data Date: ${liveData.summary.data_date}`);
    }
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
