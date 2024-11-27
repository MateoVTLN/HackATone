<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tone.js Playground</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.2/ace.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            padding: 2rem;
            background: #f5f5f5;
            max-width: 1200px;
            margin: 0 auto;
        }

        h1 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 2rem;
            color: #1a1a1a;
        }

        #editor-container {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
            padding: 1rem;
        }

        #editor { 
            width: 100%;
            height: 400px;
            border-radius: 4px;
            font-size: 14px;
            border: 1px solid #ddd;
        }

        .controls {
            display: flex;
            gap: 0.5rem;
            margin: 1rem 0;
        }

        button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        #runBtn {
            background: #4CAF50;
            color: white;
        }

        #runBtn:hover {
            background: #45a049;
        }

        #stopBtn {
            background: #f44336;
            color: white;
        }

        #stopBtn:hover {
            background: #d32f2f;
        }

        #status {
            padding: 0.5rem;
            border-radius: 4px;
            display: none;
            font-size: 0.9rem;
        }

        .error {
            background: #ffebee;
            color: #c62828;
            padding: 0.5rem;
            border-radius: 4px;
            margin-top: 0.5rem;
            display: none;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <h1>tone.js playground</h1>
    <div id="editor-container">
        <div id="editor">//my code goes heree;
            // optional effects
const distortion = new Tone.Distortion(4.8).toDestination();
const delay = new Tone.Delay(0.25).toDestination();

// define my synths
const synth = new Tone.Synth({
    oscillator : {type: "sine"}}).connect(delay);

const synth2 = new Tone.Synth({
    oscillator : {type: "triangle"},
    volume : +3 
}).toDestination().connect(distortion);    
    
/*setInterval(() => {
    synth.triggerAttackRelease("C4", "4n");
}, 1000)
*/
Tone.Transport.bpm.value = 200;
const melody = ["C4", "D4", "E4", "C4"];
const harmonics = ["A3", "B3", "E4", "A3"];

let index = 0;

Tone.Transport.scheduleRepeat((time) => {
    synth.triggerAttackRelease(melody[index], "4n", time);
    synth2.triggerAttackRelease(harmonics[index], "4n", time);
    index = (index + 1) % melody.length ;
}, "2n")

Tone.Transport.start("+0.5")

        </div>
        <div class="controls">
            <button id="runBtn">▶ Run</button>
            <button id="stopBtn">⏹ Stop</button>
        </div>
        <div id="status"></div>
        <div id="error" class="error"></div>
    </div>

    <script>
        // Initialize Ace editor
        const editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/javascript");
        editor.setOptions({
            fontSize: "14px",
            showPrintMargin: false,
            showGutter: true,
            highlightActiveLine: true,
            wrap: true,
        });

        // Elements
        const runBtn = document.getElementById('runBtn');
        const stopBtn = document.getElementById('stopBtn');
        const status = document.getElementById('status');
        const error = document.getElementById('error');

        // Variable to keep track of the current synthesizer
        let currentSynth = null;

        // Run code
        async function runCode() {
             // Clear any previous error messages and show status
            try {
                error.style.display = 'none';
                status.style.display = 'block';
                status.textContent = 'Starting audio context...';

                // !!! Browsers will not play any audio until a user clicks something (like a play button). 
                // Run your Tone.js code only after calling Tone.start() from a event listener 
                // which is triggered by a user action such as “click” or “keydown”.
                // Initialize Tone.js audio context
                await Tone.start();
                
                // Get code from editor
                const code = editor.getValue();
                
                status.textContent = 'Playing...';
    
                // This line is crucial - it modifies the user's code to store the synth
                // It replaces 'new Tone.Synth()' with 'currentSynth = new Tone.Synth()'
                // This allows the stop function to access and dispose of the synth later
                const oldSynth = code.replace('new Tone.Synth()', 'currentSynth = new Tone.Synth()');
                // Run the code
                eval(oldSynth);
                
            } catch (err) {
                error.style.display = 'block';
                error.textContent = `Error: ${err.message}`;
                stopCode();
            }
        }

        // Stop code
        function stopCode() {
            try {
                // Stop transport and cancel scheduled events
                Tone.Transport.stop();
                Tone.Transport.cancel();
                
               // If there's an active synthesizer:
                if (currentSynth) {
                    try {
                        // Release any currently playing notes
                        currentSynth.triggerRelease();
                        // Wait a brief moment (200ms) to ensure that any notes have fully stopped; then:
                        setTimeout(() => {
                            currentSynth.dispose(); // Clean up the synth's resources
                            currentSynth = null;  // Remove the reference to the synth
                        }, 200);
                    } catch (e) {
                        console.log('Error disposing synth:', e);
                    }
                }
                
                status.style.display = 'none';
                
            } catch (err) {
                error.style.display = 'block';
                error.textContent = `Error while stopping: ${err.message}`;
            }
        }

        // Event listeners
        runBtn.addEventListener('click', runCode);
        stopBtn.addEventListener('click', stopCode);
        
    </script>
</body>
</html>