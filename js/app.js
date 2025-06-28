// Tab switching
const mortgageTabBtn = document.getElementById('mortgageTabBtn');
const personalTabBtn = document.getElementById('personalTabBtn');
const comboTabBtn    = document.getElementById('comboTabBtn');
const mortgageTab    = document.getElementById('mortgageTab');
const personalTab    = document.getElementById('personalTab');
const comboTab       = document.getElementById('comboTab');

mortgageTabBtn.addEventListener('click', () => {
  mortgageTab.classList.remove('hidden');
  personalTab.classList.add('hidden');
  comboTab.classList.add('hidden');
});
personalTabBtn.addEventListener('click', () => {
  personalTab.classList.remove('hidden');
  mortgageTab.classList.add('hidden');
  comboTab.classList.add('hidden');
});
comboTabBtn.addEventListener('click', () => {
  comboTab.classList.remove('hidden');
  mortgageTab.classList.add('hidden');
  personalTab.classList.add('hidden');
});

// Show/hide helpers
function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}
function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

// Sync salary fields & hide results on change
document.querySelectorAll('.salary-input').forEach(input => {
  input.addEventListener('input', () => {
    document.querySelectorAll('.salary-input').forEach(el => {
      if (el !== input) el.value = input.value;
    });
    ['mortgageResults','personalResults','comboResults'].forEach(hideElement);
  });
});
// Also hide results for any other input/select change
document.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('input', () => {
    ['mortgageResults','personalResults','comboResults'].forEach(hideElement);
  });
});

// Persistence
const STORAGE_KEY = 'mortgage_calculator_data';
function saveToLocalStorage() {
  const data = {
    salary: document.getElementById('salary').value,
    propertyPrice: document.getElementById('propertyPrice').value,
    downPayment: document.getElementById('downPayment').value,
    loanTerm: document.getElementById('loanTerm').value,
    interestRate: document.getElementById('interestRate').value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function loadFromLocalStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const d = JSON.parse(saved);
    document.getElementById('salary').value = d.salary;
    document.getElementById('propertyPrice').value = d.propertyPrice;
    document.getElementById('downPayment').value = d.downPayment;
    document.getElementById('loanTerm').value = d.loanTerm;
    document.getElementById('interestRate').value = d.interestRate;
  }
}

// Formatters
function formatNumber(n) { return new Intl.NumberFormat('en').format(n); }
function formatCurrency(a) { return formatNumber(Math.round(a)) + ' ريال'; }
function formatPercentage(v) {
  return new Intl.NumberFormat('en', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(v);
}

// MORTGAGE CALCULATION
function calculateMortgage() {
  hideElement('downPaymentWarning');
  hideElement('dbrWarning');

  const salary      = parseFloat(document.getElementById('salary').value) || 0;
  const loanAmount  = parseFloat(document.getElementById('propertyPrice').value) || 0;
  const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
  const term        = parseFloat(document.getElementById('loanTerm').value) || 0;
  const rate        = (parseFloat(document.getElementById('interestRate').value) || 0) / 100;

  // errors
  if (downPayment < 0.1 * loanAmount) {
    showElement('downPaymentWarning');
    return;
  }

  const financed      = loanAmount - downPayment;
  const adminFee      = Math.min(financed * 0.0115, 5750);
  const totalInterest = Math.round(rate * term * financed);
  const totalLoan     = financed + totalInterest;
  const monthly       = totalLoan / (term * 12);
  const totalCost     = totalLoan + adminFee;
  const dbr           = monthly / salary;

  // populate
  document.getElementById('monthlyPayment').textContent   = formatCurrency(monthly);
  document.getElementById('loanAmount').textContent       = formatCurrency(financed);
  document.getElementById('totalInterest').textContent    = formatCurrency(totalInterest);
  document.getElementById('totalPayment').textContent     = formatCurrency(totalLoan);
  document.getElementById('adminFee').textContent         = formatCurrency(adminFee);
  document.getElementById('totalCost').textContent        = formatCurrency(totalCost);
  document.getElementById('numberOfPayments').textContent = formatNumber(term * 12) + ' قسط';
  document.getElementById('dbrPercentage').textContent    = 'نسبة الاستقطاع: ' + formatPercentage(dbr);

  if (dbr > 0.65) {
    showElement('dbrWarning');
  }
}

// PERSONAL CALCULATION
function calculatePersonal() {
  hideElement('p_dbrWarning');

  const salary    = parseFloat(document.getElementById('p_salary').value) || 0;
  const principal = parseFloat(document.getElementById('p_propertyPrice').value) || 0;
  const term      = parseFloat(document.getElementById('p_loanTerm').value) || 0;
  const rate      = (parseFloat(document.getElementById('p_interestRate').value) || 0) / 100;

  const adminFee   = Math.min(principal * 0.0115, 5750);
  const totalInt   = Math.round(rate * term * principal);
  const totalLoan  = principal + totalInt;
  const totalCost  = totalLoan + adminFee;
  const monthly    = totalLoan / (term * 12);
  const dbr        = monthly / salary;

  document.getElementById('p_monthlyPayment').textContent   = formatCurrency(monthly);
  document.getElementById('p_loanAmount').textContent       = formatCurrency(principal);
  document.getElementById('p_totalInterest').textContent    = formatCurrency(totalInt);
  document.getElementById('p_totalPayment').textContent     = formatCurrency(totalLoan);
  document.getElementById('p_adminFee').textContent         = formatCurrency(adminFee);
  document.getElementById('p_totalCost').textContent        = formatCurrency(totalCost);
  document.getElementById('p_numberOfPayments').textContent = formatNumber(term * 12) + ' قسط';
  document.getElementById('p_dbrPercentage').textContent    = 'نسبة الاستقطاع: ' + formatPercentage(dbr);

  if (dbr > 0.3333) {
    showElement('p_dbrWarning');
  }
}

// COMBO 2-in-1 CALCULATION
function calculateCombo() {
  hideElement('c_warning');
  hideElement('c_pWarning');

  const salary = parseFloat(document.getElementById('salary').value) || 0;

  // 1) Personal part
  const pPrice    = parseFloat(document.getElementById('c_personalPrice').value) || 0;
  const pTerm     = parseFloat(document.getElementById('c_personalTerm').value) || 0;
  const pRate     = (parseFloat(document.getElementById('c_personalRate').value) || 0) / 100;
  const pInterest = Math.round(pRate * pTerm * pPrice);
  const pTotal    = pPrice + pInterest;
  const pMonthly  = pTerm ? pTotal / (pTerm * 12) : 0;
  const pAdminFee = Math.min(pPrice * 0.0115, 5750);
  const pCostAll  = pTotal + pAdminFee;
  const pNum      = pTerm * 12;

  // Rule 1: personal monthly ≤ 33.33% of salary
  if (pMonthly > 0.3333 * salary) {
    showElement('c_pWarning');
  }

  // Personal → Mortgage contribution
  const personalToMortgage = parseFloat(document.getElementById('c_personalToMortgage').value) || 0;

  // 2) Mortgage part
  const mPrice    = parseFloat(document.getElementById('c_propertyPrice').value) || 0;
  const down      = parseFloat(document.getElementById('c_downPayment').value) || 0;
  const mTerm     = parseFloat(document.getElementById('c_mortgageTerm').value) || 0;
  const mRate     = (parseFloat(document.getElementById('c_mortgageRate').value) || 0) / 100;
  const userMonthlyContribution = parseFloat(document.getElementById('c_monthlyCap').value) != 0;
  const financed  = Math.max(0, mPrice - down - personalToMortgage);
  const mInterest = Math.round(mRate * mTerm * financed);
  const mTotal    = financed + mInterest;
  let firstMonthlyContributions  = mTerm ? mTotal / (mTerm * 12) : 0;
  let remainingMonthlyContributions = firstMonthlyContributions;
  const mAdminFee = Math.min(financed * 0.0115, 5750);
  const mCostAll  = mTotal + mAdminFee;
  const mNum      = mTerm * 12;
  if (userMonthlyContribution) {
    firstMonthlyContributions = parseFloat(document.getElementById('c_monthlyCap').value);
    remainingMonthlyContributions = (mTotal - (firstMonthlyContributions * pNum)) / (mNum - pNum);
  }

  // Rule 2: during personal term, combined monthly ≤ 65% of salary
  let firstCombined = pMonthly + firstMonthlyContributions;
  if (firstCombined > 0.65 * salary || remainingMonthlyContributions > 0.65 * salary) {
    const maxTotal = Math.floor((salary * 0.65 - pMonthly) * pNum + (salary * 0.65) * (mNum - pNum)); // max total for mortgage part
    if (maxTotal < mTotal) {
      showElement('c_warning');
    }
    else {
      if (userMonthlyContribution) {
        showElement('c_warning');
      }
      else {
        firstMonthlyContributions = Math.floor(salary * 0.65 - pMonthly); // cap mortgage monthly to fit DBR
        remainingMonthlyContributions = (mTotal - (firstMonthlyContributions * pNum)) / (mNum - pNum); // recalculate remaining monthly contributions
        firstCombined = pMonthly + firstMonthlyContributions; // recalculate combined monthly contributions
      }
    }
  }

  // Populate first-years contributions
  document.getElementById('c_personalMonthlyFirst').textContent  = formatCurrency(pMonthly);
  document.getElementById('c_mortgageMonthlyFirst').textContent  = formatCurrency(firstMonthlyContributions);
  document.getElementById('c_firstCombined').textContent         = formatCurrency(firstCombined);

  // Populate remaining mortgage
  document.getElementById('c_remainingMonthly').textContent      = formatCurrency(remainingMonthlyContributions);

  // Detailed breakdown: Personal
  document.getElementById('c_personalAmountTotal').textContent   = formatCurrency(pPrice);
  document.getElementById('c_personalTotalInterest').textContent = formatCurrency(pInterest);
  document.getElementById('c_personalTotalPayment').textContent  = formatCurrency(pTotal);
  document.getElementById('c_personalAdminFee').textContent      = formatCurrency(pAdminFee);
  document.getElementById('c_personalTotalCost').textContent     = formatCurrency(pCostAll);
  document.getElementById('c_personalNumPayments').textContent   = pNum + ' قسط';

  // Detailed breakdown: Mortgage
  document.getElementById('c_mortgageAmountTotal').textContent   = formatCurrency(financed);
  document.getElementById('c_mortgageTotalInterest').textContent = formatCurrency(mInterest);
  document.getElementById('c_mortgageTotalPayment').textContent  = formatCurrency(mTotal);
  document.getElementById('c_mortgageAdminFee').textContent      = formatCurrency(mAdminFee);
  document.getElementById('c_mortgageTotalCost').textContent     = formatCurrency(mCostAll);
  document.getElementById('c_mortgageNumPayments').textContent   = mNum + ' قسط';

  // Combined breakdown
  const totalAmountAll   = pPrice + financed;
  const totalInterestAll = pInterest + mInterest;
  const totalPaymentAll  = pTotal + mTotal;
  const totalAdminFeeAll = pAdminFee + mAdminFee;
  const totalCostAll     = pCostAll + mCostAll;
  document.getElementById('c_totalAmountAll').textContent   = formatCurrency(totalAmountAll);
  document.getElementById('c_totalInterestAll').textContent = formatCurrency(totalInterestAll);
  document.getElementById('c_totalPaymentAll').textContent  = formatCurrency(totalPaymentAll);
  document.getElementById('c_totalAdminFeeAll').textContent = formatCurrency(totalAdminFeeAll);
  document.getElementById('c_totalCostAll').textContent     = formatCurrency(totalCostAll);
}

// Calculate buttons with validation
document.getElementById('mortgageCalcBtn').addEventListener('click', () => {
  calculateMortgage();
  if (document.getElementById('downPaymentWarning').classList.contains('hidden') &&
      document.getElementById('dbrWarning').classList.contains('hidden')) {
    showElement('mortgageResults');
  }
});
document.getElementById('personalCalcBtn').addEventListener('click', () => {
  calculatePersonal();
  if (document.getElementById('p_dbrWarning').classList.contains('hidden')) {
    showElement('personalResults');
  }
});
document.getElementById('comboCalcBtn').addEventListener('click', () => {
  calculateCombo();

  // Grab the two warning elements
  const pWarnEl = document.getElementById('c_pWarning');
  const warnEl  = document.getElementById('c_warning');

  // Only show results if both are hidden (or warnEl is missing)
  const personalOK = pWarnEl && pWarnEl.classList.contains('hidden');
  const comboOK    = !warnEl || warnEl.classList.contains('hidden');

  if (personalOK && comboOK) {
    showElement('comboResults');
  }
});

// 1) Mortgage “الحد الأقصى”
document.getElementById('m_maxBtn').addEventListener('click', () => {
  const salary   = parseFloat(document.getElementById('salary').value) || 0;
  const term     = parseFloat(document.getElementById('loanTerm').value) || 1;
  const rate     = (parseFloat(document.getElementById('interestRate').value) || 0) / 100;
  const monthlyMax   = salary * 0.65;
  const financedMax  = (monthlyMax * term * 12) / (1 + rate * term);
  const propertyMax  = financedMax / 0.9;
  document.getElementById('propertyPrice').value = Math.floor(propertyMax);
  document.getElementById('downPayment').value   = Math.floor(propertyMax * 0.1);
  hideElement('mortgageResults');
});

// 2) Personal “الحد الأقصى”
document.getElementById('p_maxBtn').addEventListener('click', () => {
  const salary      = parseFloat(document.getElementById('p_salary').value) || 0;
  const term        = parseFloat(document.getElementById('p_loanTerm').value) || 1;
  const rate        = (parseFloat(document.getElementById('p_interestRate').value) || 0) / 100;
  const monthlyMax  = salary * 0.3333;
  const principalMax= (monthlyMax * term * 12) / (1 + rate * term);
  document.getElementById('p_propertyPrice').value = Math.floor(principalMax);
  hideElement('personalResults');
});

// 3) Combo personal loan “الحد الأقصى”
document.getElementById('c_pMaxBtn').addEventListener('click', () => {
  const salary   = parseFloat(document.getElementById('salary').value) || 0;
  const pTerm    = parseFloat(document.getElementById('c_personalTerm').value) || 1;
  const pRate    = (parseFloat(document.getElementById('c_personalRate').value) || 0) / 100;
  const monthlyMax   = salary * 0.3333;
  const principalMax = (monthlyMax * pTerm * 12) / (1 + pRate * pTerm);
  document.getElementById('c_personalPrice').value = Math.floor(principalMax);
  hideElement('comboResults');
});

// 4) Combo mortgage loan “الحد الأقصى”
document.getElementById('c_mMaxBtn').addEventListener('click', () => {
  const salary = parseFloat(document.getElementById('salary').value) || 0;
  const mTerm  = parseFloat(document.getElementById('c_mortgageTerm').value) || 1;
  const mRate  = (parseFloat(document.getElementById('c_mortgageRate').value) || 0) / 100;

  // Recompute personal monthly instead of reading from a missing DOM node:
  const pPrice    = parseFloat(document.getElementById('c_personalPrice').value) || 0;
  const pTerm     = parseFloat(document.getElementById('c_personalTerm').value) || 1;
  const pRate     = (parseFloat(document.getElementById('c_personalRate').value) || 0) / 100;
  const pInterest = Math.round(pRate * pTerm * pPrice);
  const pTotal    = pPrice + pInterest;
  const pMonthly  = pTerm ? pTotal / (pTerm * 12) : 0;

  // Determine cap for mortgage part
  const capMonthly = salary * 0.65;

  // Max available for mortgage = cap - personal monthly
  const availableMonthly = capMonthly - pMonthly;

  // Compute financed principal from availableMonthly
  const financedMaxPersonalDuration = pTerm ? (availableMonthly * pTerm * 12): 0;
  const financedMaxRemainingDuration = mTerm ? (capMonthly * (mTerm - pTerm) * 12): 0;
  const financedMax = Math.max(0, (financedMaxPersonalDuration + financedMaxRemainingDuration) / (1 + mRate * mTerm));

  const down           = parseFloat(document.getElementById('c_downPayment').value) || 0;
  const personalToMort = parseFloat(document.getElementById('c_personalToMortgage').value) || 0;

  // propertyPrice = financed + down + personalToMortgage
  document.getElementById('c_propertyPrice').value =
    Math.floor(financedMax + down + personalToMort);

  hideElement('comboResults');
  calculateCombo();
});

// 5) Combo “الكل” → مساهمة التمويل الشخصي في الدفعة الأولى
document.getElementById('c_toDownMaxBtn').addEventListener('click', () => {
  const personalAmt = parseFloat(document.getElementById('c_personalPrice').value) || 0;
  document.getElementById('c_personalToMortgage').value = Math.floor(personalAmt);
  hideElement('comboResults');
});


// Debounce & initialize
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
const debouncedSave = debounce(saveToLocalStorage, 1000);

window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  // hide all results initially
  ['mortgageResults','personalResults','comboResults'].forEach(hideElement);
  // save on any change
  document.querySelectorAll('input, select').forEach(el =>
    el.addEventListener('input', () => debouncedSave())
  );
});
