// Xử lý quên & reset password trên forgot-reset.html
const sectionEmail = document.getElementById('section-email');
const sectionReset = document.getElementById('section-reset');
const msgEl = document.getElementById('msg');
let resetTokenAPI = null;

// 1) Gửi email lấy reset token hoặc link
document.getElementById('btn-send-link').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  if (!email) return alert('Vui lòng nhập email');

  const res = await fetch('http://localhost:9000/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();

  if (!res.ok) {
    msgEl.textContent = '❌ ' + (data.error || data.message);
    return;
  }

  // Giả sử API trả token trong metadata
  resetTokenAPI = data.metadata?.token || null;
  msgEl.textContent = '✅ Link đã gửi. Paste token hoặc nhập tay bên dưới.';
  // Hiện section reset, ẩn section email
  sectionEmail.classList.add('hidden');
  sectionReset.classList.remove('hidden');
});

// 2) Reset mật khẩu
document.getElementById('btn-reset').addEventListener('click', async () => {
  const tokenInput = document.getElementById('tokenInput').value.trim();
  const token = tokenInput || resetTokenAPI;
  const pwd = document.getElementById('newPwd').value;
  const cpwd = document.getElementById('confirmPwd').value;

  if (!token) return alert('Vui lòng nhập token để xác nhận.');
  if (!pwd || !cpwd) return alert('Vui lòng nhập cả mật khẩu mới và xác nhận.');
  if (pwd !== cpwd) return alert('Mật khẩu và xác nhận không khớp.');

  const res = await fetch('http://localhost:9000/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password: pwd }),
  });
  const data = await res.json();

  if (!res.ok) {
    msgEl.textContent = '❌ ' + (data.error || data.message);
    return;
  }

  msgEl.textContent = '✅ Đổi mật khẩu thành công! Chuyển về trang login...';
  setTimeout(() => (location.href = 'index.html'), 2000);
});
