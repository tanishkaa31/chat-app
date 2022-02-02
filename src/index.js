const http = require('http')                    //core node module
const path = require('path')                    //core node module
const express = require('express')
const socketio = require('socket.io')
const badWordFilter = require('bad-words')
const {generateObject} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersinRoom} = require('./utils/users')

const publicDirectoryPath = path.join(__dirname, '../public')
const PORT = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)               //this allows our server to use both express and socket.io
const io = socketio(server)             //that's why created new server

app.use(express.static(publicDirectoryPath))

app.get('', (req, res) => {
    res.render('index')
})

//send data from server to client
// let count = 0
io.on('connection', (socket) => {
    console.log('New web socket connection.')

    // socket.emit("message", generateObject("Welcome!"))                                           //sends to the client
    // socket.broadcast.emit("message", generateObject("A new user has joined the chat!"))         //emits to all connections except this one.
    
    socket.on('join', ({username, room}, callback) => {

        const {error, user} = addUser(socket.id, username, room)

        if(error)
            return callback(error)

        socket.join(user.room)                   //creates a Room, in which only people in the room can see messages
        socket.emit("message", generateObject(user.username + ', welcome to ' + user.room + '!', 'Admin'))
        socket.broadcast.to(user.room).emit("message", generateObject( user.username + " has joined the chat!", 'Admin'))          //sends to everyone in the room except client
        callback()   
        io.to(user.room).emit('roomData', {           // emits to everyone in the room
            room: user.room,
            users: getUsersinRoom(user.room)
        }) 
    })      

    socket.on('sendMessage', (data, callback) => {
        const user = getUser(socket.id)

        if(user){
            const filter = new badWordFilter()
            if(filter.isProfane(data))
                return callback('Profanity is not acceptable.')     //validation + ack
            
            io.to(user.room).emit("message", generateObject(data, user.username))
            callback()                              //acknowledgement from server to client
        }
        else{
            callback('User does not exist.')
        }
       
    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit("location-message",generateObject(`https://google.com/maps?q=${latitude},${longitude}`, user.username))
            callback()          //acknowledgement sent from the server that location was shared
        }
        else{
            callback('User does not exist.')
        }
       
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)    
        
        if(user)
        {
            io.to(user.room).emit('message', generateObject(`${user.username} has left the room.`, 'Admin'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }
        
    })

    
    // socket.on('increment', () => {
    //     count++                             //not sending count anywhere
    //     //socket.emit('countUpdated', count)        //sends to the client that sends increment
    //     io.emit('countUpdated', count)              //sends to every client connected to the server
    // })
})

server.listen(PORT, () => {
    console.log('Server is up and running on ' + PORT)
})