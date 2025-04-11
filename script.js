// Mock stock data (replace with real API later)
const mockStockData = {
  "AAPL": {
    name: "Apple Inc.",
    price: 175.00,
    change: 1.5,
    history: [170, 172, 171, 173, 175]
  },
  "GOOGL": {
    name: "Alphabet Inc.",
    price: 135.50,
    change: -0.8,
    history: [136, 135, 134, 135, 135.5]
  },
  "TSLA": {
    name: "Tesla Inc.",
    price: 700.00,
    change: 3.2,
    history: [690, 695, 698, 702, 700]
  }
};

// Initialize chart
const ctx = document.getElementById('stockChart').getContext('2d');
let stockChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets: [{
      label: 'Stock Price',
      data: mockStockData.AAPL.history,
      borderColor: '#3498db',
      tension: 0.1
    }]
  }
});

// Update chart and info
function updateStockData(stockSymbol) {
  const stock = mockStockData[stockSymbol];
  if (!stock) {
    alert("Stock not found!");
    return;
  }

  // Update chart
  stockChart.data.datasets[0].data = stock.history;
  stockChart.data.datasets[0].label = `${stockSymbol} Price`;
  stockChart.update();

  // Update info
  document.getElementById('stockName').textContent = `${stock.name} (${stockSymbol})`;
  document.getElementById('stockPrice').textContent = `Price: $${stock.price.toFixed(2)}`;
  
  const changeElement = document.getElementById('stockChange');
  changeElement.innerHTML = `Change: <span class="${stock.change >= 0 ? 'positive' : 'negative'}">${stock.change >= 0 ? '+' : ''}${stock.change}%</span>`;
}

// Search button event
document.getElementById('searchBtn').addEventListener('click', () => {
  const stockSymbol = document.getElementById('stockInput').value.trim().toUpperCase();
  updateStockData(stockSymbol);
});

// Initialize with AAPL
updateStockData('AAPL');
