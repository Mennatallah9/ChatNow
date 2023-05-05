const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);
const formatMsg = require('./utils/msgs');
const {userJoin, getCurrUser, userLeave, getRoomUsers} = require('./utils/users');
const admin = 'Admin';

io.on('connection', socket =>{
    socket.on('joinRoom', ({username, room})=>{
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit('msg', formatMsg(admin,'Welcome to ChatNow!'));
        socket.broadcast.to(user.room).emit('msg', formatMsg(admin,`${user.username} joined the chat!`));
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })
    
    socket.on('chatmsg', (msg)=>{
        const user = getCurrUser(socket.id);

        io.to(user.room).emit('msg', formatMsg(user.username, msg));
    })

    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('msg', formatMsg(admin,`${user.username} left the chat!`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    })
})

app.use(express.static(path.join(__dirname, 'frontend')));
const PORT = 3000 || process.env.PORT;
server.listen(PORT, ()=>
    console.log(`Server running on port ${PORT}`));

