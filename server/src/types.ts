import type { Note, Program, ControlChange } from 'easymidi'

declare global {
    type MidiEventType = 'noteon' | 'noteoff' | 'cc' | 'program' | 'clock' | 'activesense'
    type Typed<S extends MidiEventType, T> = T & {
        _type: S
    }
    type MidiDeviceEvent = Typed<'noteon' | 'noteoff', Note> | Typed<'program', Program> | Typed<'cc', ControlChange>
    type MidiEvent = MidiDeviceEvent & { device: string }

    interface ISequencer {
    }
}