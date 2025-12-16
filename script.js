// Fresh Psytrance Visual Engine
// New implementation with kaleidoscope effects, particle systems, and audio-reactive patterns

class PsyVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.kaleidoscopeSegments = 12;
        this.hueShift = 0;
        this.intensity = 1;
        this.pointer = { x: 0.5, y: 0.5 };
        this.activeScene = 0;
        this.transitionProgress = 0;
        this.glitchTimer = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.pointer.x = e.clientX / this.canvas.width;
            this.pointer.y = e.clientY / this.canvas.height;
        });
        
        this.canvas.addEventListener('click', () => {
            this.activeScene = (this.activeScene + 1) % 5;
            this.transitionProgress = 0;
        });
        
        for (let i = 0; i < 150; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
        
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    renderKaleidoscope(drawFunc) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < this.kaleidoscopeSegments; i++) {
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate((Math.PI * 2 * i) / this.kaleidoscopeSegments);
            
            if (i % 2 === 0) {
                this.ctx.scale(1, -1);
            }
            
            drawFunc.call(this);
            this.ctx.restore();
        }
    }
    
    scene1_flowField() {
        const gridSize = 40;
        const flowScale = 0.003;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                const angle = Math.sin(x * flowScale + this.hueShift) * 
                             Math.cos(y * flowScale + this.hueShift) * Math.PI * 2;
                const length = 20 * this.intensity;
                
                const endX = x + Math.cos(angle) * length;
                const endY = y + Math.sin(angle) * length;
                
                const gradient = this.ctx.createLinearGradient(x, y, endX, endY);
                const hue1 = (this.hueShift * 30 + x * 0.5) % 360;
                const hue2 = (this.hueShift * 30 + y * 0.5) % 360;
                
                gradient.addColorStop(0, `hsla(${hue1}, 100%, 50%, 0.6)`);
                gradient.addColorStop(1, `hsla(${hue2}, 100%, 50%, 0.3)`);
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        }
    }
    
    scene2_particleNexus() {
        this.particles.forEach(p => {
            p.update(this.canvas.width, this.canvas.height, this.pointer);
            
            const hue = (p.hue + this.hueShift * 10) % 360;
            this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Connect nearby particles
            this.particles.forEach(other => {
                const dx = p.x - other.x;
                const dy = p.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    this.ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.2 * (1 - dist / 100)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            });
        });
    }
    
    scene3_geometricMorph() {
        this.renderKaleidoscope(function() {
            const sides = 3 + Math.floor(this.pointer.x * 8);
            const radius = 100 + Math.sin(this.hueShift) * 50;
            const rotation = this.hueShift * 0.5;
            
            for (let layer = 0; layer < 5; layer++) {
                const layerRadius = radius * (1 + layer * 0.3);
                const hue = (this.hueShift * 20 + layer * 60) % 360;
                
                this.ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.8 - layer * 0.15})`;
                this.ctx.lineWidth = 3 - layer * 0.4;
                this.ctx.beginPath();
                
                for (let i = 0; i <= sides; i++) {
                    const angle = (i / sides) * Math.PI * 2 + rotation;
                    const px = Math.cos(angle) * layerRadius;
                    const py = Math.sin(angle) * layerRadius;
                    
                    if (i === 0) {
                        this.ctx.moveTo(px, py);
                    } else {
                        this.ctx.lineTo(px, py);
                    }
                }
                
                this.ctx.closePath();
                this.ctx.stroke();
            }
        });
    }
    
    scene4_waveInterference() {
        const waves = 5;
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let x = 0; x < this.canvas.width; x += 2) {
            for (let y = 0; y < this.canvas.height; y += 2) {
                let value = 0;
                
                for (let w = 0; w < waves; w++) {
                    const waveX = this.canvas.width * (0.2 + w * 0.15);
                    const waveY = this.canvas.height * (0.3 + Math.sin(w + this.hueShift) * 0.2);
                    const dx = x - waveX;
                    const dy = y - waveY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    value += Math.sin(dist * 0.05 - this.hueShift * 2) * 0.5 + 0.5;
                }
                
                value /= waves;
                const hue = (value * 360 + this.hueShift * 30) % 360;
                const [r, g, b] = this.hslToRgb(hue / 360, 1, 0.5);
                
                for (let dx = 0; dx < 2 && x + dx < this.canvas.width; dx++) {
                    for (let dy = 0; dy < 2 && y + dy < this.canvas.height; dy++) {
                        const idx = ((y + dy) * this.canvas.width + (x + dx)) * 4;
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                        data[idx + 3] = 255;
                    }
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    scene5_vortexTunnel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.max(this.canvas.width, this.canvas.height);
        
        for (let radius = maxRadius; radius > 0; radius -= 10) {
            const segments = Math.floor(radius / 5);
            const rotation = this.hueShift + (maxRadius - radius) * 0.01;
            const hue = ((maxRadius - radius) / maxRadius * 360 + this.hueShift * 20) % 360;
            
            this.ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.3})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2 + rotation;
                const twist = Math.sin(radius * 0.02 + this.hueShift) * 0.5;
                const x = centerX + Math.cos(angle + twist) * radius;
                const y = centerY + Math.sin(angle + twist) * radius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }
    
    applyGlitchEffect() {
        if (Math.random() < 0.02) {
            const sliceHeight = 20 + Math.random() * 50;
            const sliceY = Math.random() * (this.canvas.height - sliceHeight);
            const offset = (Math.random() - 0.5) * 100;
            
            const slice = this.ctx.getImageData(0, sliceY, this.canvas.width, sliceHeight);
            this.ctx.putImageData(slice, offset, sliceY);
        }
        
        if (Math.random() < 0.01) {
            this.ctx.globalCompositeOperation = 'difference';
            this.ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    hslToRgb(h, s, l) {
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
    
    animate() {
        this.hueShift += 0.02;
        this.glitchTimer += 0.02;
        this.transitionProgress = Math.min(1, this.transitionProgress + 0.02);
        
        // Slow fade trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render active scene
        switch(this.activeScene) {
            case 0:
                this.scene1_flowField();
                break;
            case 1:
                this.scene2_particleNexus();
                break;
            case 2:
                this.scene3_geometricMorph();
                break;
            case 3:
                this.scene4_waveInterference();
                break;
            case 4:
                this.scene5_vortexTunnel();
                break;
        }
        
        // Random glitch effects
        if (this.glitchTimer > 1 && Math.random() < 0.05) {
            this.applyGlitchEffect();
            this.glitchTimer = 0;
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(width, height) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 2 + Math.random() * 4;
        this.hue = Math.random() * 360;
        this.alpha = 0.5 + Math.random() * 0.5;
    }
    
    update(width, height, pointer) {
        // Attract to pointer
        const dx = pointer.x * width - this.x;
        const dy = pointer.y * height - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.vx += (dx / dist) * 0.05;
            this.vy += (dy / dist) * 0.05;
        }
        
        // Velocity damping
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PsyVisualizer('fractalCanvas');
});
