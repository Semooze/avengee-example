import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  CodeXml,
  Compass,
  Layers3,
  MonitorSmartphone,
  PenTool,
  Sparkles,
} from 'lucide-react';
import { AvengeeLogo } from '@/components/avengee-logo';
import { ScrollReveal } from '@/components/scroll-reveal';
import { ShowcaseCarousel } from '@/components/showcase-carousel';
import { showcases } from '@/components/showcase-data';

const services: { icon: LucideIcon; th: string; en: string; text: string }[] = [
  {
    icon: Compass,
    th: 'วางกลยุทธ์โปรดักต์',
    en: 'Product strategy',
    text: 'ตั้งโจทย์ให้ชัด เข้าใจผู้ใช้ และเลือกสิ่งที่ควรสร้างก่อน',
  },
  {
    icon: PenTool,
    th: 'ออกแบบ UX/UI',
    en: 'Experience design',
    text: 'ออกแบบเส้นทางการใช้งานและหน้าจอที่เรียบง่าย ใช้ได้จริงทั้งเว็บและมือถือ',
  },
  {
    icon: CodeXml,
    th: 'พัฒนาเว็บและแอป',
    en: 'Web & app engineering',
    text: 'พัฒนาด้วยเทคโนโลยีที่ทันสมัย ดูแลง่าย และพร้อมขยาย',
  },
  {
    icon: Layers3,
    th: 'ระบบหลังบ้านและ ERP',
    en: 'Back-office systems',
    text: 'เชื่อมงานขาย สต็อก และบัญชีไว้ในที่เดียว',
  },
];

const steps = [
  {
    th: 'ค้นหาโจทย์',
    en: 'Discover',
    text: 'คุยเป้าหมาย ผู้ใช้ และข้อจำกัด เพื่อให้เห็นภาพเดียวกัน',
  },
  { th: 'ออกแบบ', en: 'Design', text: 'ทำ prototype ที่กดได้จริง ทดสอบก่อนลงมือสร้าง' },
  { th: 'พัฒนา', en: 'Build', text: 'พัฒนาเป็นรอบสั้น ๆ ให้เห็นความคืบหน้าทุกสัปดาห์' },
  { th: 'ส่งมอบและดูแล', en: 'Launch & care', text: 'ขึ้นระบบจริง วัดผล และปรับปรุงต่อเนื่อง' },
];

const stack = ['Next.js', 'React', 'TypeScript', 'NestJS', 'Node.js', 'SQL / libSQL', 'Vercel'];

const principles = [
  { th: 'คิดเป็นระบบ', en: 'Systematic thinking' },
  { th: 'ออกแบบด้วยใจ', en: 'Designed with care' },
  { th: 'พัฒนาอย่างมืออาชีพ', en: 'Built to professional standards' },
];

const CONTACT_URL = 'https://fastwork.co/user/avengee.team/web-development-12722725';

export default function Gallery() {
  return (
    <div className="gallery-site">
      <ScrollReveal />
      <header className="gallery-nav">
        <div className="shell gallery-nav-inner">
          <AvengeeLogo />
          <nav aria-label="Main">
            <a href="#projects" className="nav-link">
              ผลงาน <span lang="en">Projects</span>
            </a>
            <a href="#about" className="nav-link">
              แนวทาง <span lang="en">Approach</span>
            </a>
            <a href="#contact" className="nav-link">
              ติดต่อ <span lang="en">Contact</span>
            </a>
            <Link href="/stays" className="button button-sm nav-cta">
              ลองใช้งานเดโม <ArrowUpRight size={15} aria-hidden />
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="gallery-intro shell">
          <div>
            <div className="status-line">
              <span aria-hidden /> ทีมดิจิทัลโปรดักต์ ·{' '}
              <span lang="en">Digital product studio</span>
            </div>
            <h1>
              ไอเดียดี ๆ
              <br />
              ที่ได้ลองใช้จริง
            </h1>
            <p className="intro-en" lang="en">
              Good ideas, made real enough to use.
            </p>
          </div>
          <div className="intro-aside">
            <p>
              เราออกแบบและพัฒนาดิจิทัลโปรดักต์ ตั้งแต่ตั้งโจทย์ ออกแบบประสบการณ์
              ไปจนถึงระบบที่ใช้งานได้จริง ลองกดใช้เดโมทั้ง 6 ชิ้นด้านล่างได้เลย
            </p>
            <div className="intro-actions">
              <a href="#projects" className="button">
                ดูผลงาน <span className="en">· See our work</span>
                <ArrowRight size={16} aria-hidden />
              </a>
              <a href="#contact" className="button secondary">
                คุยโปรเจกต์กับเรา <span className="en">· Start a project</span>
              </a>
            </div>
            <ul className="proof-row">
              <li>
                <Sparkles size={16} aria-hidden /> 6 เดโมที่ใช้งานได้จริง{' '}
                <span lang="en">· 6 live demos</span>
              </li>
              <li>
                <CodeXml size={16} aria-hidden /> ออกแบบถึงโค้ด{' '}
                <span lang="en">· Design to code</span>
              </li>
              <li>
                <MonitorSmartphone size={16} aria-hidden /> รองรับมือถือ{' '}
                <span lang="en">· Mobile-ready</span>
              </li>
            </ul>
          </div>
        </section>
        <section id="projects" className="projects-section shell">
          <div className="section-heading">
            <div>
              <span className="kicker" lang="en">
                Selected work
              </span>
              <h2>
                ผลงานของทีม <span className="count-chip">06</span>
              </h2>
            </div>
            <p className="muted">
              ทุกชิ้นเป็นเดโมที่กดใช้ได้จริง ข้อมูลทั้งหมดเป็นตัวอย่าง
              <span lang="en">All demos are interactive; data is fictional</span>
            </p>
          </div>
          <ShowcaseCarousel />
        </section>
        <section id="services" className="services-section shell" data-reveal>
          <div className="section-intro">
            <span className="kicker" lang="en">
              What we do
            </span>
            <h2>สิ่งที่เราทำ</h2>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <article className="service-item" key={service.en}>
                <span className="service-icon" aria-hidden>
                  <service.icon size={20} strokeWidth={1.7} />
                </span>
                <h3>
                  {service.th}
                  <span lang="en">{service.en}</span>
                </h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="process" className="process-section shell" data-reveal>
          <div className="section-intro">
            <span className="kicker" lang="en">
              How we work
            </span>
            <h2>วิธีทำงานของเรา</h2>
          </div>
          <ol className="process-steps">
            {steps.map((step, index) => (
              <li key={step.en}>
                <span className="process-number" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>
                  {step.th} <span lang="en">· {step.en}</span>
                </h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="stack-strip">
            <span>
              เครื่องมือที่เราใช้ <span lang="en">· Built with</span>
            </span>
            <ul lang="en">
              {stack.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="about-section" id="about" data-reveal>
          <div className="shell about-inner">
            <div>
              <span className="kicker" lang="en">
                Our approach
              </span>
              <h2>
                เข้าใจคนใช้
                <br />
                ใส่ใจทุกขั้นตอน
              </h2>
            </div>
            <div>
              <p>
                เราคือทีมออกแบบและพัฒนาดิจิทัลโปรดักต์ที่ทำงานร่วมกันตั้งแต่การค้นหาโจทย์
                วางประสบการณ์ ออกแบบหน้าจอ ไปจนถึงพัฒนาและส่งมอบงานจริง
                ทุกเดโมสะท้อนวิธีคิดและมาตรฐานการทำงานของทีม
              </p>
              <ul className="principles">
                {principles.map((item) => (
                  <li key={item.en}>
                    <span className="feature-check" aria-hidden>
                      <Check size={13} strokeWidth={2.5} />
                    </span>
                    {item.th} <span lang="en">· {item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section id="contact" className="contact-section shell" data-reveal>
          <div className="contact-band">
            <div>
              <h2>มีไอเดียอยู่ในใจ? มาคุยกัน</h2>
              <p lang="en">Have an idea? Let’s make it real — tell us what you’re building.</p>
            </div>
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button contact-button"
            >
              จ้างงานผ่าน Fastwork <span className="en">· Hire us on Fastwork</span>
              <ArrowUpRight size={16} aria-hidden />
            </a>
          </div>
        </section>
      </main>
      <footer className="gallery-footer">
        <div className="shell">
          <div className="footer-grid">
            <div className="footer-brand">
              <AvengeeLogo />
              <p>ทีมออกแบบและพัฒนาดิจิทัลโปรดักต์</p>
              <p lang="en">Digital product design &amp; engineering</p>
            </div>
            <nav aria-label="Work">
              <h2>
                ผลงาน <span lang="en">· Work</span>
              </h2>
              <ul lang="en">
                {showcases.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Studio">
              <h2>
                บริษัท <span lang="en">· Studio</span>
              </h2>
              <ul>
                <li>
                  <a href="#services">สิ่งที่เราทำ</a>
                </li>
                <li>
                  <a href="#process">วิธีทำงาน</a>
                </li>
                <li>
                  <a href="#about">แนวทาง</a>
                </li>
                <li>
                  <a href="#contact">ติดต่อ</a>
                </li>
                <li>
                  <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
                    Fastwork
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="footer-bottom">
            <span lang="en">© 2026 Avengee</span>
            <span>
              เดโมทั้งหมดใช้ข้อมูลสมมติ ไม่มีการชำระเงินจริง{' '}
              <span lang="en">· All demos use fictional data; no real payments.</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
