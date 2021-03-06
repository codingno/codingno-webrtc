require('dotenv').config()
const express = require('express')
const app = express()
const fs = require('fs');
const https = require('https');
const http = require('http')
var server;
if(process.env.APP == 'development') {
    const key = fs.readFileSync('./key.pem');
    const cert = fs.readFileSync('./cert.pem');
    server = https.createServer({key: key, cert: cert }, app);
} else {
    server = http.createServer(app)
}
const { Server } = require("socket.io")
const io = new Server(server)
const { ExpressPeerServer } = require('peer');
const { v4: uuidv4 } = require('uuid')

const PORT = parseInt(process.env.PORT) || 443
const peerServer = ExpressPeerServer(server, { path: "/peerserver"});

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(peerServer)

app.get('/', (req, res) => {
    res.render('index')
})
app.get('/:type', (req, res) => {
    const user_id = uuidv4()
    res.redirect(`/${req.params.type}/${user_id}`)
})


app.get('/:type/:room', (req, res) => {
    res.render(`${req.params.type}`, { user_id : req.params.room, peer_port : PORT })
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