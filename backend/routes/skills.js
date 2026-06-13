const express = require('express');
const router = express.Router();
const axios = require('axios');
const dbHelper = require('../config/dbHelper');
const { protect } = require('../middleware/auth');

// Fallback Mock Skill Gap Analyzer
function generateMockSkillGap(userSkills, targetRole) {
  const role = (targetRole || 'Software Engineer').toLowerCase();
  const cleanUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const formattedUserSkills = userSkills.map(s => s.trim());
  
  let expectedSkills = [];
  let recommendedTech = [];
  let learningPath = [];

  if (role.includes('front') || role.includes('react') || role.includes('ui/ux') || role.includes('web')) {
    expectedSkills = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Redux', 'Git'];
    recommendedTech = ['TypeScript', 'Next.js App Router', 'Vite', 'Jest & React Testing Library'];
    learningPath = [
      {
        step: "Master Advanced TypeScript",
        description: "Learn generic types, keyof/typeof utility types, and strict compilation checks to write type-safe frontend code.",
        resource: "TypeScript Official Handbook"
      },
      {
        step: "Adopt Next.js & Server Side Components",
        description: "Build server-rendered apps, understand file-based App routing, layout design, and Server Actions.",
        resource: "Next.js official documentation"
      },
      {
        step: "Modern CSS Styling with Tailwind CSS",
        description: "Implement highly utility-first layouts, transitions, states, and responsive queries.",
        resource: "Tailwind CSS Documentation"
      }
    ];
  } else if (role.includes('back') || role.includes('node') || role.includes('api') || role.includes('devops')) {
    expectedSkills = ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'REST APIs', 'Git', 'Docker', 'AWS'];
    recommendedTech = ['NestJS', 'TypeScript', 'Prisma ORM', 'CI/CD Pipelines (GitHub Actions)'];
    learningPath = [
      {
        step: "Migrate to TypeScript on the Backend",
        description: "Set up build pipelines for compiling TS, use ts-node-dev, and secure runtime validations using Zod.",
        resource: "TypeScript Backend Guide"
      },
      {
        step: "Containerization with Docker",
        description: "Learn how to write Dockerfiles, build lightweight images, and link services using Docker Compose.",
        resource: "Docker Complete Guide"
      }
    ];
  } else {
    expectedSkills = ['JavaScript', 'Python', 'Git', 'SQL', 'REST APIs', 'Docker', 'Testing', 'Data Structures'];
    recommendedTech = ['System Design Abstractions', 'Kubernetes', 'CI/CD'];
    learningPath = [
      {
        step: "Study Data Structures & Algorithms",
        description: "Strengthen computational efficiency by practicing tree traversals, graphs, and sorting dynamic problems.",
        resource: "LeetCode patterns or NeetCode roadmap"
      },
      {
        step: "Understand Distributed Systems Design",
        description: "Learn microservices decoupling, load balancing configurations, rate limiters, and database sharding.",
        resource: "Designing Data-Intensive Applications (Book)"
      }
    ];
  }

  const existingSkills = formattedUserSkills.filter(skill => 
    expectedSkills.some(expected => expected.toLowerCase() === skill.toLowerCase())
  );
  
  if (existingSkills.length === 0 && formattedUserSkills.length > 0) {
    existingSkills.push(...formattedUserSkills.slice(0, 3));
  }

  const missingSkills = expectedSkills.filter(expected => 
    !cleanUserSkills.includes(expected.toLowerCase())
  );

  return {
    existingSkills: existingSkills.length > 0 ? existingSkills : ['Basic Web Technologies'],
    missingSkills: missingSkills.length > 0 ? missingSkills : ['Advanced System Architecture'],
    recommendedTech,
    learningPath
  };
}

// @route   POST api/skills/gap
router.post('/gap', protect, async (req, res) => {
  try {
    const { targetRole } = req.body;
    if (!targetRole) {
      return res.status(400).json({ message: 'Please specify a target role' });
    }

    // Update target role
    await dbHelper.updateUserProfile(req.user._id.toString(), { targetRole });

    const userSkills = req.user.profile?.skills || [];
    const latestResume = await dbHelper.findLatestResumeByUser(req.user._id.toString());
    let resumeText = '';
    if (latestResume && latestResume.analysisResult) {
      resumeText = latestResume.analysisResult.rawText || '';
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const gapAnalysis = generateMockSkillGap(userSkills, targetRole);
      return res.json(gapAnalysis);
    }

    const prompt = `
      You are an expert tech recruiter and technical career counselor. 
      Analyze the candidate's current skills and target role. Compare target role requirements against provided skills and resume context.
      
      Target Role: "${targetRole}"
      Candidate Current Profile Skills: [${userSkills.join(', ')}]
      Resume Context Extracted:
      ${resumeText.slice(0, 4000)}

      Return a JSON object with this exact structure (no markdown formatting):
      {
        "existingSkills": [<array of candidate skills relevant to target role>],
        "missingSkills": [<array of major core technologies/skills user lacks>],
        "recommendedTech": [<array of supplementary libraries/frameworks to learn>],
        "learningPath": [
          {
            "step": "<Step Name>",
            "description": "<detailed action items>",
            "resource": "<best course or guide name>"
          }
        ]
      }
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
      console.error('Gemini Skill Gap API Error, falling back to mock:', apiErr.message);
      res.json(generateMockSkillGap(userSkills, targetRole));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
