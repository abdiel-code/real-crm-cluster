'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

type GraphCardProps = {
  total?: number;
  history?: number[];
  index?: number;
  title?: string;
};

const GraphCard = (props: GraphCardProps) => {
  // Variables
  const count = useMotionValue(0);
  const springValue = useSpring(count, {
    stiffness: 50,
    damping: 15,
    restDelta: 0.01,
  });
  const rounded = useTransform(springValue, (latest) => Math.floor(latest));

  const history = props.history || [0, 0, 0, 0, 0, 0, 0];
  const maxValue = Math.max(...history) || 1;
  const lastValue = history[history.length - 1] || 0;
  const prevValue = history[history.length - 2] || 0;
  const trend =
    prevValue === 0 ? 0 : ((lastValue - prevValue) / prevValue) * 100;

  const points = history
    .map((value, index) => {
      const x = index * (100 / (history.length - 1));
      const y = 25 - (value / maxValue) * 20;
      return `${index === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  // Functions

  // Effects
  useEffect(() => {
    count.set(props.total || 0);
  }, [props.total, count]);

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
      <div className="w-full flex justify-between items-start mb-2">
        <h3 className="text-white/70 text-xs font-bold uppercase tracking-wider">
          {props.title}
        </h3>
        <span
          className={`text-sm font-mono px-1.5 py-0.5 rounded border ${
            trend >= 0
              ? 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10'
              : 'text-orange-400 border-orange-400/30 bg-orange-400/10'
          }`}
        >
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
      <motion.p
        className="text-4xl font-mono font-bold text-white self-start"
        children={rounded}
      />

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
        <div className="w-full flex justify-between mt-1 px-1">
          <span className="text-sm text-white/30 font-mono">7D AGO</span>
          <span className="text-sm text-white/30 font-mono uppercase">
            Today
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default GraphCard;
