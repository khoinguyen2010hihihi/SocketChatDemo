// Kiểm tra token, nếu không có thì redirect về login
const token = localStorage.getItem('token');
if (!token) {
  location.href = 'index.html';
}

let userId = null;
let ws = null;
const msgBox = document.getElementById('messages');
const receiverSelect = document.getElementById('receiver');

// 1) Lấy thông tin user hiện tại
async function getMe() {
  const res = await fetch('http://localhost:9000/user/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  userId = data.metadata?._id || data._id;
}

// 2) Load danh sách user
async function loadUsers() {
  const res = await fetch('http://localhost:9000/user/getAll', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { metadata: users = [] } = await res.json();
  users.forEach((u) => {
    if (u._id !== userId) {
      const opt = document.createElement('option');
      opt.value = u._id;
      opt.innerText = u.username;
      receiverSelect.appendChild(opt);
    }
  });
}

// 3) Kết nối WebSocket
function connectWebSocket() {
  ws = new WebSocket(`ws://localhost:9000?token=${token}`);
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    const m = document.createElement('div');
    m.className = 'message them';
    m.innerHTML = `<b>${d.from}:</b> ${d.content}`;
    msgBox.appendChild(m);
    msgBox.scrollTop = msgBox.scrollHeight;
  };
}

// 4) Gửi tin nhắn
window.sendMsg = () => {
  const to = receiverSelect.value;
  const content = document.getElementById('msg').value.trim();
  if (!to || !content) return;

  ws.send(JSON.stringify({ to, content }));

  const m = document.createElement('div');
  m.className = 'message you';
  m.innerHTML = `<b>You:</b> ${content}`;
  msgBox.appendChild(m);
  msgBox.scrollTop = msgBox.scrollHeight;
  document.getElementById('msg').value = '';
};

// 5) Logout
window.logout = () => {
  localStorage.removeItem('token');
  location.href = 'index.html';
};

// Chạy khi tải trang
(async () => {
  await getMe();
  await loadUsers();
  connectWebSocket();
})();
