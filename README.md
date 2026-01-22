# 15-Puzzle Tactical Engine
### High-Performance Computational Solver & AI Strategic Advisor

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%20Flash-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🏛️ Historical Context

### Origins of the Challenge
The **15-Puzzle** was invented circa **1874** by **Noyes Palmer Chapman**, a postmaster in Canastota, New York. Chapman originally presented the puzzle to his friends as sixteen numbered blocks in a 4x4 grid. By 1880, it became an international phenomenon, often referred to as the "Gem Puzzle."

### The Sam Loyd Controversy
The puzzle's worldwide fame is inextricably linked to the promotional efforts of **Sam Loyd**, a famous American chess player. Loyd falsely claimed for decades that he was the original inventor. He famously offered a $1,000 prize for solving a configuration starting with the "14-15" tiles swapped. This challenge was a clever marketing ploy: it was mathematically impossible to solve, as sliding moves preserve the parity of the permutation.

---

## ⚙️ Logic Engines & Mechanics

The engine navigates a search space of approximately **10.46 trillion** reachable states ($16! / 2$).

1.  **Supreme Navigator (IDA*)**: Guaranteed to find the *optimal* path. Uses iterative deepening to manage memory efficiently.
2.  **Instant Velocity (Greedy-Best)**: Prioritizes speed. Uses Manhattan Distance to find "good enough" paths instantly.
3.  **Heuristics**: Combines **Manhattan Distance** with **Linear Conflict** detection to prune trillions of sub-optimal paths.

---

## 🚀 Deployment & Security

### 🔑 AI Strategic Advisor
Provides real-time tactical insights using Google's Gemini models.
- **API Key**: Requires a Google Gemini API key provided via `process.env.API_KEY`.
- **Privacy**: No keys are stored in the source code.

---
*Developed for computational enthusiasts. Mathematical solvability is verified via parity-check on every state initialization.*