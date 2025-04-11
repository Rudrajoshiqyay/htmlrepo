// Alpha Vantage API Key (Get a free one here: https://www.alphavantage.co/support/#api-key)
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual key

// DOM Elements
const ctx = document.getElementById('stockChart').getContext('2d');
let stockChart;

// Initialize Chart
function initChart(labels, data, stockSymbol) {
  if (stockChart) stockChart.destroy(); // Clear old chart
  
  stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${stockSymbol} Price (USD)`,
        data: data,
        borderColor: '#3498db',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `$${context.raw.toFixed(2)}`
          }
        }
      }
    }
  });
}

// Fetch Real Stock Data
async function fetchStockData(stockSymbol) {
  try {
    // Fetch daily time series
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error("Invalid stock symbol");
    }

    // Process data for chart (last 5 days)
    const timeSeries = data['Time Series (Daily)'];
    const dates = Object.keys(timeSeries).slice(0, 5).reverse();
    const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

    // Get latest price and change %
    const latestPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2];
    const changePercent = ((latestPrice - prevPrice) / prevPrice) * 100;

    return {
      dates,
      prices,
      latestPrice,
      changePercent
    };

  } catch (error) {
    console.error("API Error:", error);
    alert("Error fetching data. Check console or try another stock.");
    return null;
  }
}

// Update UI with Real Data
async function updateStockData(stockSymbol) {
  const stockData = await fetchStockData(stockSymbol);
  if (!stockData) return;

  // Update Chart
  initChart(
    stockData.dates.map(date => new Date(date).toLocaleDateString()),
    stockData.prices,
    stockSymbol
  );

  // Update Info
  document.getElementById('stockName').textContent = `${stockSymbol}`;
  document.getElementById('stockPrice').textContent = `Price: $${stockData.latestPrice.toFixed(2)}`;
  
  const changeElement = document.getElementById('stockChange');
  changeElement.innerHTML = `Change: <span class="${stockData.changePercent >= 0 ? 'positive' : 'negative'}">${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%</span>`;
}

// Event Listeners
document.getElementById('searchBtn').addEventListener('click', () => {
  const stockSymbol = document.getElementById('stockInput').value.trim().toUpperCase();
  if (stockSymbol) updateStockData(stockSymbol);
});

// Initialize with a default stock (e.g., AAPL)
updateStockData('AAPL');
