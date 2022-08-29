import express from 'express'
import { Input, Output, getInputs, getOutputs } from 'easymidi'
import EventEmitter from 'events'
import { omit } from 'ramda'
import Recorder from './recorder.js'
import { match } from './util.js'

const PORT = 6833
const app = express()

app.listen(PORT)

app.get('/test', (req, res) => res.json({ ok: true }))

const virtualInputs = ['organ.pedal', 'organ.haupt', 'organ.schwell', 'organ.positiv']
const CONTROLLER = 'minilogue 1 KBD/KNOB'
const MAIN = 'Portable Grand'

const skipMessageTypes = ['clock', 'activesense']

const events = new EventEmitter()
console.log(getInputs())
const inputs = getInputs().filter(input => !virtualInputs.includes(input)).map(name => new Input(name))
inputs.forEach(input => input.on('message', msg => !skipMessageTypes.includes(msg._type) &&  events.emit('message', { ...omit(['_type'])(msg), type: msg._type, device: input.name })))

let isRecording = false
const recorder = new Recorder()
recorder.loadFile('saves/reger59.json')
console.log(recorder.data)
const p = {}
const pedal = new Output('organ.pedal')
const haupt = new Output('organ.haupt')
const positiv = new Output('organ.positiv')

const handlePlayKeys = (on, key) => {
    if (recorder.data.length) {
        console.log(on, key)
        if (on) {
            if (!p[key]) {
                p[key] = recorder.getNextNote()
                console.log(p[key])
                pedal.send('noteon', { note: p[key], velocity: 0x7F })
            }
        } else {
            pedal.send('noteoff', { note: p[key], velocity: 0x7F })
            delete p[key]
        }
    }
}

events.on('message', (event) => {
    const { device, type, note, velocity, controller, value, channel, number, ...data } = event
    console.log(event)
    if (match({ device: CONTROLLER }, event)) {
        if (match({ type: 'cc', controller: 88 }, event)) {
            if (value === 0x7F) {
                isRecording = true
                recorder.reset()
                console.log('rec')
            } else {
                isRecording = false
                console.log('stop rec', recorder.data)
                recorder.saveFile('saves/x.json')
            }
        // } else if (match({ type: ['noteon', 'noteoff'], note: [59, 60] }, event)) {
        //     handlePlayKeys(type === 'noteon', note)
        // } else if (match({ type: ['noteon', 'noteoff'], note: [58] }, event)) {
        //     recorder.rewind()
        } else if (match({ type: ['noteon', 'noteoff'] }, event)) {
            // haupt.send(type, event)
            if (type === 'noteon' && isRecording) {
                recorder.push(note)
            }
        }
    } else if (match({ device: MAIN }, event)) {
        if (match({ type: 'cc', channel: 0, controller: [64, 67] }, event)) {
            handlePlayKeys(value > 0, controller)
        } else if (match({ type: ['noteon', 'noteoff'], note: 108}, event)) {
            recorder.rewind()
        } else if (match({ type: ['noteon', 'noteoff']}, event)) {
            const isHaupt = event.note < 60
            const manual = isHaupt ? haupt : positiv
            haupt.send(type, { ...event, channel: isHaupt ? 0 : 1, note: event.note + (isHaupt ? 24 : -12) })
        }
    }
})