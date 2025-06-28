window.login = async function () {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const res = await fetch('http://localhost:9000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()

  const token = data?.metadata?.accessToken

  if (res.ok && token) {
    localStorage.setItem('token', token)
    window.location.href = '../html/chat.html'
  } else {
    alert(data.message || 'Login failed')
  }
}
