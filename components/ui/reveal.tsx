'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

/** Restrained section reveal: a short rise and fade, once, when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'article'
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      onViewportEnter={(entry) => entry?.target.classList.add('in-view')}
    >
      {children}
    </Tag>
  )
}
