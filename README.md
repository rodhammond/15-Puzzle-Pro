# 15-Puzzle Tactical Engine
### High-Performance Computational Solver & AI Strategic Advisor

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%20Flash-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📽️ System Visualization

<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/15-puzzle_magical.gif" width="350" alt="15-Puzzle Animation" style="border-radius: 20px; border: 4px solid #334155;" />
  <p><i><b>Figure 1:</b> Classic 15-Puzzle state-space navigation demonstration.</i></p>
</div>

---

## 🏛️ Historical Context

### Origins of the Challenge
The **15-Puzzle** was invented circa **1874** by **Noyes Palmer Chapman**, a postmaster in Canastota, New York. Chapman originally presented the puzzle to his friends as sixteen numbered blocks in a 4x4 grid. The puzzle became an international craze in the early 1880s, often referred to as the "Gem Puzzle" or "Boss Puzzle."

### The Sam Loyd Controversy
The puzzle's worldwide fame is inextricably linked to the promotional efforts of **Sam Loyd**, a famous American chess player and recreational mathematician. Loyd falsely claimed for decades that he was the original inventor. He famously offered a $1,000 prize for solving a configuration starting with the "14-15" tiles swapped—a challenge that drove the public into a frenzy. However, it was later mathematically proven that this specific configuration belongs to a separate parity and is **impossible to solve** through valid sliding moves.

### Corporate Manufacturing History
The puzzle was first mass-produced by the **Embossing Company** of Albany, New York, starting around 1879. The Embossing Company was a premier American toy manufacturer known for its high-quality wooden blocks and checkers. In the mid-20th century, the company’s legacy continued through a series of acquisitions: it was merged into **Halsam Products**, which was subsequently acquired by **Playskool** (now a division of **Hasbro**). Today, the 15-puzzle remains one of the most recognized sliding tile puzzles in the world.

---

## ⚙️ Logic Engines & Mechanics

The engine navigates a search space of approximately **10.46 trillion** reachable states ($16! / 2$).

1.  **Supreme Navigator (IDA*)**: Guaranteed to find the *optimal* path. It uses iterative deepening to manage memory while exploring deep logic trees.
2.  **Instant Velocity (Greedy-Best)**: An approximation engine that prioritizes speed over optimality. It utilizes the Manhattan Distance heuristic to find "good enough" paths instantly.
3.  **Heuristics**: The system calculates complexity using **Manhattan Distance** (distance of tiles from their target slots) combined with **Linear Conflict** (identifying tiles in the same row/column that block each other's path).

---

## 🚀 Deployment & Security

### 🔑 AI Strategic Advisor & API Keys
The **AI Strategic Advisor** provides real-time tactical insights using Google's Gemini models.
- **API Key Required**: To use the AI Advisor in a custom deployment, you **must** provide your own Google Gemini API key.
- **Security Policy**: This repository **does not contain any secrets or hardcoded API keys**. 

### Installation & Setup
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/15-puzzle-solver.git
    ```
2.  **Environment Configuration**:
    Create a `.env` file (or set environment variables in your hosting provider) with your key. This ensures your secrets are never committed to version control.
    ```env
    API_KEY=your_secret_gemini_api_key_here
    ```
3.  **Local Launch**:
    Run a local server to handle ESM imports:
    ```bash
    npx serve .
    ```

### Usage Instructions
- Click **START** to engage the system and begin a new session.
- Use the **Manual Configuration** preset to test specific states or custom goals.
- Once a solution is calculated, use the **Logic Stream Visualizer** to scroll through the historical path of the solution.

---
*Developed for computational enthusiasts and logic masters. Mathematical solvability is verified via parity-check on every state initialization.*