const EventEmitter = require('events')
const buffer = require('b4a')

const { Protocol } = require('./protocol')

class ServerProxy extends EventEmitter {
  constructor (dht, socket, protocol, keyPair) {
    super()

    this._dht = dht
    this._socket = socket
    this._protocol = protocol || new Protocol(socket)
    this._keyPair = keyPair

    this._server = dht.createServer()
    this._connections = new Map()

    this._onClose = onClose.bind(this)
    this._onListening = onListening.bind(this)
    this._onConnection = onConnection.bind(this)
    this._onData = onData.bind(this)
    this._onDestroy = onDestroy.bind(this)
    this._onServerClose = onServerClose.bind(this)

    this._server
      .on('close', this._onClose)
      .on('listening', this._onListening)
      .on('connection', this._onConnection)
      .listen(this._keyPair)

    this._protocol
      .on('data', this._onData)
      .on('destroy', this._onDestroy)
      .on('close', this._onServerClose)
  }

  async close () {
    await this._server.close()
  }
}

module.exports = {
  ServerProxy
}

async function onClose () {
  await this._protocol.closed(this._keyPair)

  this._server
    .off('close', this._onClose)
    .off('listening', this._onListening)
    .off('connection', this._onConnection)

  this._protocol
    .off('data', this._onData)
    .off('destroy', this._onDestroy)
    .off('close', this._onServerClose)

  for (const socket of this._connections.values()) socket.destroy()

  this.emit('close')
}

async function onListening () {
  await this._protocol.listening(this._server.address())
}

async function onConnection (socket) {
  const key = socket.publicKey.toString('hex')

  if (this._connections.has(key)) return socket.destroy()

  this._connections.set(key, socket)

  const onError = async (err) => {
    await this._protocol.error(err)
  }

  const onClose = async () => {
    socket
      .off('error', onError)
      .off('close', onClose)
      .off('data', onData)

    this._connections.delete(key)

    await this._protocol.destroy(socket)
  }

  const onData = async (data) => {
    await this._protocol.data({ publicKey: socket.publicKey, data })
  }

  socket
    .on('error', onError)
    .on('close', onClose)
    .on('data', onData)

  await this._protocol.connection(socket)
}

function onDestroy (message) {
  const socket = this._connections.get(
    message.publicKey.toString('hex')
  )

  if (socket) socket.destroy()
}

function onData (message) {
  const socket = this._connections.get(
    message.publicKey.toString('hex')
  )

  if (socket) socket.write(message.data)
}

async function onServerClose (message) {
  if (buffer.equals(message.publicKey, this._keyPair.publicKey)) {
    await this.close()
  }
}