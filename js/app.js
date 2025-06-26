const STORAGE_KEY = 'mortgage_calculator_data';

function saveToLocalStorage() {
  const data = {
    salary: document.getElementById('salary').value,
    propertyPrice: document.getElementById('propertyPrice').value,
    loanTerm: document.getElementById('loanTerm').value,
    interestRate: document.getElementById('interestRate').value,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  showToast('تم حفظ البيانات تلقائياً');
}

function loadFromLocalStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    const data = JSON.parse(savedData);
    document.getElementById('salary').value = data.salary;
    document.getElementById('propertyPrice').value = data.propertyPrice;
    document.getElementById('loanTerm').value = data.loanTerm;
    document.getElementById('interestRate').value = data.interestRate;
    calculateMortgage();
  }
}

function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function formatNumber(num) {
  return new Intl.NumberFormat('en').format(num);
}
function formatCurrency(amount) {
  return formatNumber(Math.round(amount)) + ' ريال';
}
function formatPercentage(val) {
  return new Intl.NumberFormat('en', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(val);
}

function calculateMortgage() {
  const salary = parseFloat(document.getElementById('salary').value) || 0;
  const loanAmount = parseFloat(document.getElementById('propertyPrice').value) || 0;
  const loanTerm = parseFloat(document.getElementById('loanTerm').value) || 0;
  const interestRate = (parseFloat(document.getElementById('interestRate').value) || 0) / 100;

  const totalInterestAmount = Math.round(interestRate * loanTerm * loanAmount);
  const totalLoanAmount = loanAmount + totalInterestAmount;
  const monthlyPayment = totalLoanAmount / (loanTerm * 12);
  const dbr = monthlyPayment / salary;

  document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
  document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
  document.getElementById('totalInterest').textContent = formatCurrency(totalInterestAmount);
  document.getElementById('totalPayment').textContent = formatCurrency(totalLoanAmount);
  document.getElementById('numberOfPayments').textContent = formatNumber(loanTerm * 12) + ' قسط';
  document.getElementById('dbrPercentage').textContent = 'نسبة الاستقطاع: ' + formatPercentage(dbr);

  const dbrWarning = document.getElementById('dbrWarning');
  if (dbr > 0.65) dbrWarning.classList.remove('hidden');
  else dbrWarning.classList.add('hidden');
}

// Debounce helper
function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

const debouncedSave = debounce(saveToLocalStorage, 1000);

// Attach listeners
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    calculateMortgage();
    debouncedSave();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  calculateMortgage();
});