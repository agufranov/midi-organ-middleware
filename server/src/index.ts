import express from 'express'
import DeviceObserver from './DeviceObserver'

const PORT = 5042

const app = express()
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`))

const deviceObserver = new DeviceObserver()
deviceObserver.$deviceEvents.subscribe(event => console.log('Device event', event))
deviceObserver.$midiEvents.subscribe(event => console.log('X event', event))