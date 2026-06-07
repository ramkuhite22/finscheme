
/**
 * Math Curve Loader for FinScheme
 * Inspired by math-curve-loaders
 */

class CurveLoader {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.options = Object.assign({
            particleCount: 64,
            trailSpan: 0.38,
            durationMs: 4600,
            pulseDurationMs: 4200,
            rotationDurationMs: 28000,
            strokeWidth: 5.5,
            color: '#10b981', // FinScheme Primary
            scale: 3.9
        }, options);

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 100 100");
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";
        this.container.appendChild(this.svg);

        this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.group);

        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.path.setAttribute("fill", "none");
        this.path.setAttribute("stroke", this.options.color);
        this.path.setAttribute("stroke-width", this.options.strokeWidth);
        this.path.setAttribute("stroke-linecap", "round");
        this.path.setAttribute("stroke-linejoin", "round");
        this.path.setAttribute("opacity", "0.8");
        this.group.appendChild(this.path);

        this.startTime = performance.now();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    getPoint(progress, detailScale) {
        // "Original Thinking" curve formula
        const t = progress * Math.PI * 2;
        const baseRadius = 7;
        const detailAmplitude = 3;
        const petals = 7;
        const scale = this.options.scale;

        const x = baseRadius * Math.cos(t) - detailAmplitude * detailScale * Math.cos(petals * t);
        const y = baseRadius * Math.sin(t) - detailAmplitude * detailScale * Math.sin(petals * t);

        return {
            x: 50 + x * scale,
            y: 50 + y * scale
        };
    }

    animate(now) {
        if (!this.container) return;

        const elapsed = now - this.startTime;
        
        // Pulse/Breathing effect
        const pulseProgress = (elapsed % this.options.pulseDurationMs) / this.options.pulseDurationMs;
        const detailScale = 0.5 + 0.5 * Math.sin(pulseProgress * Math.PI * 2);

        // Rotation
        const rotateProgress = (elapsed % this.options.rotationDurationMs) / this.options.rotationDurationMs;
        this.group.setAttribute("transform", `rotate(${rotateProgress * 360}, 50, 50)`);

        // Draw trail
        const mainProgress = (elapsed % this.options.durationMs) / this.options.durationMs;
        
        let pathData = "";
        for (let i = 0; i < this.options.particleCount; i++) {
            const p = (mainProgress - (i / this.options.particleCount) * this.options.trailSpan + 1) % 1;
            const pt = this.getPoint(p, detailScale);
            pathData += (i === 0 ? "M" : "L") + pt.x.toFixed(2) + "," + pt.y.toFixed(2);
        }

        this.path.setAttribute("d", pathData);
        requestAnimationFrame(this.animate);
    }

    destroy() {
        this.container = null;
    }
}

// Global reveal function
window.hideLoader = function() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            document.body.classList.remove('loading');
        }, 800);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    new CurveLoader('loader-canvas');
    
    // Simulate initial load
    setTimeout(window.hideLoader, 2500);
});
