import Header from '../components/Header.jsx'
import HeroSection from '../components/HeroSection.jsx'
import FeaturesSection from '../components/FeaturesSection.jsx'
import TestimonialsSection from '../components/TestimonialsSection.jsx'
import FooterSection from '../components/FooterSection.jsx'
import { Box } from '@mui/material'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function LandingPage({ mode, onToggleTheme }) {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const targetId = location.hash.replace('#', '')
    const section = document.getElementById(targetId)

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  return (
    <>
      <Header mode={mode} onToggleTheme={onToggleTheme} />
      <HeroSection />
      <Box component="section" id="features">
        <FeaturesSection />
      </Box>
      <Box component="section" id="testimonials">
        <TestimonialsSection />
      </Box>
      <Box component="section" id="contact">
        <FooterSection />
      </Box>
    </>
  )
}

export default LandingPage
