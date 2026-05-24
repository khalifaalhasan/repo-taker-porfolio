export interface Project {
  id: string;
  slug: string;
  title: string;
  images: string[];
  description: string;
  challengeDescription?: string | null;
  features?: string[] | null;
  techStack: string[];
  githubUrl?: string | null;
  isPrivateRepo?: boolean;
  liveUrl?: string | null;
  featured: boolean;
}

export const projectsData: Project[] = [
  {
    id: "1",
    slug: "distributed-task-queue",
    title: "Distributed Task Queue",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop"
    ],
    description: "A highly available, Redis-backed distributed task queue processing millions of jobs per day. Built with Go and gRPC.",
    challengeDescription: "The main challenge was handling distributed locks and ensuring exactly-once execution semantics across multiple worker nodes without introducing high latency. We had to optimize the Redis Lua scripts to reduce round-trip times.",
    features: ["Job retry mechanisms", "Priority queues", "Dead-letter queues", "gRPC streaming API"],
    techStack: ["Go", "Redis", "gRPC", "Docker"],
    githubUrl: "#",
    liveUrl: "#",
    featured: true,
  },
  {
    id: "2",
    slug: "kubernetes-autoscaler",
    title: "Kubernetes Autoscaler",
    images: [
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Custom Kubernetes controller to auto-scale microservices based on custom Prometheus metrics.",
    challengeDescription: "Native HPA only scales on CPU/Memory out of the box. We needed a custom controller to scale based on specific business metrics (e.g. active websocket connections) from Prometheus, which required deep integration with the K8s API server.",
    features: null,
    techStack: ["Kubernetes", "Prometheus", "Go", "Helm"],
    githubUrl: "#",
    liveUrl: null,
    featured: true,
  },
  {
    id: "3",
    slug: "microservices-api-gateway",
    title: "Microservices API Gateway",
    images: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"
    ],
    description: "A fast, lightweight API Gateway handling authentication, rate-limiting, and routing for 50+ backend services.",
    challengeDescription: null,
    features: ["JWT validation", "Dynamic routing via Redis", "IP-based rate limiting"],
    techStack: ["TypeScript", "Node.js", "Redis", "Kong"],
    githubUrl: null,
    isPrivateRepo: true,
    liveUrl: "#",
    featured: true,
  },
  {
    id: "4",
    slug: "automated-cv-generator",
    title: "Automated CV Generator",
    images: [
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Dynamic PDF resume generation service parsing Markdown and JSON data to produce ATS-optimized, beautifully styled CVs.",
    challengeDescription: null,
    features: null,
    techStack: ["Next.js", "React-PDF", "Supabase", "Tailwind"],
    githubUrl: "#",
    liveUrl: "#",
    featured: true,
  },
  {
    id: "5",
    slug: "internal-metrics-dashboard",
    title: "Internal Metrics Dashboard",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
    ],
    description: "A real-time metrics dashboard for internal stakeholders to monitor system health and business KPIs.",
    challengeDescription: "Aggregating millions of events per second and displaying them with less than 1 second latency. Solved using ClickHouse and materialized views.",
    features: ["Real-time charts", "Custom alerting", "Role-based access control"],
    techStack: ["React", "ClickHouse", "Go", "WebSockets"],
    githubUrl: null,
    isPrivateRepo: true,
    liveUrl: null,
    featured: false,
  }
];
