require('dotenv').config()
const fs = require('fs');
const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');
const express = require('express')
const app = express()
const http = require('http')
// const https = require('https');
// const server = https.createServer({key: key, cert: cert }, app);
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
const { ExpressPeerServer } = require('peer');
const { v4: uuidv4 } = require('uuid')

const PORT = process.env.PORT || 443
const peerServer = ExpressPeerServer(server);

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerserver', peerServer)

app.get('/', (req, res) => {
    const user_id = uuidv4()
    res.redirect(`/${user_id}`)
})


app.get('/:room', (req, res) => {
    res.render('index', { user_id : req.params.room, peer_port : PORT + 1})
})

io.on('connection', (socket) => {
socket.on('webrtc', (room_id, user) => {
        console.log('user ' + user + ' join in room ' + room_id);
        socket.join(room_id)
        socket.broadcast.to(room_id).emit('webrtc', room_id, user)
        socket.on('disconnect', () => {
            console.log('user disconnected');
            socket.broadcast.to(room_id).emit('user-disconnected', user)
        });
    });
})

server.listen(PORT, () => console.log('listening on PORT:' + PORT))