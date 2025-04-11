// Alpha Vantage API Key (Replace with yours)
const API_KEY = 'YOUR_API_KEY';

// DOM Elements
const ctx = document.getElementById('stockChart').getContext('2d');
let stockChart;

// Initialize Chart with Entry/Exit Lines
function initChart(labels, prices, stockSymbol, entryPrice, exitPrice) {
  if (stockChart) stockChart.destroy();

  const entryLine = {
    type: 'line',
    label: 'Entry Price',
    borderColor: '#27ae60',
    borderWidth: 2,
    borderDash: [5, 5],
    fill: false,
    data: Array(labels.length).fill(entryPrice),
    pointRadius: 0
  };

  const exitLine = {
    type: 'line',
    label: 'Exit Price',
    borderColor: '#e74c3c',
    borderWidth: 2,
    borderDash: [5, 5],
    fill: false,
    data: Array(labels.length).fill(exitPrice),
    pointRadius: 0
  };

  stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `${stockSymbol} Price`,
          data: prices,
          borderColor: '#3498db',
          borderWidth: 3,
          tension: 0.1
        },
        entryLine,
        exitLine
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `$${context.raw.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// Fetch Real Stock Data
async function fetchStockData(stockSymbol) {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error("Invalid stock symbol");
    }

    const timeSeries = data['Time Series (Daily)'];
    const dates = Object.keys(timeSeries).slice(0, 10).reverse();
    const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
    const latestPrice = prices[prices.length - 1];

    return { dates, prices, latestPrice };
  } catch (error) {
    console.error("API Error:", error);
    alert("Error: " + error.message);
    return null;
  }
}

// Calculate Profit/Loss
function calculatePL(currentPrice, entryPrice, exitPrice) {
  const pl = currentPrice - entryPrice;
  const plPercent = (pl / entryPrice) * 100;
  return {
    amount: pl,
    percent: plPercent,
    isProfit: pl >= 0
  };
}

// Update UI
async function updateChart() {
  const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
  const entryPrice = parseFloat(document.getElementById('entryPrice').value);
  const exitPrice = parseFloat(document.getElementById('exitPrice').value);

  if (!stockSymbol || isNaN(entryPrice) {
    alert("Please enter a valid stock symbol and entry price");
    return;
  }

  const stockData = await fetchStockData(stockSymbol);
  if (!stockData) return;

  // Update Chart
  initChart(
    stockData.dates.map(date => new Date(date).toLocaleDateString()),
    stockData.prices,
    stockSymbol,
    entryPrice,
    exitPrice || undefined
  );

  // Update Trade Info
  document.getElementById('stockName').textContent = `${stockSymbol}`;
  document.getElementById('currentPrice').textContent = `Current Price: $${stockData.latestPrice.toFixed(2)}`;

  if (!isNaN(entryPrice)) {
    const pl = calculatePL(stockData.latestPrice, entryPrice, exitPrice);
    const plElement = document.getElementById('plResult');
    plElement.innerHTML = `Profit/Loss: <span class="${pl.isProfit ? 'positive' : 'negative'}">$${pl.amount.toFixed(2)} (${pl.percent.toFixed(2)}%)</span>`;
  }
}

// Event Listeners
document.getElementById('updateBtn').addEventListener('click', updateChart);

// Initialize with default values
document.getElementById('entryPrice').value = '175.00';
document.getElementById('exitPrice').value = '180.00';
updateChart();
