import { useState, useEffect, useRef } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow'
import logo from './logo.svg';
import styles from './App.module.css';
import { webSocket } from 'rxjs/webSocket'

function App() {
  const ref = useRef()

  const [messages, setMessages] = useState([])

  useEffect(() => {
    console.log(1)
    const ws = webSocket('ws://localhost:5042')
    ws.subscribe(msg => setMessages(messages => ([...messages, msg])))
    const renderer = new Renderer(ref.current, Renderer.Backends.SVG)
    // renderer.resize(500, 500)
    const context = renderer.getContext()
    const stave = new Stave(10, 40, 400)
    stave.addClef('bass').setContext(context).draw()
    const voice = new Voice({ num_beats: 4 })
    voice.addTickables([
      new StaveNote({ keys: ["c/3"], duration: 'q' }),
      new StaveNote({ keys: ["c/5"], duration: 'q' }),
      new StaveNote({ keys: ["c/5"], duration: 'q' }),
      new StaveNote({ keys: ["c/5"], duration: 'q' }),
    ])
    new Formatter().joinVoices([voice]).format([voice], 360)
    voice.draw(context, stave)
    return () => console.log(3)
  }, [])

  // useEffect(() => alert(2), [])

  return (
    <div>
      <div ref={ref} className={styles.messages}>
        <div className={styles.messagesShadow}></div>
        {messages.map((message, i) => <div key={i}>#{i} {JSON.stringify(message)}</div>)}
      </div>
    </div>
  )
}

export default App;
