import React, { useEffect, useRef, useState } from 'react';

const CyberNetworkBackground = () => {
  const canvasRef = useRef(null);
  const packetsRef = useRef([]);
  const connsRef = useRef([]);
  const lastFIRAlertRef = useRef(Date.now());
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const dx = (e.clientX - window.innerWidth / 2) / 80;
      const dy = (e.clientY - window.innerHeight / 2) / 80;
      setMouseOffset({ x: dx, y: dy });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 11 Key Metropolitan Cities matching the user requirement
    const cities = {
      SRINAGAR: { x: 380, y: 100, name: 'SRINAGAR', isMajor: true, alertState: 0 },
      DELHI: { x: 410, y: 200, name: 'DELHI', isMajor: true, alertState: 0 },
      JAIPUR: { x: 330, y: 280, name: 'JAIPUR', isMajor: true, alertState: 0 },
      LUCKNOW: { x: 480, y: 260, name: 'LUCKNOW', isMajor: true, alertState: 0 },
      KOLKATA: { x: 710, y: 440, name: 'KOLKATA', isMajor: true, alertState: 0 },
      AHMEDABAD: { x: 250, y: 390, name: 'AHMEDABAD', isMain: true, isMajor: true, alertState: 0 },
      MUMBAI: { x: 270, y: 530, name: 'MUMBAI', isMajor: true, alertState: 0 },
      PUNE: { x: 290, y: 550, name: 'PUNE', isMajor: true, alertState: 0 },
      HYDERABAD: { x: 460, y: 600, name: 'HYDERABAD', isMajor: true, alertState: 0 },
      BENGALURU: { x: 420, y: 700, name: 'BENGALURU', isMajor: true, alertState: 0 },
      CHENNAI: { x: 475, y: 730, name: 'CHENNAI', isMajor: true, alertState: 0 }
    };

    // Vector border coordinates to outline India with 20-25% scale reduction support
    const borderPoints = [
      { x: 380, y: 80 },   // Srinagar / North Kashmir
      { x: 440, y: 150 },  // Uttarakhand
      { x: 480, y: 240 },  // Nepal border
      { x: 550, y: 260 },  // Sikkim
      { x: 590, y: 230 },  // Bhutan
      { x: 670, y: 240 },  // Arunachal East
      { x: 650, y: 310 },  // Nagaland / Manipur
      { x: 580, y: 330 },  // Mizoram / Tripura
      { x: 550, y: 290 },  // Bangladesh West
      { x: 710, y: 440 },  // Kolkata
      { x: 580, y: 550 },  // Odisha Coast
      { x: 520, y: 650 },  // Andhra Coast
      { x: 480, y: 760 },  // Chennai
      { x: 450, y: 850 },  // Southern tip
      { x: 400, y: 800 },  // Kerala
      { x: 380, y: 700 },  // Karnataka
      { x: 270, y: 530 },  // Mumbai
      { x: 230, y: 440 },  // Gujarat West
      { x: 250, y: 380 },  // Kutch
      { x: 300, y: 300 },  // Rajasthan
      { x: 350, y: 200 }   // Punjab border
    ];

    // Connections between the cities matching the mockup exactly
    const connections = [
      ['SRINAGAR', 'DELHI'],
      ['SRINAGAR', 'JAIPUR'],
      ['DELHI', 'JAIPUR'],
      ['DELHI', 'LUCKNOW'],
      ['DELHI', 'AHMEDABAD'],
      ['JAIPUR', 'AHMEDABAD'],
      ['JAIPUR', 'MUMBAI'],
      ['LUCKNOW', 'KOLKATA'],
      ['LUCKNOW', 'HYDERABAD'],
      ['AHMEDABAD', 'MUMBAI'],
      ['AHMEDABAD', 'DELHI'],
      ['AHMEDABAD', 'BENGALURU'],
      ['AHMEDABAD', 'CHENNAI'],
      ['AHMEDABAD', 'KOLKATA'],
      ['AHMEDABAD', 'HYDERABAD'],
      ['MUMBAI', 'PUNE'],
      ['PUNE', 'HYDERABAD'],
      ['PUNE', 'BENGALURU'],
      ['MUMBAI', 'HYDERABAD'],
      ['MUMBAI', 'BENGALURU'],
      ['HYDERABAD', 'CHENNAI'],
      ['HYDERABAD', 'KOLKATA'],
      ['BENGALURU', 'CHENNAI']
    ];

    // Initialize dynamic connection activity tracker
    if (connsRef.current.length === 0) {
      connsRef.current = connections.map(pair => ({
        pair,
        activity: 0.15,
        targetActivity: 0.15,
        lastChange: Date.now(),
        changeInterval: Math.random() * 2000 + 1000
      }));
    }

    // Spawn packets along connection paths
    const spawnPacket = (fromCityKey, toCityKey, type = 'normal') => {
      if (packetsRef.current.length > 40) return;
      packetsRef.current.push({
        from: cities[fromCityKey],
        to: cities[toCityKey],
        progress: 0,
        speed: type === 'fir' ? 0.008 : 0.003 + Math.random() * 0.004,
        type
      });
    };

    // Ambient floating particles
    let particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        size: 1 + Math.random() * 1.5,
        speedX: (Math.random() - 0.5) * 0.06,
        speedY: (Math.random() - 0.5) * 0.06,
        alpha: 0.15 + Math.random() * 0.25
      });
    }

    const render = () => {
      const time = Date.now();
      
      // Transparent background so the page wrapper gradient shows clearly
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Redesigned: Scale down India map by 20-25% compared to the reference image
      // Previous scale was min(width * 0.55, height * 0.72)
      // New scale is min(width * 0.41, height * 0.54) - exactly 25% reduction!
      const scale = Math.min(canvas.width * 0.41, canvas.height * 0.54) / 1000;
      const offsetX = (canvas.width - 1000 * scale) / 2;
      const offsetY = (canvas.height - 1100 * scale) / 2;

      const toScreen = (pt) => ({
        x: pt.x * scale + offsetX,
        y: pt.y * scale + offsetY
      });

      // 1. Draw India Border High-Tech Dotted Mesh Outline
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.16)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([5, 5]); // Cyber-mesh style line dash
      ctx.beginPath();
      borderPoints.forEach((pt, idx) => {
        const screen = toScreen(pt);
        if (idx === 0) ctx.moveTo(screen.x, screen.y);
        else ctx.lineTo(screen.x, screen.y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // 2. Draw Continuously Moving/Glowing Connection Lines
      connsRef.current.forEach(c => {
        if (time - c.lastChange > c.changeInterval) {
          c.targetActivity = Math.random() < 0.25 ? 0.95 : 0.15;
          c.lastChange = time;
          c.changeInterval = c.targetActivity > 0.5 ? Math.random() * 2000 + 1000 : Math.random() * 3000 + 2000;
        }

        // Smooth activity interpolation
        c.activity += (c.targetActivity - c.activity) * 0.04;

        const pt1 = toScreen(cities[c.pair[0]]);
        const pt2 = toScreen(cities[c.pair[1]]);
        
        ctx.strokeStyle = `rgba(0, 217, 255, ${c.activity * 0.3 + 0.06})`;
        ctx.lineWidth = c.activity > 0.5 ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
      });

      // 3. Moving Data Packets (continuous travel along routes)
      if (Math.random() < 0.12 && packetsRef.current.length < 40) {
        const randomConn = connections[Math.floor(Math.random() * connections.length)];
        spawnPacket(randomConn[0], randomConn[1], 'normal');
      }

      packetsRef.current = packetsRef.current.filter(p => {
        p.progress += p.speed;
        if (p.progress >= 1) return false;

        const pt1 = toScreen(p.from);
        const pt2 = toScreen(p.to);
        const x = pt1.x + (pt2.x - pt1.x) * p.progress;
        const y = pt1.y + (pt2.y - pt1.y) * p.progress;

        const isFir = p.type === 'fir';
        ctx.fillStyle = isFir ? '#FFFFFF' : '#00D9FF';
        
        ctx.shadowBlur = isFir ? 12 : 6;
        ctx.shadowColor = '#00D9FF';
        
        ctx.beginPath();
        ctx.arc(x, y, isFir ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        return true;
      });

      // 4. FIR Activity Simulation
      if (time - lastFIRAlertRef.current > Math.random() * 3000 + 4000) {
        const keys = Object.keys(cities).filter(k => k !== 'AHMEDABAD');
        const randCity = keys[Math.floor(Math.random() * keys.length)];
        cities[randCity].alertState = 1.0;
        
        spawnPacket(randCity, 'AHMEDABAD', 'fir');
        lastFIRAlertRef.current = time;
      }

      // 5. Radar Sweep originating from Ahmedabad every 10 seconds
      const radarCycle = 10000;
      const radarTime = time % radarCycle;
      const radarRadius = (radarTime / radarCycle) * (canvas.width * 0.45);
      const radarOpacity = 1 - (radarTime / radarCycle);

      const ahmScreen = toScreen(cities.AHMEDABAD);
      ctx.strokeStyle = `rgba(0, 217, 255, ${radarOpacity * 0.22})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ahmScreen.x, ahmScreen.y, radarRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Draw city nodes and pulse oscillations (Ahmedabad pulses primary)
      const pulseOsc = Math.sin(time * 0.0035) * 1.5;
      Object.values(cities).forEach(city => {
        const screen = toScreen(city);
        const isAhm = city.isMain;

        if (city.alertState > 0) {
          city.alertState -= 0.015;
          ctx.strokeStyle = `rgba(255, 255, 255, ${city.alertState})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, 10 + (1 - city.alertState) * 20, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Node fill
        ctx.fillStyle = (isAhm || city.alertState > 0) ? '#FFFFFF' : 'rgba(0, 217, 255, 0.85)';
        
        if (isAhm) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#00D9FF';
        }
        
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, (isAhm ? 6 : 3.5) + pulseOsc * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node pulse outer ring
        const nodePulseRadius = ((time * 0.012) % 20) + (isAhm ? 10 : 4);
        ctx.strokeStyle = `rgba(0, 217, 255, ${(isAhm ? 0.65 : 0.35) * (1 - nodePulseRadius / 20)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, nodePulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        // City labels (glowing cyan labels)
        ctx.fillStyle = isAhm ? '#00D9FF' : 'rgba(154, 164, 178, 0.65)';
        ctx.font = isAhm ? 'bold 9.5px monospace' : '8px monospace';
        ctx.fillText(city.name, screen.x + (isAhm ? 12 : 8), screen.y + 3);
      });

      // 7. Ambient floating particles
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = 1000;
        if (p.x > 1000) p.x = 0;
        if (p.y < 0) p.y = 1000;
        if (p.y > 1000) p.y = 0;

        const screen = toScreen(p);
        ctx.fillStyle = `rgba(0, 217, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // 8. Draw Futuristic Wireframe Skyline at the bottom
      const groundY = canvas.height;
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.08)';
      ctx.fillStyle = 'rgba(11, 18, 32, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      
      // Wireframe heights / coordinate shifts
      ctx.lineTo(0, groundY - 60);
      ctx.lineTo(60, groundY - 60);
      ctx.lineTo(60, groundY - 110);
      ctx.lineTo(100, groundY - 110);
      ctx.lineTo(100, groundY - 45);
      ctx.lineTo(150, groundY - 45);
      ctx.lineTo(180, groundY - 150); // Beacon tower
      ctx.lineTo(184, groundY - 150);
      ctx.lineTo(188, groundY - 45);
      ctx.lineTo(280, groundY - 45);
      ctx.lineTo(280, groundY - 80);
      ctx.lineTo(320, groundY - 80);
      ctx.lineTo(320, groundY - 45);

      // Wide clearance gap for Login Card readability in the middle
      ctx.lineTo(canvas.width - 320, groundY - 45);
      ctx.lineTo(canvas.width - 320, groundY - 80);
      ctx.lineTo(canvas.width - 280, groundY - 80);
      ctx.lineTo(canvas.width - 280, groundY - 45);
      ctx.lineTo(canvas.width - 188, groundY - 45);
      ctx.lineTo(canvas.width - 180, groundY - 140); // Another beacon tower
      ctx.lineTo(canvas.width - 176, groundY - 140);
      ctx.lineTo(canvas.width - 172, groundY - 45);
      ctx.lineTo(canvas.width - 100, groundY - 45);
      ctx.lineTo(canvas.width - 100, groundY - 95);
      ctx.lineTo(canvas.width - 60, groundY - 95);
      ctx.lineTo(canvas.width, groundY - 45);
      
      ctx.lineTo(canvas.width, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top glowing cyan beacons
      const beacons = [
        { x: 80, y: groundY - 110 },
        { x: 182, y: groundY - 150 },
        { x: 300, y: groundY - 80 },
        { x: canvas.width - 300, y: groundY - 80 },
        { x: canvas.width - 178, y: groundY - 140 },
        { x: canvas.width - 80, y: groundY - 95 }
      ];
      ctx.fillStyle = '#00D9FF';
      ctx.shadowColor = '#00D9FF';
      beacons.forEach(b => {
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: '-20px',
        left: '-20px',
        width: 'calc(100% + 40px)',
        height: 'calc(100% + 40px)',
        zIndex: 1,
        pointerEvents: 'none',
        transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
        transition: 'transform 0.2s cubic-bezier(0.1, 0.8, 0.25, 1)'
      }}
    />
  );
};

export default CyberNetworkBackground;
