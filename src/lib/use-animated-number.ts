'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Anima um numero ate `end`.
 *
 * O valor corrente fica num ref, e nao nas dependencias do efeito: com
 * `count` la, cada frame reiniciava a animacao, que nunca terminava e
 * queimava CPU enquanto a aba estivesse aberta.
 */
export function useAnimatedNumber(end: number, duration: number = 800) {
  const [count, setCount] = useState(end)
  const countRef = useRef(end)

  useEffect(() => {
    countRef.current = count
  }, [count])

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number
    const startValue = countRef.current

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

      setCount(startValue + (end - startValue) * easeProgress)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return Math.floor(count)
}
