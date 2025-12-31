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
        // Camera cleanup if leaving photobooth
        if (screenId !== 'screen-photobooth') stopCamera();
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
let cards = ['👑', '👑', '💖', '💖', '🌟', '🌟', '🧁', '🧁'];
let opened = [];
let matched = 0;

function setupMemory() {
    const grid = document.getElementById('memory-grid');
    if (!grid) return;
    grid.innerHTML = '';
    matched = 0;

    cards.sort(() => 0.5 - Math.random());

    cards.forEach((symbol, idx) => {
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
    if (opened.length === 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;

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
        if (matched === cards.length / 2) {
            document.getElementById('memory-success').classList.remove('hidden');
        }
    } else {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
    }
    opened = [];
}

// --- Candle Wishes (With Mic!) ---
let audioContext;
let microphone;
let analyser;
let micEnabled = false;

function toggleMic() {
    if (!micEnabled) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                document.getElementById('mic-btn').textContent = "🎤 Listening...";
                document.getElementById('mic-btn').classList.add('listening');
                micEnabled = true;

                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);
                analyser.fftSize = 256;

                checkBlow();
            })
            .catch(function (err) {
                alert("Microphone access needed to blow the candle! Tap it instead if it fails.");
                console.log(err);
            });
    }
}

function checkBlow() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    let average = sum / bufferLength;

    // Increased threshold/sensitivity (was 50)
    if (average > 80) {
        blowCandle();
        // Stop listening
        micEnabled = false;
        document.getElementById('mic-btn').classList.remove('listening');
        document.getElementById('mic-btn').textContent = "🎙️ Mic Disabled";
    } else {
        if (micEnabled) requestAnimationFrame(checkBlow);
    }
}

function blowCandle() {
    const flame = document.getElementById('flame');
    if (!flame.classList.contains('out')) {
        flame.classList.add('out');
        setTimeout(() => {
            document.getElementById('wish-success').classList.remove('hidden');
        }, 500);
    }
}

// --- Camera & Photobooth ---
let videoStream;

function startCamera() {
    const video = document.getElementById('camera-feed');
    const startBtn = document.getElementById('start-camera');
    const takeBtn = document.getElementById('take-photo');

    // Request highest possible resolution
    navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 4096 },
            height: { ideal: 2160 },
            facingMode: "user"
        }
    })
        .then(stream => {
            videoStream = stream;
            video.srcObject = stream;
            video.classList.remove('hidden');
            document.getElementById('photo-canvas').classList.add('hidden');

            startBtn.classList.add('hidden');
            takeBtn.classList.remove('hidden');
        })
        .catch(err => {
            alert("Camera access denied or error: " + err);
        });
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
}

function takePhoto() {
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('photo-canvas');
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video (mirrored)
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

    // Dynamic Font Sizing based on resolution
    const fontSize = Math.floor(canvas.width / 15);
    context.font = `bold ${fontSize}px 'Dancing Script'`;
    context.fillStyle = "white";
    context.textAlign = "center";
    context.shadowColor = "rgba(0,0,0,0.5)";
    context.shadowBlur = canvas.width / 50;

    // Draw Text with better positioning
    const margin = canvas.height * 0.1;
    context.fillText("Happy Birthday", canvas.width / 2, margin + fontSize);
    context.fillText("Sakshi", canvas.width / 2, canvas.height - margin);

    // Add Date nicely
    context.font = `normal ${fontSize / 2}px 'Quicksand'`;
    context.fillText(new Date().toLocaleDateString(), canvas.width / 2, canvas.height - margin + (fontSize / 1.5));

    // Switch to canvas view
    video.classList.add('hidden');
    canvas.classList.remove('hidden');

    document.getElementById('take-photo').classList.add('hidden');
    document.getElementById('retake-photo').classList.remove('hidden');

    // Prepare download
    const link = document.getElementById('download-link');
    link.href = canvas.toDataURL('image/png');
    link.download = 'birthday_selfie.png';
    link.classList.remove('hidden');
}

function resetCamera() {
    document.getElementById('camera-feed').classList.remove('hidden');
    document.getElementById('photo-canvas').classList.add('hidden');
    document.getElementById('take-photo').classList.remove('hidden');
    document.getElementById('retake-photo').classList.add('hidden');
    document.getElementById('download-link').classList.add('hidden');
}

// --- Celebration (Simple Canvas Confetti) ---
function startConfetti() {
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
    location.reload();
}
