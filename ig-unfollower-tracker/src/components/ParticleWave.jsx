import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleWave() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.0006);

    const camera = new THREE.PerspectiveCamera(65, width / height, 1, 10000);
    camera.position.set(0, 380, 1100);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x050508, 1);
    container.appendChild(renderer.domElement);

    // Grid configuration
    const SEPARATION_X = 55;
    const SEPARATION_Y = 55;
    const AMOUNT_X = 75;
    const AMOUNT_Y = 75;
    const numParticles = AMOUNT_X * AMOUNT_Y;

    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);
    const colors = new Float32Array(numParticles * 3);

    // Instagram signature color stops: Purple (#833AB4) -> Pink/Magenta (#E1306C) -> Warm Coral/Orange (#F77737)
    const igColors = [
      new THREE.Color(0x833ab4), // Purple
      new THREE.Color(0xc13584), // Violet-Pink
      new THREE.Color(0xe1306c), // Instagram Magenta
      new THREE.Color(0xfd1d1d), // Coral
      new THREE.Color(0xf77737), // Sunset Amber
      new THREE.Color(0xffffff)  // Crisp Crest Highlight
    ];

    let i = 0;
    for (let ix = 0; ix < AMOUNT_X; ix++) {
      for (let iy = 0; iy < AMOUNT_Y; iy++) {
        // Position on XZ plane
        positions[i * 3] = ix * SEPARATION_X - (AMOUNT_X * SEPARATION_X) / 2; // X
        positions[i * 3 + 1] = 0; // Y (animated)
        positions[i * 3 + 2] = iy * SEPARATION_Y - (AMOUNT_Y * SEPARATION_Y) / 2; // Z

        scales[i] = 2.4;

        // Color gradient across the wave grid
        const t = (ix / AMOUNT_X + iy / AMOUNT_Y) * 0.5;
        const colorIdx = Math.min(Math.floor(t * (igColors.length - 1)), igColors.length - 2);
        const factor = (t * (igColors.length - 1)) - colorIdx;

        const c1 = igColors[colorIdx];
        const c2 = igColors[colorIdx + 1];

        const r = THREE.MathUtils.lerp(c1.r, c2.r, factor);
        const g = THREE.MathUtils.lerp(c1.g, c2.g, factor);
        const b = THREE.MathUtils.lerp(c1.b, c2.b, factor);

        // Mix with subtle silver for a sharp professional look
        colors[i * 3] = THREE.MathUtils.lerp(r, 0.95, 0.25);
        colors[i * 3 + 1] = THREE.MathUtils.lerp(g, 0.95, 0.25);
        colors[i * 3 + 2] = THREE.MathUtils.lerp(b, 1.0, 0.25);

        i++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circular soft particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.85)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 14,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = width / 2;
    const windowHalfY = height / 2;

    const onPointerMove = (e) => {
      mouseX = (e.clientX - windowHalfX) * 0.4;
      mouseY = (e.clientY - windowHalfY) * 0.3;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Window resize
    const onResize = () => {
      if (!container) return;
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let count = 0;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera easing towards mouse
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = 380 - targetY * 0.6;
      camera.lookAt(0, 50, 0);

      const posArray = geometry.attributes.position.array;
      let idx = 0;

      // Mathematical wave equations
      for (let ix = 0; ix < AMOUNT_X; ix++) {
        for (let iy = 0; iy < AMOUNT_Y; iy++) {
          // Complex dual-sine wave with diagonal ripple
          const wave1 = Math.sin((ix + count) * 0.28) * 55;
          const wave2 = Math.sin((iy + count) * 0.45) * 45;
          const wave3 = Math.cos((ix + iy + count * 0.75) * 0.18) * 25;

          posArray[idx * 3 + 1] = wave1 + wave2 + wave3;
          idx++;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      count += 0.045;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#050508]"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0d0e15 0%, #050508 85%)'
      }}
    />
  );
}
