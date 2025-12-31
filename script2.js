// --- State & Audio ---
const bgMusic = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
let isMusicPlaying = false;

// Attempt to play music on first interaction (browser policy)
document.body.addEventListener('click', () => {
    if (!isMusicPlaying && bgMusic) {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            musicBtn.classList.add('music-rotating');
        }).catch(e => console.log('Audio autoplay blocked, waiting for user interaction'));
    }
}, { once: true });

musicBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicBtn.classList.remove('music-rotating');
        isMusicPlaying = false;
    } else {
        bgMusic.play();
        musicBtn.classList.add('music-rotating');
        isMusicPlaying = true;
    }
});

// --- Navigation ---
function goToScreen(screenId) {
    // Hide all active screens
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });

    // Show target screen
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');

        // Initialize screen specific logic
        if (screenId === 'screen-vibe') startVibeCheck();
        if (screenId === 'screen-balloons') setupBalloons();
        if (screenId === 'screen-quiz') setupQuiz();
        if (screenId === 'screen-memory') setupMemory();
        if (screenId === 'screen-celebration') startConfetti();
    }
}

// --- Vibe Check ---
function startVibeCheck() {
    const status = document.getElementById('scanner-status');
    const result = document.getElementById('vibe-result');
    const emoji = document.getElementById('scanner-emoji');

    const steps = [
        { text: "Analyzing Smile...", icon: "😄" },
        { text: "Detecting Kindness...", icon: "💖" },
        { text: "Measuring Style...", icon: "✨" },
        { text: "Calculating Awesomeness...", icon: "🚀" }
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            status.textContent = steps[i].text;
            emoji.textContent = steps[i].icon;
            i++;
        } else {
            clearInterval(interval);
            document.querySelector('.scanner-container').classList.add('hidden');
            result.classList.remove('hidden');
            document.getElementById('vibe-next-btn').classList.remove('hidden');
        }
    }, 1500);
}

// --- Balloon Pop ---
function setupBalloons() {
    const grid = document.getElementById('balloon-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const colors = ['#ff9a9e', '#fecfef', '#a1c4fd', '#84fab0'];
    const totalBalloons = 12;
    const winningIndex = Math.floor(Math.random() * totalBalloons);

    for (let i = 0; i < totalBalloons; i++) {
        const b = document.createElement('div');
        b.className = 'game-balloon';
        b.style.backgroundColor = colors[i % colors.length];
        b.onclick = function () {
            if (this.classList.contains('popped')) return;
            this.classList.add('popped');

            if (i === winningIndex) {
                this.style.background = 'transparent';
                this.innerHTML = '🌟';
                this.style.fontSize = '30px';
                this.style.opacity = '1';
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    document.getElementById('balloon-message').classList.remove('hidden');
                }, 500);
            }
        };
        grid.appendChild(b);
    }
}

// --- Quiz ---
const questions = [
    { q: "What is Sakshi's hidden superpower?", opts: ["Being Cute", "Always Late", "Reading Minds", "Eating Pizza"], a: 0 },
    { q: "If Sakshi was a Disney Princess, she'd be?", opts: ["Cinderella", "Belle", "Elsa", "Rapunzel"], a: 1 },
    { q: "What makes Sakshi awesome?", opts: ["Everything", "Her Smile", "Her Style", "All of the above!"], a: 3 }
];
let qIndex = 0;

function setupQuiz() {
    loadQuestion();
}

function loadQuestion() {
    const qData = questions[qIndex];
    document.getElementById('quiz-q').textContent = qData.q;
    const optsDiv = document.getElementById('quiz-options');
    optsDiv.innerHTML = '';

    qData.opts.forEach((opt, idx) => {
        const btn = document.createElement('div');
        btn.className = 'quiz-opt';
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(idx, qData.a);
        optsDiv.appendChild(btn);
    });
}

function handleAnswer(selected, correct) {
    const feedback = document.getElementById('quiz-feedback');
    if (selected === correct || correct === 3) {
        feedback.textContent = "Correct! You know the Queen well! 👑";
        feedback.style.color = "green";
        setTimeout(() => {
            qIndex++;
            feedback.textContent = "";
            if (qIndex < questions.length) {
                loadQuestion();
            } else {
                document.querySelector('.quiz-container').innerHTML = `
                    <h3>Quiz Complete! 🎉</h3>
                    <p>You are officially a certified Bestie!</p>
                    <button class="btn-primary" onclick="goToScreen('screen-memory')">Next Game</button>
                `;
            }
        }, 1000);
    } else {
        feedback.textContent = "Oops! Try again! 😜";
        feedback.style.color = "red";
    }
}

// --- Memory Game ---
let cards = [];
let opened = [];
let matched = 0;
let bombClicks = 0;

function setupMemory() {
    const grid = document.getElementById('memory-grid');
    if (!grid) return;
    grid.innerHTML = '';
    matched = 0;
    bombClicks = 0;
    opened = [];

    // Reset UI
    const stats = document.getElementById('bomb-stats');
    if (stats) {
        stats.textContent = "Avoid the Bomb! 💣";
        stats.style.color = "#d4af37";
    }
    document.getElementById('memory-success').classList.add('hidden');

    // 4 Pairs + 1 Bomb
    const symbols = ['👑', '👑', '💖', '💖', '🌟', '🌟', '🧁', '🧁', '💣'];
    symbols.sort(() => 0.5 - Math.random());

    symbols.forEach((symbol, idx) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.symbol = symbol;
        card.innerHTML = `
            <div class="card-face card-front">${symbol}</div>
            <div class="card-face card-back">?</div>
        `;
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });
}

function flipCard(card) {
    // Prevent interaction if already flipped or matched or 2 cards open
    if (opened.length === 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    // Bomb Logic
    if (card.dataset.symbol === '💣') {
        card.classList.add('flipped');
        bombClicks++;

        const stats = document.getElementById('bomb-stats');

        if (bombClicks === 1) {
            // First hit warning
            if (stats) {
                stats.textContent = "⚠️ Bomb Hit: 1/2! Careful!";
                stats.style.color = "orange";
            }
            setTimeout(() => {
                card.classList.remove('flipped');
            }, 800);
        } else if (bombClicks >= 2) {
            // Second hit - Game Over
            if (stats) {
                stats.textContent = "💥 BOOM! Game Over! Restarting...";
                stats.style.color = "red";
            }
            // Prevent further clicks
            document.querySelectorAll('.memory-card').forEach(c => c.style.pointerEvents = 'none');

            setTimeout(() => {
                setupMemory(); // Reset game
            }, 2000);
        }
        return;
    }

    // Normal Card Logic
    card.classList.add('flipped');
    opened.push(card);

    if (opened.length === 2) {
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [c1, c2] = opened;
    if (c1.dataset.symbol === c2.dataset.symbol) {
        c1.classList.add('matched');
        c2.classList.add('matched');
        matched++;
        // Win with 4 pairs (since there are 9 cards total, 4 pairs = win)
        if (matched === 4) {
            document.getElementById('memory-success').classList.remove('hidden');
        }
    } else {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
    }
    opened = [];
}

// --- Candle Wishes (With Mic!) ---
let audioContext = null;
let microphone = null;
let analyser = null;
let micStream = null;
let micEnabled = false;

function toggleMic() {
    const micBtn = document.getElementById('mic-btn');

    if (micEnabled) {
        // Turn off mic
        stopMic();
        return;
    }

    micBtn.textContent = "⏳ Starting...";

    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function (stream) {
            micStream = stream;

            // Create AudioContext (with iOS/Safari support)
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Resume AudioContext (required for iOS Safari)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.3;

            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);

            micEnabled = true;
            micBtn.textContent = "🎤 Blow Now!";
            micBtn.classList.add('listening');

            // Start checking for blow
            checkBlow();
        })
        .catch(function (err) {
            console.error("Mic error:", err);
            micBtn.textContent = "🎙️ Enable Mic";
            alert("Microphone access needed! You can also tap the flame to blow out the candle.");
        });
}

function stopMic() {
    micEnabled = false;

    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    const micBtn = document.getElementById('mic-btn');
    micBtn.textContent = "🎙️ Enable Mic";
    micBtn.classList.remove('listening');
}

function checkBlow() {
    if (!micEnabled || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    let average = sum / bufferLength;

    // Lower threshold for mobile (phone mics are sensitive)
    // 40 for phones, 80 was too high
    if (average > 40) {
        console.log("Blow detected! Level:", average);
        blowCandle();
        stopMic();
    } else {
        if (micEnabled) {
            requestAnimationFrame(checkBlow);
        }
    }
}

function blowCandle() {
    const flame = document.getElementById('flame');
    if (flame && !flame.classList.contains('out')) {
        flame.classList.add('out');

        // Stop mic if still on
        stopMic();

        setTimeout(() => {
            document.getElementById('wish-success').classList.remove('hidden');
        }, 500);
    }
}

// --- Birthday Song Audio Controls ---
let birthdaySongPlaying = false;

function playBirthdaySong() {
    const song = document.getElementById('happy-bday-song');
    const playBtn = document.getElementById('play-birthday-song');
    const stopBtn = document.getElementById('stop-song');
    const nowPlaying = document.getElementById('now-playing');

    // STRICTLY STOP ALL OTHER MUSIC
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        isMusicPlaying = false;
        if (musicBtn) musicBtn.classList.remove('music-rotating');
    }

    if (song) {
        // Reset the song to start from beginning
        song.currentTime = 0;

        song.play().then(() => {
            birthdaySongPlaying = true;
            if (playBtn) playBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'inline-block';
            if (nowPlaying) nowPlaying.style.display = 'block';
        }).catch(err => {
            console.log("Audio play error:", err);
            alert("Tap the button again to play the song!");
        });
    }
}

function stopBirthdaySong() {
    const song = document.getElementById('happy-bday-song');
    const playBtn = document.getElementById('play-birthday-song');
    const stopBtn = document.getElementById('stop-song');
    const nowPlaying = document.getElementById('now-playing');

    if (song) {
        song.pause();
        song.currentTime = 0;
        birthdaySongPlaying = false;
        if (playBtn) playBtn.style.display = 'inline-block';
        if (stopBtn) stopBtn.style.display = 'none';
        if (playBtn) playBtn.classList.remove('playing');
        if (nowPlaying) nowPlaying.style.display = 'none';
    }
}


// --- Celebration (Party Mode) ---
let flyingEmojiInterval = null;

function startConfetti() {
    // STRICTLY STOP ALL PREVIOUS MUSIC
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        isMusicPlaying = false;
        if (musicBtn) musicBtn.classList.remove('music-rotating');
    }

    // Auto-play birthday song
    const bdaySong = document.getElementById('happy-bday-song');
    const nowPlaying = document.getElementById('now-playing');
    const playBtn = document.getElementById('play-birthday-song');
    const stopBtn = document.getElementById('stop-song');

    if (bdaySong) {
        // Reset to start
        bdaySong.currentTime = 0;

        bdaySong.play().then(() => {
            if (nowPlaying) nowPlaying.style.display = 'block';
            // Update buttons state
            if (playBtn) playBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'inline-block';
            birthdaySongPlaying = true;
        }).catch(err => console.log("Auto-play blocked, tap button to play"));
    }

    // Start flying neon emojis
    startFlyingEmojis();

    // Confetti canvas animation
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff9a9e', '#fad0c4', '#fbc2eb', '#a18cd1', '#fad0c4'];

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 5 + 2,
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 6.2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speed;
            p.x += Math.sin(p.angle);
            if (p.y > canvas.height) p.y = -10;
        });
        requestAnimationFrame(draw);
    }
    draw();
}

function toggleGift() {
    const content = document.querySelector('.gift-content');
    if (content) content.classList.toggle('hidden');
}

function restartApp() {
    // Stop flying emojis
    if (flyingEmojiInterval) {
        clearInterval(flyingEmojiInterval);
        flyingEmojiInterval = null;
    }
    // Stop birthday song
    const bdaySong = document.getElementById('happy-bday-song');
    if (bdaySong) {
        bdaySong.pause();
        bdaySong.currentTime = 0;
    }
    location.reload();
}
// --- Dancing Characters (copied from Prince implementation) ---
// Party emojis with disco colors
const dancingEmojis = [
    // Party essentials
    '🎉', '🎊', '🎈', '🎁', '🎂', '🍰', '🥳', '🪩',
    // Music & Sound
    '🎵', '🎶', '🎤', '🎧', '🎷', '🎸', '📢',
    // Neon Glasses & Cool
    '🕶️', '😎', '🤩', '🌟', '⭐', '✨', '💫', '🔥',
    // Hearts & Love
    '💖', '💜', '💙', '💚', '💛', '🧡', '❤️', '💕', '💗',
    // Celebration
    '🎀', '👑', '💎', '🦋', '🌈', '🍾', '🥂', '🎪',
    // Faces
    '😀', '😃', '😄', '😁', '🥰', '😍', '😘', '😋', '😜', '🤗'
];

// Disco color palette from Prince
const discoColors = [
    '#ff0080', '#ff8000', '#80ff00', '#0080ff', '#8000ff',
    '#ff0040', '#40ff00', '#0040ff', '#ff4080', '#4080ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff6600', '#6600ff'
];

// Animation types from Prince
const danceAnimations = ['slideLeftToRight', 'slideRightToLeft', 'popAndDance', 'bounceInOut'];

let dancingCharacterInterval = null;

function startFlyingEmojis() {
    const container = document.getElementById('flying-emojis-container');
    if (!container) return;

    // Clear existing
    container.innerHTML = '';

    // Spawn characters on beat interval (400ms for ABCD2 song tempo)
    dancingCharacterInterval = setInterval(() => {
        // 60% chance to spawn on each beat
        if (Math.random() < 0.6) {
            spawnDancingCharacter(container);
        }
    }, 400);

    // Initial burst
    for (let i = 0; i < 6; i++) {
        setTimeout(() => spawnDancingCharacter(container), i * 150);
    }
}

function spawnDancingCharacter(container) {
    const character = document.createElement('div');
    character.className = 'dancing-character';

    // Random emoji
    const emoji = dancingEmojis[Math.floor(Math.random() * dancingEmojis.length)];
    character.textContent = emoji;

    // Random disco color
    const color = discoColors[Math.floor(Math.random() * discoColors.length)];

    // Random size (24-44px)
    const fontSize = Math.random() * 20 + 24;

    // Random animation type
    const animationType = Math.floor(Math.random() * danceAnimations.length);
    const animationName = danceAnimations[animationType];

    // Random starting position (15% to 85% from top)
    const startY = Math.random() * 70 + 15;

    // Duration 1.5-3.5 seconds for fast movement
    const duration = Math.random() * 2 + 1.5;

    // Add sparkle effect randomly (30% chance)
    const hasSparkle = Math.random() < 0.3;
    const sparkleEffect = hasSparkle ? `, sparkle ${duration * 0.5}s ease-in-out infinite` : '';

    // Apply styles
    character.style.cssText = `
        position: absolute;
        font-size: ${fontSize}px;
        font-weight: bold;
        color: ${color};
        text-shadow: 
            0 0 10px ${color},
            0 0 20px ${color},
            0 0 30px ${color};
        top: ${startY}%;
        animation: ${animationName} ${duration}s ease-in-out${sparkleEffect};
        z-index: 2;
        pointer-events: none;
        filter: drop-shadow(0 0 5px ${color});
        user-select: none;
        will-change: transform;
    `;

    // Set initial position based on animation type
    if (animationName === 'slideLeftToRight') {
        character.style.left = '-100px';
    } else if (animationName === 'slideRightToLeft') {
        character.style.right = '-100px';
    } else {
        // popAndDance or bounceInOut - random position
        character.style.left = Math.random() * 80 + 10 + '%';
    }

    container.appendChild(character);

    // Remove after animation
    setTimeout(() => {
        if (character.parentNode) {
            character.remove();
        }
    }, duration * 1000 + 500);
}

function stopFlyingEmojis() {
    if (dancingCharacterInterval) {
        clearInterval(dancingCharacterInterval);
        dancingCharacterInterval = null;
    }
    if (flyingEmojiInterval) {
        clearInterval(flyingEmojiInterval);
        flyingEmojiInterval = null;
    }
}

