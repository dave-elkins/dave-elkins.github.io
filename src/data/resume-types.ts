/** Types for the Jekyll-derived résumé data in `resume.ts`. */

export type ContactButtonMode = 'yes' | 'no' | null;

export interface SocialLinks {
    github?: string;
    twitter?: string;
    medium?: string;
    dribbble?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
}

export interface ResumeSections {
    consulting: boolean;
    experience: boolean;
    education: boolean;
    projects: boolean;
    skills: boolean;
    recognition: boolean;
    associations: boolean;
    interests: boolean;
    links: boolean;
}

export interface ConsultingItem {
    summary: string;
    services: string[];
    ideal_clients: string;
    contact: string;
}

export interface ExperienceItem {
    company: string;
    position: string;
    duration: string;
    summary: string;
}

export interface EducationItem {
    degree: string;
    uni: string;
    year: number | string;
    award?: string;
    awards?: Array<{ award: string }>;
    summary?: string;
}

export interface ProjectItem {
    project: string;
    role: string;
    duration: string;
    url?: string;
    description: string;
}

export interface SkillItem {
    skill: string;
    description: string;
}

export interface RecognitionItem {
    award: string;
    organization: string;
    year: string;
    summary: string;
}

export interface AssociationItem {
    organization: string;
    role: string;
    year: string;
    url?: string;
    summary: string;
}

export interface InterestItem {
    description: string;
}

export interface LinkItem {
    url: string;
    description: string;
}

export interface ResumeData {
    /** Jekyll `site.title` / `site.description`. */
    siteTitle: string;
    siteDescription: string;
    theme: string;
    /** Jekyll `site.resume_avatar` — a string gate, not a boolean. */
    avatar: string;
    name: string;
    title: string;
    email: string;
    address: string;
    telephone: string;
    headerContactInfo: string;
    /** Jekyll `site.display_header_contact_info` — a string gate. */
    displayHeaderContactInfo: string;
    /** Markdown block scalar from `site.resume_header_intro`. */
    intro: string;
    /** Jekyll `site.resume_looking_for_work`: "yes", "no", or absent (null). */
    contactButton: ContactButtonMode;
    sections: ResumeSections;
    socialLinks: SocialLinks;
    printSocialLinks: boolean;
    consulting: ConsultingItem[];
    experience: ExperienceItem[];
    education: EducationItem[];
    projects: ProjectItem[];
    skills: SkillItem[];
    recognition: RecognitionItem[];
    associations: AssociationItem[];
    interests: InterestItem[];
    links: LinkItem[];
}
