function specificHash(event: MidiEvent): string[] {
    switch(event._type) {
        case 'noteon':
        case 'noteoff':
            return [`n${event.note}`]
        case 'cc':
            return [`c${event.controller}`, `v${event.value}`]
        case 'program':
            return [`${event.number}`]
        default: throw new Error('Not implemented')
    }
}

export function hash(event: MidiEvent): string {
    // TODO handle velocity 0 (DGX)
    return [event._type, event.device, ...specificHash(event)].join(' | ')
}

function diff<T>(arr1: T[], arr2: T[]) {
    return arr1.filter(x => !arr2.includes(x))
}

export function symDiff<T>(arr1: T[], arr2: T[]) {
    return {
        added: diff(arr2, arr1),
        removed: diff(arr1, arr2)
    }
}

export function equal<T>(arr1: T[], arr2: T[]) {
    // stub
    return arr1.length === arr2.length
}