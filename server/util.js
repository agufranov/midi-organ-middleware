export const match = (pattern, event) => {
    for(let key in pattern) {
        if (!event.hasOwnProperty(key)) return false
        const value = pattern[key]
        if (!Array.isArray(value)) {
            if (typeof value !== 'object') {
                if (event[key] !== value) return false
            } else {
                return match(value, event[key])
            }
        } else {
            if (!value.includes(event[key])) return false
        }
    }
    return true
}