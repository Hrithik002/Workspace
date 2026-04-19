const signupTab = document.getElementById('signupTab');
const loginTab = document.getElementById('loginTab');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const messageBox = document.getElementById('messageBox');
const welcomeView = document.getElementById('welcomeView');
const welcomeTitle = document.getElementById('welcomeTitle');
const welcomeMessage = document.getElementById('welcomeMessage');
const logoutButton = document.getElementById('logoutButton');

const signupFields = {
  firstName: document.getElementById('firstName'),
  lastName: document.getElementById('lastName'),
  signupEmail: document.getElementById('signupEmail'),
  signupPassword: document.getElementById('signupPassword'),
  confirmPassword: document.getElementById('confirmPassword')
};

const loginFields = {
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword')
};

function setMessage(text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function clearMessage() {
  messageBox.textContent = '';
  messageBox.className = 'message';
}

function clearErrors(form) {
  form.querySelectorAll('.error').forEach((node) => {
    node.textContent = '';
  });
}

function setFieldError(name, message) {
  const node = document.querySelector(`[data-error-for="${name}"]`);
  if (node) {
    node.textContent = message;
  }
}

function switchMode(mode) {
  const isSignup = mode === 'signup';
  signupTab.classList.toggle('active', isSignup);
  loginTab.classList.toggle('active', !isSignup);
  signupTab.setAttribute('aria-selected', String(isSignup));
  loginTab.setAttribute('aria-selected', String(!isSignup));
  signupForm.classList.toggle('hidden', !isSignup);
  loginForm.classList.toggle('hidden', isSignup);
  clearMessage();
  clearErrors(signupForm);
  clearErrors(loginForm);
}

function showWelcome(fullName, email) {
  signupForm.classList.add('hidden');
  loginForm.classList.add('hidden');
  welcomeView.classList.remove('hidden');
  welcomeTitle.textContent = `Welcome, ${fullName}`;
  welcomeMessage.textContent = `You are successfully signed in with ${email}.`;
  clearMessage();
}

function showAuth(mode = 'login') {
  welcomeView.classList.add('hidden');
  switchMode(mode);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

function validateSignupForm() {
  clearErrors(signupForm);
  const values = {
    firstName: signupFields.firstName.value.trim(),
    lastName: signupFields.lastName.value.trim(),
    signupEmail: signupFields.signupEmail.value.trim(),
    signupPassword: signupFields.signupPassword.value,
    confirmPassword: signupFields.confirmPassword.value
  };

  let valid = true;

  if (values.firstName.length < 2) {
    setFieldError('firstName', 'Enter a valid first name.');
    valid = false;
  }
  if (values.lastName.length < 2) {
    setFieldError('lastName', 'Enter a valid last name.');
    valid = false;
  }
  if (!isValidEmail(values.signupEmail)) {
    setFieldError('signupEmail', 'Enter a valid email address.');
    valid = false;
  }
  if (!isStrongPassword(values.signupPassword)) {
    setFieldError('signupPassword', 'Use 8+ characters with at least one letter and one number.');
    valid = false;
  }
  if (values.confirmPassword !== values.signupPassword) {
    setFieldError('confirmPassword', 'Passwords do not match.');
    valid = false;
  }

  return valid;
}

function validateLoginForm() {
  clearErrors(loginForm);
  const values = {
    loginEmail: loginFields.loginEmail.value.trim(),
    loginPassword: loginFields.loginPassword.value
  };

  let valid = true;

  if (!isValidEmail(values.loginEmail)) {
    setFieldError('loginEmail', 'Enter a valid email address.');
    valid = false;
  }
  if (values.loginPassword.length < 8) {
    setFieldError('loginPassword', 'Password must be at least 8 characters.');
    valid = false;
  }

  return valid;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = data.message || data.errors?.[0] || 'Something went wrong.';
    throw new Error(errorMessage);
  }
  return data;
}

signupTab.addEventListener('click', () => switchMode('signup'));
loginTab.addEventListener('click', () => switchMode('login'));

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();

  if (!validateSignupForm()) {
    setMessage('Please fix the highlighted fields.', 'error');
    return;
  }

  try {
    const payload = {
      firstName: signupFields.firstName.value.trim(),
      lastName: signupFields.lastName.value.trim(),
      email: signupFields.signupEmail.value.trim(),
      password: signupFields.signupPassword.value,
      confirmPassword: signupFields.confirmPassword.value
    };

    const result = await postJson('/api/auth/register', payload);
    setMessage(`${result.message} Welcome, ${result.fullName}.`, 'success');
    signupForm.reset();
  } catch (error) {
    setMessage(error.message, 'error');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();

  if (!validateLoginForm()) {
    setMessage('Please fix the highlighted fields.', 'error');
    return;
  }

  try {
    const payload = {
      email: loginFields.loginEmail.value.trim(),
      password: loginFields.loginPassword.value
    };

    const result = await postJson('/api/auth/login', payload);
    showWelcome(result.fullName, result.email);
    loginForm.reset();
  } catch (error) {
    setMessage(error.message, 'error');
  }
});

logoutButton.addEventListener('click', () => {
  showAuth('login');
});

switchMode('signup');
