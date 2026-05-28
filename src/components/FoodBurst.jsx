import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FOOD_EMOJIS = [
  '🍕', '🍔', '🌮', '🍣', '🍩', '🥐', '🍰', '🧁',
  '🍜', '🥗', '🍎', '🥑', '🍇', '🍓', '🍌', '🥝',
  '🧀', '🥕', '🥦', '🍿', '🥞', '🍝', '🍛', '🥤',
  '🍪', '🌯', '🥙', '🥨', '🍱', '🍒',
];

/**
 * Creates a burst of food emoji particles from the border of a card.
 * Usage: wrap an order card with this component and pass `trigger` as true
 * when you want the animation to play.
 */

function generateParticles(count = 20) {
  return Array.from({ length: count }, (_, i) => {
    // Distribute particles around the border (top, right, bottom, left)
    const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let startX, startY, endX, endY;

    switch (side) {
      case 0: // top
        startX = Math.random() * 100;
        startY = 0;
        endX = startX + (Math.random() - 0.5) * 60;
        endY = -40 - Math.random() * 60;
        break;
      case 1: // right
        startX = 100;
        startY = Math.random() * 100;
        endX = 100 + 30 + Math.random() * 50;
        endY = startY + (Math.random() - 0.5) * 60;
        break;
      case 2: // bottom
        startX = Math.random() * 100;
        startY = 100;
        endX = startX + (Math.random() - 0.5) * 60;
        endY = 100 + 30 + Math.random() * 50;
        break;
      case 3: // left
      default:
        startX = 0;
        startY = Math.random() * 100;
        endX = -30 - Math.random() * 50;
        endY = startY + (Math.random() - 0.5) * 60;
        break;
    }

    return {
      id: i,
      emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
      startX,
      startY,
      endX,
      endY,
      size: 16 + Math.random() * 16,
      rotation: (Math.random() - 0.5) * 360,
      delay: Math.random() * 0.15,
      duration: 0.6 + Math.random() * 0.5,
    };
  });
}

export default function FoodBurst({ trigger, onComplete, children }) {
  const [particles, setParticles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const startBurst = useCallback(() => {
    const newParticles = generateParticles(22);
    setParticles(newParticles);
    setIsAnimating(true);

    // Auto-clear after longest animation completes
    const maxDuration = Math.max(...newParticles.map(p => (p.delay + p.duration) * 1000));
    setTimeout(() => {
      setIsAnimating(false);
      setParticles([]);
      onComplete?.();
    }, maxDuration + 200);
  }, [onComplete]);

  useEffect(() => {
    if (trigger) {
      startBurst();
    }
  }, [trigger, startBurst]);

  return (
    <div className="relative" style={{ overflow: 'visible' }}>
      {children}

      {/* Glow border pulse on trigger */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1, 0] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: '0 0 20px 4px rgba(168, 85, 247, 0.5), 0 0 40px 8px rgba(59, 130, 246, 0.3)',
              zIndex: 10,
            }}
          />
        )}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              opacity: 1,
              scale: 0.3,
              rotate: 0,
            }}
            animate={{
              left: `${p.endX}%`,
              top: `${p.endY}%`,
              opacity: [1, 1, 0],
              scale: [0.3, 1.2, 0.8],
              rotate: p.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
            className="absolute pointer-events-none"
            style={{
              fontSize: `${p.size}px`,
              zIndex: 50,
              transform: 'translate(-50%, -50%)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
