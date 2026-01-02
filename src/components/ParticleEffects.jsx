import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../contexts/PlayerContext';

const ParticleEffects = () => {
    const canvasRef = useRef(null);
    const { isPlaying, currentTime } = usePlayer();
    const particlesRef = useRef([]);
    const animationRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Initialize particles
        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < 50; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: Math.random() * 3 + 1,
                    opacity: Math.random() * 0.5 + 0.2,
                    color: `hsl(${Math.random() * 360}, 70%, 60%)`
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (isPlaying) {
                // Update particles based on music
                particlesRef.current.forEach(particle => {
                    // Move particles
                    particle.x += particle.vx;
                    particle.y += particle.vy;

                    // Bounce off edges
                    if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                    if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                    // Pulse effect based on time
                    const pulse = Math.sin(currentTime * 2) * 0.5 + 0.5;
                    const currentSize = particle.size * (1 + pulse * 0.5);

                    // Draw particle
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
                    ctx.fillStyle = particle.color;
                    ctx.globalAlpha = particle.opacity * (0.3 + pulse * 0.7);
                    ctx.fill();
                });
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, currentTime]);

    return (
        <canvas 
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: -1,
                opacity: isPlaying ? 0.6 : 0,
                transition: 'opacity 1s ease'
            }}
        />
    );
};

export default ParticleEffects;