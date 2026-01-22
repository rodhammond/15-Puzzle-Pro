import { GoogleGenAI } from "@google/genai";
import { BoardState, Move } from "../types";

/**
 * Provides a sophisticated strategic insight for the 15-puzzle.
 */
export const getAIHint = async (
  currentBoard: BoardState, 
  targetGoal: BoardState,
  nextOptimalMove?: Move
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const formatBoard = (b: BoardState) => {
    let output = "";
    for (let i = 0; i < 4; i++) {
      output += `[ ${b.slice(i * 4, i * 4 + 4).join(' | ')} ]\n`;
    }
    return output;
  };

  const nextMoveContext = nextOptimalMove 
    ? `Our engine suggests the next optimal step is moving the empty slot ${nextOptimalMove.direction}.`
    : "No sequence has been calculated yet.";

  const prompt = `
    You are the "15-Puzzle Grandmaster Coach." Your goal is to guide the user to solve a 15-puzzle (4x4 grid) using expert tactics.
    0 represents the empty slot.
    
    CURRENT STATE:
    ${formatBoard(currentBoard)}
    
    TARGET GOAL CONFIGURATION:
    ${formatBoard(targetGoal)}
    
    SOLVER CONTEXT:
    ${nextMoveContext}

    INSTRUCTIONS:
    - Provide a professional, tactical, and brief (2-3 sentences) insight.
    - Use terms like "Manhattan efficiency," "Parking the tile," or "Sequence rotation."
    - Be highly encouraging but technically precise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 250,
        thinkingConfig: { thinkingBudget: 150 },
      }
    });
    
    return response.text || "Your current alignment shows high Manhattan efficiency.";
  } catch (error) {
    console.error("Gemini Coach Error:", error);
    return "Tactical communication interrupted. Focus on stabilizing the upper-left quadrant.";
  }
};