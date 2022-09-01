import express from 'express'
import http from 'http'
// @ts-ignore
import WebSocket from 'ws'
// @ts-ignore
import DeviceObserver from './DeviceObserver'
import { hash } from './util'

const PORT = 5042

const app = express()
const server = http.createServer(app)
server.listen(PORT, () => console.log(`Server listening on port ${PORT}...`))

const wss = new WebSocket.Server({ server })
wss.on('connection', ws => {
    ws.on('open', () => console.log('open'))
    ws.on('message', () => console.log('message'))
    ws.send(JSON.stringify({ ok: true }))
})

const deviceObserver = new DeviceObserver()
deviceObserver.$connectionEvents.subscribe((event: any) => console.log('Device event', event))
deviceObserver.$midiEvents.subscribe((event: any) => {
    console.log('X event', hash(event))
    wss.clients.forEach(c => c.send(JSON.stringify(event)))
})