import Header from './components/Header';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import Marquee from './components/Marquee';
import MissionSection from './components/MissionSection';
import InitiativesSection from './components/InitiativesSection';
import EventsSection from './components/EventsSection';
import ResourcesSection from './components/ResourcesSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

export default function Home() {
  return (
    <>
      <Header />
      <Navigation />
      <div className="container">
        <HeroSection />
        <Marquee />
        <MissionSection />
        <InitiativesSection />
        <EventsSection />
        <ResourcesSection />
        <ContactSection />
        <Footer />
      </div>
      <ScrollToTop />
    </>
  );
}

