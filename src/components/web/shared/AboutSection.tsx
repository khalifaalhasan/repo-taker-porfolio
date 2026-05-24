"use client";

import { motion } from "framer-motion";

const approaches = [
  { step: "01", title: "Analyze requirements & constraints" },
  { step: "02", title: "Design scalable architectures" },
  { step: "03", title: "Deploy resilient solutions" },
];

const stats = [
  { value: "03+", label: "Years Of Experience" },
  { value: "20+", label: "Projects Completed" },
  { value: "10+", label: "Clients Served" },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">About Me</h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
            I&apos;m a backend and DevOps engineer passionate about crafting resilient, highly-available digital infrastructure. I focus on turning complex business logic into seamless API endpoints by understanding scaling needs, designing thoughtful schemas, and ensuring smooth deployments across cloud environments.
          </p>
        </motion.div>

        {/* My Approach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20"
        >
          <h3 className="text-xl font-bold text-center mb-6">My Approach</h3>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {approaches.map((item) => (
              <div key={item.step} className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 bg-card border border-border rounded-lg md:rounded-xl p-2 md:p-4 text-center md:text-left">
                <div className="w-6 h-6 md:w-10 md:h-10 shrink-0 rounded md:rounded-lg bg-secondary text-secondary-foreground font-bold flex items-center justify-center text-[10px] md:text-sm">
                  {item.step}
                </div>
                <span className="text-muted-foreground text-[8px] md:text-sm font-medium leading-tight md:leading-normal">{item.title}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-12 md:gap-24"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <h4 className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</h4>
              <p className="text-sm font-medium text-muted-foreground tracking-wide">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
