import type { ResumeData } from './resume-types';

// Ported verbatim from _config.yml and _data/*.yml. String-valued gates
// (avatar, displayHeaderContactInfo, contactButton) are intentionally kept as
// strings; only section toggles are real booleans. Raw HTML entities and
// Markdown block-scalar content are preserved as authored.

export const resume: ResumeData = {
    siteTitle: 'Dave Elkins',
    siteDescription: 'a site about me',
    theme: 'default',
    avatar: 'true',
    name: 'Dave Elkins',
    title: 'Senior Principal Engineer · Healthcare Software · Cloud Architecture · Available for Consulting',
    email: 'dave@fenohlth.com',
    address: 'Colorado',
    telephone: '',
    headerContactInfo: 'Colorado • https://linkedin.com/in/daveelkins/',
    displayHeaderContactInfo: 'false',
    intro: `I'm a software engineer with 20+ years of experience, the last 15 spent exclusively in healthcare. I co-founded HealthPost — a consumer healthcare scheduling platform — built it from scratch as a solo engineer, scaled the team, and led a successful acquisition by The Advisory Board Company in 2014. Since then I've worked at the Director and Principal Engineer level inside Optum/UnitedHealth Group and HarmonyCares, building large-scale cloud platforms, EMR integrations, and data pipelines for some of the largest health systems in the country.

I'm passionate about both the end-user experience and the developer experience — good software needs to work well for the people using it and the engineers maintaining it.

📩 [dave@fenohlth.com](mailto:dave@fenohlth.com)
`,
    contactButton: 'yes',
    sections: {
        consulting: true,
        experience: true,
        education: true,
        projects: true,
        skills: true,
        recognition: false,
        associations: false,
        interests: false,
        links: true,
    },
    socialLinks: {
        github: 'https://github.com/dave-elkins',
        linkedin: 'https://linkedin.com/in/daveelkins/',
        website: 'http://dave-elkins.github.com',
    },
    printSocialLinks: true,
    consulting: [
        {
            summary: `I work with health-tech companies that need senior-level technical expertise without the overhead of a full-time hire.

I've spent 15+ years building and scaling healthcare software — from co-founding and selling a startup to architecting consumer health platforms at Optum scale. I bring that depth to focused engagements where it matters most.

Learn more about my consulting services at [fenohlth.com](https://fenohlth.com)
`,
            services: [
                'HIPAA-compliant AWS and Azure cloud architecture',
                'EMR / EHR integration design and implementation (eClinicalWorks, Epic, and others)',
                'Infrastructure as Code (Terraform), CI/CD pipelines, and DevOps modernization',
                'API platform design and microservices architecture',
                'Technical due diligence for investors or acquirers',
                'Fractional CTO support for early-stage health-tech startups',
            ],
            ideal_clients: `Series A/B health-tech companies, digital health startups, and healthcare organizations scaling their engineering capabilities who need a senior technical partner that understands both the technology and the regulatory landscape.
`,
            contact: 'dave@fenohlth.com',
        },
    ],
    experience: [
        {
            company: 'FenoHLTH',
            position: 'Founder &amp; Principal Consultant',
            duration: 'Apr, 2026 &mdash; Present',
            summary: `FenoHLTH is how I bring that depth to organizations that need senior technical expertise without a full-time hire — for a focused project, a fractional CTO role, or anything in between.

- HIPAA-compliant AWS and Azure cloud architecture
- EMR / EHR integration design and implementation (eClinicalWorks, Epic, and others)
- Infrastructure as Code (Terraform), CI/CD pipelines, and DevOps modernization
- API platform design and microservices architecture
- Technical due diligence for investors or acquirers
- Fractional CTO support for early-stage health-tech startups

*AI, AWS, Azure, Healthcare, DevOps*
`,
        },
        {
            company: 'HarmonyCares',
            position: 'Senior Principal Engineer',
            duration: 'Apr, 2025 &mdash; Present',
            summary: `HarmonyCares delivers value-based, in-home primary care to high-need patients across the country.

- Leading architecture and engineering for our integration platform to support our clinical operations between Salesforce, Athena, CareLink and Verato.
- Implemented robust patient identity mastering across Salesforce, Athena and Carelink using Verato as our EMPI solution along with a custom FastAPI app and Azure functions to keep all systems in sync for patient identification.
- Designed and built a robust monitoring solution to identify issues in our data syncing process so that they could be identified, triage and resolved by our support team with rare escalations to the dev team for help.
- Driving adoption of cloud-native patterns and infrastructure-as-code practices for the engineering team
- Partnering with product and clinical stakeholders to translate healthcare workflows into scalable, reliable software systems

*Azure, Python, Databricks, Terraform, Github Copilot*
`,
        },
        {
            company: 'Optum',
            position: 'Senior Principal Engineer',
            duration: 'Jun, 2020 &mdash; Apr, 2025',
            summary: `- Lead architect for Consumer Acquisition Services (CAS), a marketing and member acquisition platform on AWS
- Designed and led the Infrastructure-as-Code and CI/CD strategy for CAS, replacing manual provisioning with fully automated Terraform pipelines — reducing deployment time by 50% and improving environment consistency across dev, staging, and production
- Served as architect on the JMH MMP program within the Enterprise Integration Platform (EIP) on Azure, driving technical strategy for a complex multi-stakeholder integration effort
- Partnered with Marketing Cloud teams to deliver data pipeline integrations connecting member acquisition workflows to downstream analytics and campaign systems
- Mentored engineers across multiple teams and helped establish architectural standards adopted org-wide

*Python, Scala, Terraform, AWS, Azure, Marketing Cloud integrations, CI/CD*
`,
        },
        {
            company: 'Optum',
            position: 'Director of Engineering',
            duration: 'Nov, 2017 &mdash; Jun, 2020',
            summary: `- Engineering lead and people manager for the HealthPost product following its acquisition by UnitedHealth Group
- Led the migration of HealthPost's infrastructure from on-premise to AWS, improving reliability, scalability, and deployment velocity
- Maintained a microservices architecture in Ruby on Rails with bi-directional EMR integrations covering most major EHR vendors in the U.S. market
- Managed a team of engineers through hiring, performance reviews, roadmap prioritization, and cross-functional stakeholder alignment
- Maintained 24/7 uptime SLAs for a scheduling platform used by hospital systems and healthcare providers nationwide

*Ruby on Rails, AWS, Terraform, REST APIs, EMR/EHR integrations, CI/CD*
`,
        },
        {
            company: 'The Advisory Board Company',
            position: 'Director of Engineering',
            duration: 'May, 2014 &mdash; Nov, 2017',
            summary: `- Led the HealthPost engineering team post-acquisition through rapid scaling and product expansion
- Led the initiative to build an API Developer Platform for HealthPost, enabling third-party integrations at scale
- Delivered a complex eClinicalWorks (ECW) integration involving a deployable agent that read and wrote directly to ECW's database — a technically demanding, high-value integration for clinical scheduling
- Managed client relationships directly, regularly attending on-site meetings on behalf of the product
- Led the move to AWS and established Terraform-based infrastructure automation

*Ruby on Rails, REST APIs, EMR/EHR integrations, CI/CD*
`,
        },
        {
            company: 'HealthPost',
            position: 'Co-founder &amp; CTO',
            duration: 'Jan, 2011 &mdash; May, 2014',
            summary: `- Co-founded HealthPost, a white-label consumer healthcare scheduling platform for hospital systems and medical practices
- Designed, built, and deployed the initial product entirely as a solo engineer — full stack, infrastructure, and integrations
- Built an API platform and EMR integrations for scheduling with major EHR vendors
- Scaled the engineering team and client base as the company grew
- Successfully exited via acquisition by The Advisory Board Company in 2014

*Ruby on Rails, REST APIs, EMR/EHR integrations, CI/CD*
`,
        },
        {
            company: 'BDP International',
            position: 'Software Developer',
            duration: '2007 &mdash; May, 2011',
            summary: `Java developer working on EDI integrations between enterprise clients and BDP's logistics platform across North America, Europe, and Asia. Involved in the full project lifecycle from planning through production support. Also built web-based internal tools and reporting dashboards.

*Java, XML, SAP IDOC, EDI*
`,
        },
        {
            company: 'Lonestar Turnkey Systems',
            position: 'Software Developer',
            duration: '2003 &mdash; May, 2007',
            summary: 'Helped develop and support a Windows GUI-based product',
        },
    ],
    education: [
        {
            degree: 'Masters of Computer Science',
            uni: 'Texas A&amp;M University',
            year: 2002,
        },
        {
            degree: 'Bachelor of Science, Computer Science',
            uni: 'Texas A&amp;M University',
            year: 2001,
        },
    ],
    projects: [
        {
            project: 'HealthPost (acquired 2014)',
            role: 'Co-Founder &amp; CTO',
            duration: '2011 &mdash; 2014',
            description: `Consumer healthcare scheduling platform serving hospital systems and medical practices. Built from scratch — full stack Rails application, AWS infrastructure, EMR integrations, and API platform. Scaled to 10+ clients before a successful acquisition by The Advisory Board Company.
`,
        },
        {
            project: 'AWS WAFv2 Terraform Module',
            role: 'Developer',
            duration: '2024 &mdash; Present',
            url: 'https://github.com/dave-elkins/terraform-aws-wafv2',
            description: `A reusable Terraform module for AWS WAF V2, simplifying web application firewall configuration for teams building HIPAA-compliant and security-conscious infrastructure on AWS.
`,
        },
    ],
    skills: [
        {
            skill: 'Healthcare & Compliance',
            description:
                'HIPAA-compliant architecture, EMR/EHR integrations, HL7/FHIR, consumer health platforms',
        },
        {
            skill: 'Cloud Infrastructure',
            description:
                'AWS, Azure, Terraform / Infrastructure as Code, CI/CD pipelines, zero-downtime deployments',
        },
        {
            skill: 'Software Architecture',
            description:
                'Microservices, event-driven architecture, API platforms, distributed systems, big data pipelines',
        },
        {
            skill: 'Languages & Frameworks',
            description: 'Python, Scala, Ruby on Rails, Java, SQL',
        },
        {
            skill: 'Leadership',
            description:
                'Technical team leadership, roadmap ownership, cross-functional stakeholder alignment, engineering hiring',
        },
    ],
    recognition: [],
    associations: [],
    interests: [
        {
            description: 'Healthcare',
        },
        {
            description: 'ML & AI',
        },
        {
            description: 'Consumer Facing Applications',
        },
    ],
    links: [
        {
            url: 'https://github.com/dave-elkins',
            description: 'Github Profile',
        },
        {
            url: 'https://linkedin.com/in/daveelkins/',
            description: 'LinkedIn Profile',
        },
    ],
};
