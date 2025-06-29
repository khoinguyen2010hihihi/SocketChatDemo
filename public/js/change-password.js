// Xử lý trang change-password.html (nếu bạn dùng riêng trang này)
const btnChangePage = document.getElementById('btn-change');
if (btnChangePage) {
  btnChangePage.addEventListener('click', async () => {
    const current = document.getElementById('currentPwd').value;
    const nw = document.getElementById('newPwd').value;
    const msgC = document.getElementById('msg-change');

    if (!current || !nw) {
      msgC.textContent = 'Vui lòng nhập cả hai trường';
      return;
    }

    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:9000/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword: current, newPassword: nw }),
    });
    const data = await res.json();

    if (res.ok) {
      msgC.textContent = '✅ ' + data.message;
    } else {
      msgC.textContent = '❌ ' + data.message;
    }
  });
}

// Xử lý modal đổi mật khẩu trong chat.html
window.openChangePwd = () => {
  document.getElementById('changePwdModal').classList.remove('hidden');
};
window.closeChangePwd = () => {
  document.getElementById('changePwdModal').classList.add('hidden');
};
window.submitChangePwd = async () => {
  const current = document.getElementById('currentPwdModal').value;
  const nw = document.getElementById('newPwdModal').value;

  if (!current || !nw) {
    alert('Vui lòng nhập cả hai trường');
    return;
  }

  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:9000/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword: current, newPassword: nw }),
  });
  const data = await res.json();

  if (res.ok) {
    alert('✅ ' + data.message);
    closeChangePwd();
  } else {
    alert('❌ ' + data.message);
  }
};
