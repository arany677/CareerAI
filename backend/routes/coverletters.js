const express = require('express');
const router = express.Router();
const axios = require('axios');
const dbHelper = require('../config/dbHelper');
const { protect } = require('../middleware/auth');

// Local Profile-Aware Cover Letter Compiler
function generateMockCoverLetter(userName, userProfile, companyName, position, experienceDetails) {
  const skillsList = userProfile.skills && userProfile.skills.length > 0 
    ? userProfile.skills.slice(0, 4).join(', ') 
    : 'software engineering, modern framework design, and systems architecture';

  const expParagraph = experienceDetails 
    ? experienceDetails 
    : (userProfile.experience && userProfile.experience.length > 0 
       ? `In my previous role at ${userProfile.experience[0].company} as a ${userProfile.experience[0].position}, I spearheaded key application modules, resolved latency issues, and collaborated extensively within multi-disciplinary groups to deploy quality web products.`
       : `Through my project portfolios, academic tasks, and freelance assignments, I have refined my ability to architect clean components, construct scalable server backends, and translate business criteria into stable user-facing platforms.`);

  const edText = userProfile.education && userProfile.education.length > 0
    ? `I hold a degree in ${userProfile.education[0].fieldOfStudy} from ${userProfile.education[0].school}.`
    : `I am committed to ongoing professional growth and continuous skill development.`;

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `${userName}
Candidate for ${position}
Date: ${date}

Hiring Recruitment Committee
${companyName}

RE: Application for ${position}

Dear Hiring Manager,

I am writing to express my strong interest in the ${position} opening at ${companyName}. Having followed your company's latest achievements, I am inspired by your standard of innovation and product execution. I believe my skillset in ${skillsList} makes me an ideal candidate to join your team.

${expParagraph}

My technical stack aligns closely with your needs. I specialize in building performant, mobile-first systems that prioritize user efficiency. ${edText} Throughout my career, my focus has been on translating complicated technical objectives into clean, maintainable, and thoroughly documented solutions.

I am eager to contribute my technical aptitude, creative problem-solving approach, and work ethic to your team at ${companyName}. Thank you for your time, consideration, and review of my attached application materials.

Warm regards,

${userName}
`;
}

// @route   POST api/cover-letters/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const { companyName, position, experienceDetails } = req.body;

    if (!companyName || !position) {
      return res.status(400).json({ message: 'Please provide company name and position' });
    }

    const userSkills = req.user.profile?.skills || [];
    const latestResume = await dbHelper.findLatestResumeByUser(req.user._id.toString());
    let resumeText = '';
    if (latestResume && latestResume.analysisResult) {
      resumeText = latestResume.analysisResult.rawText || '';
    }

    let coverLetterText = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      coverLetterText = generateMockCoverLetter(req.user.name, req.user.profile || { skills: [] }, companyName, position, experienceDetails);
    } else {
      const prompt = `
        You are a highly sought-after executive career coach and professional copywriter.
        Write a persuasive, professional cover letter tailored for a job application.
        
        Job Details:
        - Target Position: "${position}"
        - Company: "${companyName}"
        
        Applicant Details:
        - Name: "${req.user.name}"
        - Skills: [${userSkills.join(', ')}]
        - Additional experience context: "${experienceDetails || 'None'}"
        - Resume Text snippet:
        ${resumeText.slice(0, 3000)}

        Write a 3-4 paragraph letter that is professional and engaging. Address it to "Dear Hiring Manager".
        Return ONLY the text of the cover letter. Do not include markdown fences, comments, or headers.
      `;

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await axios.post(url, {
          contents: [{ parts: [{ text: prompt }] }]
        });

        coverLetterText = response.data.candidates[0].content.parts[0].text;
      } catch (apiErr) {
        console.error('Gemini Cover Letter API Error, using mock compiler:', apiErr.message);
        coverLetterText = generateMockCoverLetter(req.user.name, req.user.profile || { skills: [] }, companyName, position, experienceDetails);
      }
    }

    const newLetter = await dbHelper.createCoverLetter({
      userId: req.user._id.toString(),
      companyName,
      position,
      generatedLetter: coverLetterText
    });

    res.status(201).json(newLetter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET api/cover-letters/history
router.get('/history', protect, async (req, res) => {
  try {
    const letters = await dbHelper.findCoverLettersByUser(req.user._id.toString());
    res.json(letters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/cover-letters/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const letter = await dbHelper.findCoverLetterById(req.params.id);

    if (!letter) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }

    if (letter.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await dbHelper.deleteCoverLetter(req.params.id);
    res.json({ message: 'Cover letter removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
