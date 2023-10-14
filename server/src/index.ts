import DeviceObserver from './DeviceObserver'
import { Channel, getOutputs, Output, getInputs } from 'easymidi'
import { hash } from './util'
import { Sequencer, SequencerMapper } from './sequencer'
import { wss } from './server'

const playEvents: Partial<MidiEvent>[] = [
    // { note: 21 },
    // { note: 23 },
    { _type: 'cc', controller: 64 },
    { _type: 'cc', controller: 67 }
]

console.log(getOutputs())
console.log(getInputs())
const outputName = getOutputs()[0]
console.log(`Output: ${outputName}`)

const output = new Output(outputName)
console.log(output.isPortOpen())

const deviceObserver = new DeviceObserver([outputName])
deviceObserver.$connectionEvents.subscribe((event: any) => console.log('Device event', event))
deviceObserver.$midiEvents.subscribe((event: any) => {
    console.log(event)
    // console.log('X event', hash(event))
    wss.clients.forEach(c => c.send(JSON.stringify(event)))
})
// deviceObserver.$midiEvents.subscribe(console.log)

const seqMapper = new SequencerMapper(playEvents, deviceObserver.$midiEvents)
// seqMapper.$output.subscribe(console.log.bind(null, '[SeqMapper]'))

const sequencer = new Sequencer(seqMapper.$output)
sequencer.data = require('../saves/reger59.json')

const channels: { [key: string]: Channel } = {
    pedal: 0,
    haupt: 1,
    schwell: 2,
}

deviceObserver.$midiEvents.subscribe(e => {
    switch (e._type) {
        case 'noteon':
            if (e.note === 108) {
                if (e.velocity !== 0) sequencer.reset()
            } else {
                output.send('noteon', { note: e.note, velocity: e.velocity, channel: channels.haupt })
            }
            break
        // case 'noteoff':
    }
})

sequencer.$output.subscribe(e => {
    console.log('SEQ:', e)
    const midiData = { note: e.note, velocity: e.on ? 0xFF : 0, channel: channels.pedal }
    if (e.on) {
        output.send('noteon', midiData)
    } else {
        output.send('noteoff', midiData)
    }
})