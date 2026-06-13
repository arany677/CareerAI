const express = require('express');
const router = express.Router();
const axios = require('axios');
const dbHelper = require('../config/dbHelper');
const { protect } = require('../middleware/auth');

// Local Job Database for Mock Recommendation Engine
const MOCK_JOBS_DB = [
  {
    title: "Frontend Developer",
    requiredSkills: ["JavaScript", "React", "HTML", "CSS", "Tailwind CSS", "Git"],
    description: "Design and implement engaging user interfaces for cloud-scale enterprise SaaS web applications. Collaborate with designers and backend engineering squads.",
    company: "SaaSify Technologies"
  },
  {
    title: "React Developer",
    requiredSkills: ["React", "TypeScript", "Next.js", "Redux", "Jest", "Git"],
    description: "Build robust, highly scalable, and reusable frontend component portfolios using React and Next.js. Work closely with product and data analytics teams.",
    company: "Innovate Web Solutions"
  },
  {
    title: "UI/UX Designer",
    requiredSkills: ["Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "UX"],
    description: "Conduct user experience audits, sketch detailed user flows, build high-fidelity interactive wireframes, and design components using Figma.",
    company: "CreativeMind Studio"
  },
  {
    title: "Product Designer",
    requiredSkills: ["Figma", "UX", "UI", "Design Systems", "Prototyping", "User Testing"],
    description: "Oversee the lifecycle design of consumer products, from conceptual sketches to prototype tests and technical developer handoff assets.",
    company: "CoreProduct Labs"
  },
  {
    title: "Digital Marketing Specialist",
    requiredSkills: ["SEO", "Google Analytics", "SEM", "Copywriting", "Social Media", "Marketing"],
    description: "Optimize digital campaigns, structure SEO indexing, manage paid advertisement networks, and create copy to drive site click conversions.",
    company: "GrowthBoost Agency"
  },
  {
    title: "Backend Engineer",
    requiredSkills: ["Node.js", "Express.js", "MongoDB", "REST APIs", "SQL", "Docker"],
    description: "Architect secure microservice backend APIs, configure database indexes, build query pipelines, and maintain server infrastructures.",
    company: "DataShield Systems"
  },
  {
    title: "Full Stack Developer",
    requiredSkills: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript", "REST APIs"],
    description: "Develop both end-to-end frontend interfaces and backend Express APIs, handling state storage and server infrastructure updates.",
    company: "StackFlow Ventures"
  }
];

function generateMockRecommendations(userSkills, targetRole) {
  const cleanUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const normalizedTarget = (targetRole || '').toLowerCase().trim();

  const recommendations = MOCK_JOBS_DB.map(job => {
    let matchingSkillsCount = 0;
    job.requiredSkills.forEach(reqSkill => {
      if (cleanUserSkills.includes(reqSkill.toLowerCase())) {
        matchingSkillsCount++;
      }
    });

    let matchPercentage = 0;
    if (job.requiredSkills.length > 0) {
      matchPercentage = Math.round((matchingSkillsCount / job.requiredSkills.length) * 100);
    }

    const normalizedTitle = job.title.toLowerCase();
    if (normalizedTarget && (normalizedTitle.includes(normalizedTarget) || normalizedTarget.includes(normalizedTitle))) {
      matchPercentage = Math.min(98, matchPercentage + 30);
    }

    if (matchPercentage === 0) {
      matchPercentage = Math.max(30, Math.round(Math.random() * 20) + 35);
    }

    return {
      title: job.title,
      company: job.company,
      requiredSkills: job.requiredSkills,
      matchPercentage,
      description: job.description
    };
  });

  return recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// @route   GET api/jobs/recommend
router.get('/recommend', protect, async (req, res) => {
  try {
    const userSkills = req.user.profile?.skills || [];
    const targetRole = req.user.profile?.targetRole || '';

    const latestResume = await dbHelper.findLatestResumeByUser(req.user._id.toString());
    let resumeText = '';
    if (latestResume && latestResume.analysisResult) {
      resumeText = latestResume.analysisResult.rawText || '';
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json(generateMockRecommendations(userSkills, targetRole));
    }

    const prompt = `
      You are an advanced career matching engine. 
      Analyze skills, target role, and resume context. Recommend 4-5 job roles.
      For each role, provide: Job Title, Company, Required Skills, Match Percentage (calculated integer), and Short Description.

      Candidate Current Profile Skills: [${userSkills.join(', ')}]
      Candidate Target Career Goal Role: "${targetRole}"
      Candidate Resume Content Context:
      ${resumeText.slice(0, 3000)}

      Return a JSON array of objects matching this exact structure (no markdown formatting):
      [
        {
          "title": "<Job Title>",
          "company": "<Company Name>",
          "requiredSkills": ["Skill 1", "Skill 2", ...],
          "matchPercentage": <number>,
          "description": "<Description text>"
        }
      ]
    `;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const resultText = response.data.candidates[0].content.parts[0].text;
      res.json(JSON.parse(resultText));
    } catch (apiErr) {
      console.error('Gemini Job Recommendation API Error, falling back to mock:', apiErr.message);
      res.json(generateMockRecommendations(userSkills, targetRole));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
