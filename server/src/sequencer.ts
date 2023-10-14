import { Observable, Subject, map, filter, distinctUntilChanged } from 'rxjs'
import type { Note, Program, ControlChange } from 'easymidi'

interface InEvent { button: number | string, on: boolean }
interface OutEvent<TNote> { note: TNote, on: boolean }

export class SequencerMapper<TNote extends number> {
    $output: Observable<InEvent>

    constructor(private playEvents: Partial<MidiEvent>[], private $input: Observable<MidiEvent>) {
        this.$output = $input.pipe(
            filter(event => this.playEvents.some(template => SequencerMapper.isMatch(template, event))),
            map(e => {
                switch (e._type) {
                    case 'cc':
                        return { button: `cc${e.controller}`, on: !!e.value }
                    case 'noteon':
                    case 'noteoff':
                        return { button: `note${e.note}`, on: e._type === 'noteon' && e.velocity > 0 }
                }
            }),
            filter(Boolean)
        )
    }

    private static isMatch(template: Partial<MidiEvent>, event: MidiEvent) {
        // @ts-ignore
        return Object.keys(template).every(k => template[k] === event[k])
    }
}

export class Sequencer<TNote extends number> {
    data: TNote[] = []
    cursor = 0
    $output: Observable<OutEvent<TNote>>
    mapping: { [key: string]: TNote | null } = {}

    constructor($input: Observable<InEvent>) {
        this.$output = $input.pipe(
            filter(({ on, button }) => (!on !== !this.mapping[button])),
            map(this.transform),
        )
    }

    reset(): void {
        this.cursor = 0
        this.mapping = {}
    }

    private pickNextNote(): TNote {
        if (!this.data.length) throw new Error('No data')
        return this.data[this.cursor++ % this.data.length]
    }

    private transform = ({ button, on }: InEvent): OutEvent<TNote> => {
        const note = on ? this.pickNextNote() : this.mapping[button]!
        this.mapping[button] = on ? note : null
        return { note, on }
    }

    static test() {
        const $inEvents = new Subject<InEvent>()

        const seq = new this<number>($inEvents)
        seq.data = [1, 3, 7]

        $inEvents.pipe(distinctUntilChanged((a, b) => a.on === b.on && a.button === b.button)).subscribe(e => console.log('-->', e))
        seq.$output.subscribe(e => console.log('<--', e))

        $inEvents.next({ button: 6, on: true })
        $inEvents.next({ button: 6, on: true })
        $inEvents.next({ button: 6, on: true })
        $inEvents.next({ button: 4, on: true })
        $inEvents.next({ button: 5, on: false })
        $inEvents.next({ button: 4, on: false })
        $inEvents.next({ button: 6, on: false })
        $inEvents.next({ button: 6, on: true })
        $inEvents.next({ button: 6, on: false })
    }
}