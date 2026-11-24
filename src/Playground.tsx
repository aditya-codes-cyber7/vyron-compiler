
import { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import {
  ArrowLeft, Code2, Play, RotateCcw,
  Monitor, Save, Globe
} from 'lucide-react'

type Files = {
  html: string
  css: string
  javascript: string
}

const templates: Files = {
  html: `<div class="card">
  <h1>Hello VYRON!</h1>
  <p>My first website</p>
  <button id="demo">Click Me</button>
  <p id="message"></p>
</div>`,

  css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Arial, sans-serif;
  background: linear-gradient(
    135deg, #0f172a, #312e81
  );
  color: white;
}

.card {
  text-align: center;
  padding: 40px;
  border-radius: 24px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(20px);
}

h1 {
  color: #67e8f9;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: #6366f1;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #8b5cf6;
}`,

  javascript: `document
  .getElementById("demo")
  .addEventListener("click", function () {
    document.getElementById("message")
      .textContent = "Welcome to VYRON!";
  });`
}

function loadFiles(): Files {
  try {
    const saved = JSON.parse(
      localStorage.getItem('vyron-playground') || '{}'
    )

    return {
      html: typeof saved?.html === 'string'
        ? saved.html : templates.html,
      css: typeof saved?.css === 'string'
        ? saved.css : templates.css,
      javascript: typeof saved?.javascript === 'string'
        ? saved.javascript : templates.javascript
    }
  } catch {
    return { ...templates }
  }
}

function createPreview(files: Files) {
  const data = JSON.stringify(files)
    .replace(/</g, '\\u003c')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none';
      script-src 'unsafe-inline';
      style-src 'unsafe-inline';
      img-src data: blob:;
      base-uri 'none';
      form-action 'none';">
<title>VYRON Preview</title>
</head>
<body>
<script>
  const files = ${data};

  const style = document.createElement('style');
  style.textContent = files.css;
  document.head.appendChild(style);

  const content = document.createElement('div');
  content.innerHTML = files.html;

  while (content.firstChild) {
    document.body.appendChild(content.firstChild);
  }

  const script = document.createElement('script');
  script.textContent = files.javascript;
  document.body.appendChild(script);
</script>
</body>
</html>`
}

type Props = {
  onBack: () => void
  dark: boolean
}

export default function Playground({
  onBack,
  dark
}: Props) {

  const [tab, setTab] =
    useState<keyof Files>('html')

  const [files, setFiles] = useState(loadFiles)

  const [preview, setPreview] = useState(
    () => createPreview(files)
  )

  const [revision, setRevision] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem(
        'vyron-playground',
        JSON.stringify(files)
      )
    } catch {
      // Continue without local storage.
    }
  }, [files])

  function runPreview() {
    setPreview(createPreview(files))
    setRevision(previous => previous + 1)
  }

  function resetPlayground() {
    if (!window.confirm('Reset all playground files?')) {
      return
    }

    setFiles({ ...templates })
    setPreview(createPreview(templates))
    setRevision(previous => previous + 1)
  }

  return (
    <div className={`app playground ${dark ? 'dark' : 'light'}`}>

      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />
      <div className="bg-grid" />

      <header className="navbar glass">

        <div className="brand">

          <div className="logo">
            <Globe size={28} />
          </div>

          <div>
            <h1>VYRON <span>PLAYGROUND</span></h1>
            <small>Design. Develop. Preview.</small>
          </div>

        </div>

        <button onClick={onBack}>
          <ArrowLeft size={18} />
          Compiler
        </button>

      </header>

      <div className="toolbar">

        <div className="autosave">
          <Save size={16} />
          Local auto-save
        </div>

        <div className="actions">

          <button
            onClick={resetPlayground}
            title="Reset playground"
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            className="run-button"
            onClick={runPreview}
          >
            <Play size={18} />
            Run Preview
          </button>

        </div>

      </div>

      <main className="workspace playground-workspace">

        <section className="editor-panel glass">

          <div className="playground-tabs">

            <button
              className={`html-tab ${tab === 'html' ? 'active' : ''}`}
              onClick={() => setTab('html')}
            >
              HTML
            </button>

            <button
              className={`css-tab ${tab === 'css' ? 'active' : ''}`}
              onClick={() => setTab('css')}
            >
              CSS
            </button>

            <button
              className={`js-tab ${tab === 'javascript' ? 'active' : ''}`}
              onClick={() => setTab('javascript')}
            >
              JavaScript
            </button>

          </div>

          <div className="panel-title">

            <Code2 size={17} />

            {tab === 'html'
              ? 'index.html'
              : tab === 'css'
                ? 'style.css'
                : 'script.js'}

          </div>

          <div className="editor-container">

            <Editor
              height="100%"
              language={tab}
              theme={dark ? 'vs-dark' : 'light'}
              path={tab === 'html'
                ? 'index.html'
                : tab === 'css'
                  ? 'style.css'
                  : 'script.js'}
              value={files[tab]}
              onChange={value =>
                setFiles(previous => ({
                  ...previous,
                  [tab]: value ?? ''
                }))
              }
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 2,
                padding: { top: 18 },
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                cursorBlinking: 'smooth'
              }}
            />

          </div>

        </section>

        <section className="preview-panel glass">

          <div className="panel-title">
            <Monitor size={18} />
            Live Website Preview

            <span className="preview-live">
              Preview
            </span>
          </div>

          <iframe
            key={revision}
            title="Website preview"
            srcDoc={preview}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            className="website-preview"
          />

        </section>

      </main>

      <footer className="glass">
        <span>VYRON Playground v1.0</span>
        <span>HTML • CSS • JavaScript</span>
        <span>Built for Developers</span>
      </footer>

    </div>
  )
}
