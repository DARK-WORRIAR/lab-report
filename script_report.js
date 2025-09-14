function initializeStockItems() {
    const stockItems = JSON.parse(localStorage.getItem('stockItems') || '[]');
    if (stockItems.length === 0) {
        const defaultItems = [
            { id: Date.now() - 2, name: 'Test Tubes', initialQuantity: 100, pricePerPiece: 2.50, addedDate: '2025-09-01' },
            { id: Date.now() - 1, name: 'Chemicals', initialQuantity: 50, pricePerPiece: 10.00, addedDate: '2025-09-02' },
            { id: Date.now(), name: 'Pipettes', initialQuantity: 200, pricePerPiece: 1.20, addedDate: '2025-09-03' }
        ];
        localStorage.setItem('stockItems', JSON.stringify(defaultItems));
    }
}

function getMonthYear(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

function getDateStr(dateStr) {
    return new Date(dateStr).toISOString().split('T')[0];
}

function deleteExpense(expenseId) {
    let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses = expenses.filter(exp => exp.id !== expenseId);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    generateReports();
}

function editExpense(expenseId) {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const expense = expenses.find(exp => exp.id === expenseId);
    if (expense) {
        window.location.href = `edit_expense.html?id=${expenseId}&date=${encodeURIComponent(expense.date)}&description=${encodeURIComponent(expense.description)}&amount=${expense.amount}&category=${encodeURIComponent(expense.category)}`;
    }
}

function deleteStockItem(itemId) {
    let stockItems = JSON.parse(localStorage.getItem('stockItems') || '[]');
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    stockItems = stockItems.filter(item => item.id !== itemId);
    transactions = transactions.filter(txn => txn.stockId !== itemId);
    localStorage.setItem('stockItems', JSON.stringify(stockItems));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    generateReports();
}

function editStockItem(itemId) {
    const stockItems = JSON.parse(localStorage.getItem('stockItems') || '[]');
    const item = stockItems.find(item => item.id === itemId);
    if (item) {
        window.location.href = `edit_stock.html?id=${itemId}&name=${encodeURIComponent(item.name)}&initialQuantity=${item.initialQuantity}&pricePerPiece=${item.pricePerPiece}&addedDate=${encodeURIComponent(item.addedDate)}`;
    }
}

function generateReports() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const stockItems = JSON.parse(localStorage.getItem('stockItems') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    // Expenses Report
    const expenseTableBody = document.querySelector('#expenseTable');
    expenseTableBody.innerHTML = '';
    const filteredExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        const inDateRange = (!start || expDate >= start) && (!end || expDate <= end);
        const inCategory = !categoryFilter || exp.category === categoryFilter;
        return inDateRange && inCategory;
    });
    filteredExpenses.forEach(exp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exp.date}</td>
            <td>${exp.description}</td>
            <td>Rs${exp.amount.toFixed(2)}</td>
            <td>${exp.category}</td>
            <td>
                <span class="edit-btn" onclick="editExpense(${exp.id})">Edit</span>
                <span class="delete-btn" onclick="deleteExpense(${exp.id})">Delete</span>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });

    // Calculate and display total expenses
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('totalExpenses').textContent = `Rs${totalExpenses.toFixed(2)}`;

    // Stock Summary Report
    const stockReport = {};
    stockItems.forEach(item => {
        if (!item || typeof item !== 'object') return;
        stockReport[item.id] = {
            name: item.name || 'Unknown',
            addedDate: item.addedDate || 'N/A',
            months: {},
            initial: item.initialQuantity || 0,
            pricePerPiece: item.pricePerPiece || 0
        };
    });

    transactions.forEach(txn => {
        if (!stockReport[txn.stockId]) return;
        const month = getMonthYear(txn.date);
        if (!stockReport[txn.stockId].months[month]) {
            stockReport[txn.stockId].months[month] = { newIn: 0, usedOut: 0 };
        }
        if (txn.type === 'in') {
            stockReport[txn.stockId].months[month].newIn += txn.quantity || 0;
        } else {
            stockReport[txn.stockId].months[month].usedOut += txn.quantity || 0;
        }
    });

    const stockTableBody = document.querySelector('#stockTable');
    stockTableBody.innerHTML = '';
    stockItems
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .forEach(item => {
            if (!item || typeof item !== 'object') return;
            const totalNewIn = Object.values(stockReport[item.id]?.months || {}).reduce((sum, data) => sum + (data.newIn || 0), 0);
            const totalUsedOut = Object.values(stockReport[item.id]?.months || {}).reduce((sum, data) => sum + (data.usedOut || 0), 0);
            const available = (item.initialQuantity || 0) + totalNewIn - totalUsedOut;
            const pricePerPiece = item.pricePerPiece || 0;
            const totalValue = available * pricePerPiece;

            for (const [month, data] of Object.entries(stockReport[item.id]?.months || {})) {
                const monthAvailable = (item.initialQuantity || 0) + (data.newIn || 0) - (data.usedOut || 0);
                const monthTotalValue = monthAvailable * pricePerPiece;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name || 'Unknown'}</td>
                    <td>${item.addedDate || 'N/A'}</td>
                    <td>${month}</td>
                    <td>${data.newIn || 0}</td>
                    <td>${data.usedOut || 0}</td>
                    <td>${monthAvailable}</td>
                    <td>Rs${pricePerPiece.toFixed(2)}</td>
                    <td>Rs${monthTotalValue.toFixed(2)}</td>
                    <td>
                        <span class="edit-btn" onclick="editStockItem(${item.id})">Edit</span>
                        <span class="delete-btn" onclick="deleteStockItem(${item.id})">Delete</span>
                    </td>
                `;
                stockTableBody.appendChild(row);
            }
            if (Object.keys(stockReport[item.id]?.months || {}).length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name || 'Unknown'}</td>
                    <td>${item.addedDate || 'N/A'}</td>
                    <td>N/A</td>
                    <td>0</td>
                    <td>0</td>
                    <td>${available}</td>
                    <td>Rs${pricePerPiece.toFixed(2)}</td>
                    <td>Rs${totalValue.toFixed(2)}</td>
                    <td>
                        <span class="edit-btn" onclick="editStockItem(${item.id})">Edit</span>
                        <span class="delete-btn" onclick="deleteStockItem(${item.id})">Delete</span>
                    </td>
                `;
                stockTableBody.appendChild(row);
            }
        });

    // Daily Stock Transactions
    const dailyStockTableBody = document.querySelector('#dailyStockTable');
    dailyStockTableBody.innerHTML = '';
    transactions
        .filter(txn => {
            const txnDate = new Date(txn.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            return (!start || txnDate >= start) && (!end || txnDate <= end);
        })
        .forEach(txn => {
            const stock = stockItems.find(item => item.id === txn.stockId);
            if (stock) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${stock.name || 'Unknown'}</td>
                    <td>${txn.date || 'N/A'}</td>
                    <td>${txn.type === 'in' ? 'Incoming' : 'Used'}</td>
                    <td>${txn.quantity || 0}</td>
                `;
                dailyStockTableBody.appendChild(row);
            }
        });
}

window.onload = function() {
    initializeStockItems();
    document.getElementById('filterDates').addEventListener('click', generateReports);
    document.getElementById('categoryFilter').addEventListener('change', generateReports);
    generateReports();
};