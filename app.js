import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Remove loading screen on complete load
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loader = document.getElementById('loading');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 1000);
        }
    }, 1500);
});

// --- Scene & Camera Config ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050101, 0.015);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 55;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Composer & Bloom setup
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.45, 0.85);
composer.addPass(bloomPass);

// --- High Fidelity Particle Engine ---
const COUNT = 25000;
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const sizes = new Float32Array(COUNT);

// Target states mapping
const targets = {
    neutral: { pos: new Float32Array(COUNT * 3), col: new Float32Array(COUNT * 3), size: new Float32Array(COUNT) },
    tiger: { pos: new Float32Array(COUNT * 3), col: new Float32Array(COUNT * 3), size: new Float32Array(COUNT) },
    onehanded: { pos: new Float32Array(COUNT * 3), col: new Float32Array(COUNT * 3), size: new Float32Array(COUNT) },
    genjutsu: { pos: new Float32Array(COUNT * 3), col: new Float32Array(COUNT * 3), size: new Float32Array(COUNT) },
    akatsuki: { pos: new Float32Array(COUNT * 3), col: new Float32Array(COUNT * 3), size: new Float32Array(COUNT) }
};

// --- State Descriptors ---
const descriptors = {
    neutral: "A peaceful rest state. Swirling red and black ash circles Itachi's stance quietly.",
    tiger: "Katon: Gōkākyū no Jutsu! A massive rotating stream of blazing fireballs surges outwards.",
    onehanded: "Tsukuyomi Illusion! Crimson geometric concentric rings project deep hypnotic space-time ripples.",
    genjutsu: "Genjutsu Awakened! A vibrating crimson Kanji '幻' (Illusion) seal and Japanese Onmyodo star spin majestically with ultimate power.",
    akatsuki: "The Amaterasu activates! Itachi's classic Mangekyō Sharingan pinwheel revolves majestically."
};

// --- Itachi's Visual Jutsu Math Algorithms ---

// 1. Neutral: Swirling Ash Cylinder
function getNeutral(i) {
    const theta = Math.random() * Math.PI * 2;
    const r = 8 + Math.random() * 8;
    const y = (Math.random() - 0.5) * 45;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    // 60% black/grey ash, 40% deep red ash
    let r_col, g_col, b_col;
    if (Math.random() < 0.6) {
        r_col = 0.06 + Math.random() * 0.05;
        g_col = 0.05 + Math.random() * 0.05;
        b_col = 0.06 + Math.random() * 0.05;
    } else {
        r_col = 0.6 + Math.random() * 0.2;
        g_col = 0.02 + Math.random() * 0.03;
        b_col = 0.04 + Math.random() * 0.03;
    }
    
    return { x, y, z, r: r_col, g: g_col, b: b_col, s: 0.8 + Math.random() * 1.4 };
}

// 2. Tiger Seal: Fire Ball Jutsu (A roaring, swirling rising fire vortex cone)
function getFireball(i) {
    const theta = Math.random() * Math.PI * 2;
    const progress = Math.random(); // Height progress

    // Dynamic expanding cone vortex
    const radius = (progress * 18.0) + (Math.random() - 0.5) * 4;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    const y = (progress - 0.5) * 45 + (Math.random() - 0.5) * 4;

    // Bright fire gradient: fiery orange to neon gold/yellow
    const r = 1.0;
    const g = 0.15 + (Math.random() * 0.55 * (1.0 - progress));
    const b = 0.0;

    return { x, y, z, r, g, b, s: 1.8 * (1.2 - progress) };
}

// 3. One-Handed Sign: Tsukuyomi Concentric Hypnotic Moons
function getTsukuyomi(i) {
    if (i < COUNT * 0.4) {
        // High intensity concentric split rings
        const ringIndex = i % 4;
        const radius = 9 + ringIndex * 8;
        const theta = Math.random() * Math.PI * 2;
        const deviation = (Math.random() - 0.5) * 0.8;

        return {
            x: (radius + deviation) * Math.cos(theta),
            y: (radius + deviation) * Math.sin(theta),
            z: (Math.random() - 0.5) * 1.5,
            r: 0.95, g: 0.05, b: 0.08, s: 2.2
        };
    } else {
        // Surrounding dark deep crimson space cloud
        const r = 24 + Math.random() * 26;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        return {
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi) * 0.2, // flattened layout
            r: 0.15, g: 0.02, b: 0.05, s: 0.8
        };
    }
}

// 4. Genjutsu Finger: Japanese Anime Magic Circle and Kanji "幻"
function getGenjutsuSeal(i) {
    // Precompute Pentagram Vertices for R = 13.5
    const R_star = 13.5;
    const V_star = [];
    for (let k = 0; k < 5; k++) {
        const angle = k * 2 * Math.PI / 5 - Math.PI / 2;
        V_star.push({ x: R_star * Math.cos(angle), y: R_star * Math.sin(angle) });
    }

    // Kanji "幻" Stroke Segments inside a R = 7 bounding box
    const kanjiSegments = [
        // Left side of 幻
        { x1: -3.5, y1: 4.5, x2: -1.2, y2: 2.2 },
        { x1: -2.2, y1: 2.2, x2: -2.2, y2: -5.0 },
        { x1: -2.2, y1: -5.0, x2: -0.8, y2: -4.2 },
        
        // Middle hook of 幻
        { x1: -0.8, y1: 3.0, x2: 2.5, y2: 3.0 },
        { x1: 2.5, y1: 3.0, x2: 2.5, y2: -1.2 },
        { x1: 2.5, y1: -1.2, x2: 0.0, y2: -1.2 },
        
        // Right hook of 幻
        { x1: 0.8, y1: 4.0, x2: 3.5, y2: 1.8 },
        { x1: 3.5, y1: 1.8, x2: 3.5, y2: -5.0 },
        { x1: 3.5, y1: -5.0, x2: 5.0, y2: -3.8 }
    ];

    let x = 0, y = 0, z = 0;
    let r = 1.0, g = 0.0, b = 0.0;
    let s = 1.2;

    if (i < COUNT * 0.35) {
        // Component A: Kanji "幻" in the center (35% of particles)
        const seg = kanjiSegments[i % kanjiSegments.length];
        const t = Math.random();
        x = seg.x1 + (seg.x2 - seg.x1) * t + (Math.random() - 0.5) * 0.5;
        y = seg.y1 + (seg.y2 - seg.y1) * t + (Math.random() - 0.5) * 0.5;
        z = (Math.random() - 0.5) * 0.5;

        // Glowing anime neon pink/red gradient
        r = 1.0;
        g = 0.0;
        b = 0.4 + Math.random() * 0.5;
        s = 2.0;
    }
    else if (i < COUNT * 0.65) {
        // Component B: Pentagram Star (30% of particles)
        const starLine = i % 5;
        const t = Math.random();
        let p1, p2;
        if (starLine === 0) { p1 = V_star[0]; p2 = V_star[2]; }
        else if (starLine === 1) { p1 = V_star[2]; p2 = V_star[4]; }
        else if (starLine === 2) { p1 = V_star[4]; p2 = V_star[1]; }
        else if (starLine === 3) { p1 = V_star[1]; p2 = V_star[3]; }
        else { p1 = V_star[3]; p2 = V_star[0]; }

        x = p1.x + (p2.x - p1.x) * t + (Math.random() - 0.5) * 0.4;
        y = p1.y + (p2.y - p1.y) * t + (Math.random() - 0.5) * 0.4;
        z = (Math.random() - 0.5) * 0.5;

        // Fiery orange/gold
        r = 1.0;
        g = 0.2 + Math.random() * 0.4;
        b = 0.0;
        s = 1.6;
    }
    else if (i < COUNT * 0.90) {
        // Component C: Concentric Rings (25% of particles)
        const ringIndex = i % 2;
        const radius = ringIndex === 0 ? 17.5 : 22.0;
        const theta = Math.random() * Math.PI * 2;
        x = radius * Math.cos(theta) + (Math.random() - 0.5) * 0.3;
        y = radius * Math.sin(theta) + (Math.random() - 0.5) * 0.3;
        z = (Math.random() - 0.5) * 0.5;

        // Deep electric purple/violet
        r = 0.4 + Math.random() * 0.3;
        g = 0.0;
        b = 1.0;
        s = 1.4;
    }
    else {
        // Component D: Radiating Power Rays (10% of particles)
        const rayIndex = i % 8;
        const angle = rayIndex * Math.PI / 4;
        const distance = 5.0 + Math.random() * 23.0;
        x = distance * Math.cos(angle) + (Math.random() - 0.5) * 0.5;
        y = distance * Math.sin(angle) + (Math.random() - 0.5) * 0.5;
        z = (Math.random() - 0.5) * 0.5;

        // Neon golden rays
        r = 1.0;
        g = 0.8 + Math.random() * 0.2;
        b = 0.0;
        s = 1.0;
    }

    return { x, y, z, r, g, b, s };
}

// 5. Akatsuki: Itachi's Mangekyō Sharingan Pinwheel & Amaterasu Black Flames
function getAkatsuki(i) {
    let x, y, z;
    let r = 0, g = 0, b = 0;
    let s = 1.0;

    if (i < COUNT * 0.35) {
        // Component A: Red Background Disk (35%)
        const radius = 3.5 + Math.random() * 14.0;
        const theta = Math.random() * Math.PI * 2;
        x = radius * Math.cos(theta);
        y = radius * Math.sin(theta);
        z = (Math.random() - 0.5) * 0.5;
        
        // Deep Sharingan Crimson
        r = 0.85;
        g = 0.01;
        b = 0.03;
        s = 0.8 + Math.random() * 0.8;
    } 
    else if (i < COUNT * 0.45) {
        // Component B: Center Pupil (10%)
        const radius = Math.random() * 3.5;
        const theta = Math.random() * Math.PI * 2;
        x = radius * Math.cos(theta);
        y = radius * Math.sin(theta);
        z = (Math.random() - 0.5) * 0.5;

        // Black pupil
        r = 0.01;
        g = 0.01;
        b = 0.01;
        s = 1.2;
    } 
    else if (i < COUNT * 0.55) {
        // Component C: Outer Boundary Ring (10%)
        const radius = 17.5 + Math.random() * 0.8;
        const theta = Math.random() * Math.PI * 2;
        x = radius * Math.cos(theta);
        y = radius * Math.sin(theta);
        z = (Math.random() - 0.5) * 0.5;

        // Black ring
        r = 0.01;
        g = 0.01;
        b = 0.01;
        s = 1.4;
    } 
    else if (i < COUNT * 0.85) {
        // Component D: Three Curved Blades (30%)
        const bladeIndex = i % 3;
        const t = Math.random(); // parameter from inner pupil to outer ring
        const radius = 3.5 + t * 14.0;
        
        const baseAngle = bladeIndex * (2 * Math.PI / 3);
        const curveOffset = t * 1.8; // spiral twist
        const width = 0.55 * Math.sin(t * Math.PI); // wider in center, narrow at ends
        const angle = baseAngle + curveOffset + (Math.random() - 0.5) * width;

        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
        z = (Math.random() - 0.5) * 0.5;

        // Black blades
        r = 0.01;
        g = 0.01;
        b = 0.01;
        s = 1.5;
    } 
    else {
        // Component E: Amaterasu Black & Violet Flame Storm (15%)
        const radius = 18.5 + Math.random() * 10.0;
        const theta = Math.random() * Math.PI * 2;
        x = radius * Math.cos(theta);
        y = radius * Math.sin(theta);
        z = (Math.random() - 0.5) * 6.0;

        // Dark violet and deep black ash
        r = 0.08 + Math.random() * 0.04;
        g = 0.0;
        b = 0.16 + Math.random() * 0.08;
        s = 1.0 + Math.random() * 2.0;
    }

    return { x, y, z, r, g, b, s };
}

// Initialize all target arrays
function initTargets() {
    for (let i = 0; i < COUNT; i++) {
        // Neutral
        const neu = getNeutral(i);
        targets.neutral.pos[3 * i] = neu.x;
        targets.neutral.pos[3 * i + 1] = neu.y;
        targets.neutral.pos[3 * i + 2] = neu.z;
        targets.neutral.col[3 * i] = neu.r;
        targets.neutral.col[3 * i + 1] = neu.g;
        targets.neutral.col[3 * i + 2] = neu.b;
        targets.neutral.size[i] = neu.s;

        // Tiger
        const tig = getFireball(i);
        targets.tiger.pos[3 * i] = tig.x;
        targets.tiger.pos[3 * i + 1] = tig.y;
        targets.tiger.pos[3 * i + 2] = tig.z;
        targets.tiger.col[3 * i] = tig.r;
        targets.tiger.col[3 * i + 1] = tig.g;
        targets.tiger.col[3 * i + 2] = tig.b;
        targets.tiger.size[i] = tig.s;

        // One-Handed
        const one = getTsukuyomi(i);
        targets.onehanded.pos[3 * i] = one.x;
        targets.onehanded.pos[3 * i + 1] = one.y;
        targets.onehanded.pos[3 * i + 2] = one.z;
        targets.onehanded.col[3 * i] = one.r;
        targets.onehanded.col[3 * i + 1] = one.g;
        targets.onehanded.col[3 * i + 2] = one.b;
        targets.onehanded.size[i] = one.s;

        // Genjutsu
        const gen = getGenjutsuSeal(i);
        targets.genjutsu.pos[3 * i] = gen.x;
        targets.genjutsu.pos[3 * i + 1] = gen.y;
        targets.genjutsu.pos[3 * i + 2] = gen.z;
        targets.genjutsu.col[3 * i] = gen.r;
        targets.genjutsu.col[3 * i + 1] = gen.g;
        targets.genjutsu.col[3 * i + 2] = gen.b;
        targets.genjutsu.size[i] = gen.s;

        // Akatsuki
        const aka = getAkatsuki(i);
        targets.akatsuki.pos[3 * i] = aka.x;
        targets.akatsuki.pos[3 * i + 1] = aka.y;
        targets.akatsuki.pos[3 * i + 2] = aka.z;
        targets.akatsuki.col[3 * i] = aka.r;
        targets.akatsuki.col[3 * i + 1] = aka.g;
        targets.akatsuki.col[3 * i + 2] = aka.b;
        targets.akatsuki.size[i] = aka.s;
    }
}

initTargets();

// Set initial state to neutral
for (let i = 0; i < COUNT * 3; i++) {
    positions[i] = targets.neutral.pos[i];
    colors[i] = targets.neutral.col[i];
}
for (let i = 0; i < COUNT; i++) {
    sizes[i] = targets.neutral.size[i];
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const material = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// --- State and UI Control Systems ---
let activeState = 'neutral';
let selectedManualState = 'neutral';

function triggerState(state, isManual = true) {
    if (state === activeState) return;
    
    activeState = state;
    if (isManual) {
        selectedManualState = state;
    }

    // Play cinematic sharingan flash
    const overlay = document.getElementById('eye-overlay');
    if (overlay) {
        overlay.classList.remove('laser-flash');
        void overlay.offsetWidth; // Trigger reflow to restart animation
        overlay.classList.add('laser-flash');
    }

    // Update UI text info
    const techName = document.getElementById('technique-name');
    const jutsuDesc = document.getElementById('jutsu-desc');
    if (techName) techName.innerText = state === 'akatsuki' ? 'Mangekyō Awakened' : state === 'onehanded' ? 'Tsukuyomi Illusion' : state === 'genjutsu' ? 'Genjutsu Awakened' : state === 'tiger' ? 'Tiger Seal (Katon)' : 'Chakra Neutral';
    if (jutsuDesc) jutsuDesc.innerText = descriptors[state];

    // Update button visual states
    const buttons = document.querySelectorAll('.gesture-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        const stateId = btn.id.replace('btn-', '');
        if (stateId === state) {
            btn.classList.add('active');
        }
    });

    // Reset rotation scales on state shift for clean transition start
    particles.rotation.set(0, 0, 0);
    particles.scale.setScalar(1);
    material.size = 0.35;
}

// Expose manual trigger function to global window scope (for HTML onclicks)
window.triggerManualState = function(state) {
    triggerState(state, true);
};

// --- Render & Animation Loop ---
const clock = new THREE.Clock();
const lerpSpeed = 0.05;

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    const posArr = geometry.attributes.position.array;
    const colArr = geometry.attributes.color.array;
    const sizeArr = geometry.attributes.size.array;
    
    const targetPos = targets[activeState].pos;
    const targetCol = targets[activeState].col;
    const targetSize = targets[activeState].size;

    // Smoothly morph position, color and size attributes
    for (let i = 0; i < COUNT; i++) {
        // Position
        const idx3 = i * 3;
        posArr[idx3] += (targetPos[idx3] - posArr[idx3]) * lerpSpeed;
        posArr[idx3 + 1] += (targetPos[idx3 + 1] - posArr[idx3 + 1]) * lerpSpeed;
        posArr[idx3 + 2] += (targetPos[idx3 + 2] - posArr[idx3 + 2]) * lerpSpeed;

        // Color
        colArr[idx3] += (targetCol[idx3] - colArr[idx3]) * lerpSpeed;
        colArr[idx3 + 1] += (targetCol[idx3 + 1] - colArr[idx3 + 1]) * lerpSpeed;
        colArr[idx3 + 2] += (targetCol[idx3 + 2] - colArr[idx3 + 2]) * lerpSpeed;

        // Size
        sizeArr[i] += (targetSize[i] - sizeArr[i]) * lerpSpeed;
    }

    // Apply specific continuous animation behaviors for active state
    if (activeState === 'neutral') {
        // Slow swirling cylindrical storm
        particles.rotation.y = time * 0.2;
        particles.rotation.x = Math.sin(time * 0.5) * 0.05;
    } 
    else if (activeState === 'tiger') {
        // Blazing fireball vortex - fast spiral spin
        particles.rotation.y = -time * 1.5;
        material.size = 0.35 + Math.sin(time * 8.0) * 0.08; // pulse fire glow size
    } 
    else if (activeState === 'onehanded') {
        // Tsukuyomi concentric geometric rings rotating
        particles.rotation.z = time * 0.4;
        
        // Dynamic ripple waves projecting deep hypnotic space-time distortion
        for (let i = 0; i < COUNT; i++) {
            const idx3 = i * 3;
            const x = posArr[idx3];
            const y = posArr[idx3 + 1];
            const d = Math.sqrt(x*x + y*y);
            // Oscillate depth based on distance from center for hypnotic concentric waves
            if (d < 35.0) {
                posArr[idx3 + 2] = targetPos[idx3 + 2] + Math.sin(d * 0.4 - time * 6.0) * 1.0;
            }
        }
    } 
    else if (activeState === 'genjutsu') {
        // Spin the anime Kanji circle
        particles.rotation.z = time * 0.5;
        // Breathing pulse effect
        particles.scale.setScalar(1.0 + Math.sin(time * 3.0) * 0.06);
    } 
    else if (activeState === 'akatsuki') {
        // Revolving Mangekyō Sharingan pinwheel
        particles.rotation.z = -time * 1.2;
        
        // Add subtle heat distortion / flickering motion to Amaterasu black flames (last 15% particles)
        const flameStartIndex = Math.floor(COUNT * 0.85);
        for (let i = flameStartIndex; i < COUNT; i++) {
            const idx3 = i * 3;
            // Flame particles drift outwards and sway randomly
            posArr[idx3] += (Math.random() - 0.5) * 0.15;
            posArr[idx3 + 1] += (Math.random() - 0.5) * 0.15;
            posArr[idx3 + 2] += (Math.random() - 0.5) * 0.15;
        }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;

    composer.render();
}

animate();

// --- Responsive Window Resizing ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});


// --- MediaPipe Gesture Recognition Engine ---
const videoElement = document.querySelector('.input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

let neutralTimeoutId = null;
let lastGesture = 'neutral';
let gestureBuffer = [];
const BUFFER_SIZE = 5;

// Euclidean distance helper
function getDistance(lm1, lm2) {
    const dx = lm1.x - lm2.x;
    const dy = lm1.y - lm2.y;
    const dz = lm1.z - lm2.z || 0;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

function handleNoHands() {
    // If we lose hand tracking, debounce back to selected manual state after 1.5 seconds
    if (!neutralTimeoutId) {
        neutralTimeoutId = setTimeout(() => {
            if (activeState !== selectedManualState) {
                triggerState(selectedManualState, false);
                lastGesture = selectedManualState;
                gestureBuffer = [];
            }
        }, 1500);
    }
}

function detectGesture(results) {
    const handsList = results.multiHandLandmarks;
    if (!handsList || handsList.length === 0) {
        handleNoHands();
        return;
    }

    // Cancel return-to-manual timeout since hands are detected
    if (neutralTimeoutId) {
        clearTimeout(neutralTimeoutId);
        neutralTimeoutId = null;
    }

    let detected = 'neutral';

    if (handsList.length === 2) {
        // Two hands detected -> Tiger Seal (Fireball)
        detected = 'tiger';
    } 
    else if (handsList.length === 1) {
        const lm = handsList[0];
        
        // 1. Check Index-to-Thumb pinch for Mangekyō (Akatsuki)
        // Index tip = 8, Thumb tip = 4
        const pinchDist = getDistance(lm[4], lm[8]);

        // 2. Check finger extension status (tip vs PIP joints)
        // MediaPipe Y points down: smaller Y value means higher in screen
        const indexExtended = lm[8].y < lm[6].y;
        const middleExtended = lm[12].y < lm[10].y;
        const ringExtended = lm[16].y > lm[14].y;  // folded (tip lower than PIP)
        const pinkyExtended = lm[20].y > lm[18].y; // folded

        if (pinchDist < 0.04) {
            detected = 'akatsuki';
        } 
        else if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
            detected = 'onehanded'; // Index+Middle up, Ring+Pinky folded
        } 
        else if (indexExtended && !middleExtended && ringExtended && pinkyExtended) {
            detected = 'genjutsu';  // Index up only, Middle/Ring/Pinky folded
        }
    }

    // Debounce noise using a simple rolling window buffer
    gestureBuffer.push(detected);
    if (gestureBuffer.length > BUFFER_SIZE) {
        gestureBuffer.shift();
    }

    // Find most frequent gesture in buffer
    const counts = {};
    let maxCount = 0;
    let consensus = 'neutral';
    for (const g of gestureBuffer) {
        counts[g] = (counts[g] || 0) + 1;
        if (counts[g] > maxCount) {
            maxCount = counts[g];
            consensus = g;
        }
    }

    if (consensus !== lastGesture) {
        lastGesture = consensus;
        triggerState(consensus, false);
    }
}

// MediaPipe results handler
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            // Draw skeleton connections in sharingan red
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#ff1111', lineWidth: 2 });
            // Draw joints in pure white
            drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
        }
        detectGesture(results);
    } else {
        handleNoHands();
    }
    canvasCtx.restore();
}

// Setup MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});
hands.onResults(onResults);

// Setup Web Camera Utility
const cameraMP = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

// Start tracking and handle camera block gracefully
cameraMP.start().catch(err => {
    console.warn("Webcam access denied or camera not found. Visual Jutsu Engine will run in manual-only dashboard mode.", err);
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
        videoContainer.style.borderColor = 'rgba(255, 50, 50, 0.1)';
    }
});
