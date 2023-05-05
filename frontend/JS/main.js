const chatForm = document.getElementById('chat-form');
const chatMsgs = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersNames = document.getElementById('users');

const socket = io();
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

socket.emit('joinRoom', {username, room});
socket.on('roomUsers', ({room, users}) => {
    outputRoom(room);
    outputUsers(users);
})

socket.on('msg', message=>{
    console.log(message);
    outputMsg(message);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
});

chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    socket.emit('chatmsg', msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

function outputMsg(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoom(room){
    roomName.innerText = room;

}

function outputUsers(users){
    usersNames.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}