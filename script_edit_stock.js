window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById('stockId').value = urlParams.get('id');
    document.getElementById('name').value = decodeURIComponent(urlParams.get('name') || '');
    document.getElementById('initialQuantity').value = urlParams.get('initialQuantity') || '';
    document.getElementById('pricePerPiece').value = urlParams.get('pricePerPiece') || '';
    document.getElementById('addedDate').value = decodeURIComponent(urlParams.get('addedDate') || '');

    document.getElementById('editStockForm').onsubmit = function(e) {
        e.preventDefault();
        const stockItems = JSON.parse(localStorage.getItem('stockItems') || '[]');
        const itemIndex = stockItems.findIndex(item => item.id == document.getElementById('stockId').value);
        if (itemIndex !== -1) {
            stockItems[itemIndex] = {
                id: parseInt(document.getElementById('stockId').value),
                name: document.getElementById('name').value,
                initialQuantity: parseInt(document.getElementById('initialQuantity').value),
                pricePerPiece: parseFloat(document.getElementById('pricePerPiece').value),
                addedDate: document.getElementById('addedDate').value
            };
            localStorage.setItem('stockItems', JSON.stringify(stockItems));
            window.location.href = 'report.html';
        }
    };
};