const socket = io('/')
const audioGrid = document.getElementById('audio-grid')
const peer = new Peer(undefined, {
    host: '/',
    path: '/peerserver',
    port: 443,
});

const peers = {}

const myaudio = document.createElement('audio')
myaudio.muted = true
myaudio.id = 'audio1'

navigator.mediaDevices.getUserMedia({
    audio : true
}).then( stream => {
    addaudioStream(myaudio, stream)

    peer.on('call', call => {
        call.answer(stream)
        const audio = document.createElement('audio')
        call.on('stream', useraudioStream => {
            addaudioStream(audio, useraudioStream)
        })
    })

    socket.on('webrtc', (room_id, id) => {
        console.log('User connected : ' + id);
        connectToNewUser(id, stream)
    })
})

socket.on('user-disconnected', id => {
    if(peers[id]) peers[id].close()
})

peer.on('open', id => {
    socket.emit('webrtc', user_id, id)
})

function connectToNewUser(id, stream) {
    const call = peer.call(id, stream)
    const audio = document.createElement('audio')
    call.on('stream', useraudioStream => {
        addaudioStream(audio, useraudioStream)
    })
    call.on('close', () => {
        audio.remove()
    })
    peers[id] = call
}

function addaudioStream(audio, stream) {
   audio.srcObject = stream
   audio.addEventListener('loadedmetadata', () => {
       audio.play()
   }) 
   audioGrid.append(audio)
}

