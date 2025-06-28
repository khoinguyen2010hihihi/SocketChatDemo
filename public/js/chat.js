const token = localStorage.getItem('token')
if (!token) {
  window.location.href = '../html/index.html'
}

let userId = null
let ws = null

const msgBox = document.getElementById('messages')
const receiverSelect = document.getElementById('receiver')
const msgInput = document.getElementById('msg')

// --- Fetch current user info ---
const getMe = async () => {
  const res = await fetch('http://localhost:9000/user/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  userId = data.metadata._id
}

// --- Load users into dropdown ---
const loadUsers = async () => {
  const res = await fetch('http://localhost:9000/user/getAll', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const resData = await res.json()
  const users = resData.metadata

  receiverSelect.innerHTML = ''

  users.forEach((u) => {
    if (u._id !== userId) {
      const option = document.createElement('option')
      option.value = u._id
      option.innerText = u.username
      receiverSelect.appendChild(option)
    }
  })

  receiverSelect.addEventListener('change', (e) => {
    const selectedReceiver = e.target.value
    loadMessages(selectedReceiver)
  })

  if (receiverSelect.options.length > 0) {
    const defaultReceiver = receiverSelect.options[0].value
    receiverSelect.value = defaultReceiver
    await loadMessages(defaultReceiver)
  }
}


// --- Load all messages ---
const loadMessages = async (receiverId) => {
  msgBox.innerHTML = ''

  const res = await fetch(`http://localhost:9000/message/${receiverId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json()
  const messages = data.metadata

  messages.forEach((msg) => {
    const div = document.createElement('div')
    const isMe = msg.sender._id === userId
    const senderName = isMe ? 'You' : msg.sender.username

    div.className = isMe ? 'message you' : 'message them'
    div.innerHTML = `<b>${senderName}:</b> ${msg.content}`
    msgBox.appendChild(div)
  })
}


// --- WebSocket ---
const connectWebSocket = () => {
  ws = new WebSocket(`ws://localhost:9000?token=${token}`)

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)

    if (data.fromId === userId) return

    const receiverId = receiverSelect.value
    if (data.fromId !== receiverId) return

    const message = document.createElement('div')
    message.className = 'message them'
    message.innerHTML = `<b>${data.fromUsername}:</b> ${data.content}`
    msgBox.appendChild(message)
  }
}

// --- Send message ---
window.sendMsg = () => {
  const to = receiverSelect.value
  const content = msgInput.value

  if (!to || !content.trim()) return

  ws.send(JSON.stringify({ to, content }))

  const message = document.createElement('div')
  message.className = 'message you'
  message.innerHTML = `<b>You:</b> ${content}`
  msgBox.appendChild(message)

  msgInput.value = ''
}

// --- Logout
window.logout = () => {
  localStorage.removeItem('token')
  window.location.href = '../html/index.html'
}

// --- On load ---
(async () => {
  await getMe()
  await loadUsers()
  connectWebSocket()
})()
