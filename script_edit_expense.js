window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById('expenseId').value = urlParams.get('id');
    document.getElementById('date').value = decodeURIComponent(urlParams.get('date') || '');
    document.getElementById('description').value = decodeURIComponent(urlParams.get('description') || '');
    document.getElementById('amount').value = urlParams.get('amount') || '';
    document.getElementById('category').value = decodeURIComponent(urlParams.get('category') || '');

    document.getElementById('editExpenseForm').onsubmit = function(e) {
        e.preventDefault();
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const itemIndex = expenses.findIndex(exp => exp.id == document.getElementById('expenseId').value);
        if (itemIndex !== -1) {
            expenses[itemIndex] = {
                id: parseInt(document.getElementById('expenseId').value),
                date: document.getElementById('date').value,
                description: document.getElementById('description').value,
                amount: parseFloat(document.getElementById('amount').value),
                category: document.getElementById('category').value
            };
            localStorage.setItem('expenses', JSON.stringify(expenses));
            window.location.href = 'report.html';
        }
    };
};