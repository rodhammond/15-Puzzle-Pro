# 15-Puzzle Tactical Engine
### High-Performance Computational Solver & AI Strategic Advisor

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%20Flash-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📽️ System Visualization

<div align="center">
  <!-- Professional SVG Animation mimicking the App aesthetic -->
  <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="border-radius: 24px; border: 8px solid #334155; background: #0f172a;">
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.5"/>
      </filter>
    </defs>
    <!-- Grid Background -->
    <rect x="20" y="20" width="360" height="360" rx="12" fill="#1e293b" />
    <g fill="#0f172a" opacity="0.5">
      <rect x="30" y="30" width="80" height="80" rx="8" />
      <rect x="120" y="30" width="80" height="80" rx="8" />
      <rect x="210" y="30" width="80" height="80" rx="8" />
      <rect x="300" y="30" width="80" height="80" rx="8" />
      <!-- row 2 -->
      <rect x="30" y="120" width="80" height="80" rx="8" />
      <rect x="120" y="120" width="80" height="80" rx="8" />
      <rect x="210" y="120" width="80" height="80" rx="8" />
      <rect x="300" y="120" width="80" height="80" rx="8" />
    </g>
    
    <!-- Moving Tile (Animated) -->
    <g filter="url(#shadow)">
      <rect x="210" y="210" width="80" height="80" rx="8" fill="#dc2626">
        <animate attributeName="x" values="210;300;300;210;210" dur="4s" repeatCount="indefinite" />
        <animate attributeName="y" values="210;210;300;300;210" dur="4s" repeatCount="indefinite" />
      </rect>
      <text x="250" y="265" font-family="Arial, sans-serif" font-weight="900" font-size="40" fill="white" text-anchor="middle">
        15
        <animate attributeName="x" values="250;340;340;250;250" dur="4s" repeatCount="indefinite" />
        <animate attributeName="y" values="265;265;355;355;265" dur="4s" repeatCount="indefinite" />
      </text>
    </g>

    <!-- Static Tiles -->
    <rect x="30" y="30" width="80" height="80" rx="8" fill="#ffffff" />
    <text x="70" y="85" font-family="Arial, sans-serif" font-weight="900" font-size="40" fill="#0f172a" text-anchor="middle">1</text>
    
    <rect x="120" y="30" width="80" height="80" rx="8" fill="#dc2626" />
    <text x="160" y="85" font-family="Arial, sans-serif" font-weight="900" font-size="40" fill="white" text-anchor="middle">2</text>
  </svg>
  <p><i><b>Figure 1:</b> State-space navigation simulation via the Supreme Navigator engine.</i></p>
</div>

---

## 🏛️ Historical Context

### Origins of the Challenge
The **15-Puzzle** (also known as the Gem Puzzle) was invented circa **1874** by **Noyes Palmer Chapman**, a postmaster in Canastota, New York. Chapman originally showed a wooden version of the puzzle to his friends, featuring sixteen numbered blocks that could be arranged into a 4x4 grid.

### The Sam Loyd Craze
While Chapman holds the original claim to invention, the puzzle achieved worldwide fame in **1880** due to the marketing efforts of **Sam Loyd**. Loyd, a famous chess player and puzzler, falsely claimed credit for the invention and offered a $1,000 prize to anyone who could solve a specific configuration (the "14-15" swap). 

This configuration was, in fact, **mathematically impossible**. By starting with a state that had an odd permutation of the goal state, the laws of parity ensured no sequence of slides could ever reach the target. This craze cemented the 15-puzzle's place in mathematical history as a primary example of parity-based unsolvability.

### Corporate Legacy
Early production was spearheaded by the **Embossing Company** of Albany, New York, and later by industry giants like **Milton Bradley**. Today, the 15-puzzle is considered part of the public domain, though modern iterations like this "Tactical Engine" continue to push the boundaries of how we solve these combinatorial problems.

---

## ⚙️ Logic Engines & Mechanics

The engine navigates a search space of approximately **10.46 trillion** reachable states ($16! / 2$).

1.  **Supreme Navigator (IDA*)**: Guaranteed to find the *optimal* path. It uses iterative deepening to manage memory while exploring deep logic trees.
2.  **Instant Velocity (Greedy-Best)**: An approximation engine that prioritizes speed. It utilizes the Manhattan Distance heuristic to find "good enough" paths instantly.
3.  **Heuristics**: The system calculates complexity using **Manhattan Distance** (distance of tiles from their slot) combined with **Linear Conflict** (detecting tiles that block each other in the same row/column).

---

## 🚀 Deployment & Security

### 🔑 API Key Requirement
The **AI Strategic Advisor** is an optional but powerful feature that requires a **Google Gemini API Key**. 
- The application **will not work** for strategic insights if the key is missing.
- **Security**: Never commit your API key to a public repository.

### Installation
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-repo/15-puzzle-solver.git
    ```
2.  **Configure Environment**:
    Create a `.env` file in the root directory and add your key:
    ```env
    API_KEY=your_secret_gemini_api_key_here
    ```
3.  **Local Launch**:
    Run a local server (e.g., `npx serve`) and open `index.html`.

### Usage Instructions
- Click **START** to initialize the system.
- Use the **Manual Configuration** preset to test specific Loyd-style impossible states (the engine will notify you if a state is unsolvable).
- Once solved, use the **Sequence Visualizer** to scroll through the logic history of the calculated path.

---
*Developed for computational enthusiasts. Mathematical solvability is verified via parity-check on every shuffle.*