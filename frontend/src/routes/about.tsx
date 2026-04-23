import { createFileRoute } from '@tanstack/react-router';
import { Hexagon } from '@/components/ui/Hexagon';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About Me | Aidas Kriščiūnas' },
      {
        name: 'description',
        content: 'Learn more about Aidas Kriščiūnas, my background in infrastructure, and my technical skills.',
      },
      { property: 'og:title', content: 'About Me | Aidas Kriščiūnas' },
    ],
  }),
  component: About,
});

const skills = [
  'TypeScript',
  'React',
  'Kubernetes',
  'Talos Linux',
  'Go',
  'Python',
  'Terraform',
  'Docker',
  'CI/CD',
  'Grafana',
];

const interests = [
  'Open-source contribution',
  'Self-hosted infrastructure',
  'Home lab experimentation',
  'Cloud-native technologies',
  'System architecture design',
  'DevOps automation',
];

function About() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4 relative overflow-hidden">
      {/* Decorative Hexagon elements */}
      <div className="absolute top-20 left-10 opacity-20" aria-hidden="true">
        <Hexagon size="lg" />
      </div>
      <div className="absolute bottom-32 right-16 opacity-15" aria-hidden="true">
        <Hexagon size="md" />
      </div>
      <div className="absolute top-1/2 right-1/4 opacity-10" aria-hidden="true">
        <Hexagon size="sm" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-8">
          About Me
        </h1>

        {/* Bio Section */}
        <section className="mb-12" aria-labelledby="bio-heading">
          <h2 id="bio-heading" className="sr-only">
            Bio
          </h2>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
            <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
              I'm a developer who believes in open-source, self-hosted infrastructure, and transparent engineering.
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mt-4">
              I build and maintain infrastructure that runs reliably at scale. From Kubernetes clusters to CI/CD pipelines,
              I focus on creating systems that are robust, maintainable, and well-documented. My approach centers on
              transparency — every decision is documented, every configuration is version-controlled, and every system
              is designed to be understood by the next person who inherits it.
            </p>
          </div>
        </section>

        {/* Skills / Tech Stack Section */}
        <section className="mb-12" aria-labelledby="skills-heading">
          <h2 id="skills-heading" className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-6">
            Tech Stack & Skills
          </h2>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-wrap gap-3" role="list" aria-label="Skills and technologies">
              {skills.map((skill) => (
                <span
                  key={skill}
                  role="listitem"
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors duration-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Interests Section */}
        <section className="mb-12" aria-labelledby="interests-heading">
          <h2 id="interests-heading" className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-6">
            Personal Interests
          </h2>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
            <ul className="space-y-3" role="list">
              {interests.map((interest) => (
                <li
                  key={interest}
                  className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300"
                >
                  <Hexagon size="sm" className="flex-shrink-0" />
                  <span>{interest}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Resume Download Section */}
        <section aria-labelledby="resume-heading">
          <h2 id="resume-heading" className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-6">
            Resume
          </h2>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Want a detailed look at my experience and qualifications? Download my resume below.
            </p>
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Resume
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
