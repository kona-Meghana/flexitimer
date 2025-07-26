document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const millisecondsElement = document.getElementById('milliseconds');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');

    // Variables for stopwatch
    let startTime;
    let elapsedTime = 0;
    let timerInterval;
    let isRunning = false;
    let recognition;
    let isVoiceControlActive = false;

    // Initialize speech recognition
    function initSpeechRecognition() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
                voiceStatus.textContent = 'Listening for commands...';
                voiceStatus.classList.add('listening');
                isVoiceControlActive = true;
            };

            recognition.onend = function() {
                if (isVoiceControlActive) {
                    recognition.start();
                } else {
                    voiceStatus.textContent = 'Voice recognition inactive';
                    voiceStatus.classList.remove('listening');
                }
            };

            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                voiceStatus.textContent = `Error: ${event.error}`;
                isVoiceControlActive = false;
                voiceStatus.classList.remove('listening');
            };

            recognition.onresult = function(event) {
                const last = event.results.length - 1;
                const command = event.results[last][0].transcript.trim().toLowerCase();
                
                voiceStatus.textContent = `Command recognized: "${command}"`;
                
                if (command.includes('start')) {
                    startStopwatch();
                } else if (command.includes('stop')) {
                    stopStopwatch();
                } else if (command.includes('reset')) {
                    resetStopwatch();
                }
            };
            
            return true;
        } else {
            voiceStatus.textContent = 'Speech recognition not supported in this browser.';
            return false;
        }
    }

    // Format time to display
    function formatTime(time) {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = Math.floor((time % 1000) / 10);

        return {
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            milliseconds: milliseconds.toString().padStart(2, '0')
        };
    }

    // Update the display
    function updateDisplay() {
        const currentTime = Date.now();
        const totalElapsedTime = elapsedTime + (currentTime - startTime);
        const formattedTime = formatTime(totalElapsedTime);
        
        minutesElement.textContent = formattedTime.minutes;
        secondsElement.textContent = formattedTime.seconds;
        millisecondsElement.textContent = formattedTime.milliseconds;
    }

    // Start the stopwatch
    function startStopwatch() {
        if (!isRunning) {
            startTime = Date.now();
            timerInterval = setInterval(updateDisplay, 10);
            isRunning = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
        }
    }

    // Stop the stopwatch
    function stopStopwatch() {
        if (isRunning) {
            clearInterval(timerInterval);
            elapsedTime += Date.now() - startTime;
            isRunning = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }

    // Reset the stopwatch
    function resetStopwatch() {
        clearInterval(timerInterval);
        elapsedTime = 0;
        isRunning = false;
        
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';
        millisecondsElement.textContent = '00';
        
        startBtn.disabled = false;
        stopBtn.disabled = false;
    }

    // Toggle voice control
    function toggleVoiceControl() {
        if (!isVoiceControlActive) {
            if (initSpeechRecognition()) {
                recognition.start();
                voiceBtn.textContent = '🎤 Stop Voice Control';
            }
        } else {
            isVoiceControlActive = false;
            if (recognition) {
                recognition.stop();
            }
            voiceBtn.textContent = '🎤 Voice Control';
        }
    }

    // Event listeners
    startBtn.addEventListener('click', startStopwatch);
    stopBtn.addEventListener('click', stopStopwatch);
    resetBtn.addEventListener('click', resetStopwatch);
    voiceBtn.addEventListener('click', toggleVoiceControl);

    // Check if speech recognition is supported on page load
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        voiceBtn.disabled = true;
        voiceStatus.textContent = 'Speech recognition not supported in this browser.';
    }
});
