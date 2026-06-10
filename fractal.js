// Never Not Playing
// Vector lines, changing colors, spinning geometries at varying speeds/sizes/shapes

const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouseX = 0.5;
let mouseY = 0.5;
let time = 0;
let currentPattern = 0;
let interacting = false;
let lastMoveTime = 0;
let isTouch = false;
let fadeOpacity = 0.03;
let lastPatternBeat = -999;

function readAudio() {
    return window.AmoroAudio || {
        energy: 0,
        bass: 0,
        mid: 0,
        high: 0,
        beat: 0,
        playing: false
    };
}

// Colors: vibrant, ethereal blues, purples, golds, reds
const greyColors = ['#00FFFF', '#FF00FF', '#FFFF00', '#FF4500', '#9370DB'];

// Constants
const TEMPO = 128 / 60;
const PULSE_FREQ = TEMPO * 4; // Slower pulse for ethereal feel
const FLASH_THRESHOLD = 0.95;
const GLITCH_FREQ = TEMPO * 2;
const STOP_THRESHOLD = 0.5;
const COLOR_SWAP_SPEED = 0.03; // Slower swap

// Random center title pulses (slow fade in/out)
const centerTitlePulse = {
    active: false,
    start: 0,
    duration: 0,
    next: 2 + Math.random() * 4
};

function centerTitleAlpha() {
    if (!centerTitlePulse.active) {
        if (time >= centerTitlePulse.next) {
            centerTitlePulse.active = true;
            centerTitlePulse.start = time;
            centerTitlePulse.duration = 3.2 + Math.random() * 3.2; // slow in/out
        }
        return 0;
    }

    const t = (time - centerTitlePulse.start) / centerTitlePulse.duration;
    if (t >= 1) {
        centerTitlePulse.active = false;
        centerTitlePulse.next = time + 4.5 + Math.random() * 10; // random downtime
        return 0;
    }

    // 0 -> 1 -> 0 smooth fade
    const wave = Math.sin(Math.PI * t);
    return Math.pow(Math.max(0, wave), 1.15);
}

// Resize
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    height = canvas.height = Math.floor(vh);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeCanvas);
    window.visualViewport.addEventListener('scroll', resizeCanvas);
}

// Mouse/touch
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / width;
    mouseY = e.clientY / height;
    lastMoveTime = time;
    if (!interacting) interacting = true;
    isTouch = false;
});

document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX / width;
        mouseY = e.touches[0].clientY / height;
        lastMoveTime = time;
        if (!interacting) interacting = true;
        isTouch = true;
    }
});

document.addEventListener('touchend', () => {
    currentPattern = (currentPattern + 1) % 5; // Adjusted patterns
    interacting = false;
});

// Pulse
function pulseScale(audio) {
    const drive = audio.energy * 0.55 + audio.bass * 0.35 + audio.beat * 0.45;
    return 1 + 0.2 * Math.abs(Math.sin(time * PULSE_FREQ * Math.PI * 2)) + drive * 0.55;
}

// Get color
function getGreyColor(offset = 0) {
    const index = Math.floor((time * COLOR_SWAP_SPEED + offset) % greyColors.length);
    return greyColors[index];
}

// HSL to RGB
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Spinning geometries: polygons at different speeds/sizes
function drawSpinningPolygons(audio) {
    const centerX = width / 2;
    const centerY = height / 2;
    const numLayers = 4 + Math.floor(mouseY * 4) + Math.floor(audio.energy * 7) + Math.floor(audio.beat * 3);
    
    for (let layer = 0; layer < numLayers; layer++) {
        const sides = 3 + Math.floor((layer + audio.mid * 6 + audio.beat * 2) % 6);
        const radius = (50 + layer * 30) * pulseScale(audio) * (0.5 + mouseX + audio.bass * 0.35);
        const speed = (layer % 2 ? 1 : -1) * (0.05 + layer * 0.01 + audio.energy * 0.18 + audio.high * 0.12);
        const rotation = time * speed;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        ctx.strokeStyle = getGreyColor(layer / numLayers + audio.high * 0.4);
        ctx.lineWidth = 2 + (numLayers - layer) * 0.5 + audio.beat * 2.2;
        ctx.stroke();
        
        ctx.restore();
    }

    // Random, slow title pulse in the center
    const a = centerTitleAlpha();
    if (a > 0) {
        const glitch = Math.abs(Math.sin(time * GLITCH_FREQ * Math.PI * 2));
        const alpha = Math.min(1, a * 0.75 + (glitch > 0.97 ? 0.15 : 0));
        const size = Math.max(14, Math.min(30, Math.min(width, height) * 0.045));

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${size}px monospace`;
        ctx.fillStyle = getGreyColor();
        ctx.globalAlpha = alpha;
        ctx.fillText('Ⲁ Ⲙ Ⲟ ꓤ Ⲟ', 0, 0);
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// Vector lines connecting spinning points
function drawVectorLines(audio) {
    const numPoints = 16 + Math.floor(mouseX * 16) + Math.floor(audio.mid * 18) + Math.floor(audio.beat * 6);
    const radius = Math.min(width, height) / (2.8 - audio.bass * 0.35);
    const centerX = width / 2;
    const centerY = height / 2;
    
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2 + time * (0.02 + i * 0.005 + audio.energy * 0.08);
        const dist = radius * (0.5 + Math.sin(time + i) * (0.3 + audio.high * 0.25));
        points.push({
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist
        });
    }
    
    for (let i = 0; i < numPoints; i++) {
        for (let j = i + 1; j < numPoints; j++) {
            const connectChance = 0.14 + audio.energy * 0.28 + audio.beat * 0.2;
            if (Math.random() < connectChance) {
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.strokeStyle = getGreyColor((i + j) / (numPoints * 2) + audio.mid * 0.3);
                ctx.lineWidth = 1 + Math.sin(time + i + j) * 0.5 + audio.beat * 1.4;
                ctx.stroke();
            }
        }
    }
}

// Ethereal fractal inspired by Grey's patterns
function drawGreyFractal(audio) {
    const maxIterations = 70 + Math.floor(audio.energy * 35);
    const zoom = 1.5 + mouseX * 1 + Math.sin(time * 0.1) * 0.5 + audio.bass * 0.9;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let px = 0; px < width; px += 3) {
        for (let py = 0; py < height; py += 3) {
            let x = (px - width / 2) / (0.3 * zoom * width) + mouseX * 0.3;
            let y = (py - height / 2) / (0.3 * zoom * height) + mouseY * 0.3;
            
            let iteration = 0;
            while (x * x + y * y <= 4 && iteration < maxIterations) {
                const twist = 0.05 + audio.mid * 0.12 + audio.beat * 0.08;
                const xTemp = x * x - y * y - 0.8 + Math.sin(time * twist);
                y = 2 * x * y + 0.27 + Math.cos(time * twist);
                x = xTemp;
                iteration++;
            }
            
            if (iteration < maxIterations) {
                const hue = (iteration / maxIterations * 360 + time * 10) % 360;
                const rgb = hslToRgb(hue / 360, 0.8, 0.6);
                for (let dx = 0; dx < 3 && px + dx < width; dx++) {
                    for (let dy = 0; dy < 3 && py + dy < height; dy++) {
                        const index = ((py + dy) * width + (px + dx)) * 4;
                        data[index] = rgb[0];
                        data[index + 1] = rgb[1];
                        data[index + 2] = rgb[2];
                        data[index + 3] = 128 + iteration * 2;
                    }
                }
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Symmetry lines like anatomical views
function drawSymmetryLines(audio) {
    const centerX = width / 2;
    const numLines = 8 + Math.floor(mouseY * 8) + Math.floor(audio.high * 14) + Math.floor(audio.beat * 4);
    
    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2 + time * (0.03 + audio.energy * 0.06);
        const length = height * 0.4 * (0.5 + Math.sin(time + i) * (0.3 + audio.bass * 0.25));
        
        const x1 = centerX + Math.cos(angle) * length;
        const y1 = height / 2 + Math.sin(angle) * length;
        const x2 = centerX - Math.cos(angle) * length; // Symmetry
        const y2 = height / 2 - Math.sin(angle) * length;
        
        ctx.beginPath();
        ctx.moveTo(centerX, height / 2);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = getGreyColor(i / numLines);
        ctx.lineWidth = 1.5 + pulseScale(audio);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, height / 2);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

// Glitch for sudden changes
function applyGlitch() {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const numSlices = 4 + Math.floor(Math.random() * 4);
    for (let s = 0; s < numSlices; s++) {
        const sliceY = Math.floor(Math.random() * height);
        const sliceHeight = Math.floor(15 + Math.random() * 25);
        const shift = Math.floor(-40 + Math.random() * 80);
        
        for (let y = sliceY; y < sliceY + sliceHeight && y < height; y++) {
            for (let x = 0; x < width; x++) {
                const origIndex = (y * width + x) * 4;
                const newX = (x + shift + width) % width;
                const newIndex = (y * width + newX) * 4;
                
                data[newIndex] = data[origIndex];
                data[newIndex + 1] = data[origIndex + 1];
                data[newIndex + 2] = data[origIndex + 2];
                data[newIndex + 3] = data[origIndex + 3];
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Animation
function animate() {
    const audio = readAudio();
    const motion = audio.playing ? 1 + audio.energy * 2.8 + audio.beat * 1.6 : 1;
    time += 0.02 * motion;
    
    fadeOpacity = Math.min(0.08 + audio.energy * 0.04, fadeOpacity + 0.00005 + audio.beat * 0.004);
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
    ctx.fillRect(0, 0, width, height);
    
    const flashDrive = Math.sin(time * (PULSE_FREQ + audio.bass * 2) * Math.PI * 2);
    if (flashDrive > FLASH_THRESHOLD - audio.beat * 0.2) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.12 + audio.beat * 0.18})`;
        ctx.fillRect(0, 0, width, height);
    }
    
    if (audio.beat > 0.82 && audio.playing && time - lastPatternBeat > 0.45) {
        currentPattern = (currentPattern + 1) % 5;
        lastPatternBeat = time;
    }
    
    switch (currentPattern) {
        case 0:
            drawSpinningPolygons(audio);
            break;
        case 1:
            drawVectorLines(audio);
            break;
        case 2:
            drawGreyFractal(audio);
            break;
        case 3:
            drawSymmetryLines(audio);
            break;
        case 4:
            drawSpinningPolygons(audio);
            drawVectorLines(audio);
            break;
    }
    
    const glitchChance = 0.005 + audio.high * 0.03 + audio.beat * 0.12;
    if (Math.sin(time * (GLITCH_FREQ + audio.mid * 3) * Math.PI * 2) > 0.95 - audio.beat * 0.15 || Math.random() < glitchChance) {
        applyGlitch();
    }
    
    if (interacting && time - lastMoveTime > STOP_THRESHOLD) {
        currentPattern = (currentPattern + 1) % 5;
        interacting = false;
    }
    
    requestAnimationFrame(animate);
}

animate();
