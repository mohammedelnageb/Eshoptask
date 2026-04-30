import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectSocket = (token: string): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    try {
      socket = io('http://localhost:8080', {
        auth: {
          token,
        },
      })

      socket.on('connect', () => {
        console.log('Socket connected')
        resolve(socket!)
      })

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = (): Socket | null => {
  return socket
}

export const subscribeToOrderUpdates = (orderId: string, callback: (data: any) => void) => {
  if (socket) {
    socket.on(`order:${orderId}:update`, callback)
  }
}

export const subscribeToStockUpdates = (productId: number, callback: (data: any) => void) => {
  if (socket) {
    socket.on(`product:${productId}:stock`, callback)
  }
}

export const subscribeToNotifications = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('notification', callback)
  }
}

export const unsubscribeFromOrderUpdates = (orderId: string) => {
  if (socket) {
    socket.off(`order:${orderId}:update`)
  }
}

export const unsubscribeFromStockUpdates = (productId: number) => {
  if (socket) {
    socket.off(`product:${productId}:stock`)
  }
}

export const unsubscribeFromNotifications = () => {
  if (socket) {
    socket.off('notification')
  }
}
