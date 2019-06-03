const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = 3000

const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))



io.on('connection', (socket) => {
    console.log('New WebSocket connection started')

       
         socket.on('sendMessage', (message, callback) =>{
            const user = getUser(socket.id)
            io.to(user.room).emit('message', generateMessage(user.username, message))
            callback('Delivered!')
        })

        socket.on('sendLocation', (location, callback) => {
            const user = getUser(socket.id)
            io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
            callback()
        })


        socket.on('join', (options , callback) => {
            const {error, user} = addUser({ id: socket.id, ...options })
            if(error){
                return callback(error)
            }

            socket.join(user.room)

            socket.emit('message', generateMessage('Admin','Welcome!'))
            socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `User ${user.username} joined the channel`))
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

            
            callback()
        })


        socket.on('disconnect', () => {
            const user = removeUser(socket.id)
            if(user){
                io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room`))
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getUsersInRoom(user.room)
                })
            }
            
        })
})




server.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})