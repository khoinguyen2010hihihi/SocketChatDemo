async function register() {
  const username = document.getElementById('username').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirmPassword').value;

  if (!username || !email || !password || !confirm) {
    return alert('Please fill in all fields.');
  }
  if (password !== confirm) {
    return alert('Passwords do not match.');
  }

  try {
    const res = await fetch('http://localhost:9000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();

    if (res.ok) {
      alert('Registered successfully. Redirecting to login...');
      setTimeout(() => location.href = 'index.html', 1500);
    } else {
      alert((data.message || 'Registration failed.'));
    }
  } catch (err) {
    console.error(err);
    alert('Server error. Please try again later.');
  }
}
window.register = register;
