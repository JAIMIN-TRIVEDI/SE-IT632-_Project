const subscribers = new Set()

export const emitToast = (payload) => {
  subscribers.forEach((callback) => callback(payload))
}

export const subscribeToast = (callback) => {
  subscribers.add(callback)
  return () => {
    subscribers.delete(callback)
  }
}
