const { fixed, fixed32, fixed64, string, buffer, array, raw, none } = require('compact-encoding')
const { ipv4Address } = require('compact-encoding-net')

const publicKey = fixed32

const secretKey = fixed64

const keyPair = {
  preencode (state, message) {
    publicKey.preencode(state, message.publicKey)
    secretKey.preencode(state, message.secretKey)
  },
  encode (state, message) {
    publicKey.encode(state, message.publicKey)
    secretKey.encode(state, message.secretKey)
  },
  decode (state) {
    return {
      publicKey: publicKey.decode(state),
      secretKey: secretKey.decode(state)
    }
  }
}

const topic = fixed32

const handshake = message(0, 'handshake', keyPair)

const error = message(1, 'error', {
  preencode (state, message) {
    string.preencode(state, message.message)
  },
  encode (state, message) {
    string.encode(state, message.message)
  },
  decode (state) {
    return new Error(string.decode(state))
  }
})

const ping = message(2, 'ping')

const pong = message(3, 'pong')

const id = fixed(4)

const socket = id

const connect = message(4, 'connect', {
  preencode (state, message) {
    socket.preencode(state, message.socket)
    keyPair.preencode(state, message)
    publicKey.preencode(state, message.remotePublicKey)
  },
  encode (state, message) {
    socket.encode(state, message.socket)
    keyPair.encode(state, message)
    publicKey.encode(state, message.remotePublicKey)
  },
  decode (state) {
    return {
      socket: socket.decode(state),
      ...keyPair.decode(state),
      remotePublicKey: publicKey.decode(state)
    }
  }
})

const connection = message(5, 'connection', {
  preencode (state, message) {
    socket.preencode(state, message.socket)
    publicKey.preencode(state, message.publicKey)
    publicKey.preencode(state, message.remotePublicKey)
    fixed64.preencode(state, message.handshakeHash)
  },
  encode (state, message) {
    socket.encode(state, message.socket)
    publicKey.encode(state, message.publicKey)
    publicKey.encode(state, message.remotePublicKey)
    fixed64.encode(state, message.handshakeHash)
  },
  decode (state) {
    return {
      socket: socket.decode(state),
      publicKey: publicKey.decode(state),
      remotePublicKey: publicKey.decode(state),
      handshakeHash: fixed64.decode(state)
    }
  }
})

const destroy = message(6, 'destroy', {
  preencode (state, message) {
    socket.preencode(state, message.socket)
    publicKey.preencode(state, message.publicKey)
  },
  encode (state, message) {
    socket.encode(state, message.socket)
    publicKey.encode(state, message.publicKey)
  },
  decode (state) {
    return {
      socket: socket.decode(state),
      publicKey: publicKey.decode(state)
    }
  }
})

const listen = message(7, 'listen', keyPair)

const listening = message(8, 'listening', {
  preencode (state, message) {
    publicKey.preencode(state, message.publicKey)
    ipv4Address.preencode(state, message)
  },
  encode (state, message) {
    publicKey.encode(state, message.publicKey)
    ipv4Address.encode(state, message)
  },
  decode (state) {
    return {
      publicKey: publicKey.decode(state),
      ...ipv4Address.decode(state)
    }
  }
})

const close = message(9, 'close', {
  preencode (state, message) {
    publicKey.preencode(state, message.publicKey)
  },
  encode (state, message) {
    publicKey.encode(state, message.publicKey)
  },
  decode (state) {
    return {
      publicKey: publicKey.decode(state)
    }
  }
})

const closed = message(10, 'closed', close)

const batch = array(buffer)

const data = message(11, 'data', {
  preencode (state, message) {
    socket.preencode(state, message.socket)
    publicKey.preencode(state, message.publicKey)
    batch.preencode(state, message.data)
  },
  encode (state, message) {
    socket.encode(state, message.socket)
    publicKey.encode(state, message.publicKey)
    batch.encode(state, message.data)
  },
  decode (state) {
    return {
      socket: socket.decode(state),
      publicKey: publicKey.decode(state),
      data: batch.decode(state)
    }
  }
})

const query = {
  preencode (state, message) {
    id.preencode(state, message.id)
  },
  encode (state, message) {
    id.encode(state, message.id)
  },
  decode (state) {
    return {
      id: id.decode(state)
    }
  }
}

const result = message(12, 'result', {
  preencode (state, message) {
    query.preencode(state, message)
    raw.preencode(state, message.data)
  },
  encode (state, message) {
    query.encode(state, message)
    raw.encode(state, message.data)
  },
  decode (state) {
    return {
      ...query.decode(state),
      data: raw.decode(state)
    }
  }
})

const finished = message(13, 'finished', query)

const lookup = message(14, 'lookup', {
  preencode (state, message) {
    query.preencode(state, message)
    topic.preencode(state, message.topic)
  },
  encode (state, message) {
    query.encode(state, message)
    topic.encode(state, message.topic)
  },
  decode (state) {
    return {
      ...query.decode(state),
      topic: topic.decode(state)
    }
  }
})

const announce = message(15, 'announce', {
  preencode (state, message) {
    query.preencode(state, message)
    topic.preencode(state, message.topic)
    keyPair.preencode(state, message.keyPair)
  },
  encode (state, message) {
    query.encode(state, message)
    topic.encode(state, message.topic)
    keyPair.encode(state, message.keyPair)
  },
  decode (state) {
    return {
      ...query.decode(state),
      topic: topic.decode(state),
      keyPair: keyPair.decode(state)
    }
  }
})

const unannounce = message(16, 'unannounce', announce)

const node = {
  preencode (state, message) {
    buffer.preencode(state, message.id)
    ipv4Address.preencode(state, message)
  },
  encode (state, message) {
    buffer.encode(state, message.id)
    ipv4Address.encode(state, message)
  },
  decode (state) {
    return {
      id: buffer.decode(state),
      ...ipv4Address.decode(state)
    }
  }
}

const relayAddresses = array(ipv4Address)

const peer = {
  preencode (state, message) {
    publicKey.preencode(state, message.publicKey)
    relayAddresses.preencode(state, message.relayAddresses)
  },
  encode (state, message) {
    publicKey.encode(state, message.publicKey)
    relayAddresses.encode(state, message.relayAddresses)
  },
  decode (state) {
    return {
      publicKey: publicKey.decode(state),
      relayAddresses: relayAddresses.decode(state)
    }
  }
}

const peers = array(peer)

const announcers = {
  preencode (state, message) {
    fixed32.preencode(state, message.token)
    node.preencode(state, message.from)
    node.preencode(state, message.to)
    peers.preencode(state, message.peers)
  },
  encode (state, message) {
    fixed32.encode(state, message.token)
    node.encode(state, message.from)
    node.encode(state, message.to)
    peers.encode(state, message.peers)
  },
  decode (state) {
    return {
      token: fixed32.decode(state),
      from: node.decode(state),
      to: node.decode(state),
      peers: peers.decode(state)
    }
  }
}

const sign = message(17, 'sign', {
  preencode (state, message) {
    id.preencode(state, message.id)
    publicKey.preencode(state, message.publicKey)
    buffer.preencode(state, message.data)
  },
  encode (state, message) {
    id.encode(state, message.id)
    publicKey.encode(state, message.publicKey)
    buffer.encode(state, message.data)
  },
  decode (state) {
    return {
      id: id.decode(state),
      publicKey: publicKey.decode(state),
      data: buffer.decode(state)
    }
  }
})

const signature = message(18, 'signature', {
  preencode (state, message) {
    id.preencode(state, message.id)
    buffer.preencode(state, message.signature)
  },
  encode (state, message) {
    id.encode(state, message.id)
    buffer.encode(state, message.signature)
  },
  decode (state) {
    return {
      id: id.decode(state),
      signature: buffer.decode(state)
    }
  }
})

module.exports = {
  handshake,
  error,
  ping,
  pong,
  connect,
  connection,
  destroy,
  listen,
  listening,
  close,
  closed,
  data,
  query,
  result,
  finished,
  lookup,
  announce,
  unannounce,
  announcers,
  sign,
  signature
}

function message (type, name, encoding = none) {
  return { ...encoding, type, name }
}
