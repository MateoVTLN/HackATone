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
