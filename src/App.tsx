
import { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import type { BeforeMount } from '@monaco-editor/react'
import { examples } from './examples'

import {
  Code2, Play, Moon, Sun, Download,
  Copy, RotateCcw, Terminal, Settings,
  Maximize2, Minimize2, LoaderCircle,
  CheckCircle2, XCircle, Sparkles,
  Save, Zap, Globe
} from 'lucide-react'

import Playground from './Playground'
import './App.css'

// ========================================
// 15 PROGRAMMING LANGUAGE TEMPLATES
// ========================================

const templates: Record<string, string> = {

  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!");\n    return 0;\n}',

  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!";\n    return 0;\n}',

  python: 'print("Hello, World!")',

  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',

  javascript: 'console.log("Hello, World!");',

  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',

  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',

  rust: 'fn main() {\n    println!("Hello, World!");\n}',

  php: '<?php\n    echo "Hello, World!";\n?>',

  ruby: 'puts "Hello, World!"',

  kotlin: 'fun main() {\n    println("Hello, World!")\n}',

  swift: 'print("Hello, World!")',

  typescript: 'const message: string = "Hello, World!";\nconsole.log(message);',

  lua: 'print("Hello, World!")',

  r: 'cat("Hello, World!\\n")'

}

// ========================================
// FILE EXTENSIONS
// ========================================

const extensions: Record<string, string> = {

  c: 'c',
  cpp: 'cpp',
  python: 'py',
  java: 'java',
  javascript: 'js',
  csharp: 'cs',
  go: 'go',
  rust: 'rs',
  php: 'php',
  ruby: 'rb',
  kotlin: 'kt',
  swift: 'swift',
  typescript: 'ts',
  lua: 'lua',
  r: 'r'

}

// ========================================
// LANGUAGE NAMES
// ========================================

const languageNames: Record<string, string> = {

  c: 'C Programming',
  cpp: 'C++',
  python: 'Python',
  java: 'Java',
  javascript: 'JavaScript',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  kotlin: 'Kotlin',
  swift: 'Swift',
  typescript: 'TypeScript',
  lua: 'Lua',
  r: 'R Programming'

}

// ========================================
// EXECUTION RESULT TYPE
// ========================================

type ExecutionResult = {
  output?: string
  error?: string
  compileOutput?: string
  message?: string
  status?: string
  time?: string | number
  memory?: number
}

// ========================================
// AUTO-SAVE LOADING
// ========================================

function loadSavedCodes(): Record<string, string> {

  const codes = { ...templates }

  try {

    const saved = localStorage.getItem(
      'vyron-codes-v2'
    )

    if (saved) {

      const parsed = JSON.parse(saved)

      for (const lang of Object.keys(templates)) {

        if (typeof parsed?.[lang] === 'string') {
          codes[lang] = parsed[lang]
        }

      }
    }

  } catch {
    // Use default templates if storage is unavailable.
  }

  return codes
}

// ========================================
// CRYSTAL MONACO EDITOR THEMES
// ========================================

const defineCrystalThemes: BeforeMount = monaco => {

  monaco.editor.defineTheme('vyron-dark', {

    base: 'vs-dark',
    inherit: true,

    rules: [

      {
        token: 'comment',
        foreground: '8295B5',
        fontStyle: 'italic'
      },

      {
        token: 'keyword',
        foreground: 'C4A7FF'
      },

      {
        token: 'string',
        foreground: '86EFAC'
      },

      {
        token: 'number',
        foreground: 'FBBF77'
      },

      {
        token: 'type',
        foreground: '67E8F9'
      }

    ],

    colors: {

      'editor.background': '#00000000',

      'editorGutter.background': '#00000000',

      'editor.foreground': '#EAF2FF',

      'editorLineNumber.foreground': '#7388AA',

      'editorLineNumber.activeForeground': '#67E8F9',

      'editorCursor.foreground': '#67E8F9',

      'editor.lineHighlightBackground': '#FFFFFF08',

      'editor.lineHighlightBorder': '#00000000',

      'editor.selectionBackground': '#60A5FA40',

      'editorWidget.background': '#14213D',

      'editorSuggestWidget.background': '#14213D'

    }

  })

  monaco.editor.defineTheme('vyron-light', {

    base: 'vs',
    inherit: true,

    rules: [],

    colors: {

      'editor.background': '#00000000',

      'editorGutter.background': '#00000000',

      'editor.foreground': '#172033',

      'editorLineNumber.foreground': '#64748B',

      'editorCursor.foreground': '#2563EB',

      'editor.lineHighlightBackground': '#2563EB0C'

    }

  })

}

// ========================================
// MAIN APPLICATION
// ========================================

function App() {

  const [language, setLanguage] =
    useState('c')

  const [codes, setCodes] =
    useState(loadSavedCodes)

  const [input, setInput] =
    useState('')

  const [output, setOutput] =
    useState('')

  const [dark, setDark] =
    useState(true)

  const [fontSize, setFontSize] =
    useState(16)

  const [running, setRunning] =
    useState(false)

  const [fullScreen, setFullScreen] =
    useState(false)

  const [copied, setCopied] =
    useState(false)

  const [showPlayground, setShowPlayground] =
    useState(false)

  const [status, setStatus] = useState<
    'idle' | 'running' | 'success' | 'error'
  >('idle')

  const [resultStatus, setResultStatus] =
    useState('')

  const [executionTime, setExecutionTime] =
    useState('')

  const [memory, setMemory] =
    useState('')

  const code = codes[language]

  // ========================================
  // AUTOMATIC CODE SAVING
  // ========================================

  useEffect(() => {

    try {

      localStorage.setItem(
        'vyron-codes-v2',
        JSON.stringify(codes)
      )

    } catch {
      // Continue without local storage.
    }

  }, [codes])

  // ========================================
  // EXIT FULL-SCREEN USING ESCAPE
  // ========================================

  useEffect(() => {

    function handleEscape(event: KeyboardEvent) {

      if (event.key === 'Escape') {
        setFullScreen(false)
      }

    }

    window.addEventListener(
      'keydown',
      handleEscape
    )

    return () => {

      window.removeEventListener(
        'keydown',
        handleEscape
      )

    }

  }, [])

  // ========================================
  // COPY NOTIFICATION
  // ========================================

  useEffect(() => {

    if (!copied) return

    const timer = window.setTimeout(
      () => setCopied(false),
      1800
    )

    return () =>
      window.clearTimeout(timer)

  }, [copied])

  // ========================================
  // CLEAR OUTPUT
  // ========================================

  function clearOutput() {

    setOutput('')
    setStatus('idle')
    setResultStatus('')
    setExecutionTime('')
    setMemory('')

  }

  // ========================================
  // CHANGE LANGUAGE
  // ========================================

  function changeLanguage(value: string) {

    setLanguage(value)
    setInput('')
    clearOutput()

  }

  // ========================================
  // UPDATE CODE
  // ========================================

  function updateCode(value: string) {

    setCodes(previous => ({

      ...previous,

      [language]: value

    }))

  }

  // ========================================
  // RESET CODE
  // ========================================

  function resetCode() {

    if (
      window.confirm(
        'Reset this program to its default template?'
      )
    ) {

      updateCode(templates[language])
      clearOutput()

    }

  }

  // ========================================
  // COPY SOURCE CODE
  // ========================================

  async function copyCode() {

    try {

      await navigator.clipboard.writeText(code)

      setCopied(true)

    } catch {

      window.alert('Unable to copy code.')

    }

  }

  // ========================================
  // DOWNLOAD SOURCE CODE
  // ========================================

  function downloadCode() {

    const blob = new Blob([code], {

      type: 'text/plain'

    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url

    link.download =
      `Main.${extensions[language]}`

    document.body.appendChild(link)

    link.click()

    link.remove()

    setTimeout(

      () => URL.revokeObjectURL(url),

      1000

    )

  }

  // ========================================
  // REAL COMPILER EXECUTION
  // ========================================

  async function runCode() {

    if (running) return

    clearOutput()

    if (!code.trim()) {

      setOutput('Please write some code first.')

      setStatus('error')

      return

    }

    setRunning(true)

    setStatus('running')

    setOutput(
      'Compiling and executing your program...'
    )

    try {

      const response = await fetch('/api/run', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          language,

          code,

          input

        })

      })

      const result: ExecutionResult =
        await response.json()

      if (!response.ok) {

        setOutput(
          result.error || 'Execution failed.'
        )

        setStatus('error')

        return

      }

      const finalOutput = [

        result.output,

        result.compileOutput,

        result.error,

        result.message

      ].filter(Boolean).join('\n')

      setOutput(finalOutput || 'No output')

      setResultStatus(
        result.status || 'Unknown'
      )

      setExecutionTime(

        result.time != null

          ? `${result.time} sec`

          : 'N/A'

      )

      setMemory(

        result.memory != null

          ? `${result.memory} KB`

          : 'N/A'

      )

      setStatus(

        result.status === 'Accepted'

          ? 'success'

          : 'error'

      )

    } catch {

      setOutput(
        'Unable to connect to VYRON Compiler backend.'
      )

      setStatus('error')

    } finally {

      setRunning(false)

    }

  }

  // ========================================
  // HTML PLAYGROUND
  // ========================================

  if (showPlayground) {

    return (

      <Playground

        dark={dark}

        onBack={() =>
          setShowPlayground(false)
        }

      />

    )

  }

  // ========================================
  // MAIN COMPILER USER INTERFACE
  // ========================================

  return (

    <div className={`app ${dark ? 'dark' : 'light'}`}>

      {/* Crystal Animated Background */}

      <div className="aurora aurora-one" />

      <div className="aurora aurora-two" />

      <div className="aurora aurora-three" />

      <div className="bg-grid" />

      {/* Navigation Bar */}

      <header className="navbar glass">

        <div className="brand">

          <div className="logo">

            <Code2 size={32} />

          </div>

          <div>

            <h1>

              VYRON <span>COMPILER</span>

            </h1>

            <small>

              Write. Compile. Execute.

            </small>

          </div>

          <span className="version">

            V2.1

          </span>

        </div>

        <div className="nav-actions">

          {/* HTML Playground Button */}

          <button

            onClick={() => {

              setFullScreen(false)

              setShowPlayground(true)

            }}

            disabled={running}

            title="Open HTML Playground"

          >

            <Globe size={18} />

            HTML Playground

          </button>

          {/* Dark and Light Mode */}

          <button

            className="icon-button"

            onClick={() => setDark(!dark)}

            title="Change theme"

            aria-label="Change theme"

          >

            {dark

              ? <Sun size={20} />

              : <Moon size={20} />

            }

          </button>

          {/* Font Settings */}

          <button

            className="icon-button"

            title={`Font size: ${fontSize}`}

            aria-label="Change font size"

            onClick={() =>

              setFontSize(

                fontSize >= 24

                  ? 12

                  : fontSize + 2

              )

            }

          >

            <Settings size={20} />

          </button>

        </div>

      </header>

      {/* Compiler Toolbar */}

      <div className="toolbar">

        <div className="language-area">

          {/* All 15 Programming Languages */}

          <select

            value={language}

            disabled={running}

            aria-label="Programming language"

            onChange={e =>

              changeLanguage(e.target.value)

            }

          >

            {Object.entries(languageNames).map(

              ([value, label]) => (

                <option

                  key={value}

                  value={value}

                >

                  {label}

                </option>

              )

            )}

          </select>

          <select
  value=""
  disabled={running}
  aria-label="Programming examples"
  onChange={e => {
    if (e.target.value === '') return

    const example =
      examples[language]?.[Number(e.target.value)]

    if (example) {
      if (
        code.trim() &&
        code !== example.code &&
        !window.confirm('Replace your current code?')
      ) {
        return
      }

      updateCode(example.code)
      setInput(example.input ?? '')
      clearOutput()
    }
  }}
>
  <option value="">Programming Examples</option>

  {examples[language]?.map((example, index) => (
    <option key={index} value={index}>
      {example.name}
    </option>
  ))}
</select>

          <span className="autosave">

            <Save size={14} />

            Local auto-save

          </span>

        </div>

        <div className="actions">

          {/* Copy Code */}

          <button

            className="icon-button"

            onClick={copyCode}

            title="Copy code"

            aria-label="Copy code"

          >

            {copied

              ? <CheckCircle2 size={19} />

              : <Copy size={19} />

            }

          </button>

          {/* Download Code */}

          <button

            className="icon-button"

            onClick={downloadCode}

            title="Download code"

            aria-label="Download code"

          >

            <Download size={19} />

          </button>

          {/* Reset Code */}

          <button

            className="icon-button"

            onClick={resetCode}

            disabled={running}

            title="Reset code"

            aria-label="Reset code"

          >

            <RotateCcw size={19} />

          </button>

          {/* Run Code */}

          <button

            className="run-button"

            onClick={runCode}

            disabled={running}

          >

            {running

              ? <LoaderCircle className="spin" size={19} />

              : <Play size={19} />

            }

            {running

              ? 'Running...'

              : 'Run Code'

            }

          </button>

        </div>

      </div>

      {/* Main Workspace */}

      <main className="workspace">

        {/* Monaco Editor */}

        <section className={

          `editor-panel glass ${fullScreen ? 'expanded' : ''}`

        }>

          <div className="panel-title">

            <div className="file-info">

              <Code2 size={17} />

              Main.{extensions[language]}

            </div>

            <div className="window-actions">

              <span className="window-dot red" />

              <span className="window-dot yellow" />

              <span className="window-dot green" />

              <button

                className="small-button"

                onClick={() =>

                  setFullScreen(!fullScreen)

                }

                title="Toggle full-screen editor"

                aria-label="Toggle full-screen editor"

              >

                {fullScreen

                  ? <Minimize2 size={17} />

                  : <Maximize2 size={17} />

                }

              </button>

            </div>

          </div>

          <div className="editor-container">

            <Editor

              height="100%"

              language={language}

              path={`Main.${extensions[language]}`}

              theme={

                dark ? 'vyron-dark' : 'vyron-light'

              }

              beforeMount={defineCrystalThemes}

              value={code}

              onChange={value =>

                updateCode(value ?? '')

              }

              options={{

                fontSize,

                readOnly: running,

                minimap: {
                  enabled: false
                },

                automaticLayout: true,

                wordWrap: 'on',

                padding: {
                  top: 20
                },

                scrollBeyondLastLine: false,

                smoothScrolling: true,

                cursorBlinking: 'smooth',

                cursorSmoothCaretAnimation: 'on',

                bracketPairColorization: {
                  enabled: true
                },

                fontFamily: 'Consolas, monospace',

                fontLigatures: true,

                renderLineHighlight: 'line',

                folding: true,

                lineNumbers: 'on',

                roundedSelection: true,

                tabSize: 4

              }}

            />

          </div>

        </section>

        {/* Input and Output Panels */}

        <section className="result-panel">

          {/* Standard Input */}

          <div className="input-panel glass">

            <div className="panel-title">

              <Terminal size={17} />

              Standard Input

              <span className="muted">

                stdin

              </span>

            </div>

            <textarea

              value={input}

              onChange={e =>

                setInput(e.target.value)

              }

              placeholder="Enter program input here..."

              aria-label="Standard input"

              spellCheck={false}

              disabled={running}

            />

          </div>

          {/* Output Terminal */}

          <div className="output-panel glass">

            <div className="panel-title">

              <Terminal size={18} />

              Output Terminal

              <button

                className="small-button clear-button"

                onClick={clearOutput}

                disabled={running}

              >

                Clear

              </button>

            </div>

            {/* Execution Status */}

            <div

              className={`execution-status ${status}`}

              role="status"

            >

              {status === 'idle' && (

                <>

                  <Terminal size={16} />

                  Ready to execute

                </>

              )}

              {status === 'running' && (

                <>

                  <LoaderCircle

                    size={16}

                    className="spin"

                  />

                  Executing program

                </>

              )}

              {status === 'success' && (

                <>

                  <CheckCircle2 size={16} />

                  Execution Successful

                </>

              )}

              {status === 'error' && (

                <>

                  <XCircle size={16} />

                  Execution Failed

                </>

              )}

            </div>

            {/* Actual Program Output */}

            <pre aria-live="polite">

              {output ||

                'Your program output will appear here.'

              }

            </pre>

            {/* Execution Performance */}

            {resultStatus && (

              <div className="performance">

                <div>

                  <small>Status</small>

                  <strong>{resultStatus}</strong>

                </div>

                <div>

                  <small>Time</small>

                  <strong>{executionTime}</strong>

                </div>

                <div>

                  <small>Memory</small>

                  <strong>{memory}</strong>

                </div>

              </div>

            )}

          </div>

        </section>

      </main>

      {/* Footer */}

      <footer className="glass">

        <span>

          <Sparkles size={14} />

          VYRON Compiler 2.1

        </span>

        <span>

          <span className="live-dot" />

          15 Programming Languages

        </span>

        <span>

          <Zap size={14} />

          Built for Developers

        </span>

      </footer>

    </div>

  )

}

export default App
