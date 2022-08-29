import { useEffect, useLayoutEffect, useRef } from 'react'
import logo from './logo.svg';
import './App.css';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow'


function App() {
  const ref = useRef()

  useEffect(() => {
    const renderer = new Renderer(ref.current, Renderer.Backends.SVG)
    // renderer.resize(500, 500)
    const context = renderer.getContext()
    const stave = new Stave(10, 40, 400)
    stave.addClef('treble').setContext(context).draw()
    const voice = new Voice({ num_beats: 4, beat_value: 4 })
    voice.addTickables([
      new StaveNote({ keys: ["c/4"], duration: 'q' }),
      new StaveNote({ keys: ["c/5"], duration: 'q' }),
      new StaveNote({ keys: ["c/5"], duration: 'q' }),
      new StaveNote({ keys: ["c/5"], duration: 'q' }),
    ])
    new Formatter().joinVoices([voice]).format([voice], 360)
    voice.draw(context, stave)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div ref={ref}></div>
      </header>
    </div>
  );
}

export default App;
