import express from 'express'
import http from 'http'
// @ts-ignore
import WebSocket from 'ws'

const PORT = 5042

const app = express()
const server = http.createServer(app)
server.listen(PORT, () => console.log(`Server listening on port ${PORT}...`))

export const wss = new WebSocket.Server({ server })
wss.on('connection', ws => {
    ws.on('open', () => console.log('open'))
    ws.on('message', () => console.log('message'))
    ws.send(JSON.stringify({ ok: true }))
})

const e = new EventTarget()
const s: ProxyHandler<any> = {
    set(t: any, p: any, v: any): boolean {
        // @ts-ignore
        e.dispatchEvent(new Event('change', { detail: { p, v } }))
        setTimeout(()=> wss.clients.forEach(wss => wss.send(JSON.stringify({ p, v }))),1000)
        return true
    }
}
e.addEventListener('change', console.log)
        // console.log(`Changed ${p} to ${v}`)
const o = { x : 1 }
const p = new Proxy(o, s)
p.a = 2