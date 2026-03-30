import Header from '../components/Header.jsx'
import HeroSection from '../components/HeroSection.jsx'
import FeaturesSection from '../components/FeaturesSection.jsx'
import TestimonialsSection from '../components/TestimonialsSection.jsx'
import FooterSection from '../components/FooterSection.jsx'

function LandingPage({ mode, onToggleTheme }) {
  return (
    <>
      <Header mode={mode} onToggleTheme={onToggleTheme} />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FooterSection />
    </>
  )
}

export default LandingPage
