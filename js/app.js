const STORAGE_KEY = 'mortgage_calculator_data';

function saveToLocalStorage() {
  const data = {
    salary: document.getElementById('salary').value,
    propertyPrice: document.getElementById('propertyPrice').value,
    downPayment: document.getElementById('downPayment').value,
    loanTerm: document.getElementById('loanTerm').value,
    interestRate: document.getElementById('interestRate').value,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    const data = JSON.parse(savedData);
    document.getElementById('salary').value = data.salary;
    document.getElementById('propertyPrice').value = data.propertyPrice;
    document.getElementById('downPayment').value = data.downPayment;
    document.getElementById('loanTerm').value = data.loanTerm;
    document.getElementById('interestRate').value = data.interestRate;
  }
  calculateMortgage();
}

function showElement(id) { document.getElementById(id).classList.remove('hidden'); }
function hideElement(id) { document.getElementById(id).classList.add('hidden'); }

// Formatting
function formatNumber(num) { return new Intl.NumberFormat('en').format(num); }
function formatCurrency(amount) { return formatNumber(Math.round(amount)) + ' ريال'; }
function formatPercentage(val) {
  return new Intl.NumberFormat('en',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1}).format(val);
}

function calculateMortgage() {
  const salary = parseFloat(document.getElementById('salary').value) || 0;
  const loanAmount = parseFloat(document.getElementById('propertyPrice').value) || 0;
  const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
  const loanTerm = parseFloat(document.getElementById('loanTerm').value) || 0;
  const interestRate = (parseFloat(document.getElementById('interestRate').value) || 0)/100;

  // Hide warnings
  hideElement('downPaymentWarning');
  hideElement('dbrWarning');

  // Validate down payment ≥10%
  if (downPayment < 0.1 * loanAmount) {
    showElement('downPaymentWarning');
    return;
  }

  const financedAmount = loanAmount - downPayment;
  // Admin fee: min(5750, 1% of principal)
  const adminFee = Math.min(5750, financedAmount * 0.01);
  const totalInterestAmount = Math.round(interestRate * loanTerm * financedAmount);
  const totalLoanAmount = financedAmount + totalInterestAmount;
  const monthlyPayment = totalLoanAmount / (loanTerm * 12);
  const totalCost = totalLoanAmount + adminFee;
  const dbr = monthlyPayment / salary;

  // Populate outputs
  document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
  document.getElementById('loanAmount').textContent = formatCurrency(financedAmount);
  document.getElementById('totalInterest').textContent = formatCurrency(totalInterestAmount);
  document.getElementById('totalPayment').textContent = formatCurrency(totalLoanAmount);
  document.getElementById('adminFee').textContent = formatCurrency(adminFee);
  document.getElementById('totalCost').textContent = formatCurrency(totalCost);
  document.getElementById('numberOfPayments').textContent = formatNumber(loanTerm*12) + ' قسط';
  document.getElementById('dbrPercentage').textContent = 'نسبة الاستقطاع: ' + formatPercentage(dbr);

  if (dbr > 0.65) showElement('dbrWarning');
}

// Debounce
function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
const debouncedSave = debounce(saveToLocalStorage, 1000);

// Init
window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  document.querySelectorAll('input').forEach(input =>
    input.addEventListener('input', () => {
      calculateMortgage();
      debouncedSave();
    })
  );
});