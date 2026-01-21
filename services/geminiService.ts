
import { GoogleGenAI } from "@google/genai";
import { BoardState, Move } from "../types";

/**
 * Provides a sophisticated strategic insight for the 15-puzzle.
 * Injects domain knowledge about solving strategies (Row-by-Row, Corner-first, etc.)
 */
export const getAIHint = async (
  currentBoard: BoardState, 
  targetGoal: BoardState,
  nextOptimalMove?: Move
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Convert boards to a readable 4x4 grid representation for the LLM
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

    STRATEGIC DIRECTIVES:
    1. Focus on solving Row 1 (Top) first, then Row 2.
    2. For Row 1: Solve tiles 1, 2, then 3. To place 4, "park" it below its target and rotate the 3-4 sequence in.
    3. If the first two rows are solved, focus on the bottom-left 2x2 area.
    4. If the user has a custom goal (not 1-15), adapt your strategy to that specific pattern.
    5. Mention specific tile numbers and their positions (row, column).

    INSTRUCTIONS:
    - Provide a professional, tactical, and brief (2-3 sentences) insight.
    - Use terms like "Manhattan efficiency," "Parking the tile," or "Sequence rotation."
    - Be highly encouraging but technically precise.
    - Do not just list the numbers; explain the MOVEMENT logic.
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
    
    return response.text || "Your current alignment shows high Manhattan efficiency. Continue the rotation to clear the path for the second row.";
  } catch (error) {
    console.error("Gemini Coach Error:", error);
    return "Tactical communication interrupted. Focus on stabilizing the upper-left quadrant to reduce the search space for the lower tiles.";
  }
};
