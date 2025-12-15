// Servidor customizado com Socket.io para chat em tempo real
// Execute com: node server.js

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Configurar Socket.io
  const io = new Server(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Gerenciamento de conexões
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`)

    // Entrar em uma sala de negociação
    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`👥 Socket ${socket.id} entrou na sala: ${roomId}`)
    })

    // Sair de uma sala
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId)
      console.log(`👋 Socket ${socket.id} saiu da sala: ${roomId}`)
    })

    // Enviar mensagem para a sala
    socket.on('send-message', ({ roomId, message }) => {
      // Envia para todos na sala, exceto o remetente
      socket.to(roomId).emit('new-message', message)
      console.log(`💬 Mensagem enviada na sala ${roomId}`)
    })

    // Digitando...
    socket.on('typing', ({ roomId, userName }) => {
      socket.to(roomId).emit('user-typing', { userName })
    })

    // Parou de digitar
    socket.on('stop-typing', ({ roomId }) => {
      socket.to(roomId).emit('user-stop-typing')
    })

    // Desconexão
    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`)
    })
  })

  httpServer.listen(port, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   🚗 AutoPier - Servidor Iniciado                 ║
    ║                                                   ║
    ║   Local:   http://${hostname}:${port}                   ║
    ║   Socket:  Conectado ✓                            ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
    `)
  })
})

