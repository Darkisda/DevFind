const socketio = require('socket.io')

const parseStringAsArray = require('./utils/parseStringAsArray')
const calculateDistance = require('./utils/calculateDistance')

const connections = []
let io

module.exports.setupWebsocket = (server) => {
  io = socketio(server) 
  
  io.on('connection', socket => {
    const {
      latitude,
      longitude,
      techs
    } = socket.handshake.query 

    connections.push({
      id: socket.id,
      coordinates: {
        
        latitude: Number(latitude),
        longitude: Number(longitude)
      },
      techs: parseStringAsArray(techs)
    })
  })
}

module.exports.findConnections = (coordinates, techs) => {
  return connections.filter(connection => {
    return calculateDistance(coordinates, connection.coordinates) < 20
      &&
      connection.techs.some(item => techs.includes(item))
  })
}

module.exports.sendMessage = (to, messageType, data) => {
  to.forEach(connection => {
    io.to(connection.id).emit(messageType, data);
  })
}