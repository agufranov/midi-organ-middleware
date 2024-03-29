import usbDetect from 'usb-detection'
import { debounceTime, mergeAll, Observable, ReplaySubject, Subject } from 'rxjs'
import { getInputs, getOutputs, Input } from 'easymidi'
import { symDiff } from './util'

const enum DeviceEventType {
    ADDED = 'ADDED',
    REMOVED = 'REMOVED'
}

type DeviceEvent = {
    type: DeviceEventType,
    name: string
}

const HEARTBEAT_TIMEOUT = 500
const USB_ADD_DELAY = 500

export default class DeviceObserver {
    private devices: {
        [name: string]: boolean
    } = {}

    private $connectionEventsSubject = new ReplaySubject<DeviceEvent>()
    $connectionEvents = this.$connectionEventsSubject.asObservable()
    private $midiObservables = new ReplaySubject<Observable<MidiEvent>>()
    $midiEvents = this.$midiObservables.pipe(mergeAll())

    constructor(private excludedInputs: string[]) {
        this.getFilteredInputs().filter(inputName => !excludedInputs.includes(inputName)).map(this.addInput)
        usbDetect.startMonitoring()
        usbDetect.on('changed', (...e) => console.log('changed', ...e))
        usbDetect.on('add', (device: { deviceName: string }) => {
            console.log('Device detected', device.deviceName)
            setTimeout(this.refresh, USB_ADD_DELAY) // 'changed' will also track removed devices
        })
    }

    private getFilteredInputs  =() => getInputs().filter(inputName => !this.excludedInputs.includes(inputName))

    private addInput = (name: string) => {
        const input = new Input(name)

        if (!input.isPortOpen()) {
            console.error(`Input ${name} is not opened`)
            return
        }

        this.$connectionEventsSubject.next({ type: DeviceEventType.ADDED, name })

        const $heartbeat = new Observable<void>(subscriber => {
            input.on('clock', () => subscriber.next()).on('activesense', () => subscriber.next())
        })
        $heartbeat.pipe(debounceTime(HEARTBEAT_TIMEOUT)).subscribe(() => {
            input.close()
            this.removeInput(name)
        })

        const $controls = new Observable<MidiEvent>(subscriber => {
            const handler = (event: Omit<MidiDeviceEvent, '_type'>) => subscriber.next({ ...<MidiDeviceEvent>event, device: input.name })
            input.on('noteon', handler).on('noteoff', handler).on('program', handler).on('cc', handler)
        })
        this.$midiObservables.next($controls)

        this.devices[name] = true
    }

    private removeInput = (name: string) => {
        if (!this.devices[name]) return
        this.$connectionEventsSubject.next({ type: DeviceEventType.REMOVED, name })
        delete this.devices[name]
    }

    private refresh = () => {
        const newDevices = this.getFilteredInputs()
        const diff = symDiff(Object.keys(this.devices), newDevices)
        diff.removed.forEach(this.removeInput)
        diff.added.forEach(this.addInput)
    }
}