import { useEffect, useState, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim'; // Подключаем оптимизированную версию

const ParticleEffect = () => {
  const [init, setInit] = useState(false);

  // Инициализация движка частиц
  useEffect(() => {
    initParticlesEngine(async engine => {
      await loadSlim(engine); // Загружаем только необходимый функционал
    }).then(() => setInit(true));
  }, []);

  // Коллбэк при загрузке частиц
  const particlesLoaded = useCallback((container: any) => {
    console.log('Particles container loaded', container);
  }, []);

  return (
    <>
      {init && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            fpsLimit: 120,
            fullScreen: {
              enable: true,
              zIndex: -1,
            },
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: 'repulse',
                },
                resize: true,
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 200, duration: 0.4 },
              },
            },
            particles: {
              color: { value: '#ffffff' },
              links: {
                color: '#ffffff',
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: { default: 'bounce' },
                speed: 1,
                straight: false,
              },
              number: {
                density: { enable: true, area: 800 },
                value: 80,
              },
              opacity: { value: 0.9 },
              shape: { type: 'circle' },
              size: { value: { min: 1, max: 5 } },
            },
            detectRetina: true,
          }}
        />
      )}
    </>
  );
};

export default ParticleEffect;
