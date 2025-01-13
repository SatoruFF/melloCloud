import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const ParticleEffect = () => {
  const particlesInit: any = async (main) => {
    await loadFull(main);
  };
  return (
    <div id="particles-js">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fpsLimit: 120,
          fullScreen: {
            enable: true,
            zIndex: -1,
          },
          style: {
            position: 'absolute',
            zIndex: '-1',
          },
          interactivity: {
            events: {
              // onClick: {
              //   enable: true,
              //   mode: "push",
              // },
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: '#ffffff',
            },
            links: {
              color: '#ffffff',
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.9,
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
};

export default ParticleEffect;
