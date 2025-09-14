window.onload = function() {
    const stockItems = JSON.parse(localStorage.getItem('stockItems') || '[]');
    const stockSelect = document.getElementById('stockId');
    stockItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        stockSelect.appendChild(option);
    });

    document.getElementById('transactionForm').onsubmit = function(e) {
        e.preventDefault();
        const transaction = {
            stockId: parseInt(document.getElementById('stockId').value),
            date: document.getElementById('date').value,
            type: document.getElementById('type').value,
            quantity: parseInt(document.getElementById('quantity').value)
        };
        let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        window.location.href = 'index.html';
    };
};