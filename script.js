document.querySelector('.login-form')?.addEventListener('submit', function (event) {
  event.preventDefault();

  const loginScreen = document.querySelector('.login-screen');
  const dashboardScreen = document.querySelector('.dashboard-screen');

  if (loginScreen) loginScreen.classList.remove('active');
  if (dashboardScreen) dashboardScreen.classList.add('active');
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
