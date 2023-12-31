const pickInstrumentButtons = document.querySelectorAll('.pickInstrument');

const appDiv = document.getElementById('app');
const onboardingDiv = document.getElementById('onboarding');
pickInstrumentButtons.forEach(button => {
    button.addEventListener('click', function() {
        appDiv.classList.add('active');
        onboardingDiv.classList.remove('active');
    });
});
// define bpm
var bpm = 82;
var beatSeconds = 60/bpm;

document.getElementById("timeline").setAttribute("step", beatSeconds/10);

// we need the duration to be global
var audioDuration;

// console.log(parseInt(audioDuration));
var timeline = document.getElementById("timeline");
var timelineMax = timeline.getAttribute("max");
// console.log(timelineMax);

// this will help with some maths
var timelineStep;
// console.log(timelineStep);

var currentTimeSecs;
var barSecs;
var currentBeat;
var currentBar;
var currentTimeInS;
var globalProgress;

let bass;
let metronomeOn;
let mutedBass;
let mutedDrums;
let mutedOther;
let mutedVocals;
let soloBass;
let soloDrums;
let soloOther;
let soloVocals;

let audioElements = [];
let isPlaying = false;

const skipToElements = document.querySelectorAll('.skipTo');

const mixerOpen = document.getElementById("changeInstrument");
const mixerClose = document.getElementById("closeMixer");
const mixerDiv = document.getElementById('mixer');

mixerOpen.addEventListener('click', function() {
    mixerDiv.classList.toggle('active');
});

mixerClose.addEventListener('click', function() {
    mixerDiv.classList.toggle('active');
});

function navigationStates() {
    skipToElements.forEach((element, index) => {
        const skipValue = parseInt(element.getAttribute('data-skip'), 10);
        const nextSkipValue = parseInt(skipToElements[index + 1]?.getAttribute('data-skip'), 10);
  
        if (currentBar >= skipValue && (!nextSkipValue || currentBar < nextSkipValue)) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
    });
}

let isDragging = false;

// console.log(timeline.getAttribute("max"));

PIXI.sound.disableAutoPause = true;

PIXI.sound.add('bass', {
    url: "src/bass2.mp3",
    preload: true,
    singleInstance: true
});
PIXI.sound.add('other', {
    url:  'src/other2.mp3',
    preload: true,
    singleInstance: true
});
PIXI.sound.add('vocals', {
    url:  'src/vocals2.mp3',
    preload: true,
    singleInstance: true
});
PIXI.sound.add('drums', {
    url:  'src/drums2.mp3',
    preload: true,
    singleInstance: true
});
PIXI.sound.add('click', {
    url:  'src/click.mp3',
    preload: true,
    singleInstance: true,
    volume: 0
});

function toggleMetronome(el) {
    if (!metronomeOn) {
        PIXI.sound._sounds['click'].volume = .5;
        el.classList.add('active');
        metronomeOn = true;
    } else {
        PIXI.sound._sounds['click'].volume = 0;
        el.classList.remove('active');
        metronomeOn = false;
    }
}

function muteBass(el) {
    if (!mutedBass) {
        PIXI.sound._sounds['bass'].volume = 0;
        el.classList.add('active');
        mutedBass = true;
    } else {
        PIXI.sound._sounds['bass'].volume = 1;
        el.classList.remove('active');
        mutedBass = false;
    }
}

function muteDrums(el) {
    if (!mutedDrums) {
        PIXI.sound._sounds['drums'].volume = 0;
        el.classList.add('active');
        mutedDrums = true;
    } else {
        PIXI.sound._sounds['drums'].volume = 1;
        el.classList.remove('active');
        mutedDrums = false;
    }
}

function muteOther(el) {
    if (!mutedOther) {
        PIXI.sound._sounds['other'].volume = 0;
        el.classList.add('active');
        mutedOther = true;
    } else {
        PIXI.sound._sounds['other'].volume = 1;
        el.classList.remove('active');
        mutedOther = false;
    }
}

function muteVocals(el) {
    if (!mutedVocals) {
        PIXI.sound._sounds['vocals'].volume = 0;
        el.classList.add('active');
        mutedVocals = true;
    } else {
        PIXI.sound._sounds['vocals'].volume = 1;
        el.classList.remove('active');
        mutedVocals = false;
    }
}

const soloButtons = document.querySelectorAll('.soloBtn');
const muteButtons = document.querySelectorAll('.muteBtn');

function toggleSoloBass(el) {
    if (!soloBass) {
        PIXI.sound._sounds['bass'].volume = 1;
        PIXI.sound._sounds['other'].volume = 0;
        PIXI.sound._sounds['vocals'].volume = 0;
        PIXI.sound._sounds['drums'].volume = 0;
        soloBass = true;
        soloOther = false;
        soloDrums = false;
        soloVocals = false;
    } else {
        PIXI.sound._sounds['bass'].volume = 1;
        PIXI.sound._sounds['other'].volume = 1;
        PIXI.sound._sounds['vocals'].volume = 1;
        PIXI.sound._sounds['drums'].volume = 1;
        soloBass = false;
    }
    if (el.classList.contains('active')) {
        el.classList.remove('active');
    } else {
        // Remove "active" class from all buttons
        soloButtons.forEach(btn => btn.classList.remove('active'));
        muteButtons.forEach(btn => btn.classList.remove('active'));
        // Add "active" class to the clicked button
        el.classList.add('active');
    }
}

function toggleSoloDrums(el) {
    if (!soloDrums) {
        PIXI.sound._sounds['bass'].volume = 0;
        PIXI.sound._sounds['other'].volume = 0;
        PIXI.sound._sounds['vocals'].volume = 0;
        PIXI.sound._sounds['drums'].volume = 1;
        soloDrums = true;
        soloOther = false;
        soloVocals = false;
        soloBass = false;
    } else {
        PIXI.sound._sounds['bass'].volume = 1;
        PIXI.sound._sounds['other'].volume = 1;
        PIXI.sound._sounds['vocals'].volume = 1;
        PIXI.sound._sounds['drums'].volume = 1;
        soloDrums = false;   
    }
    if (el.classList.contains('active')) {
        el.classList.remove('active');
    } else {
        // Remove "active" class from all buttons
        soloButtons.forEach(btn => btn.classList.remove('active'));
        muteButtons.forEach(btn => btn.classList.remove('active'));
        // Add "active" class to the clicked button
        el.classList.add('active');
    }
}

function toggleSoloOther(el) {
    if (!soloOther) {
        PIXI.sound._sounds['bass'].volume = 0;
        PIXI.sound._sounds['other'].volume = 1;
        PIXI.sound._sounds['vocals'].volume = 0;
        PIXI.sound._sounds['drums'].volume = 0;
        soloOther = true;
        soloVocals = false;
        soloDrums = false;
        soloBass = false;
    } else {
        PIXI.sound._sounds['bass'].volume = 1;
        PIXI.sound._sounds['other'].volume = 1;
        PIXI.sound._sounds['vocals'].volume = 1;
        PIXI.sound._sounds['drums'].volume = 1;
        soloOther = false;
    }
    if (el.classList.contains('active')) {
        el.classList.remove('active');
    } else {
        // Remove "active" class from all buttons
        soloButtons.forEach(btn => btn.classList.remove('active'));
        muteButtons.forEach(btn => btn.classList.remove('active'));
        // Add "active" class to the clicked button
        el.classList.add('active');
    }
}

function toggleSoloVocals(el) {
    if (!soloVocals) {
        PIXI.sound._sounds['bass'].volume = 0;
        PIXI.sound._sounds['other'].volume = 0;
        PIXI.sound._sounds['vocals'].volume = 1;
        PIXI.sound._sounds['drums'].volume = 0;
        soloVocals = true;
        soloOther = false;
        soloDrums = false;
        soloBass = false;
    } else {
        PIXI.sound._sounds['bass'].volume = 1;
        PIXI.sound._sounds['other'].volume = 1;
        PIXI.sound._sounds['vocals'].volume = 1;
        PIXI.sound._sounds['drums'].volume = 1;
        soloVocals = false;
    }
    if (el.classList.contains('active')) {
        el.classList.remove('active');
    } else {
        // Remove "active" class from all buttons
        soloButtons.forEach(btn => btn.classList.remove('active'));
        muteButtons.forEach(btn => btn.classList.remove('active'));
        // Add "active" class to the clicked button
        el.classList.add('active');
    }
}

function secondsToMinutesAndSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Recursive function to update active classes for nested elements
function updateActiveClassesRecursive(element, currentBar) {
    const begins = parseInt(element.getAttribute('data-begins'));
    const ends = parseInt(element.getAttribute('data-ends'));

    if (currentBar >= begins && currentBar <= ends) {
        element.classList.add('active');
    } else {
        element.classList.remove('active');
    }

    // Recursively check nested elements
    const nestedElements = element.querySelectorAll('.micro');
    nestedElements.forEach(nestedElement => {
        updateActiveClassesRecursive(nestedElement, currentBar);
    });
}

// Update the active classes based on the currentBar value
function updateActiveClasses(currentBar) {
    const elements = document.querySelectorAll('.micro');
    elements.forEach(element => {
        updateActiveClassesRecursive(element, currentBar);
    });
}

let hasFunctionRun = false;

function drop(direction) {
    const countDiv = document.querySelectorAll('.numbers');
    countDiv.forEach(element => {
        element.innerHTML = "";
        const numbers = direction === 'down' ? [4, 3, 2, 1] : [1, 2, 3, 4];

        numbers.forEach((number, index) => {
            const span = document.createElement('span');
            span.classList.add("singleNumber");
            span.textContent = number;
            element.appendChild(span);
        });
        countFunction(element);
    });
}

function countFunction(element) {
    const countDiv = document.querySelectorAll('.count');
    const spans = element.querySelectorAll('.singleNumber');
    let currentIndex = 0;
  
    function setActiveSpan() {
      spans.forEach(span => {
        span.classList.remove('active');
      });
      spans[currentIndex].classList.add('active');
  
      currentIndex = (currentIndex + 1) % spans.length;
    }
  
    // Initial activation
    setActiveSpan();
  
    if (!hasFunctionRun) {
        let intervalCounter = 0;
        const maxOccurrences = 4;

        function intervalCallback() {
            intervalCounter++;
            //console.log('Interval occurrence:', intervalCounter);

            // Your interval logic here
            setActiveSpan();

            if (intervalCounter >= maxOccurrences) {
                clearInterval(countTransition);
                intervalCounter = 0;
                console.log('Interval stopped after', maxOccurrences, 'occurrences');
            }
        }
        const countTransition = setInterval(intervalCallback, beatSeconds * 1000); // Adjust the interval time as needed
    }
}

function nowPlaying(){
    // console.log(beatSeconds);
    currentBar = Math.ceil(((globalProgress) * audioDuration) / (beatSeconds * 4));
    document.getElementById('currentBar').innerHTML = currentBar;
    if ((currentBar >= 1 && currentBar <= 8) || (currentBar >= 34 && currentBar <= 41)) {
        document.getElementById("metadata").className = "intro";
    } else if ((currentBar >= 9 && currentBar <= 24) || (currentBar >= 42 && currentBar <= 57)) {
        document.getElementById("metadata").className = "a";
    } else if ((currentBar >= 25 && currentBar <= 34) || (currentBar >= 58 && currentBar <= 68)) {
        document.getElementById("metadata").className = "b";
    }

    if (currentBar >= 3 && currentBar <= 4) {
        document.getElementById("metadata").classList.add("light");
    } else {
        document.getElementById("metadata").classList.remove("light");
    }

    updateActiveClasses(currentBar);

    if (!hasFunctionRun && ((currentBar == 41) || (currentBar == 44) || (currentBar == 31) || (currentBar == 16))) {
        drop("down");
        hasFunctionRun = true;
        setTimeout(() => {
            hasFunctionRun = false;
        }, beatSeconds * 4 * 1000);
    }
    if (!hasFunctionRun && ((currentBar == 45) || (currentBar == 33))) {
        drop("up");
        hasFunctionRun = true;
        setTimeout(() => {
            hasFunctionRun = false;
        }, beatSeconds * 4 * 1000);
    }
}

function togglePlay(el) {
    if (currentBar) {
        if (isPlaying) {
            pauseAll();
            document.getElementById("togglePlay").classList.add('paused');
        } else {
            skipIntent();
        }
    } else {
        bufferIntent();
    }
}

timeline.addEventListener('mousedown', () => {
    const audioElements = [
        PIXI.sound._sounds['bass'],
        PIXI.sound._sounds['other'],
        PIXI.sound._sounds['vocals'],
        PIXI.sound._sounds['drums'],
        PIXI.sound._sounds['click']
    ];

    // Attempt to play all audio elements
    audioElements.forEach(audio => audio.pause());
    isPlaying = false;
    isDragging = true;

    if (isPlaying) {
        document.getElementById("togglePlay").classList.add('paused');
        //console.log("remove");
    } else {
        //document.getElementById("togglePlay").classList.remove('paused');
        //console.log("add");
    }
});

timeline.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        
        globalProgress = timeline.value;

        // Attempt to play all audio elements
        skipIntent();
    }
});

let infoShown = false;

function nextBar() {
    if (currentBar && !infoShown) {
        //console.log(currentBar);
        globalProgress = ((currentBar * beatSeconds * 4) / audioDuration) * 100;
        // Attempt to play all audio elements
        skipIntent();
    } 
    if (infoShown) {
        document.getElementById("extra").classList.toggle("current");
        document.getElementById("placeholder").classList.toggle("current");
    }
    if (!currentBar) {
        document.getElementById("placeholder").classList.toggle("active");
        document.getElementById("extra").classList.toggle("active");
    }
}

const prevButton = document.getElementById('prevBar');
let timerId;

prevButton.addEventListener('click', function() {
    if (currentBar >= 2 && !infoShown) {
        if (timerId) {
            clearTimeout(timerId);
            currentBar -= 2;
            globalProgress = ((currentBar * beatSeconds * 4) / audioDuration) * 100;
            skipIntent();
        } else {
            currentBar--;
            //console.log('Decreased by 1 to:', currentBar);
            globalProgress = ((currentBar * beatSeconds * 4) / audioDuration) * 100;
            skipIntent();
        }
    } 
    if (infoShown) {
        document.getElementById("extra").classList.toggle("current");
        document.getElementById("placeholder").classList.toggle("current");
    }
    if (!currentBar) {
        document.getElementById("placeholder").classList.toggle("active");
        document.getElementById("extra").classList.toggle("active");
    }

    // Start a new timer
    timerId = setTimeout(function() {
        timerId = null;
    }, 1000);
});

const toggleInfo = document.getElementById('toggleInfo');
toggleInfo.addEventListener('click', function() {
    document.getElementById("app").classList.toggle("infoMode");
    if (!infoShown) {
        document.getElementById("placeholder").classList.add("current");
    } else {
        document.getElementById("placeholder").classList.remove("current");
        document.getElementById("extra").classList.remove("current");
    }
    infoShown = !infoShown;
});

function myFunction(parameter) {
    console.log(`Function called with parameter: ${parameter}`);
    // Your code here using the parameter
}

// Get all buttons with the "custom-button" class
const skipButtons = document.querySelectorAll('.skipTo');

// Attach event listeners to each button
skipButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (currentBar) {
            const parameter = button.getAttribute('data-skip');
            // console.log("skip to", parameter);
            globalProgress = (((parameter-1) * beatSeconds * 4) / audioDuration) * 100;
            // console.log("plz skip to ", globalProgress);
            skipIntent();
        } else {
            console.log("click");
        }
    });
});

function bufferIntent() {
    const audioElements = [
        PIXI.sound._sounds['bass'],
        PIXI.sound._sounds['other'],
        PIXI.sound._sounds['vocals'],
        PIXI.sound._sounds['drums'],
        PIXI.sound._sounds['click']
    ];

    // Attempt to play all audio elements
    audioElements.forEach(audio => audio.play({start: 0}));

    const checkPlayable = () => {
        const allPlayable = audioElements.every(audio => audio.isPlayable);
        document.getElementById("playAudio").innerHTML = "cargando";

        if (allPlayable) {
            audioElements.forEach(audio => audio.play());
            setInterval(navigationStates, (beatSeconds * 4));
            const instance = PIXI.sound._sounds['bass'].play();
            document.getElementById("placeholder").classList.remove("active");
            instance.on('progress', function(progress, duration) {
                // console.log('Amount played: ', progress * 100 + '% of ', duration);
                audioDuration = duration;
                globalProgress = progress;
                document.getElementById("fakeProgressBar").style.width = (globalProgress * 100) + "%";
                // console.log("progress percent", globalProgress);
                currentTimeInS = Math.round((globalProgress) * duration);
                const timeString = secondsToMinutesAndSeconds(currentTimeInS);
                document.getElementById('tracktime').innerHTML = timeString;
                document.getElementById('timeline').value = progress * 100;
                nowPlaying();
                // console.log(duration);
                // TODOOOOO: TRADUCIR EL PROGRESO A SEGUNDOS Y QUE SEA CERTEROX
            });
            instance.on('end', function() {
                console.log('Sound finished playing');
                isPlaying = false;
                document.getElementById("togglePlay").classList.add('paused');
            });
            isPlaying = true;
            document.getElementById("togglePlay").classList.remove('paused');
            document.getElementById("toggleInfo").classList.remove("hidden");
        } else {
            setTimeout(checkPlayable, 2000); // Check again after 100ms
        }
    };

    // Actually pause after 50ms, to enforce
    setTimeout(() => {
        audioElements.forEach(audio => audio.stop());
        checkPlayable(); // Start checking if they are playable
    }, 5);
    // console.log(audioElements[0].duration);
}

function skipIntent() {
    const audioElements = [
        PIXI.sound._sounds['bass'],
        PIXI.sound._sounds['other'],
        PIXI.sound._sounds['vocals'],
        PIXI.sound._sounds['drums'],
        PIXI.sound._sounds['click']
    ];

    // Attempt to play all audio elements
    audioElements.forEach(audio => audio.play({start: (globalProgress/100) * audioDuration}));

    const checkPlayable = () => {
        const allPlayable = audioElements.every(audio => audio.isPlayable);

        if (allPlayable) {
            audioElements.forEach(audio => audio.play({start: (globalProgress/100) * audioDuration}));
            const instance = PIXI.sound._sounds['bass'].play({start: (globalProgress/100) * audioDuration});
            instance.on('progress', function(progress, duration) {
                // console.log('Amount played: ', progress * 100 + '% of ', duration);
                audioDuration = duration;
                globalProgress = progress;
                //console.log("song progress is", globalProgress);
                document.getElementById("fakeProgressBar").style.width = (globalProgress * 100) + "%";
                // console.log("skipped to ", globalProgress);
                currentTimeInS = Math.round((globalProgress) * duration);
                const timeString = secondsToMinutesAndSeconds(currentTimeInS);
                document.getElementById('tracktime').innerHTML = timeString;
                document.getElementById('timeline').value = progress * 100;
                nowPlaying();
                // console.log(duration);
                // TODOOOOO: TRADUCIR EL PROGRESO A SEGUNDOS Y QUE SEA CERTEROX
            });
            instance.on('end', function() {
                console.log('Sound finished playing');
                isPlaying = false;
                document.getElementById("togglePlay").classList.add('paused');
            });
            isPlaying = true;
            if (isPlaying) {
                document.getElementById("togglePlay").classList.remove('paused');
                //console.log("remove");
            } else {
                document.getElementById("togglePlay").classList.add('paused');
                //console.log("add");
            }
        } else {
            setTimeout(checkPlayable, 2000); // Check again after 100ms
        }
    };

    // Actually pause after 50ms, to enforce
    setTimeout(() => {
        audioElements.forEach(audio => audio.stop());
        checkPlayable(); // Start checking if they are playable
    }, 5);
    // console.log(audioElements[0].duration);
}

function pauseAll() {
    const audioElements = [
        PIXI.sound._sounds['bass'],
        PIXI.sound._sounds['other'],
        PIXI.sound._sounds['vocals'],
        PIXI.sound._sounds['drums'],
        PIXI.sound._sounds['click']
    ];

    globalProgress = timeline.value;
    console.log("paused progress seconds",  (globalProgress/100) * audioDuration);

    // Attempt to play all audio elements
    audioElements.forEach(audio => audio.pause());
    isPlaying = false;
}

function resumeAll() {
    globalProgress = timeline.value;

    skipIntent();

    isPlaying = true;
}

const hintsContainer = document.getElementById('hintsContainer');
const selectedSongIndex = 0;
const desiredInstrument = "harmonic"; // Change this index as needed

// Load songs data from the JSON file
fetch('src/songs.json')
.then(response => response.json())
.then(songsData => {
    const selectedSong = songsData[selectedSongIndex].instruments.find(instrument => instrument.name === desiredInstrument);

    // Loop through hints of the selected song and generate HTML
    selectedSong.hints.forEach(hint => {
        const hintElement = document.createElement('div');
        hintElement.classList.add('micro', hint.type);

        if (hint.hasOwnProperty("score")) {
            hintElement.classList.add("hasScore");
            hintElement.innerHTML += `<div id='${hint.score}' class='score'></div>`
        }
        if (hint.hasOwnProperty("part")) {
            hintElement.setAttribute("data-part", hint.part);
        }
        hintElement.innerHTML += `
            <h3>${hint.title}</h3>
            ${hint.content}
        `;
        // Set "data-begins" and "data-ends" attributes
        hintElement.setAttribute('data-begins', hint.barStart);
        hintElement.setAttribute('data-ends', hint.barEnd);

        hintsContainer.appendChild(hintElement);
    });
    
    // we'll need one of these per score occurence
    // vexflow code
    const {
        Renderer,
        Stave,
        StaveNote,
        Voice,
        Formatter
    } = Vex.Flow;
    
    // Create an SVG renderer and attach it to the DIV element named "boo".
    const div = document.getElementById('vexflow');
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    
    // Configure the rendering context.
    renderer.resize(500, 120);
    const context = renderer.getContext();
    
    // Create a stave of width 500 at position 0, 0 on the canvas.
    const stave = new Stave(0, 0, 500);
    
    // Add a clef and time signature.
    stave.addClef('treble').addTimeSignature('4/4');
    
    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
    
    // Create the notes
    const notes = [
    // A quarter-note C.
    new StaveNote({
        keys: ['c/4'],
        duration: 'q'
    }),
    
    // A quarter-note D.
    new StaveNote({
        keys: ['d/4'],
        duration: 'q'
    }),
    
    // A quarter-note rest. Note that the key (b/4) specifies the vertical
    // position of the rest.
    new StaveNote({
        keys: ['b/4'],
        duration: 'qr'
    }),
    
    // A C-Major chord.
    new StaveNote({
        keys: ['c/4', 'e/4', 'g/4'],
        duration: 'q'
    }),
    ];
    
    // Create a voice in 4/4 and add above notes
    const voice = new Voice({
        num_beats: 4,
        beat_value: 4
    });
    voice.addTickables(notes);
    
    // Format and justify the notes to 400 pixels.
    new Formatter().joinVoices([voice]).format([voice], 350);
    
    // Render voice
    voice.draw(context, stave);
})
.catch(error => {
    console.error('Error loading JSON:', error);
});

let targetLane;
document.getElementById('drums-mixer').addEventListener('click', (event) => {
    event.preventDefault;
    targetLane = event.target.getAttribute('data-instrument');
    
    hintsContainer.innerHTML = "";
    console.log("logged " + targetLane);

    fetch('src/songs.json')
    .then(response => response.json())
    .then(songsData => {
        const selectedSong = songsData[selectedSongIndex].instruments.find(instrument => instrument.name === targetLane);

        // Loop through hints of the selected song and generate HTML
        selectedSong.hints.forEach(hint => {
            const hintElement = document.createElement('div');
            hintElement.classList.add('micro', hint.type);
            if (hint.hasOwnProperty("part")) {
                hintElement.setAttribute("data-part", hint.part);
            } else {
                hintElement.setAttribute("data-part", "Suddenly driven");
            }
            hintElement.innerHTML += `
                <h3>${hint.title}</h3>
                ${hint.content}
            `;
            // Set "data-begins" and "data-ends" attributes
            hintElement.setAttribute('data-begins', hint.barStart);
            hintElement.setAttribute('data-ends', hint.barEnd);

            hintsContainer.appendChild(hintElement);
        });
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
    });
});

if (!currentBar) {
    document.getElementById("toggleInfo").classList.add("hidden");
}