// Alpha Vantage API (Replace with your key)
const API_KEY = 'YOUR_API_KEY';
const STOCK_SYMBOL = 'RELIANCE.BSE'; // BSE symbol for Reliance

// Chart and Data
let stockChart;
let ohlcData = [];

// Initialize Chart
function initChart() {
  const ctx = document.getElementById('stockChart').getContext('2d');
  
  if (stockChart) stockChart.destroy();

  // Entry/Exit lines
  const entryPrice = parseFloat(document.getElementById('entryPrice').value);
  const exitPrice = parseFloat(document.getElementById('exitPrice').value);

  stockChart = new Chart(ctx, {
    type: 'candlestick',
    data: {
      datasets: [{
        label: 'RELIANCE',
        data: ohlcData,
        color: {
          up: '#27ae60', // Green for bullish
          down: '#e74c3c', // Red for bearish
          unchanged: '#7f8c8d',
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        annotation: {
          annotations: {
            entryLine: {
              type: 'line',
              yMin: entryPrice,
              yMax: entryPrice,
              borderColor: '#3498db',
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                content: 'Entry: ₹' + entryPrice,
                enabled: true,
                position: 'left'
              }
            },
            exitLine: {
              type: 'line',
              yMin: exitPrice,
              yMax: exitPrice,
              borderColor: '#9b59b6',
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                content: 'Exit: ₹' + exitPrice,
                enabled: true,
                position: 'left'
              }
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const item = ctx.raw;
              return [
                `Open: ₹${item.o}`,
                `High: ₹${item.h}`,
                `Low: ₹${item.l}`,
                `Close: ₹${item.c}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          }
        },
        y: {
          ticks: {
            callback: (value) => '₹' + value
          }
        }
      }
    }
  });

  detectPatterns();
}

// Fetch Reliance OHLC Data
async function fetchData() {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${STOCK_SYMBOL}&apikey=${API_KEY}&outputsize=compact`
    );
    const data = await response.json();

    const timeSeries = data['Time Series (Daily)'];
    ohlcData = Object.entries(timeSeries).map(([date, values]) => ({
      x: new Date(date),
      o: parseFloat(values['1. open']),
      h: parseFloat(values['2. high']),
      l: parseFloat(values['3. low']),
      c: parseFloat(values['4. close'])
    })).slice(0, 30).reverse(); // Last 30 days

    initChart();
  } catch (error) {
    console.error("API Error:", error);
    document.getElementById('patterns').textContent = "Failed to load data. Check console.";
  }
}

// Detect Candlestick Patterns
function detectPatterns() {
  const patterns = [];
  const lastCandle = ohlcData[ohlcData.length - 1];
  
  // Detect Inverted Hammer (Single candle pattern)
  const isInvertedHammer = 
    (lastCandle.h - lastCandle.l) > 3 * (lastCandle.c - lastCandle.o) && 
    lastCandle.c > lastCandle.o;
  
  if (isInvertedHammer) {
    patterns.push("🔨 Inverted Hammer (Bullish Reversal)");
  }

  // Add more pattern detections here...

  document.getElementById('patterns').innerHTML = 
    patterns.length > 0 ? patterns.join('<br>') : "No strong patterns detected";
}

// Event Listeners
document.getElementById('updateBtn').addEventListener('click', initChart);

// Initialize
fetchData();
