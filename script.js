const loginForm = document.querySelector('.login-form');
const statusMessage = document.querySelector('.form-status');
const passwordInput = document.querySelector('#password-input');
const passwordToggle = document.querySelector('.password-toggle');

function setStatus(message, isError = false) {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.hidden = false;
  statusMessage.classList.toggle('error', isError);
}

function showPage(targetId) {
  const dashboardHome = document.querySelector('.dashboard-home');
  const paymentsPage = document.querySelector('#payments-page');
  const smartPayPage = document.querySelector('#smartpay-page');
  const paymentQrPage = document.querySelector('#payment-qr-page');
  const enrollmentPage = document.querySelector('#enrollment-assessment');

  if (dashboardHome) dashboardHome.hidden = targetId !== 'dashboard-home';
  if (paymentsPage) paymentsPage.hidden = targetId !== 'payments-page';
  if (smartPayPage) smartPayPage.hidden = targetId !== 'smartpay-page';
  if (paymentQrPage) paymentQrPage.hidden = targetId !== 'payment-qr-page';
  if (enrollmentPage) enrollmentPage.hidden = targetId !== 'enrollment-assessment';

  document.querySelectorAll('[data-target]').forEach((item) => {
    const matches = item.dataset.target === targetId;
    item.classList.toggle('active', matches);
  });
}

passwordToggle?.addEventListener('click', function () {
  if (!passwordInput) return;

  const shouldShow = passwordInput.type === 'password';
  passwordInput.type = shouldShow ? 'text' : 'password';

  this.textContent = shouldShow ? 'Hide' : 'Show';
  this.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
  this.setAttribute('aria-pressed', String(shouldShow));
});

loginForm?.addEventListener('submit', function (event) {
  event.preventDefault();

  const username = loginForm.querySelector('input[type="text"]')?.value.trim() ?? '';
  const password = passwordInput?.value.trim() ?? '';

  if (!username || !password) {
    setStatus('Please enter your username and password.', true);
    return;
  }

  setStatus('Welcome back! Redirecting to your dashboard...');

  setTimeout(() => {
    const loginScreen = document.querySelector('.login-screen');
    const dashboardScreen = document.querySelector('.dashboard-screen');

    if (loginScreen) loginScreen.classList.remove('active');
    if (dashboardScreen) dashboardScreen.classList.add('active');
    showPage('dashboard-home');
  }, 500);
});

document.querySelectorAll('[data-target]').forEach((item) => {
  item.addEventListener('click', function () {
    const targetId = this.dataset.target;
    if (!targetId) return;
    showPage(targetId);
  });
});

const paymentFlowRows = [...document.querySelectorAll('.payment-flow-row[data-installment]')];
let highestPaidInstallment = 1;

function getInstallmentKeyFromSelection(selection) {
  const rawValue = typeof selection === 'string' || typeof selection === 'number'
    ? String(selection)
    : selection?.value || '';

  const valueMap = {
    '2201': '1',
    '24201': '2',
    '22136': '3',
    '22136b': '4',
  };

  if (rawValue && valueMap[rawValue]) {
    return valueMap[rawValue];
  }

  const text = selection?.textContent || selection?.value || rawValue || 'Installment 1';
  const match = String(text).match(/Installment\s*(\d+)/i);

  if (match && match[1]) return match[1];

  const numericMatch = String(text).match(/\d+/);
  return numericMatch ? String(numericMatch[0]) : '1';
}

function updatePaymentRowsState() {
  paymentFlowRows.forEach((row) => {
    const rowValue = String(row.dataset.installment || '');
    const rowNumber = Number(rowValue) || 0;
    const isPaid = rowNumber <= highestPaidInstallment;
    const label = row.firstElementChild;
    const amount = row.lastElementChild;

    row.classList.toggle('paid-row', isPaid);

    if (label) {
      if (isPaid) {
        label.innerHTML = `Installment ${rowValue}<span class="status-pill paid">Paid</span>`;
      } else {
        label.innerHTML = `Installment ${rowValue}`;
      }
    }

    if (amount) {
      amount.textContent = isPaid ? '—' : (row.dataset.amount || amount.textContent);
    }
  });
}

function markInstallmentPaid(selection) {
  const selectedKey = Number(getInstallmentKeyFromSelection(selection || { textContent: 'Installment 1', value: '2201' })) || 1;
  highestPaidInstallment = Math.max(highestPaidInstallment, selectedKey);
  updatePaymentRowsState();
}

document.querySelector('.payment-qr-back')?.addEventListener('click', function () {
  const selected = installmentSelect?.selectedOptions?.[0];

  markInstallmentPaid(selected || { textContent: 'Installment 1', value: '2201' });
  showPage('payments-page');
  togglePaymentFlow(true);
});

document.querySelector('.profile-trigger')?.addEventListener('click', function () {
  const profileGroup = this.closest('.nav-group');
  const isOpen = profileGroup?.classList.toggle('open') ?? false;

  this.setAttribute('aria-expanded', String(isOpen));
});

document.querySelector('.enrollment-link')?.addEventListener('click', function (event) {
  event.preventDefault();

  const dashboardHome = document.querySelector('.dashboard-home');
  const enrollmentPage = document.querySelector('.enrollment-page');

  if (dashboardHome) dashboardHome.hidden = true;
  if (enrollmentPage) enrollmentPage.hidden = false;
  this.classList.add('selected');
});

const paymentFlowPanel = document.querySelector('#payment-flow-panel');
const proceedPaymentButton = document.querySelector('.primary-payment-action');
const cancelPaymentButton = document.querySelector('.secondary-payment-action');
const installmentSelect = document.querySelector('#installment-select');
const installmentTotalAmount = document.querySelector('.installment-total-amount');
const paymentTotalValue = document.querySelector('.payment-total-value');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value);
}

function updateInstallmentTotal() {
  if (!installmentSelect || !installmentTotalAmount || !paymentTotalValue) return;

  const amount = Number(installmentSelect.value || 0);
  const formatted = formatCurrency(amount);

  installmentTotalAmount.textContent = formatted;
  paymentTotalValue.textContent = formatted;
}

function togglePaymentFlow(show) {
  if (!paymentFlowPanel) return;

  paymentFlowPanel.hidden = !show;

  if (show) {
    paymentFlowPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

proceedPaymentButton?.addEventListener('click', function () {
  togglePaymentFlow(true);
});

const paymentSubmitButton = document.querySelector('.payment-submit-button');

paymentSubmitButton?.addEventListener('click', function () {
  const selected = installmentSelect?.selectedOptions?.[0];
  const amountText = paymentTotalValue?.textContent?.trim() || '₱ 2,201.00';
  const installmentText = selected?.textContent?.replace(/\s*-\s*.*$/, '').trim() || 'Installment 1';

  const smartpayAmount = document.querySelector('#smartpay-amount');
  const smartpayTotal = document.querySelector('#smartpay-total');
  const smartpayInstallment = document.querySelector('#smartpay-installment');
  const paymentReference = document.querySelector('#payment-reference');
  const qrAmount = document.querySelector('#payment-amount');
  const qrInstallment = document.querySelector('#payment-installment');

  const refValue = selected?.value || '2201';
  const refText = `P${String(refValue).padStart(8, '0')}`;

  if (smartpayAmount) smartpayAmount.textContent = amountText;
  if (smartpayTotal) smartpayTotal.textContent = amountText;
  if (smartpayInstallment) smartpayInstallment.textContent = installmentText;
  if (paymentReference) paymentReference.textContent = refText;
  if (qrAmount) qrAmount.textContent = amountText;
  if (qrInstallment) qrInstallment.textContent = installmentText;

  markInstallmentPaid(selected);
  showPage('smartpay-page');
});

const smartpayContinueButton = document.querySelector('.smartpay-continue');
smartpayContinueButton?.addEventListener('click', function () {
  const refValue = document.querySelector('#payment-reference')?.textContent || 'P000198049';
  const qrRef = document.querySelector('#qr-reference');
  if (qrRef) qrRef.textContent = refValue;
  showPage('payment-qr-page');
});

cancelPaymentButton?.addEventListener('click', function () {
  togglePaymentFlow(false);
});

installmentSelect?.addEventListener('change', updateInstallmentTotal);
updateInstallmentTotal();

const qrBlock = document.querySelector('.qr-block');
if (qrBlock) {
  qrBlock.innerHTML = '<img src="LPU_QR.jpg" alt="Instapay QR code" class="instapay-qr" />';
}

const assessmentModal = document.querySelector('.assessment-modal');
const openAssessmentButton = document.querySelector('.enlistment-slip-button');
const closeAssessmentButton = document.querySelector('.assessment-modal-close');
const assessmentBackdrop = document.querySelector('.assessment-modal-backdrop');

function closeAssessmentModal() {
  assessmentModal?.classList.remove('open');
  assessmentModal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

openAssessmentButton?.addEventListener('click', function () {
  assessmentModal?.classList.add('open');
  assessmentModal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
});

closeAssessmentButton?.addEventListener('click', closeAssessmentModal);
assessmentBackdrop?.addEventListener('click', closeAssessmentModal);

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') closeAssessmentModal();
});
