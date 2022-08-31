import { Observable, Subject, map, filter, distinctUntilChanged } from 'rxjs'

interface InEvent { button: number, on: boolean }
interface OutEvent<TNote> { note: TNote, on: boolean }

export default class Sequencer<TNote extends number> {
    data: TNote[] = []
    cursor = 0
    $output: Observable<OutEvent<TNote>>
    mapping: {[key: number]: TNote | null} = {}

    constructor($input: Observable<InEvent>) {
        this.$output = $input.pipe(
            filter(({ on, button }) => (!on !== !this.mapping[button])),
            map(this.transform),
        )
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