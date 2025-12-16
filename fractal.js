// Alex Grey Inspired Visualization - Adaptive Performance
// Automatically adjusts quality based on device capabilities

const canvas = document.getElementById('fractalCanvas');
if (!canvas) {
    console.error('Canvas element not found');
    document.body.innerHTML = '<div style="color: white; padding: 20px;">Error: Canvas not found</div>';
}
const ctx = canvas.getContext('2d');

// Device detection and performance settings
let deviceProfile = {
    complexity: 1,
    targetFPS: 60,
    pixelRatio: 1,
    quality: 'high'
};

// Detect device capabilities
function detectDevice() {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod/.test(ua);
    const isTablet = /ipad|tablet/.test(ua);
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Check for hardware acceleration
    const gl = document.createElement('canvas').getContext('webgl');
    const hasWebGL = !!gl;
    
    // Estimate device power
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4;
    
    if (isMobile && !isTablet) {
        // Mobile phone
        deviceProfile = {
            complexity: 0.4,
            targetFPS: 30,
            pixelRatio: Math.min(pixelRatio, 1.5),
            quality: 'low',
            maxParticles: 100,
            maxPolygons: 8
        };
    } else if (isTablet) {
        // Tablet
        deviceProfile = {
            complexity: 0.6,
            targetFPS: 45,
            pixelRatio: Math.min(pixelRatio, 2),
            quality: 'medium',
            maxParticles: 200,
            maxPolygons: 12
        };
    } else if (cores >= 8 && memory >= 8) {
        // High-end desktop
        deviceProfile = {
            complexity: 1,
            targetFPS: 60,
            pixelRatio: Math.min(pixelRatio, 2),
            quality: 'ultra',
            maxParticles: 400,
            maxPolygons: 20
        };
    } else if (cores >= 4) {
        // Mid-range desktop
        deviceProfile = {
            complexity: 0.8,
            targetFPS: 60,
            pixelRatio: Math.min(pixelRatio, 2),
            quality: 'high',
            maxParticles: 300,
            maxPolygons: 15
        };
    } else {
        // Low-end desktop
        deviceProfile = {
            complexity: 0.5,
            targetFPS: 30,
            pixelRatio: 1,
            quality: 'medium',
            maxParticles: 150,
            maxPolygons: 10
        };
    }
    
    console.log('Device Profile:', deviceProfile);
}

detectDevice();

// Adaptive FPS management
let lastFrameTime = performance.now();
let frameCount = 0;
let actualFPS = 60;
let frameInterval = 1000 / deviceProfile.targetFPS;

// Canvas state
let width, height;
let mouseX = 0.5;
let mouseY = 0.5;
let time = 0;
let currentPattern = 0;
let autoRotate = true;

// Colors - Alex Grey palette
const colors = ['#00FFFF', '#FF00FF', '#FFFF00', '#FF4500', '#9370DB', '#00FF00', '#FF1493'];

// Resize canvas
function resizeCanvas() {
    const dpr = deviceProfile.pixelRatio;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Input handling
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / width;
    mouseY = e.clientY / height;
    autoRotate = false;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX / width;
        mouseY = e.touches[0].clientY / height;
        autoRotate = false;
    }
}, { passive: false });

canvas.addEventListener('click', () => {
    currentPattern = (currentPattern + 1) % 5;
});

// Get color with rotation
function getColor(offset = 0) {
    const index = Math.floor((time * 0.5 + offset) % colors.length);
    return colors[index];
}

// Pulse effect
function pulse() {
    return 1 + 0.15 * Math.sin(time * 3);
}

// Pattern 1: Organic flowing shapes
function drawPolygons() {
    const numShapes = Math.floor(deviceProfile.maxPolygons * 0.8);
    
    for (let i = 0; i < numShapes; i++) {
        const seed = i * 13.7;
        const noiseX = Math.sin(time * 0.3 + seed) * Math.cos(time * 0.2 + seed * 1.3);
        const noiseY = Math.cos(time * 0.25 + seed) * Math.sin(time * 0.35 + seed * 0.7);
        
        const x = width * (0.3 + noiseX * 0.2 + mouseX * 0.4);
        const y = height * (0.3 + noiseY * 0.2 + mouseY * 0.4);
        
        const sides = 3 + Math.floor(Math.abs(Math.sin(time + seed)) * 5);
        const radius = (30 + Math.sin(time * 0.7 + seed) * 50 + Math.cos(time * 0.4 + seed * 2) * 30) * deviceProfile.complexity;
        const rotation = time * (0.3 + Math.sin(seed) * 0.5) + seed;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        
        for (let j = 0; j <= sides; j++) {
            const a = (j / sides) * Math.PI * 2;
            const rOffset = Math.sin(time * 2 + j + seed) * 15;
            const r = radius + rOffset;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        
        ctx.strokeStyle = getColor(i / numShapes + time * 0.1);
        ctx.lineWidth = 1.5 + Math.abs(Math.sin(time + seed)) * 2;
        ctx.stroke();
        ctx.restore();
    }
}

// Pattern 2: Chaotic vector field
function drawVectorLines() {
    const numPoints = Math.floor(25 * deviceProfile.complexity);
    const points = [];
    
    for (let i = 0; i < numPoints; i++) {
        const seed = i * 7.3;
        const flowX = Math.sin(time * 0.4 + seed * 0.3) * Math.cos(time * 0.3 + seed);
        const flowY = Math.cos(time * 0.35 + seed * 0.5) * Math.sin(time * 0.25 + seed * 1.2);
        
        const wanderX = Math.sin(time * 0.6 + seed * 2) * 0.15;
        const wanderY = Math.cos(time * 0.5 + seed * 3) * 0.15;
        
        points.push({
            x: width * (0.2 + flowX * 0.3 + wanderX + mouseX * 0.4),
            y: height * (0.2 + flowY * 0.3 + wanderY + mouseY * 0.4)
        });
    }
    
    for (let i = 0; i < numPoints; i++) {
        const connectionCount = 2 + Math.floor(Math.random() * 3);
        for (let c = 0; c < connectionCount; c++) {
            const targetIdx = Math.floor(Math.random() * numPoints);
            if (targetIdx === i) continue;
            
            const dx = points[targetIdx].x - points[i].x;
            const dy = points[targetIdx].y - points[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.min(width, height) * 0.4;
            
            if (dist < maxDist) {
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[targetIdx].x, points[targetIdx].y);
                ctx.strokeStyle = getColor(i / numPoints);
                ctx.lineWidth = 1 + (1 - dist / maxDist) * 2;
                ctx.globalAlpha = 0.3 + (1 - dist / maxDist) * 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }
}

// Pattern 3: Flowing energy streams
function drawKaleidoscope() {
    const numStreams = Math.floor(40 * deviceProfile.complexity);
    
    for (let i = 0; i < numStreams; i++) {
        const seed = i * 11.4;
        const lifetime = time * (0.5 + Math.sin(seed) * 0.3);
        
        const startX = width * (0.2 + Math.sin(seed * 2) * 0.3);
        const startY = height * (0.2 + Math.cos(seed * 3) * 0.3);
        
        ctx.beginPath();
        const segments = 20;
        
        for (let s = 0; s < segments; s++) {
            const t = s / segments;
            const phase = lifetime + s * 0.1;
            
            const flowX = Math.sin(phase + seed) * Math.cos(phase * 0.7 + seed * 2);
            const flowY = Math.cos(phase + seed * 1.5) * Math.sin(phase * 0.6 + seed);
            
            const x = startX + flowX * width * 0.3 * t + mouseX * width * 0.2 * t;
            const y = startY + flowY * height * 0.3 * t + mouseY * height * 0.2 * t;
            
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = getColor(i / numStreams + time * 0.05);
        ctx.lineWidth = 1 + Math.abs(Math.sin(time + seed)) * 2;
        ctx.globalAlpha = 0.4 + Math.abs(Math.cos(time * 0.5 + seed)) * 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }x = Math.cos(offset) * length;
            const y = Math.sin(offset) * length;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x, y);
            ctx.strokeStyle = getColor(j / numRays);
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    ctx.restore();
}

// Pattern 4: Particle System
const particles = [];
class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1 + Math.random() * 3;
        this.radius = 2 + Math.random() * 3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = 1;
    }
    
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.angle += (mouseX - 0.5) * 0.1;
        this.life -= 0.01;
        
        if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.reset();
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life * 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function initParticles() {
    const count = Math.floor(deviceProfile.maxParticles * mouseY);
    while (particles.length < count) {
        particles.push(new Particle());
    }
    while (particles.length > count) {
        particles.pop();
    }
}

function drawParticles() {
    initParticles();
    particles.forEach(p => {
        p.update();
        p.draw();
    });
}Organic web of chaos
function drawMandala() {
    const numNodes = Math.floor(12 * deviceProfile.complexity);
    const nodes = [];
    
    for (let i = 0; i < numNodes; i++) {
        const seed = i * 9.8;
        const orbitRadius = (100 + Math.sin(seed) * 80) * deviceProfile.complexity;
        const orbitSpeed = 0.3 + Math.cos(seed * 2) * 0.2;
        const orbitPhase = time * orbitSpeed + seed;
        
        const wobbleX = Math.sin(time * 1.3 + seed * 3) * 40;
        const wobbleY = Math.cos(time * 1.1 + seed * 4) * 40;
        
        const baseX = width / 2 + Math.cos(orbitPhase) * orbitRadius;
        const baseY = height / 2 + Math.sin(orbitPhase) * orbitRadius;
        
        nodes.push({
            x: baseX + wobbleX + (mouseX - 0.5) * width * 0.2,
            y: baseY + wobbleY + (mouseY - 0.5) * height * 0.2,
            seed: seed
        });
    }
    
    for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 200 * deviceProfile.complexity;
            
            if (dist < maxDist && Math.random() < 0.4) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                
                const cpx = (nodes[i].x + nodes[j].x) / 2 + Math.sin(time + i + j) * 50;
                const cpy = (nodes[i].y + nodes[j].y) / 2 + Math.cos(time + i + j) * 50;
                ctx.quadraticCurveTo(cpx, cpy, nodes[j].x, nodes[j].y);
                
                ctx.strokeStyle = getColor((i + j) / (numNodes * 2));
                ctx.lineWidth = 1 + (1 - dist / maxDist) * 3;
                ctx.globalAlpha = 0.2 + (1 - dist / maxDist) * 0.6;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
        
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 3 + Math.sin(time + nodes[i].seed) * 2, 0, Math.PI * 2);
        ctx.fillStyle = getColor(i / numNodes);
        ctx.fillStyle = getColor(ring / rings);
        ctx.lineWidth = 3 - ring * 0.3;
        ctx.stroke();
    }
}

// Main animation loop with adaptive FPS
function animate(currentTime) {
    // Calculate actual FPS
    const deltaTime = currentTime - lastFrameTime;
    
    if (deltaTime >= frameInterval) {
        lastFrameTime = currentTime - (deltaTime % frameInterval);
        frameCount++;
        
        // Update FPS calculation every second
        if (frameCount % 60 === 0) {
            actualFPS = Math.round(1000 / deltaTime);
        }
        
        // Auto-rotate mouse position if not interacting
        if (autoRotate) {
            mouseX = 0.5 + Math.sin(time * 0.3) * 0.3;
            mouseY = 0.5 + Math.cos(time * 0.2) * 0.3;
        }
        
        // Clear with fade trail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw current pattern
        switch (currentPattern) {
            case 0:
                drawPolygons();
                break;
            case 1:
                drawVectorLines();
                break;
            case 2:
                drawKaleidoscope();
                break;
            case 3:
                drawParticles();
                break;
            case 4:
                drawMandala();
                break;
        }
        
        time += 0.03;
    }
    
    requestAnimationFrame(animate);
}

// Start
console.log('Visualization started - Quality:', deviceProfile.quality, 'Target FPS:', deviceProfile.targetFPS);
requestAnimationFrame(animate);
