const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '../html/index.html';
}

let userId = null;
let ws = null;

const msgBox = document.getElementById('messages');
const receiverSelect = document.getElementById('receiver');

// Fetch current user info
const getMe = async () => {
  const res = await fetch('http://localhost:9000/user/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  userId = data._id;
};

// Fetch all users and populate select box
const loadUsers = async () => {
  const res = await fetch('http://localhost:9000/user/getAll', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const users = await res.json();
  users.forEach((u) => {
    if (u._id !== userId) {
      const option = document.createElement('option');
      option.value = u._id;
      option.innerText = u.username;
      receiverSelect.appendChild(option);
    }
  });
};

// WebSocket setup
const connectWebSocket = () => {
  ws = new WebSocket(`ws://localhost:9000?token=${token}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const message = document.createElement('div');
    message.className = 'message them';
    message.innerHTML = `<b>${data.from}:</b> ${data.content}`;
    msgBox.appendChild(message);
  };
};

window.sendMsg = () => {
  const to = receiverSelect.value;
  const content = document.getElementById('msg').value;

  ws.send(JSON.stringify({ to, content }));

  const message = document.createElement('div');
  message.className = 'message you';
  message.innerHTML = `<b>You:</b> ${content}`;
  msgBox.appendChild(message);

  document.getElementById('msg').value = '';
};

window.logout = () => {
  localStorage.removeItem('token');
  window.location.href = '../html/index.html';
};

// Run on page load
(async () => {
  await getMe();
  await loadUsers();
  connectWebSocket();
})();
