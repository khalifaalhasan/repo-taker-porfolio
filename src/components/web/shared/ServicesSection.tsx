"use client";

import { motion } from "framer-motion";

const services = [
  {
    id: "1",
    title: "Backend\nDevelopment",
    description: "Robust architectures using Node.js, Go, and Python for clean, consistent, reliable performance.",
    pills: ["Clean Code", "Scalability"],
  },
  {
    id: "2",
    title: "Cloud &\nDevOps",
    description: "Automated CI/CD pipelines and infrastructure as code using Docker, Kubernetes, and Terraform.",
    pills: ["Automation", "High Availability"],
  },
  {
    id: "3",
    title: "Database\nDesign",
    description: "Optimized relational and NoSQL schemas ensuring fast data retrieval and data integrity.",
    pills: ["PostgreSQL", "Performance"],
  },
  {
    id: "4",
    title: "System\nArchitecture",
    description: "Designing microservices and distributed systems capable of handling millions of requests seamlessly.",
    pills: ["Microservices", "Reliability"],
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Services</h2>
          <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
            Designing clean scalable resilient systems
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex flex-col justify-between rounded-xl md:rounded-2xl bg-card border border-border p-4 md:p-8 min-h-[180px] md:min-h-[380px]"
            >
              <div>
                <h3 className="text-xs md:text-2xl font-bold mb-2 md:mb-6 text-foreground leading-tight md:leading-snug break-words">
                  {service.title.replace('\n', ' ')}
                </h3>
                <p className="text-muted-foreground text-[10px] md:text-sm leading-snug md:leading-relaxed mb-4 md:mb-8 line-clamp-3 md:line-clamp-none">
                  {service.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 md:gap-3">
                {service.pills.map((pill) => (
                  <div key={pill} className="px-2 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border border-border bg-secondary/50 text-[9px] md:text-xs font-medium text-muted-foreground text-center md:text-left truncate">
                    {pill}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
