import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

function LuxuryBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const sphereGeometry = new THREE.SphereGeometry(2.4, 48, 48);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x111827,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    const pointsGeometry = new THREE.BufferGeometry();
    const points = [];
    for (let i = 0; i < 700; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2.4 + (Math.random() - 0.5) * 0.15;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      points.push(x, y, z);
    }
    pointsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3)
    );
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
    });
    const pointCloud = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointCloud);

    const gridGeometry = new THREE.BufferGeometry();
    const gridVertices = [];
    const gridSize = 18;
    const step = 0.9;
    for (let x = -gridSize; x <= gridSize; x += step) {
      for (let z = -gridSize; z <= gridSize; z += step) {
        gridVertices.push(x * 0.06, -3.8, z * 0.06);
      }
    }
    gridGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(gridVertices, 3)
    );
    const gridMaterial = new THREE.PointsMaterial({
      color: 0x1e293b,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
    });
    const gridPoints = new THREE.Points(gridGeometry, gridMaterial);
    scene.add(gridPoints);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x38bdf8, 0.8, 0, 2);
    pointLight.position.set(4, 3, 6);
    scene.add(pointLight);
    const warmLight = new THREE.PointLight(0xfbbf24, 0.7, 0, 2);
    warmLight.position.set(-4, -3, 6);
    scene.add(warmLight);

    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      sphere.rotation.y = t * 0.12;
      sphere.rotation.x = Math.sin(t * 0.08) * 0.08;
      pointCloud.rotation.y = t * 0.18;
      pointCloud.rotation.x = Math.sin(t * 0.12) * 0.12;
      gridPoints.position.z = ((t * 0.45) % 4) * -1.4;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      sphereGeometry.dispose();
      pointsGeometry.dispose();
      gridGeometry.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
}

// Decoding Text Component
const DecodedText = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

function Hero() {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleFundingClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/funding");
    }, 2500);
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02020a] text-white selection:bg-[#38bdf8] selection:text-[#02020a]">
      {/* Navigation Transition Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02030a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf81a_1px,transparent_1px),linear-gradient(to_bottom,#38bdf81a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)] opacity-20" />

            {/* Animated Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-md p-8">
              {/* Hexagon Loader */}
              <div className="relative h-32 w-32 flex items-center justify-center">
                {/* Outer Ring */}
                <motion.div
                  className="absolute inset-0 border border-[#38bdf8]/30 rounded-full"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Spinning Segments */}
                <motion.div
                  className="absolute inset-2 border-t-2 border-r-2 border-[#38bdf8]"
                  style={{ borderRadius: '40%' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-4 border-b-2 border-l-2 border-[#facc15]"
                  style={{ borderRadius: '40%' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* Center Core */}
                <div className="h-4 w-4 bg-[#38bdf8] rounded-full shadow-[0_0_20px_#38bdf8]" />
              </div>

              {/* Text Animation */}
              <div className="text-center space-y-4 font-mono">
                <motion.h2
                  className="text-3xl font-bold text-white tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-white to-[#38bdf8]"
                >
                  <DecodedText text="ACCESSING_CORE" />
                </motion.h2>

                <div className="flex flex-col items-center gap-2">
                  <p className="text-[#38bdf8]/70 text-xs tracking-widest uppercase">
                    Authenticating User Signature...
                  </p>
                  <p className="text-[#facc15]/70 text-xs tracking-widest uppercase">
                    <DecodedText text="ENCRYPTING_DATA_STREAM" />
                  </p>
                </div>
              </div>

              {/* Tech Progress Bar */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px] text-[#38bdf8]/50 font-mono">
                  <span>SYS_LOAD</span>
                  <span>100%</span>
                </div>
                <div className="h-1 w-full bg-[#38bdf8]/10 rounded-none overflow-hidden relative">
                  <motion.div
                    className="absolute inset-0 bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]"
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 2, ease: "circOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LuxuryBackground />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(250,204,21,0.14),_transparent_55%)]" />
        <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-gradient-to-br from-[#facc15] via-[#f97316] to-transparent opacity-40 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-gradient-to-tl from-[#38bdf8] via-[#4f46e5] to-transparent opacity-40 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(148,163,184,0.12)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(148,163,184,0.08)_1px,_transparent_1px)] bg-[size:120px_120px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-24 text-center sm:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.26em] text-white/60 backdrop-blur">
            <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-[#facc15] via-[#fde68a] to-[#38bdf8] shadow-[0_0_14px_rgba(250,204,21,0.65)]" />
            Investment Intelligence Ecosystem
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance font-serif text-4xl font-semibold tracking-[0.08em] text-white sm:text-5xl lg:text-6xl"
          >
            Where Capital Meets Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="mx-auto max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base"
          >
            The premier platform connecting those seeking funding with strategic investors.
            Experience advanced analytics, valuation intelligence, and risk
            architecture designed for modern venture ecosystems.
          </motion.p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 0 20px rgba(56, 189, 248, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFundingClick}
              className="relative overflow-hidden rounded-none bg-transparent px-8 py-4 text-sm font-bold tracking-[0.2em] text-[#38bdf8] border border-[#38bdf8] transition-all group"
            >
              <div className="absolute inset-0 bg-[#38bdf8]/10 group-hover:bg-[#38bdf8]/20 transition-colors" />
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-2">
                I'M SEEKING FUNDING
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(250, 204, 21, 0.8)",
                color: "#facc15"
              }}
              whileTap={{ scale: 0.95 }}
              className="rounded-none border border-white/20 bg-black/40 px-8 py-4 text-sm font-bold tracking-[0.2em] text-white/70 backdrop-blur-lg transition-colors hover:bg-black/60"
            >
              I WANT TO INVEST
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
