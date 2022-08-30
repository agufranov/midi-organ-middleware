import { readFileSync, writeFileSync } from 'fs'

export default class Recorder {
    data = []
    cursor = 0
    
    push(note) {
        this.data.push(note)
    }

    rewind() {
        this.cursor = 0
    }

    reset() {
        this.data = []
        this.rewind()
    }

    getNextNote() {
        const note = this.data[this.cursor]
        this.cursor = (this.cursor + 1) % this.data.length
        return note
    }

    loadFile(filename) {
        this.data = JSON.parse(readFileSync(filename))
        this.rewind()
    }

    saveFile(filename) {
        writeFileSync(filename, JSON.stringify(this.data))
        this.rewind()
    }
}