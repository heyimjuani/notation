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
    const nestedElements = element.querySelectorAll('.hint');
    nestedElements.forEach(nestedElement => {
        updateActiveClassesRecursive(nestedElement, currentBar);
    });
}

// Update the active classes based on the currentBar value
function updateActiveClasses(currentBar) {
    const elements = document.querySelectorAll('.hint');
    elements.forEach(element => {
        updateActiveClassesRecursive(element, currentBar);
    });
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
    updateActiveClasses(currentBar);
}

function togglePlay(el) {
    if (isPlaying) {
        pauseAll();
        document.getElementById("togglePlay").classList.add('paused');
    } else {
        skipIntent();
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

function nextBar() {
    console.log(currentBar);
    globalProgress = ((currentBar * beatSeconds * 4) / audioDuration) * 100;
    // Attempt to play all audio elements
    skipIntent();
}

const prevButton = document.getElementById('prevBar');
let timerId;

prevButton.addEventListener('click', function() {
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

    // Start a new timer
    timerId = setTimeout(function() {
        timerId = null;
    }, 1000);
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
        const parameter = button.getAttribute('data-skip');
        // console.log("skip to", parameter);
        globalProgress = (((parameter-1) * beatSeconds * 4) / audioDuration) * 100;
        // console.log("plz skip to ", globalProgress);
        skipIntent();
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
const selectedSongIndex = 0; // Change this index as needed

// Load songs data from the JSON file
fetch('src/songs.json')
.then(response => response.json())
.then(songsData => {
    const selectedSong = songsData[selectedSongIndex];

    // Loop through hints of the selected song and generate HTML
    selectedSong.hints.forEach(hint => {
        const hintElement = document.createElement('div');
        hintElement.classList.add('micro', 'hint');

        hintElement.innerHTML = `
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