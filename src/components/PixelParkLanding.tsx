import { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface PixelParkLandingProps {
  onEnterPortal: () => void;
}

export default function PixelParkLanding({ onEnterPortal }: PixelParkLandingProps) {
  const [characterPos, setCharacterPos] = useState<Position>({ x: 300, y: 200 });
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>('down');
  const [isWalking, setIsWalking] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>(0);

  // Define collision boundaries (obstacles in the scene)
  const obstacles = [
    // Trees
    { x: 60 - 30, y: 142, width: 60, height: 100 }, // tree1
    { x: 546 - 30, y: 142, width: 60, height: 100 }, // tree2
    // Benches
    { x: 170, y: 212, width: 54, height: 40 }, // bench1
    { x: 486, y: 212, width: 54, height: 40 }, // bench2
    // Bushes
    { x: 230, y: 213, width: 90, height: 40 }, // bush1
    { x: 310, y: 213, width: 85, height: 40 }, // bush2
    { x: 546, y: 213, width: 103, height: 40 }, // bush3
  ];

  // Portal zone (center of the scene)
  const portalZone = { x: 280, y: 180, width: 66, height: 80 };

  const checkCollision = (newX: number, newY: number): boolean => {
    const characterBox = { x: newX - 8, y: newY - 16, width: 16, height: 24 };

    // Check boundaries
    if (newX < 20 || newX > 606 || newY < 100 || newY > 240) {
      return true;
    }

    // Check obstacles
    for (const obstacle of obstacles) {
      if (
        characterBox.x < obstacle.x + obstacle.width &&
        characterBox.x + characterBox.width > obstacle.x &&
        characterBox.y < obstacle.y + obstacle.height &&
        characterBox.y + characterBox.height > obstacle.y
      ) {
        return true;
      }
    }

    return false;
  };

  const checkPortalZone = (x: number, y: number): boolean => {
    return (
      x > portalZone.x &&
      x < portalZone.x + portalZone.width &&
      y > portalZone.y &&
      y < portalZone.y + portalZone.height
    );
  };

  const moveCharacter = () => {
    const speed = 2;
    let newX = characterPos.x;
    let newY = characterPos.y;
    let moved = false;
    let newDirection = direction;

    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
      newY -= speed;
      newDirection = 'up';
      moved = true;
    }
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
      newY += speed;
      newDirection = 'down';
      moved = true;
    }
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
      newX -= speed;
      newDirection = 'left';
      moved = true;
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
      newX += speed;
      newDirection = 'right';
      moved = true;
    }

    if (moved) {
      if (!checkCollision(newX, newY)) {
        setCharacterPos({ x: newX, y: newY });
        setDirection(newDirection);
        setIsWalking(true);
      } else {
        setIsWalking(false);
      }

      // Check if in portal zone
      setShowPrompt(checkPortalZone(newX, newY));
    } else {
      setIsWalking(false);
    }

    animationFrameRef.current = requestAnimationFrame(moveCharacter);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key === 'arrowup' ? 'ArrowUp' :
                                 key === 'arrowdown' ? 'ArrowDown' :
                                 key === 'arrowleft' ? 'ArrowLeft' :
                                 key === 'arrowright' ? 'ArrowRight' : key);
      }

      if (key === 'enter' && showPrompt) {
        onEnterPortal();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key === 'arrowup' ? 'ArrowUp' :
                                 key === 'arrowdown' ? 'ArrowDown' :
                                 key === 'arrowleft' ? 'ArrowLeft' :
                                 key === 'arrowright' ? 'ArrowRight' : key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animationFrameRef.current = requestAnimationFrame(moveCharacter);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [characterPos, direction, showPrompt]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#222] p-8">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          MoeFlavor Training Center
        </h1>
        <p className="text-gray-400 text-sm">
          Use Arrow Keys or WASD to move • Walk to the center to start training
        </p>
      </div>

      <div className="relative" style={{ width: '626px', height: '355px' }}>
        {/* Scene Container */}
        <div
          className="relative overflow-hidden"
          style={{
            width: '626px',
            height: '355px',
            border: '3px solid #333',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {/* Sky */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: '70%',
              background: 'linear-gradient(to bottom, #4CC9E5 0%, #7DD9F0 100%)',
            }}
          >
            {/* Clouds */}
            {[
              { size: 80, top: 30, delay: 0 },
              { size: 100, top: 100, delay: 7 },
              { size: 120, top: 50, delay: 14 },
            ].map((cloud, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: `${cloud.size}px`,
                  height: '20px',
                  top: `${cloud.top}px`,
                  left: '-100px',
                  animation: `cloudFloat 20s infinite linear`,
                  animationDelay: `${cloud.delay}s`,
                }}
              />
            ))}
          </div>

          {/* Ground */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '30%',
              background: '#2d1810',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: '15px',
                background: '#4CAF50',
                borderBottom: '3px solid #3d8b40',
              }}
            />
          </div>

          {/* Trees */}
          {[60, 546].map((left, i) => (
            <div
              key={`tree-${i}`}
              className="absolute"
              style={{ bottom: '30%', left: `${left}px` }}
            >
              {/* Trunk */}
              <div
                style={{
                  width: '25px',
                  height: '50px',
                  background: '#5d4037',
                  border: '2px solid #3e2723',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              />
              {/* Leaves */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '35px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {[
                  { w: 60, h: 60, l: -30, t: 0, bg: '#4CAF50' },
                  { w: 50, h: 50, l: -45, t: 15, bg: '#3d8b40' },
                  { w: 50, h: 50, l: 5, t: 15, bg: '#3d8b40' },
                  { w: 55, h: 55, l: -25, t: -15, bg: '#4CAF50' },
                ].map((leaf, j) => (
                  <div
                    key={j}
                    style={{
                      position: 'absolute',
                      background: leaf.bg,
                      border: '2px solid #2d5f2e',
                      borderRadius: '50%',
                      width: `${leaf.w}px`,
                      height: `${leaf.h}px`,
                      left: `${leaf.l}px`,
                      top: `${leaf.t}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Bushes */}
          {[230, 310, 546].map((left, i) => (
            <div
              key={`bush-${i}`}
              className="absolute"
              style={{ bottom: '30%', left: `${left}px` }}
            >
              {[
                { w: 35, h: 35, l: 0, bg: i === 1 ? '#4CAF50' : '#3d8b40' },
                { w: i === 1 ? 38 : 40, h: i === 1 ? 38 : 40, l: i === 1 ? 22 : 25, bg: i === 1 ? '#3d8b40' : '#4CAF50' },
                { w: 35, h: 35, l: i === 1 ? 50 : 55, bg: '#3d8b40' },
              ].map((part, j) => (
                <div
                  key={j}
                  style={{
                    position: 'absolute',
                    background: part.bg,
                    border: '2px solid #2d5f2e',
                    borderRadius: '50%',
                    width: `${part.w}px`,
                    height: `${part.h}px`,
                    left: `${part.l}px`,
                    bottom: 0,
                  }}
                />
              ))}
            </div>
          ))}

          {/* Benches */}
          {[170, 486].map((left, i) => (
            <div
              key={`bench-${i}`}
              className="absolute"
              style={{ bottom: 'calc(30% + 5px)', left: `${left}px` }}
            >
              {/* Back */}
              <div
                style={{
                  width: '50px',
                  height: '8px',
                  background: '#8d6e63',
                  border: '2px solid #5d4037',
                  position: 'absolute',
                  top: '-15px',
                }}
              />
              {/* Seat */}
              <div
                style={{
                  width: '50px',
                  height: '8px',
                  background: '#8d6e63',
                  border: '2px solid #5d4037',
                  position: 'relative',
                }}
              >
                {/* Legs */}
                {[5, 41].map((legLeft, j) => (
                  <div
                    key={j}
                    style={{
                      width: '4px',
                      height: '15px',
                      background: '#5d4037',
                      position: 'absolute',
                      bottom: '-15px',
                      left: `${legLeft}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Character */}
          <div
            className="absolute transition-all duration-75"
            style={{
              left: `${characterPos.x}px`,
              top: `${characterPos.y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            {/* Pixel Character */}
            <div className="relative">
              {/* Head */}
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  background: '#FFD1B3',
                  border: '2px solid #000',
                  position: 'relative',
                  margin: '0 auto',
                }}
              >
                {/* Eyes */}
                <div
                  style={{
                    width: '3px',
                    height: '3px',
                    background: '#000',
                    position: 'absolute',
                    top: '6px',
                    left: direction === 'left' ? '2px' : direction === 'right' ? '11px' : '3px',
                  }}
                />
                {direction !== 'left' && direction !== 'right' && (
                  <div
                    style={{
                      width: '3px',
                      height: '3px',
                      background: '#000',
                      position: 'absolute',
                      top: '6px',
                      left: '10px',
                    }}
                  />
                )}
              </div>
              {/* Body */}
              <div
                style={{
                  width: '16px',
                  height: '12px',
                  background: '#F5008B',
                  border: '2px solid #000',
                  margin: '0 auto',
                }}
              />
              {/* Legs */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                <div
                  style={{
                    width: '6px',
                    height: '10px',
                    background: '#333',
                    border: '2px solid #000',
                    transform: isWalking ? 'translateY(-1px)' : 'none',
                  }}
                />
                <div
                  style={{
                    width: '6px',
                    height: '10px',
                    background: '#333',
                    border: '2px solid #000',
                    transform: isWalking ? 'translateY(1px)' : 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Portal Zone Indicator */}
          <div
            className="absolute animate-pulse"
            style={{
              left: `${portalZone.x}px`,
              top: `${portalZone.y}px`,
              width: `${portalZone.width}px`,
              height: `${portalZone.height}px`,
              border: '2px dashed rgba(245, 0, 139, 0.5)',
              borderRadius: '8px',
              pointerEvents: 'none',
              background: 'rgba(245, 0, 139, 0.1)',
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-pink-500 font-bold text-xs">
                🚪
              </span>
            </div>
          </div>

          {/* Enter Prompt */}
          {showPrompt && (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
              style={{ zIndex: 20 }}
            >
              <div className="bg-black/80 text-white px-4 py-2 rounded-lg border-2 border-pink-500 text-sm">
                Press <span className="text-pink-500 font-bold">ENTER</span> to start training
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cloudFloat {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(800px);
          }
        }
      `}</style>
    </div>
  );
}
