import { cs } from './cs';

export const en = {
  hero: {
    greeting: "Hi, I am",
    role: "Software Engineer & Student",
    bio: "I'm a student and developer focused on fullstack web applications. I enjoy building functional and clear systems."
  },
  skills: {
    title: "Experience",
    js: "JavaScript",
    frontend: "Frontend Engineering",
    frontendDesc: "React, Modern Web, User experience, User interface",
    backend: "Backend Engineering",
    backendDesc: "Working with API, Webserver, Database operations",
    sql: "SQL",
    linux: "Linux"
  },
  experience: {
    title: "Work Experience",
    jobs: [
      {
        company: "BePositive",
        role: "Junior Software Engineer",
        period: "July 2024 - December 2024 (Brno)",
        desc: "Web application development in React.js",
        link: "https://www.bepositive.agency/"
      },
      {
        company: "Flyboys",
        role: "Tester",
        period: "July 2023 - August 2023 (Klášterec nad Ohří)",
        desc: "",
        link: "https://www.worldofairports.com/"
      }
    ]
  },
  education: {
    title: "Education",
    schools: [
      {
        name: "Faculty of Information Technology CTU",
        field: "Information Technology (University)",
        period: "September 2025 - Present",
        link: "https://fit.cvut.cz/"
      },
      {
        name: "Gymnázium Kadaň",
        field: "High School",
        period: "September 2017 - June 2025",
        link: "https://www.gymka.cz/"
      }
    ]
  },
  competitions: {
    title: "Competitions",
    items: [
      {
        name: "1st place – Tour de App 2025",
        org: "Student Cyber Games",
        date: "March 2025",
        link: "https://tourde.app"
      },
      {
        name: "2nd place – Tour de App 2024",
        org: "Student Cyber Games",
        date: "March 2024",
        link: "https://tourde.app"
      }
    ]
  },
  projects: {
    title: "My Projects",
    items: [
      {
        name: "Internal SPEAR system for the association",
        desc: "Web internal system for a group of gamers (Frontend, Backend, API work)",
        period: "September 2024 - December 2024",
        link: "https://arma3spartans.com"
      }
    ]
  },
  volunteering: {
    title: "Volunteering",
    items: [
      {
        name: "Student Cyber Games",
        role: "IT / Head of Sales",
        period: "April 2025 - Present (Brno)",
        desc: "Helping out in my free time with the association's shop operations.",
        link: "https://scg.cz"
      }
    ]
  },
  contact: {
    title: "Contact",
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send",
    success: "Message successfully sent.",
    error: "An error occurred while sending."
  },
  nav: {
    langSwitch: "Přepnout do Češtiny",
    admin: "Admin",
    home: "Home"
  }
};

export type Dictionary = typeof cs;
