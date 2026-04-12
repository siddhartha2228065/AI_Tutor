"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  isTalking?: boolean;
  isThinking?: boolean;
  isListening?: boolean;
}

export default function AntiGravitySphere({ isTalking = false, isThinking = false, isListening = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ isTalking, isThinking, isListening });

  // Keep state sync for animation loop closure
  useEffect(() => {
    stateRef.current = { isTalking, isThinking, isListening };
  }, [isTalking, isThinking, isListening]);

  useEffect(() => {
    if (!containerRef.current) return;

    let w = containerRef.current.clientWidth;
    let h = containerRef.current.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.05);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // 2. Liquid Energy Morphing Shader Material
    const coreGeometry = new THREE.IcosahedronGeometry(2.5, 64);
    
    // Shader to create liquid glowing waves with neon colors
    const coreMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color("#4f46e5") }, // Indigo
        uColor2: { value: new THREE.Color("#06b6d4") }, // Cyan
        uColor3: { value: new THREE.Color("#d946ef") }, // Magenta
        uHover: { value: 0 },
        uSpeed: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;
        
        uniform float uTime;
        uniform float uSpeed;

        // Classic 3D Perlin Noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute( permute( permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          vUv = uv;
          vNormal = normal;

          float time = uTime * uSpeed;
          float noiseVal = snoise(position * 0.8 + time * 0.5) * 0.5;
          float ripple = sin(length(position) * 10.0 - time * 4.0) * snoise(position * 2.0 + time) * 0.1;
          
          vNoise = noiseVal + ripple;
          vec3 newPos = position + normal * (vNoise * 0.5);
          vPosition = newPos;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uSpeed;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;

        void main() {
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = dot(viewDirection, vNormal);
          fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
          fresnel = pow(fresnel, 2.0);

          float time = uTime * uSpeed;
          vec3 colorMix = mix(uColor1, uColor2, smoothstep(-0.5, 0.5, vNoise));
          colorMix = mix(colorMix, uColor3, max(0.0, sin(vNoise * 10.0 + time)));

          float pulse = (sin(time * 2.0) * 0.5 + 0.5) * 0.3;
          vec3 finalColor = colorMix + (fresnel * uColor2 * 1.5) + pulse;

          gl_FragColor = vec4(finalColor, 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // 3. Force Field / Holographic Wireframe Shell
    const wireframeGeometry = new THREE.IcosahedronGeometry(2.8, 12);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframeMesh);

    // 4. Fake Volumetric Glow (Billboard Sprite)
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, "rgba(79, 70, 229, 0.8)"); // Indigo
      gradient.addColorStop(0.3, "rgba(6, 182, 212, 0.4)"); // Cyan
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
    }
    const glowTexture = new THREE.CanvasTexture(canvas);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(12, 12, 1);
    scene.add(glowSprite);

    // 5. Cosmic Dust / Orbiting Particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);
    const scaleArray = new Float32Array(particleCount);
    const phaseArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 4 + Math.random() * 4;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      posArray[i] = r * Math.sin(phi) * Math.cos(theta); // x
      posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta); // y
      posArray[i + 2] = r * Math.cos(phi); // z

      scaleArray[i / 3] = Math.random();
      phaseArray[i / 3] = Math.random() * Math.PI * 2;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particleGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));
    particleGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phaseArray, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uColor: { value: new THREE.Color("#0ee") }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSpeed;
        attribute float aScale;
        attribute float aPhase;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          float time = uTime * uSpeed;
          float angle = time * 0.2 + aPhase;
          float s = sin(angle);
          float c = cos(angle);
          
          pos.x = position.x * c - position.z * s;
          pos.z = position.x * s + position.z * c;
          pos.y += sin(time + aPhase) * 0.5;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          gl_PointSize = (15.0 * aScale) * (10.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          vAlpha = 0.3 + (sin(time * 3.0 + aPhase) * 0.5 + 0.5) * 0.7;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float glow = smoothstep(0.5, 0.0, dist);
          gl_FragColor = vec4(uColor * glow, vAlpha * glow);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particlesSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesSystem);

    // 6. Camera Parallax & Mouse Interactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = (x / (rect.width / 2)) * 1.5;
      mouseY = (y / (rect.height / 2)) * 1.5;
    };

    window.addEventListener("mousemove", onMouseMove);

    // Dynamic Variables for lerping
    const currentColors = {
      c1: new THREE.Color("#4f46e5"),
      c2: new THREE.Color("#06b6d4"),
      c3: new THREE.Color("#d946ef"),
    };
    let currentSpeed = 1.0;

    // 7. Animation Loop
    const startTime = performance.now();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) / 1000;
      const state = stateRef.current;

      // React to agent state
      let targetSpeed = 1.0;
      let tC1 = new THREE.Color("#4f46e5"); // Default Indigo
      let tC2 = new THREE.Color("#06b6d4"); // Default Cyan
      let tC3 = new THREE.Color("#d946ef"); // Default Magenta

      if (state.isThinking) {
        targetSpeed = 2.5;
        tC1 = new THREE.Color("#06b6d4"); // Cyan
        tC2 = new THREE.Color("#10b981"); // Emerald
        tC3 = new THREE.Color("#8b5cf6"); // Violet
      } else if (state.isTalking) {
        targetSpeed = 1.5;
        tC1 = new THREE.Color("#ef4444"); // Red/Rose tone
        tC2 = new THREE.Color("#f59e0b"); // Amber
        tC3 = new THREE.Color("#ec4899"); // Pink
      } else if (state.isListening) {
        targetSpeed = 0.5; // calm
        tC1 = new THREE.Color("#3b82f6"); // Blue
        tC2 = new THREE.Color("#8b5cf6"); // Violet
        tC3 = new THREE.Color("#6366f1"); // Indigo
      }

      currentSpeed += (targetSpeed - currentSpeed) * 0.05;
      currentColors.c1.lerp(tC1, 0.05);
      currentColors.c2.lerp(tC2, 0.05);
      currentColors.c3.lerp(tC3, 0.05);

      coreMaterial.uniforms.uTime.value = time;
      coreMaterial.uniforms.uSpeed.value = currentSpeed;
      coreMaterial.uniforms.uColor1.value.copy(currentColors.c1);
      coreMaterial.uniforms.uColor2.value.copy(currentColors.c2);
      coreMaterial.uniforms.uColor3.value.copy(currentColors.c3);
      
      particleMaterial.uniforms.uTime.value = time;
      particleMaterial.uniforms.uSpeed.value = currentSpeed;

      // Voice pulsation
      let voiceScale = 1;
      if (state.isTalking) {
        voiceScale = 1 + Math.sin(time * 15.0) * 0.05;
      }
      coreMesh.scale.set(voiceScale, voiceScale, voiceScale);

      // Gentle free-floating rotation
      coreMesh.rotation.x = Math.sin(time * 0.3 * currentSpeed) * 0.5;
      coreMesh.rotation.y = time * 0.2 * currentSpeed;
      coreMesh.rotation.z = Math.cos(time * 0.25 * currentSpeed) * 0.3;

      wireframeMesh.rotation.x = time * 0.1 * currentSpeed;
      wireframeMesh.rotation.y = -time * 0.15 * currentSpeed;
      
      const hoverY = Math.sin(time * 1.2) * 0.3;
      coreMesh.position.y = hoverY;
      wireframeMesh.position.y = hoverY;
      glowSprite.position.y = hoverY;
      
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      const pulseScale = 12 + Math.sin(time * 2.0 * currentSpeed) * 1.5;
      glowSprite.scale.set(pulseScale, pulseScale, 1);
      if (state.isTalking) glowSprite.material.color.copy(currentColors.c2);
      else glowSprite.material.color.setHex(0xffffff);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize robustly
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      let newW = containerRef.current.clientWidth;
      let newH = containerRef.current.clientHeight;
      if (newW === 0 || newH === 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      resizeObserver.disconnect();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.innerHTML = "";
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-hidden"
      style={{ minWidth: 0, minHeight: 0 }}
    />
  );
}

