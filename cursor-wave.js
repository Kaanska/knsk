(() => {
    const backdrop = document.querySelector('.bg-animate');
    if (!backdrop) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'cursor-wave-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    backdrop.prepend(canvas);

    const context = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const colors = ['#4ee2c0', '#52a5ff', '#8b7cff', '#b7fff0', '#348dc7'];
    const pointer = { x: -1000, y: -1000, active: false };
    const bursts = [];
    let cells = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let protectionFrame = 0;
    let previousTime = performance.now();

    const hash = (column, row) => {
        const value = Math.sin(column * 91.7 + row * 217.3) * 43758.5453;
        return value - Math.floor(value);
    };

    function updateProtectedAreas() {
        protectionFrame = 0;
        const padding = 22;
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, a, button, label');
        const protectedAreas = [];

        for (const element of textElements) {
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > height) continue;
            protectedAreas.push({
                left: rect.left - padding,
                right: rect.right + padding,
                top: rect.top - padding,
                bottom: rect.bottom + padding
            });
        }

        for (const cell of cells) {
            cell.protected = protectedAreas.some((area) => (
                cell.x >= area.left && cell.x <= area.right &&
                cell.y >= area.top && cell.y <= area.bottom
            ));
        }
    }

    function scheduleProtectedAreaUpdate() {
        if (protectionFrame) return;
        protectionFrame = requestAnimationFrame(updateProtectedAreas);
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const gap = width < 700 ? 52 : 42;
        const columns = Math.ceil(width / gap) + 2;
        const rows = Math.ceil(height / gap) + 2;
        cells = [];
        for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
                const seed = hash(column, row);
                cells.push({
                    x: column * gap - gap / 2,
                    y: row * gap - gap / 2,
                    shape: Math.floor(seed * 3),
                    color: colors[Math.floor(hash(row + 7, column + 3) * colors.length)],
                    scale: 0.12,
                    phase: hash(column + 17, row + 11) * Math.PI * 2
                });
            }
        }
        updateProtectedAreas();
        draw(performance.now(), 0);
    }

    function drawShape(cell, scale) {
        const size = 6.8 * scale;
        context.save();
        context.translate(cell.x, cell.y);
        context.rotate(cell.phase * 0.18);
        context.fillStyle = cell.color;
        context.beginPath();
        if (cell.shape === 0) {
            context.arc(0, 0, size, 0, Math.PI * 2);
        } else if (cell.shape === 1) {
            context.rect(-size, -size, size * 2, size * 2);
        } else {
            context.moveTo(0, -size * 1.25);
            context.lineTo(size * 1.1, size * 0.8);
            context.lineTo(-size * 1.1, size * 0.8);
            context.closePath();
        }
        context.fill();
        context.restore();
    }

    function draw(time, delta) {
        context.clearRect(0, 0, width, height);
        const radius = Math.min(width, height) * 0.3;

        for (const cell of cells) {
            const dx = cell.x - pointer.x;
            const dy = cell.y - pointer.y;
            const distance = Math.hypot(dx, dy);
            let strength = pointer.active ? Math.max(0, 1 - distance / radius) : 0;
            strength = strength * strength * (3 - 2 * strength);

            for (const burst of bursts) {
                const burstDistance = Math.abs(Math.hypot(cell.x - burst.x, cell.y - burst.y) - burst.radius);
                strength = Math.max(strength, Math.max(0, 1 - burstDistance / 82) * burst.opacity);
            }

            const idlePulse = reducedMotion ? 0 : (Math.sin(time * 0.00055 + cell.phase) + 1) * 0.025;
            const target = 0.12 + idlePulse + strength * 2.45;
            const easing = 1 - Math.exp(-delta * (target > cell.scale ? 10 : 5));
            cell.scale += (target - cell.scale) * easing;
            context.globalAlpha = cell.protected ? 0 : 0.18 + Math.min(0.7, strength * 0.78);
            drawShape(cell, cell.scale);
        }
        context.globalAlpha = 1;
    }

    function animate(time) {
        const delta = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        for (let index = bursts.length - 1; index >= 0; index -= 1) {
            bursts[index].radius += delta * 740;
            bursts[index].opacity -= delta * 0.72;
            if (bursts[index].opacity <= 0) bursts.splice(index, 1);
        }
        draw(time, delta);
        frame = requestAnimationFrame(animate);
    }

    window.addEventListener('pointermove', (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
        pointer.active = false;
    });

    window.addEventListener('pointerdown', (event) => {
        if (reducedMotion) return;
        bursts.push({ x: event.clientX, y: event.clientY, radius: 0, opacity: 1 });
    }, { passive: true });

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', scheduleProtectedAreaUpdate, { passive: true });
    if (document.fonts?.ready) document.fonts.ready.then(scheduleProtectedAreaUpdate);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(frame);
        } else if (!reducedMotion) {
            previousTime = performance.now();
            frame = requestAnimationFrame(animate);
        }
    });

    resize();
    if (!reducedMotion) frame = requestAnimationFrame(animate);
})();
