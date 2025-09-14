window.onload = function() {
    document.getElementById('expenseForm').onsubmit = function(e) {
        e.preventDefault();
        const expense = {
            id: Date.now(),
            date: document.getElementById('date').value,
            description: document.getElementById('description').value,
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value
        };
        let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        window.location.href = 'index.html';
    };
};