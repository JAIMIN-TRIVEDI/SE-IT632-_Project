import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socketInstance = null

export const getSocket = () => {
    if (!socketInstance) {
        socketInstance = io(SOCKET_URL, {
            autoConnect: false,
            withCredentials: true,
            transports: ['websocket', 'polling'],
        })
    }

    return socketInstance
}

export const connectSocketForUser = (userId) => {
    if (!userId) return null

    const socket = getSocket()

    if (!socket.connected) {
        socket.connect()
    }

    socket.emit('join', String(userId))
    return socket
}
