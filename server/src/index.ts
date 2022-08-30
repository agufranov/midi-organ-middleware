import express from 'express'
import Sequencer from './sequencer'

const PORT = 5042

const app = express()
console.log(new Sequencer())
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`))