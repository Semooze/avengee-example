import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  Ticket,
  Flower2,
  ShoppingBag,
  Truck,
  Layers3,
  Check,
} from 'lucide-react';
import { photo } from '@avengee/domain';
export default function Gallery() {
  return (
    <div className="gallery-site">
      <header className="gallery-nav shell">
        <Link href="/" className="avengee-logo">
          <span className="brand-symbol">a</span>avengee<span className="logo-dot">.</span>
        </Link>
        <nav>
          <a href="#projects">Our projects</a>
          <a href="#about">The approach</a>
          <Link href="/stays" className="nav-cta">
            Try a live demo <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
      <main className="shell">
        <section className="gallery-intro">
          <div>
            <div className="status-line">
              <span /> The Avengee playground
            </div>
            <h1>
              Good ideas.
              <br />
              Real experiences.
            </h1>
          </div>
          <div className="intro-aside">
            <p>
              A collection of thoughtfully designed apps.
              <br />
              Built to explore. Made to work.
            </p>
            <a href="#projects" className="text-link">
              Find your next inspiration <ArrowRight size={17} />
            </a>
          </div>
        </section>
        <section id="projects" className="projects-section">
          <div className="section-heading">
            <h2>
              Explore the collection <span>06</span>
            </h2>
            <span className="muted">One live. More on the way.</span>
          </div>
          <article className="featured-project">
            <div className="featured-copy">
              <div className="project-label">
                <span className="live-pill">
                  <span /> Live demo
                </span>
                <span>Travel & hospitality</span>
              </div>
              <span className="serein-wordmark">
                serein<span>✳</span>
              </span>
              <h2>
                A better way
                <br />
                to get away.
              </h2>
              <p>
                A boutique hotel booking experience, from finding your kind of place to making it
                yours.
              </p>
              <ul className="feature-list">
                <li>
                  <Check size={16} /> Discover curated stays
                </li>
                <li>
                  <Check size={16} /> Book and manage your trip
                </li>
                <li>
                  <Check size={16} /> Try the complete booking journey
                </li>
              </ul>
              <Link className="button gallery-button" href="/stays">
                Explore hotel demo <ArrowUpRight size={18} />
              </Link>
              <div className="stack-tags">
                <span>Next.js</span>
                <span>NestJS</span>
                <span>Responsive design</span>
              </div>
            </div>
            <Link href="/stays" className="featured-visual" aria-label="Preview Serein hotel demo">
              <img
                src={photo('photo-1571896349842-33c89424de2d')}
                alt="Palm-lined resort pool overlooking a tropical coast"
              />
              <div className="visual-shade" />
              <div className="preview-nav">
                <span className="serein-wordmark">
                  serein<span>✳</span>
                </span>
                <span>Your next chapter awaits</span>
              </div>
              <div className="preview-title">
                Somewhere you’d
                <br />
                rather be.
              </div>
              <div className="preview-search">
                <span>
                  Where to?<strong>Somewhere beautiful</strong>
                </span>
                <span>
                  Your dates<strong>At your own pace</strong>
                </span>
                <span className="preview-search-icon">
                  <ArrowRight size={20} />
                </span>
              </div>
              <span className="preview-caption">Thoughtful stays. Unhurried days.</span>
            </Link>
          </article>
          <div className="upcoming-grid">
            {[
              {
                title: 'Front row, every time.',
                name: 'Ticket selling',
                icon: Ticket,
                color: 'lilac',
                text: 'From finding your next event to your seat in the crowd.',
              },
              {
                title: 'Make room for you.',
                name: 'Massage booking',
                icon: Flower2,
                color: 'sage',
                text: 'A calmer way to discover treatments and book your time.',
              },
              {
                title: 'Good things, on the way.',
                name: 'Delivery',
                icon: Truck,
                color: 'peach',
                text: 'Local favorites, easy ordering, and every step of the journey.',
              },
              {
                title: 'Find your next favorite.',
                name: 'E-commerce',
                icon: ShoppingBag,
                color: 'blue',
                text: 'Considered collections and a seamless shopping experience.',
              },
              {
                title: 'The whole picture.',
                name: 'ERP workspace',
                icon: Layers3,
                color: 'sand',
                text: 'People, accounting, and operations, working better together.',
              },
            ].map((project) => (
              <article className={`upcoming-card ${project.color}`} key={project.name}>
                <div className="upcoming-top">
                  <project.icon size={27} strokeWidth={1.5} />
                  <span>Planned</span>
                </div>
                <div>
                  <p className="project-type">{project.name}</p>
                  <h3>{project.title}</h3>
                  <p>{project.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="about-section" id="about">
          <h2>
            Designed with care.
            <br />
            Built with purpose.
          </h2>
          <p>
            These projects are a place to explore what a thoughtful digital product can feel like.
            Every live demo is a working experience you can click through, try out, and make your
            own.
          </p>
        </section>
      </main>
      <footer className="gallery-footer shell">
        <Link className="avengee-logo" href="/">
          avengee.
        </Link>
        <span>A collection in the making.</span>
        <span>Design meets engineering.</span>
      </footer>
    </div>
  );
}
