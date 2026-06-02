"use client";

import { motion } from "framer-motion";
import { Building2, GraduationCap } from "lucide-react";
import resumeData from "@/data/resume.json";

export function ExperienceSection() {
  return (
    <section id="experience" className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        {/* Work Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">Work Experience</h2>
          <div className="space-y-6 md:space-y-8">
            {resumeData.work.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start md:items-center gap-4 md:gap-6 group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/50 border border-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4 border-b border-border/50 pb-6 md:pb-8">
                  <div>
                    <h3 className="font-bold text-foreground text-base md:text-xl mb-1">{item.company}</h3>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">{item.role}</p>
                  </div>
                  <div className="text-muted-foreground text-xs md:text-sm whitespace-nowrap font-mono mt-1 md:mt-0">
                    {item.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">Education</h2>
          <div className="space-y-6 md:space-y-8">
            {resumeData.education.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start md:items-center gap-4 md:gap-6 group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/50 border border-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4 border-b border-border/50 pb-6 md:pb-8 last:border-0">
                  <div>
                    <h3 className="font-bold text-foreground text-base md:text-xl mb-1">{item.school}</h3>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">{item.degree}</p>
                  </div>
                  <div className="text-muted-foreground text-xs md:text-sm whitespace-nowrap font-mono mt-1 md:mt-0">
                    {item.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
