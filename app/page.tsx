import Header from './components/Header';
import Navigation from './components/Navigation';
import Marquee from './components/Marquee';
import MissionSection from './components/MissionSection';
import InitiativesSection from './components/InitiativesSection';
import EventsSection from './components/EventsSection';
import ResourcesSection from './components/ResourcesSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="container">
      <Header />
      <Navigation />
      <Marquee />
      <MissionSection />
      <InitiativesSection />
      <EventsSection />
      <ResourcesSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

