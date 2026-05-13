import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const variants = {
  initial: { opacity: 0, y: 24 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.3, ease: [0.77, 0, 0.175, 1] } },
}

export default function PageTransition({ children }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
