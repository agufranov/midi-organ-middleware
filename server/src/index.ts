import express from 'express'
import Sequencer from './Sequencer'
import MidiObserver from './MidiObserver'

const PORT = 5042

const app = express()
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`))

new MidiObserver().$output.subscribe(e => {
    console.log(e)
})