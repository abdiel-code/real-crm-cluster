'use client';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

type GraphCardProps = {
  total?: number;
  history?: number[];
  index?: number;
  title?: string;
};

const GraphCard = (props: GraphCardProps) => {
  const history = props.history || [0, 0, 0, 0, 0, 0, 0];
  const [displayValue, setDisplayValue] = useState(0);
  const maxValue = Math.max(...history) || 1;

  const points = history
    .map((value, index) => {
      const x = index * (100 / (history.length - 1));
      const y = 25 - (value / maxValue) * 20;
      return `${index === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  useEffect(() => {
    if (!props.total) return;

    let start = 0;
    const end = props.total;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [props.total]);

  return (
    <motion.div
      initial={{
        x: 300,
        opacity: 0,
        rotateY: 45,
        scale: 0.9,
      }}
      animate={{
        x: 0,
        opacity: 1,
        rotateY: 25,
        scale: 1,
      }}
      whileHover={{
        rotateY: 0,
        scale: 1.02,
        boxShadow: [
          '0 0 20px rgba(0, 212, 255, 0.3)',
          '0 0 40px rgba(0, 212, 255, 0.5)',
          '0 0 20px rgba(0, 212, 255, 0.3)',
        ],
        transition: {
          duration: 0.3,
          boxShadow: {
            duration: 1.6,
            repeat: Infinity,
          },
        },
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: props.index ? props.index * 0.1 : 0,
      }}
      className="bg-[#00d4ff1a] backdrop-blur-xs rounded-md border-2 border-[#00d4ff40] hover:border-[#00d4ff80] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]
        p-6 shadow-md flex flex-col items-center justify-center cursor-pointer hover:backdrop-blur-sm"
    >
      <h3 className="text-white font-bold">{props.title}</h3>
      <p className="text-3xl font-bold">{displayValue.toLocaleString()}</p>

      <div className="w-full h-16 mt-4">
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <motion.path
            d={points}
            fill="none"
            stroke="#00d4ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: (props.index || 0) * 0.1 + 0.5 }}
            style={{
              filter: 'drop-shadow(0px 0px 4px rgba(0, 212, 255, 0.8))',
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default GraphCard;
