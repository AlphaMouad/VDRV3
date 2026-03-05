"use client"

import { useEffect, useRef, useState } from "react"
import { useSpring, useTransform, motion, type MotionValue } from "framer-motion"

interface AnimatedValueProps {
  value: number
  format?: "currency" | "percent" | "multiplier" | "integer"
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  decimals?: number
}

function useAnimatedNumber(value: number, duration: number): MotionValue<number> {
  const spring = useSpring(value, {
    stiffness: 140,
    damping: 28,
    mass: 0.6,
    duration: duration * 1000,
  })

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return spring
}

export function AnimatedValue({
  value,
  format = "currency",
  prefix = "",
  suffix = "",
  duration = 0.6,
  className = "",
  decimals,
}: AnimatedValueProps) {
  const spring = useAnimatedNumber(value, duration)
  const [display, setDisplay] = useState(() => formatNumber(value, format, decimals))
  const prevValue = useRef(value)
  const [flash, setFlash] = useState(false)

  const formatted = useTransform(spring, (v) => formatNumber(v, format, decimals))

  useEffect(() => {
    const unsubscribe = formatted.on("change", (v) => setDisplay(v))
    return unsubscribe
  }, [formatted])

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 400)
      prevValue.current = value
      return () => clearTimeout(timer)
    }
  }, [value])

  return (
    <motion.span
      className={`${className} ${flash ? "metric-flash" : ""}`}
      style={{ display: "inline-block" }}
    >
      {prefix}{display}{suffix}
    </motion.span>
  )
}

function formatNumber(v: number, format: string, decimals?: number): string {
  switch (format) {
    case "currency":
      return Math.round(v).toLocaleString()
    case "percent":
      return v.toFixed(decimals ?? 1)
    case "multiplier":
      return v.toFixed(decimals ?? 2)
    case "integer":
      return Math.round(v).toLocaleString()
    default:
      return v.toFixed(decimals ?? 0)
  }
}
