class NeuralBackground {
    constructor() {
        this.canvas = document.getElementById('neural-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.numPoints = 60;
        this.maxDistance = 180;
        
        this.init();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    init() {
        this.resize();
        for (let i = 0; i < this.numPoints; i++) {
            this.points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(15, 118, 110, 0.15)';
        this.ctx.fillStyle = 'rgba(15, 118, 110, 0.3)';

        for (let i = 0; i < this.numPoints; i++) {
            let p = this.points[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();

            for (let j = i + 1; j < this.numPoints; j++) {
                let p2 = this.points[j];
                let dist = Math.hypot(p.x - p2.x, p.y - p2.y);

                if (dist < this.maxDistance) {
                    this.ctx.lineWidth = 1 - dist / this.maxDistance;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NeuralBackground();
});
