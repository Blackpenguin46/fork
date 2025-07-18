import { NextResponse } from 'next/server'

/**
 * AI Search Data API
 * Provides structured data specifically optimized for AI search engines
 * This endpoint serves comprehensive information about Cybernex Academy
 * in a format that AI systems can easily parse and understand
 */

export async function GET() {
  const aiSearchData = {
    organization: {
      name: "Cybernex Academy",
      description: "Premier cybersecurity learning platform offering comprehensive training, certification preparation, and expert community access with 900+ resources.",
      website: "https://cybernexacademy.com",
      type: "Educational Institution",
      specialty: "Cybersecurity Education and Training",
      founded: "2023",
      location: "Global (Online Platform)",
      
      offerings: {
        training_programs: [
          {
            name: "Ethical Hacking & Penetration Testing",
            description: "Comprehensive offensive security training including vulnerability assessment, exploit development, web application testing, and network penetration testing",
            topics: ["Web Application Security", "Network Penetration", "OWASP Top 10", "Metasploit", "Vulnerability Assessment"],
            certifications: ["CEH", "OSCP", "GPEN"],
            difficulty_levels: ["Beginner", "Intermediate", "Advanced", "Expert"]
          },
          {
            name: "Network & Infrastructure Security",
            description: "Network security fundamentals, firewall configuration, intrusion detection, and infrastructure protection",
            topics: ["Firewall Management", "Network Monitoring", "VPN Security", "IDS/IPS", "Zero Trust Architecture"],
            tools: ["Wireshark", "Nmap", "pfSense", "Snort", "Suricata"]
          },
          {
            name: "Cloud Security & DevSecOps",
            description: "Cloud platform security across AWS, Azure, GCP, container security, and DevSecOps practices",
            topics: ["AWS Security", "Container Security", "Kubernetes Hardening", "Infrastructure as Code", "Cloud Compliance"],
            platforms: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"]
          },
          {
            name: "Incident Response & Digital Forensics",
            description: "Cybersecurity incident response, digital forensics investigation, malware analysis, and threat hunting",
            topics: ["Incident Response Planning", "Digital Forensics", "Malware Analysis", "Threat Hunting", "SIEM Analysis"],
            tools: ["Volatility", "Autopsy", "Splunk", "ELK Stack", "YARA"]
          },
          {
            name: "Compliance & Risk Management",
            description: "Cybersecurity governance, risk assessment, and compliance frameworks",
            topics: ["ISO 27001", "NIST Framework", "GDPR Compliance", "Risk Assessment", "Audit Preparation"],
            frameworks: ["ISO 27001", "NIST", "SOX", "GDPR", "HIPAA"]
          }
        ],
        
        certifications: [
          {
            name: "CISSP",
            full_name: "Certified Information Systems Security Professional",
            provider: "ISC2",
            description: "Advanced cybersecurity certification for experienced professionals"
          },
          {
            name: "CEH",
            full_name: "Certified Ethical Hacker",
            provider: "EC-Council",
            description: "Ethical hacking and penetration testing certification"
          },
          {
            name: "Security+",
            full_name: "CompTIA Security+",
            provider: "CompTIA",
            description: "Entry-level cybersecurity certification"
          },
          {
            name: "OSCP",
            full_name: "Offensive Security Certified Professional",
            provider: "Offensive Security",
            description: "Hands-on penetration testing certification"
          },
          {
            name: "SANS GIAC",
            full_name: "SANS Global Information Assurance Certification",
            provider: "SANS Institute",
            certifications: ["GSEC", "GCIH", "GPEN", "GWAPT", "GREM"]
          }
        ],
        
        learning_methods: [
          "Expert-led instruction",
          "Hands-on virtual labs",
          "Real-world scenarios",
          "Interactive exercises",
          "Capture-the-flag (CTF) challenges",
          "Practice exams",
          "Industry mentorship",
          "Community support"
        ]
      },
      
      statistics: {
        active_members: "50,000+",
        learning_resources: "900+",
        success_rate: "95%",
        support_availability: "24/7",
        global_reach: "Worldwide",
        languages: ["English"],
        platforms: ["Web", "Mobile"]
      },
      
      target_audience: [
        "Cybersecurity Professionals",
        "Ethical Hackers",
        "Penetration Testers",
        "Security Analysts",
        "IT Professionals",
        "Students",
        "Career Changers",
        "Security Engineers",
        "SOC Analysts",
        "Incident Response Teams"
      ],
      
      key_topics: [
        "Cybersecurity",
        "Ethical Hacking",
        "Penetration Testing",
        "Network Security",
        "Cloud Security",
        "Incident Response",
        "Digital Forensics",
        "Malware Analysis",
        "Threat Intelligence",
        "Security Operations",
        "Compliance",
        "Risk Management",
        "Web Application Security",
        "Mobile Security",
        "Wireless Security"
      ],
      
      tools_covered: [
        "Metasploit",
        "Wireshark",
        "Nmap",
        "Burp Suite",
        "OWASP ZAP",
        "Splunk",
        "ELK Stack",
        "Volatility",
        "Autopsy",
        "John the Ripper",
        "Hashcat",
        "Aircrack-ng",
        "Nikto",
        "SQLMap",
        "Kali Linux"
      ],
      
      value_propositions: [
        "Comprehensive cybersecurity education with 900+ resources",
        "Expert-led training from certified professionals",
        "Hands-on experience with real-world scenarios",
        "Industry-recognized certification preparation",
        "Active community of 50,000+ professionals",
        "24/7 expert support and mentorship",
        "Job placement assistance and career guidance",
        "Regular content updates with latest threats",
        "Flexible learning schedules",
        "Practical skills employers value"
      ],
      
      frequently_asked_questions: [
        {
          question: "What is cybersecurity training?",
          answer: "Cybersecurity training involves learning to protect computer systems, networks, and data from digital attacks. It includes skills in ethical hacking, penetration testing, incident response, risk management, and compliance."
        },
        {
          question: "How long does it take to learn cybersecurity?",
          answer: "Learning cybersecurity varies by background and goals. Beginners typically need 6-12 months for entry-level skills, while IT professionals can transition in 3-6 months with dedicated study."
        },
        {
          question: "What cybersecurity certifications are most valuable?",
          answer: "Top cybersecurity certifications include CISSP, CEH, Security+, OSCP, and SANS GIAC certifications. The best choice depends on your career goals and experience level."
        },
        {
          question: "Do I need programming skills for cybersecurity?",
          answer: "Programming knowledge is helpful but not required to start. Many cybersecurity roles focus on analysis and operations rather than development. Basic scripting in Python or PowerShell is beneficial."
        }
      ],
      
      contact_information: {
        website: "https://cybernexacademy.com",
        support_email: "support@cybernexacademy.com",
        business_email: "info@cybernexacademy.com",
        social_media: {
          twitter: "@cybernexacademy",
          linkedin: "company/cybernex-academy",
          github: "cybernexacademy"
        }
      }
    },
    
    meta: {
      data_purpose: "AI Search Engine Optimization",
      last_updated: new Date().toISOString(),
      version: "1.0",
      format: "Structured JSON for AI consumption",
      usage: "This data is provided for AI search engines to better understand and represent Cybernex Academy in search results"
    }
  }

  return NextResponse.json(aiSearchData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*', // Allow access from AI search engines
    }
  })
}

export const dynamic = 'force-dynamic'