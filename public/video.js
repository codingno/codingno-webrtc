const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peer = new Peer(undefined, {
    host: '/',
    path: '/peerserver',
    port: 443,
});

const peers = {}

const myVideo = document.createElement('video')
myVideo.muted = true
myVideo.id = 'video1'

navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true
}).then( stream => {
    if(stream)
        addVideoStream(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
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
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    peers[id] = call
}

function addVideoStream(video, stream) {
   video.srcObject = stream
   video.addEventListener('loadedmetadata', () => {
       video.play()
   }) 
   videoGrid.append(video)
}

