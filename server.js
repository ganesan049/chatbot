const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io');
const formatMessage = require('./util/messages');
const { userJoin,getCurrentUser,userLeave,getRoomUsers } = require('./util/user')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,'public')))

const botName = 'chat-cord bot'

io.on('connection',socket => {

    socket.on('joinRoom',({username,room}) => {

    const user = userJoin(socket.id,username,room);
    socket.join(user.room);

    //to the client which is connected
    socket.emit('message',formatMessage(botName,`Welcome ${user.username}`));

    //all of the client except which one is connected
    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

    //GET users in room
    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(room)
    })

    //all the client
    // io.emit()

    socket.on('disconnect',() => {
        const user = userLeave(socket.id);
        if(user){
            socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
             //GET users in room
    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(room)
    })
        }
    });

    })

    console.log(socket.id + ' new connection');


    //listen to the message from client
    socket.on('chatMessage',(message) => {
        // console.log(message+' from client')
        const user = getCurrentUser(socket.id);
        console.log(user)
        io.to(user.room).emit('message',formatMessage(user.username,message))
    })

})

const PORT = 3000 || process.env.PORT;
server.listen(PORT,() => console.log(`server running on ${PORT}`));