window.onload = function() {
    document.getElementById('stockForm').onsubmit = function(e) {
        e.preventDefault();
        const stock = {
            id: Date.now(),
            name: document.getElementById('name').value,
            initialQuantity: parseInt(document.getElementById('initialQuantity').value),
            pricePerPiece: parseFloat(document.getElementById('pricePerPiece').value),
            addedDate: document.getElementById('addedDate').value
        };
        let stockItems = JSON.parse(localStorage.getItem('stockItems') || '[]');
        stockItems.push(stock);
        localStorage.setItem('stockItems', JSON.stringify(stockItems));
        window.location.href = 'index.html';
    };
};