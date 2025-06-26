// حساب الرسوم الإدارية
function calcAdminFee(amount) {
  return Math.min(amount * 0.01, 5750);
}

// صيغة القسط الشهري الثابت (قرض مع هامش)
function calcMonthly(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return principal * r / (1 - Math.pow(1 + r, -n));
}

// قرض شخصي
function calcPersonal() {
  const salary = parseFloat(document.getElementById('p_salary').value);
  const rate = parseFloat(document.getElementById('p_rate').value);
  const years = parseInt(document.getElementById('p_years').value);
  let amount = parseFloat(document.getElementById('p_amount').value);
  const maxAllowed = salary * years * (rate/100) * 0.33;
  if (amount > maxAllowed) amount = maxAllowed;

  const admin = calcAdminFee(amount);
  const monthly = calcMonthly(amount, rate, years);
  const totalInterest = monthly * years * 12 - amount;
  const totalPay = amount + totalInterest + admin;
  const months = years * 12;

  document.getElementById('p_results').innerHTML = `
    <p>المبلغ الأصلي: ${amount.toFixed(2)} ر.س</p>
    <p>إجمالي الفائدة: ${totalInterest.toFixed(2)} ر.س</p>
    <p>الرسوم الإدارية: ${admin.toFixed(2)} ر.س</p>
    <p>إجمالي السداد: ${totalPay.toFixed(2)} ر.س</p>
    <p>القسط الشهري: ${monthly.toFixed(2)} ر.س</p>
    <p>عدد الأقساط: ${months}</p>
  `;
}

// تمويل عقاري
function calcMortgage() {
  const salary = parseFloat(document.getElementById('m_salary').value);
  const value = parseFloat(document.getElementById('m_value').value);
  const rate = parseFloat(document.getElementById('m_rate').value);
  const years = parseInt(document.getElementById('m_years').value);
  let down = parseFloat(document.getElementById('m_down').value);
  if (!down) down = value * 0.10;
  let amount = parseFloat(document.getElementById('m_amount').value);
  const principal = Math.max(value - down, 0);
  const maxAllowed = salary * years * (rate/100) * 0.65;
  if (amount > maxAllowed) amount = maxAllowed;

  const admin = calcAdminFee(amount);
  const monthly = calcMonthly(amount, rate, years);
  const totalInterest = monthly * years * 12 - amount;
  const totalPay = amount + totalInterest + admin;
  const months = years * 12;

  document.getElementById('m_results').innerHTML = `
    <p>المبلغ الأصلي بعد الدفعة الأولى: ${amount.toFixed(2)} ر.س</p>
    <p>إجمالي الفائدة: ${totalInterest.toFixed(2)} ر.س</p>
    <p>الرسوم الإدارية: ${admin.toFixed(2)} ر.س</p>
    <p>إجمالي السداد: ${totalPay.toFixed(2)} ر.س</p>
    <p>القسط الشهري: ${monthly.toFixed(2)} ر.س</p>
    <p>عدد الأقساط: ${months}</p>
  `;
}

// خيار مُدمج
function calcCombined() {
  const salary = parseFloat(document.getElementById('c_salary').value);
  const value = parseFloat(document.getElementById('c_value').value);
  const personalUsed = parseFloat(document.getElementById('c_personal_used').value);
  const rate = parseFloat(document.getElementById('c_rate').value);
  const years = parseInt(document.getElementById('c_years').value);
  const specialMonthly = parseFloat(document.getElementById('c_special_monthly').value);

  // التحقق من الحد الأقصى للقرض الشخصي + عقاري
  const maxTotal = salary * (rate/100) * years * 0.65;
  let personal = Math.min(personalUsed, maxTotal);
  let mortgagePrincipal = Math.min(value - personal, maxTotal - personal);

  // حساب القسط العقاري بعد 5 سنوات
  const adminP = calcAdminFee(personal);
  const adminM = calcAdminFee(mortgagePrincipal);
  const months = years * 12;
  const monthlyP = calcMonthly(personal, rate, years);
  const totalInterestP = monthlyP * months - personal;
  const totalPayP = personal + totalInterestP + adminP;

  // للقرض العقاري: 5 سنوات بقسط خاص ثم الباقي بالقسط المحسوب
  let totalInterestM, totalPayM;
  if (specialMonthly) {
    // نفترض specialMonthly للسنوات الخمس الأولى، ثم نحسب للباقي
    const firstPeriod = 5 * 12;
    const rest = months - firstPeriod;
    const paidFirst = specialMonthly * firstPeriod;
    const remainingPrincipal = mortgagePrincipal - paidFirst + (mortgagePrincipal * rate/100/12 * firstPeriod);
    const normalMonthly = calcMonthly(remainingPrincipal, rate, years - 5);
    totalInterestM = paidFirst - mortgagePrincipal + (normalMonthly * rest - remainingPrincipal);
    totalPayM = mortgagePrincipal + totalInterestM + adminM;
  } else {
    const normalMonthly = calcMonthly(mortgagePrincipal, rate, years);
    totalInterestM = normalMonthly * months - mortgagePrincipal;
    totalPayM = mortgagePrincipal + totalInterestM + adminM;
  }

  document.getElementById('c_results').innerHTML = `
    <h5>القرض الشخصي</h5>
    <p>المبلغ: ${personal.toFixed(2)} ر.س</p>
    <p>الرسوم الإدارية: ${adminP.toFixed(2)} ر.س</p>
    <p>القسط الشهري: ${monthlyP.toFixed(2)} ر.س</p>

    <h5>القرض العقاري</h5>
    <p>المبلغ: ${mortgagePrincipal.toFixed(2)} ر.س</p>
    <p>الرسوم الإدارية: ${adminM.toFixed(2)} ر.س</p>
    <p>إجمالي السداد العقاري: ${totalPayM.toFixed(2)} ر.س</p>
  `;
}