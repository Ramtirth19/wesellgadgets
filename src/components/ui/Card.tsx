import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glass = false,
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const glassClasses = glass
    ? 'bg-white/10 backdrop-blur-md border border-white/20 shadow-glass'
    : 'bg-white shadow-lg border border-gray-100';
    
  const hoverClasses = hover
    ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer'
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        baseClasses,
        glassClasses,
        hoverClasses,
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default Card;