import { Logo } from "@/components/ui/Logo";
import { SITE, FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import { Twitter, Linkedin, Github, Youtube, MessageCircle } from "lucide-react";

const socialIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter size={16} />,
  linkedin: <Linkedin size={16} />,
  github: <Github size={16} />,
  youtube: <Youtube size={16} />,
  whatsapp: <MessageCircle size={16} />,
};

export function Footer() {
  return (
    <footer className="bg-[#1c1b19] text-[rgba(255,255,255,0.6)]" style={{ padding: "64px 0 32px" }}>
      <div className="container">
        {/* Top: Logo + tagline */}
        <div className="mb-12">
          <Logo variant="white" className="w-[140px] h-auto mb-2" />
          <p className="text-[rgba(255,255,255,0.4)] text-sm" style={{ fontFamily: "var(--font-body)" }}>
            {SITE.tagline}
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p
                className="text-[rgba(255,255,255,0.9)] text-xs font-semibold uppercase tracking-wider mb-5"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {heading}
              </p>
              <ul className="space-y-0">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[rgba(255,255,255,0.55)] text-sm hover:text-[rgba(255,255,255,0.9)] transition-colors"
                      style={{
                        fontFamily: "var(--font-body)",
                        lineHeight: 2.0,
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tricolor bar */}
        <div
          className="h-[3px] rounded-sm mb-4"
          style={{
            background: "linear-gradient(90deg, #FF9933 0% 33.33%, #FFFFFF 33.33% 66.66%, #138808 66.66% 100%)",
            marginTop: "32px",
          }}
        />

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[rgba(255,255,255,0.08)]"
        >
          <p className="text-[rgba(255,255,255,0.4)] text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} {SITE.name} by {SITE.company} &middot; {SITE.location}
          </p>

          {/* Social links */}
          <div className="flex gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-9 h-9 rounded-full border border-[rgba(255,255,255,0.12)] grid place-items-center text-[rgba(255,255,255,0.5)] hover:border-brand-400 hover:text-brand-400 transition-all"
              >
                {socialIcons[social.icon]}
              </a>
            ))}
          </div>
        </div>

        {/* Made in India */}
        <p className="text-center text-[rgba(255,255,255,0.3)] text-xs mt-6">
          Made in India &nbsp;&middot;&nbsp; Built for India
        </p>
      </div>
    </footer>
  );
}
