import { Database, Zap, Globe, Github, Lock, Layout } from "lucide-react";

const features = [
  {
    name: 'Zero Database Architecture',
    description: 'We pull your projects and profile data directly from GitHub in real-time. No more tedious manual data entry or database syncing.',
    icon: Database,
  },
  {
    name: 'Edge-Cached for Speed',
    description: 'Your portfolio is statically rendered and cached at the Edge. Recruiters experience zero load times when viewing your profile.',
    icon: Zap,
  },
  {
    name: 'Automated Screenshots',
    description: 'We automatically capture beautiful, 16:9 device screenshots of your live web projects using our headless Microlink integration.',
    icon: Layout,
  },
  {
    name: 'Subdomain Out of the Box',
    description: 'Get a professional subdomain like username.porto.social instantly upon signup. Upgrade later for custom domain support.',
    icon: Globe,
  },
  {
    name: 'Seamless GitHub Login',
    description: 'No passwords to remember. Authenticate securely with GitHub and let us handle the rest through our OAuth App.',
    icon: Github,
  },
  {
    name: 'Enterprise Security',
    description: 'Built on Next.js App Router and Better Auth. Your data remains on GitHub, we just present it beautifully and securely.',
    icon: Lock,
  },
];

export function LandingFeatures() {
  return (
    <div id="features" className="bg-background py-24 sm:py-32 relative isolate">
      <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl" aria-hidden="true">
        <div className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            No maintenance. Just pure performance.
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Porto.social is built differently. We believe your code should be the single source of truth. If it's on GitHub, it's on your portfolio.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16 hover:bg-secondary/20 p-4 -m-4 rounded-2xl transition-colors">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-sm md:text-base leading-7 text-muted-foreground">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
