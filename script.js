function calculateProfit() {
  const stockName = document.getElementById('stockName').value;
  const buyPrice = parseFloat(document.getElementById('buyPrice').value);
  const quantity = parseInt(document.getElementById('quantity').value);
  const sellPrice = parseFloat(document.getElementById('sellPrice').value);

  if (!stockName || isNaN(buyPrice) || isNaN(quantity) || isNaN(sellPrice)) {
    document.getElementById('result').textContent = "Please fill in all fields.";
    return;
  }

  const totalBuy = buyPrice * quantity;
  const totalSell = sellPrice * quantity;
  const profit = totalSell - totalBuy;

  let message = `Stock: ${stockName} | `;

  if (profit > 0) {
    message += `Profit: ₹${profit.toFixed(2)} ✅`;
  } else if (profit < 0) {
    message += `Loss: ₹${Math.abs(profit).toFixed(2)} ❌`;
  } else {
    message += "No Profit, No Loss 😐";
  }

  document.getElementById('result').textContent = message;
}
