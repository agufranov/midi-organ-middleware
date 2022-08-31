import { Observable, Subject, merge } from 'rxjs'
import { Input, Output, getInputs, getOutputs } from 'easymidi'
import type { Note, Program, ControlChange } from 'easymidi'

type MidiEventType = 'noteon' | 'noteoff' | 'cc' | 'program'
type Typed<S extends MidiEventType, T> = T & {
    _type: S
}
type MidiDeviceEvent = Typed<'noteon' | 'noteoff', Note> | Typed<'program', Program> | Typed<'cc', ControlChange>
type MidiEvent = MidiDeviceEvent & { device: string }

export default class MidiObserver {
    $output: Observable<MidiEvent>

    constructor() {
        const $inputs = getInputs().map(name => new Input(name)).map(MidiObserver.inputToObservable)

        this.$output = new Subject()
        this.$output = merge(...$inputs)
    }

    private static inputToObservable(input: Input): Observable<MidiEvent> {
        return new Observable<MidiEvent>(subscriber => {
            const h = (event: Omit<MidiDeviceEvent, '_type'>) => {
                subscriber.next({ ...<MidiDeviceEvent>event, device: input.name })
            }
            input.on('noteon', h).on('noteoff', h).on('cc', h).on('program', h)
        })
    }
}