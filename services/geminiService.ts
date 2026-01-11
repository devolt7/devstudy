import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GenerationConfig, TeacherMode } from "../types";

// Helper to safely get the API key in a Vite environment
const getApiKey = () => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  // Fallback for other environments if needed
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
     // @ts-ignore
     return process.env.API_KEY;
  }
  console.error("API Key is missing. Please set VITE_API_KEY in your .env file.");
  return "MISSING_KEY";
};

// Initialize with the retrieved key
const ai = new GoogleGenAI({ apiKey: getApiKey() });

// Helper to clean response text
const cleanText = (text: string | undefined) => text?.trim() || '';

const getContentStrategy = (teacherMode: TeacherMode, topic: string) => {
    // Detect marks in the topic string (e.g., "5 marks", "10 mks", "15 points")
    const marksMatch = topic.match(/\b(\d+)\s*(?:marks?|mks?|points?)\b/i);
    const marks = marksMatch ? parseInt(marksMatch[1], 10) : null;

    let strategy = `\nCONTENT STRATEGY & LENGTH:\n`;

    // 1. MARKS INFLUENCE
    if (marks) {
        strategy += `DETECTED MARKS: ${marks}.\n`;
        if (marks <= 2) {
             strategy += `Rule: VERY SHORT. 2-3 sentences max. No diagrams unless explicitly asked.\n`;
        } else if (marks <= 5) {
             strategy += `Rule: CONCISE. Direct answer. 1-2 paragraphs or 4-5 bullet points.\n`;
        } else if (marks <= 10) {
             strategy += `Rule: DETAILED. Standard essay length. Introduction, Core Answer, Conclusion.\n`;
        } else {
             strategy += `Rule: EXTENSIVE. Long answer format. Detailed explanations, examples, structure, and applications.\n`;
        }
    } else {
        // Fallback defaults if no marks detected
        strategy += `No explicit marks detected. Inferring length from Teacher Persona below.\n`;
    }

    // 2. TEACHER PERSONA INFLUENCE
    switch (teacherMode) {
        case 'strict': // Strict Examiner
            strategy += `
            MODE: STRICT EXAMINER
            - PHILOSOPHY: "Quality over Quantity".
            - LENGTH: Minimal pages. Keep it short.
            - STYLE: Precise, definition-focused, no fluff.
            - STRUCTURE: Direct answer immediately. No conversational filler.
            - PAGE USAGE: Low.
            `;
            if (!marks) strategy += `Target: Short to Medium length.\n`;
            break;

        case 'average': // Balanced Evaluator
            strategy += `
            MODE: BALANCED EVALUATOR
            - PHILOSOPHY: "Structure matters".
            - LENGTH: Moderate.
            - STYLE: Clear explanations with relevant examples.
            - STRUCTURE: Headings, subheadings, and bullet points.
            - PAGE USAGE: Moderate.
            `;
            if (!marks) strategy += `Target: Medium length (standard college answer).\n`;
            break;

        case 'lenient': // Marks-Oriented Evaluator
            strategy += `
            MODE: MARKS-ORIENTED EVALUATOR (PAGE FILLER)
            - PHILOSOPHY: "Length = Marks".
            - LENGTH: MAXIMUM. Expand every point.
            - STYLE: Descriptive, elaborate, repetitive if needed to fill space.
            - STRUCTURE: Extensive Introduction, Detailed Body, Examples, Diagrams, Applications, Conclusion.
            - PAGE USAGE: High. Fill as many lines as logical.
            `;
            if (!marks) strategy += `Target: Long length (maximize content).\n`;
            break;
    }

    strategy += `
    3. GENERAL RULES:
    - **CONTINUITY**: Do NOT stop mid-sentence. Finish all answers completely.
    - **COMPLETENESS**: Answer ALL questions found in the context.
    - **LAYOUT**: Write continuously. Do NOT use "---PAGE_BREAK---" unless absolutely necessary for a new section title.
    `;

    return strategy;
};

const MATH_INSTRUCTION = `
MATH RULES (STRICT):
- Do NOT use LaTeX format (e.g., no \\frac, \\int, $...$).
- Use ONLY standard Unicode characters that look like handwriting.
- Ex: Write "x² + y²" instead of "x^2 + y^2".
- Ex: Write "½" instead of "1/2".
- Ex: Write "Area = πr²" linearly.
`;

const DIAGRAM_INSTRUCTION = `
DIAGRAMS (STRICT):
- ONLY generate a diagram tag if the user's topic or the question EXPLICITLY asks for it (e.g., keywords: "Draw", "Sketch", "Diagram of", "With diagram", "Labelled diagram") OR if the 'Marks-Oriented' mode suggests adding one for extra marks.
- **Tag Format**: [DIAGRAM_REQ: <detailed description of the diagram>].
- **Placement**: Insert the tag on a NEW LINE immediately after the Question header or before the Answer starts. Do NOT hide it inside a paragraph.
`;

// Type definition for file payload
interface FilePayload {
    data: string;
    mimeType: string;
}

export const GeminiService = {
  async generateAssignment(config: GenerationConfig, file?: FilePayload) {
    const modelId = 'gemini-3-flash-preview';
    
    const contentStrategy = getContentStrategy(config.teacherMode, config.topic);

    const baseTask = file 
        ? "Analyze document. Extract ALL questions. Solve ALL of them."
        : `Topic: ${config.topic}. Generate a complete assignment.`;

    const prompt = `
        ${baseTask}
        Stream: ${config.stream}
        
        ${contentStrategy}
        ${MATH_INSTRUCTION}
        ${DIAGRAM_INSTRUCTION}

        STRICT FORMATTING (FOR HANDWRITING ENGINE):
        1. **Format**: 
           Q[Number]. [Question Text]
           Answer: [Answer Text]
        
        2. **Rules**:
           - ALWAYS start a question with "Q1.", "Q2.", etc.
           - ALWAYS start the answer with "Answer:".
           - **NO MARKDOWN**: Do not use bold (**), italics (*), or headers (#). Output PLAIN TEXT only.
           - NO "Here is your assignment", NO introductions, NO "I hope this helps".
           - DO NOT MENTION "DevStudy" or "AI Engine".
           - Generate ONLY the content.
    `;

    let contents: any;
    if (file) {
        contents = {
            parts: [
                { inlineData: { data: file.data, mimeType: file.mimeType } },
                { text: prompt }
            ]
        };
    } else {
        contents = prompt;
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelId,
        contents: contents,
        config: {
            maxOutputTokens: 8192, 
            thinkingConfig: { thinkingBudget: 0 },
            systemInstruction: "You are a specialized academic generator. Output pure plain text content only. No markdown formatting. Do not introduce yourself."
        }
      });
      return cleanText(response.text);
    } catch (error) {
      console.error("Assignment Generation Error:", error);
      throw error;
    }
  },

  async generateNotes(config: GenerationConfig, file?: FilePayload) {
    const modelId = 'gemini-3-flash-preview';
    let contents: any;
    const contentStrategy = getContentStrategy(config.teacherMode, config.topic);

    const structureInstruction = `
        STRUCTURE:
        1. Introduction
        2. Core Concepts (Heading-wise)
        3. Key Points (Bullets)
        4. Examples
        
        REMEMBER: NO MARKDOWN BOLDING (**). Use plain text structure.
        NO INTRODUCTORY TEXT. Start directly with the content.
    `;

    if (file) {
         const prompt = `
            Make exam notes from this file.
            Stream: ${config.stream}.
            ${structureInstruction}
            ${contentStrategy}
            ${MATH_INSTRUCTION}
            ${DIAGRAM_INSTRUCTION}
        `;
        contents = {
            parts: [
                { inlineData: { data: file.data, mimeType: file.mimeType } },
                { text: prompt }
            ]
        };
    } else {
        const prompt = `
          Generate exam notes.
          Topic: ${config.topic}
          ${structureInstruction}
          ${contentStrategy}
          ${MATH_INSTRUCTION}
          ${DIAGRAM_INSTRUCTION}
        `;
        contents = prompt;
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelId,
        contents: contents
      });
      return cleanText(response.text);
    } catch (error) {
      console.error("Notes Generation Error:", error);
      throw error;
    }
  },

  async generateReport(config: GenerationConfig, file?: FilePayload) {
    const modelId = 'gemini-3-flash-preview';
    let contents: any;
    
    const promptText = `
        Generate a PREMIUM ACADEMIC ARTICLE (Magazine Style).
        Topic: ${config.topic}
        Stream: ${config.stream}
        
        STYLE & TONE:
        - Highly professional, university-level, formal yet engaging.
        - Magazine-style flow: Use catchy headings, clear paragraphs (no long blocks of text).
        - NOT a simple report or assignment. It must read like a published article.

        STRUCTURE:
        1. **Cover Page Content**: Start immediately with the Article Title (do not label it 'Cover Page', just the title).
        2. **Visuals**: You MUST request images.
           - Start with a Cover Image request: [DIAGRAM_REQ: [REALISTIC] A vibrant, colorful, cinematic, high-quality cover image representing ${config.topic}].
           - Insert 2-3 more [DIAGRAM_REQ: [REALISTIC] description...] tags throughout the article between sections.
           - Use '[REALISTIC]' keyword inside the tag to ensure high-quality colorful photo generation.
           - Description inside the tag MUST be detailed, visual, and describe a scene (e.g. "A modern laboratory with glowing blue lights and advanced equipment" instead of just "lab").
        3. **Introduction**: Engaging hook and overview.
        4. **Body**: 3-4 Deeply researched sections with clear H2 headings (Markdown ##).
        5. **Conclusion**: Impactful summary.
        6. **Closing**: End the article with a new line and the text "THANK YOU" in uppercase.

        FORMATTING:
        - Use Markdown for headings (## Section Title).
        - Use bolding (**) for key terms.
        - Ensure smooth transitions between sections.
        - NO PREAMBLE. Start directly with Title.
    `;

    if (file) {
        contents = {
            parts: [
                { inlineData: { data: file.data, mimeType: file.mimeType } },
                { text: promptText + " Use the context from this file." }
            ]
        };
    } else {
        contents = promptText;
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelId,
        contents: contents
      });
      return cleanText(response.text);
    } catch (error) {
      console.error("Article Generation Error:", error);
      throw error;
    }
  },

  async generateViva(config: GenerationConfig, file?: FilePayload) {
    const modelId = 'gemini-3-flash-preview';
    let contents: any;
    
    // Viva usually doesn't need huge length variation logic, but we can respect strictness
    const promptStyle = config.teacherMode === 'strict' ? "Tough, conceptual questions." : "Standard, theoretical questions.";

    const basePrompt = `
        Viva Voce Examiner.
        Stream: ${config.stream}
        Style: ${promptStyle}
        Generate 10-15 Q&A.
        Format:
        Q1. [Question]
        Answer: [Short Answer]
        NO MARKDOWN.
        NO PREAMBLE.
    `;

    if (file) {
        contents = {
            parts: [
                { inlineData: { data: file.data, mimeType: file.mimeType } },
                { text: basePrompt + " Based on this file." }
            ]
        };
    } else {
        contents = basePrompt + ` Topic: ${config.topic}`;
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelId,
        contents: contents
      });
      return cleanText(response.text);
    } catch (error) {
      console.error("Viva Generation Error:", error);
      throw error;
    }
  },

  async analyzeImage(base64Data: string, mimeType: string, promptText: string) {
    const modelId = 'gemini-3-flash-preview';
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: promptText || "Analyze this academic content." }
          ]
        },
      });
      return cleanText(response.text);
    } catch (error) {
      console.error("Image Analysis Error:", error);
      throw error;
    }
  },

  async summarizeContent(file: FilePayload, instructions: string) {
    const modelId = 'gemini-3-flash-preview';
    
    const baseInstruction = instructions.trim() 
      ? `User Instructions: ${instructions}\n\n` 
      : '';
    
    const prompt = `
      ${baseInstruction}
      Analyze the content in this file and create a comprehensive, exam-ready summary.
      
      OUTPUT REQUIREMENTS:
      - Use clear headings (## format) for different sections
      - Use bullet points for key points
      - Highlight important terms and concepts using **bold**
      - Keep explanations concise but complete
      - Focus on exam-relevant information
      - Include definitions where necessary
      - Structure the content for easy revision
      
      FORMAT:
      - Start with a brief overview
      - Break down into logical sections
      - End with key takeaways if appropriate
      
      DO NOT include phrases like "Here is the summary" or any meta-commentary.
      Start directly with the content.
    `;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            { inlineData: { data: file.data, mimeType: file.mimeType } },
            { text: prompt }
          ]
        },
        config: {
          maxOutputTokens: 8192,
          systemInstruction: "You are an expert academic summarizer. Create clear, structured, exam-ready summaries. Use markdown formatting for headings and bullet points."
        }
      });
      return cleanText(response.text);
    } catch (error) {
      console.error("Summarization Error:", error);
      throw error;
    }
  },

  async generateMCQs(file: FilePayload | null, textContent: string, numQuestions: number) {
    const modelId = 'gemini-3-flash-preview';
    
    const prompt = `
      Generate exactly ${numQuestions} Multiple Choice Questions (MCQs) based on the provided content.
      
      REQUIREMENTS:
      - Questions must be exam-relevant and concept-based
      - Each question should test understanding, not just memorization
      - Options should be clear and unambiguous
      - Include one correct answer and 3-4 plausible distractors
      - Provide a short 1-2 line explanation for the correct answer
      
      OUTPUT FORMAT (STRICT JSON):
      Return ONLY a valid JSON array with this exact structure:
      [
        {
          "id": 1,
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Brief explanation why this is correct."
        }
      ]
      
      RULES:
      - "correctAnswer" is the 0-based index of the correct option
      - Return ONLY the JSON array, no other text
      - Ensure all JSON is valid and properly escaped
      ${textContent ? `\n\nCONTENT/TOPIC:\n${textContent}` : ''}
    `;

    let contents: any;
    if (file) {
      contents = {
        parts: [
          { inlineData: { data: file.data, mimeType: file.mimeType } },
          { text: prompt }
        ]
      };
    } else {
      contents = prompt;
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelId,
        contents: contents,
        config: {
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          systemInstruction: "You are an expert exam question generator. Generate high-quality, concept-based MCQs suitable for competitive exams and college tests. Output ONLY valid JSON."
        }
      });
      
      const responseText = cleanText(response.text);
      
      // Parse the JSON response
      try {
        const mcqs = JSON.parse(responseText);
        return mcqs;
      } catch (parseError) {
        // Try to extract JSON from the response if it's wrapped in markdown
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse MCQ response");
      }
    } catch (error) {
      console.error("MCQ Generation Error:", error);
      throw error;
    }
  },

  async generateDiagram(prompt: string) {
    // Check if the prompt requests a realistic image (Article Mode)
    // We treat [REALISTIC] (and legacy [GHIBLI] if any remains) as the trigger for the colorful/magazine style
    const isRealistic = prompt.includes('[REALISTIC]') || prompt.includes('[GHIBLI]');
    const cleanPrompt = prompt.replace('[REALISTIC]', '').replace('[GHIBLI]', '').trim();

    let enhancedPrompt = '';
    
    if (isRealistic) {
        enhancedPrompt = `
            High-quality, vibrant, and colorful photorealistic image of: ${cleanPrompt}.
            CONTEXT: Editorial image for a premium academic magazine.
            STYLE: Professional photography or high-end digital art, cinematic lighting, visually striking, highly detailed.
            COLORS: Vibrant, rich, and engaging.
            NEGATIVE_PROMPT: Black and white, sketch, drawing, dull, blurry, text, watermark.
        `;
    } else {
        // Standard Assignment Mode - Sketch
        enhancedPrompt = `
          Create a realistic hand-drawn graphite pencil sketch of: ${cleanPrompt}.
          STYLE: Technical academic diagram, drawn with a HB pencil on white paper.
          DETAILS: Crisp lines, shading to show depth, handwritten labels if necessary.
          BACKGROUND: Pure white (#FFFFFF). 
          NO COLORS: Grayscale only.
        `;
    }

    // 1. Try Imagen 3 (Dedicated Image Model) - Primary
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-001',
            prompt: enhancedPrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: isRealistic ? '16:9' : '1:1', // Articles look better with landscape images
                outputMimeType: 'image/png'
            }
        });
        
        const base64 = response.generatedImages?.[0]?.image?.imageBytes;
        if (base64) return `data:image/png;base64,${base64}`;
        
    } catch (error) {
        console.warn("Imagen generation failed, attempting fallback...", error);
    }

    // 2. Fallback to Gemini 2.5 Flash Image (Multimodal)
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: enhancedPrompt }] }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    } catch (error) {
      console.error("Fallback Diagram Generation Error:", error);
    }

    throw new Error("Failed to generate diagram image.");
  }
};