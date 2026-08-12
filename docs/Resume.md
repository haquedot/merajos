%-------------------------
% Full Stack Resume
%-------------------------

\documentclass[a4paper,6pt]{article}

\usepackage[margin=1cm]{geometry}
\usepackage[hidelinks]{hyperref}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{parskip}
\usepackage{array}
\usepackage{ragged2e}
\usepackage[normalem]{ulem}

\setlength{\parskip}{2pt}
\setlength{\parindent}{0pt}

\setlist[itemize]{leftmargin=*, noitemsep, topsep=2pt}

\titleformat{\section}{
  \large\bfseries
}{}{0em}{}[\titlerule]

\newcommand{\resumeItem}[1]{\item #1}

\newcommand{\resumeSubheading}[4]{
  \textbf{#1} \hfill #2 \\
  #3 \hfill \textit{#4}
}

\newcommand{\resumeProject}[3]{
  \textbf{#1} \hfill {\small #2} \\
  \textit{\small #3}
}

\newcommand{\ulhref}[2]{\href{#1}{\uline{#2}}}

\begin{document}

%========================
% HEADER
%========================
\noindent
\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}} l r}

\begin{minipage}[t]{0.4\textwidth}
  \raggedright
  {\LARGE \textbf{Md Merajul Haque}}\\[2pt]
  {\large Full Stack Developer}
\end{minipage}
&
\begin{minipage}[t]{0.55\textwidth}
  \raggedleft
  Gachibowli, Hyderabad, 500032\\
  \ulhref{https://www.merajulhaque.com/}{Portfolio} \textbar{}
  \ulhref{https://github.com/haquedot}{GitHub} \textbar{}
  \ulhref{https://leetcode.com/u/haquedot/}{LeetCode} \textbar{}
  \ulhref{https://www.linkedin.com/in/haquedot/}{LinkedIn}\\[3pt]
  Contact: \ulhref{mailto:haquedot@gmail.com}{haquedot@gmail.com} \textbar{} \ulhref{tel:+917502461630}{+91-7502461630}
\end{minipage}

\end{tabular*}

%========================
% SUMMARY
%========================
\section*{Summary}

Full Stack Developer with hands-on experience building real-world web applications using React.js, Next.js, Node.js, and MongoDB. Worked on production-level projects and internships where I developed responsive user interfaces, integrated APIs, and built backend features for real users. Experienced in creating dashboards, improving UI/UX, and working with analytics tools.

%========================
% EXPERIENCE
%========================
\section*{Experience}

\resumeSubheading
  {Lincode}{May 2025 -- Nov 2025}
  {Frontend Developer Intern}{Remote}

\begin{itemize}
  \resumeItem{Revamped the product UI/UX by implementing complete dark mode, multi-brand theming, modular CSS architecture, and translation support.}
  \resumeItem{Built reusable graph components using Recharts and Highcharts.}
  \resumeItem{Developed drag-and-drop analytics dashboards using \texttt{react-dnd-kit}.}
  \resumeItem{Enhanced subscription workflows, filters, and responsiveness.}
\end{itemize}

\resumeSubheading
  {WhatBytes}{Jan 2025 -- May 2025}
  {Frontend Developer Intern}{Remote}

\begin{itemize}
  \resumeItem{Worked on Cura Care healthcare platform (\ulhref{https://curacare.in}{Live}).}
  \resumeItem{Integrated PostHog, Google Analytics, and Facebook Pixel.}
  \resumeItem{Built dynamic appointment slot management system.}
\end{itemize}

\resumeSubheading
  {Ministry of Electronics and Information Technology}{Mar 2023 -- Dec 2023, Mar 2024 -- Jun 2024}
  {Web Developer Intern}{Hyderabad, India}

\begin{itemize}
  \resumeItem{Developed CMS dashboard improving usability.}
  \resumeItem{Built responsive React.js interfaces.}
  \resumeItem{Collaborated with backend teams on features.}
\end{itemize}

%========================
% PROJECTS
%========================

\section*{Projects}

\resumeProject
  {MasjidMadarsaFinder \textbar{} \ulhref{https://masjidmadarsafinder.com/}{Live}}{}
  {Next.js, React, TypeScript, Node.js, Express, MongoDB}

\begin{itemize}
  \resumeItem{Built a full-stack platform to discover, verify, and manage Masjid/Madarsa institutions across India.}
  \resumeItem{Implemented multi-layer verification workflow (District → State → National → Admin) with RBAC.}
  \resumeItem{Developed dynamic step-based onboarding forms with configurable schema system.}
  \resumeItem{Engineered JWT + Google OAuth authentication with role-based access control.}
  \resumeItem{Built search, listing, and location-based discovery features for public users.}
  \resumeItem{Integrated Cloudinary for media uploads (documents, images, videos).}
  \resumeItem{Designed REST APIs across domains (auth, profiles, reviews, wishlist, notifications).}
  \resumeItem{Added Swagger API documentation and strong backend security (Helmet, XSS, rate limiting).}
  \resumeItem{Implemented SEO (sitemap, metadata, robots) and i18n (English, Hindi, Urdu, Arabic).}
\end{itemize}

\resumeProject
  {Matchwize \textbar{} \ulhref{https://www.matchwize.com/}{Live}}{}
  {Next.js, Tailwind CSS, Node.js, Express.js, Supabase}

\begin{itemize}
  \resumeItem{Built AI-powered resume analyzer used by \textbf{130+ users} for job matching and skill insights.}
  \resumeItem{Integrated Gemini API for resume parsing, scoring, and suggestions.}
  \resumeItem{Implemented credit-based usage system for AI requests.}
  \resumeItem{Developed dashboards with score breakdown and actionable insights.}
  \resumeItem{Built authentication and backend workflows for resume processing.}
\end{itemize}

\resumeProject
  {Exceed Robotics \textbar{} \ulhref{https://exceedrobotics.com/}{Live}}{}
  {HTML, CSS, JavaScript, Bootstrap, jQuery}

\begin{itemize}
  \resumeItem{Developed enrollment, camp, and blog modules.}
  \resumeItem{Built responsive UI optimized for performance.}
  \resumeItem{Converted UI designs into production-ready interfaces.}
\end{itemize}

%========================
% EDUCATION
%========================
\section*{Education}

\textbf{M.Tech, Computer Science} \hfill Jul 2022 -- May 2027 \\
Maulana Azad National Urdu University \hfill CGPA: 8.15 \\

\textbf{B.Tech, Computer Science} \hfill Oct 2022 -- May 2025 \\
Maulana Azad National Urdu University \hfill CGPA: 8.71 \\

\textbf{Diploma in Computer Science and Engineering} \hfill Aug 2019 -- Jun 2022 \\
CGPA: 9.78

%========================
% SKILLS
%========================
\section*{Skills}

\begin{tabular}{@{}p{3cm}p{11cm}@{}}
\textbf{Frontend} & React.js, Next.js, JavaScript, TypeScript, Tailwind CSS \\
\textbf{Backend} & Node.js, Express.js \\
\textbf{Databases} & MongoDB, MySQL, Supabase \\
\textbf{Tools} & Git, GitHub, Figma, PostHog, Google Analytics \\
\end{tabular}

%========================
% COURSES
%========================
\section*{Courses}

\begin{itemize}
  \resumeItem{The Web Developer Bootcamp 2023 --- Udemy}
  \resumeItem{Responsive Web Design --- freeCodeCamp}
\end{itemize}

%========================
% COMMUNITY
%========================
\section*{Community Involvement}

\textbf{MANUU Connect} \hfill Hyderabad, India \\
\textit{Founding Member \& Backend Developer} \hfill Nov 2025 -- Present

\begin{itemize}
  \resumeItem{Built backend APIs for authentication and user management.}
  \resumeItem{Developed bootcamp registration and onboarding flows.}
  \resumeItem{Collaborated with team for feature integration.}
\end{itemize}

%========================
% ACHIEVEMENTS
%========================
\section*{Achievements}

\begin{itemize}
\resumeItem{Secured 1\textsuperscript{st} position in Diploma in Computer Science (University Level).}
\end{itemize}

\end{document}