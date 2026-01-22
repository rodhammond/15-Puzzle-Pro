# 15-Puzzle Tactical Engine
### High-Performance Computational Solver & AI Strategic Advisor

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%20Flash-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🖥️ Game Dashboard

<div align="center">
  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwZjE3MmEiLz4KICAgICAgPHN0b3Agb2mZz2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMWUyOTNiIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGZpbHRlciBpZD0iZ2xvdyI+CiAgICAgIDxmZUd1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMyIgcmVzdWx0PSJibHVyIi8+CiAgICAgIDxmZUNvbXBvc2l0ZSBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJibHVyIiBvcGVyYXRvcj0ib3ZlciIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiByeD0iNDAiIGZpbGw9InVybCgjYmcpIi8+CiAgCiAgPCEtLSBQdXp6bGUgR3JpZCAtLT4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNjAsIDc1KSI+CiAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgcng9IjIwIiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS13aWR0aD0iOCIvPgogICAgCiAgICA8IS0tIFRpbGVzIC0tPgogICAgPHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSI4IiBmaWxsPSIjZGMyNjI2Ii8+CiAgICA8dGV4dCB4PSI0NSIgeT0iNTUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4xPC90ZXh0PgogICAgCiAgICA8cmVjdCB4PSI4NSIgeT0iMTUiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcng9IjgiIGZpbGw9IndoaXRlIi8+CiAgICA8dGV4dCB4PSIxMTUiIHk9IjE1IiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSI4IiBmaWxsPSJ3aGl0ZSIvPgogICAgPHRleHQgeD0iMTE1IiB5PSI1NSIgZmlsbD0iIzBmMTcyYSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MjwvdGV4dD4KICAgIAogICAgPHJlY3QgeD0iMTU1IiB5PSIxNSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iOCIgZmlsbD0iI2RjMjYyNiIvPgogICAgPHRleHQgeD0iMTg1IiB5PSI1NSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjM8L3RleHQ+CiAgICAKICAgIDxyZWN0IHg9IjIyNSIgeT0iMTUiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcng9IjgiIGZpbGw9IndoaXRlIi8+CiAgICA8dGV4dCB4PSIyNTUiIHk9IjU1IiBmaWxsPSIjMGYxNzJhIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj40PC90ZXh0PgogICAgCiAgICA8IS0tIFN1Z2dlc3RlZCBNb3ZlIEhpZ2hsaWdodCAtLT4KICAgIDxyZWN0IHg9IjE1NSIgeT0iODUiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcng9IjgiIGZpbGw9IiNkYzI2MjYiIHN0cm9rZT0iI2ZhY2MwNSIgc3Ryb2tlLXdpZHRoPSI0IiBmaWx0ZXI9InVybCgjZ2xvdykiLz4KICAgIDx0ZXh0IHg9IjE4NSIgeT0iMTI1IiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NzwvdGV4dD4KICA8L2c+CiAgCiAgPCEtLSBIZWFkZXIgLS0+CiAgPHRleHQgeD0iNjAiIHk9IjQwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iOTAwIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ic3RhcnQiPjE1LVQswRVVCTE8gR1JBTkRNQVNURVI8L3RleHQ+CiAgCiAgPCEtLSBTdGF0cyAtLT4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MCwgOTApIj4KICAgIDxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iODAiIHJ4PSIxNSIgZmlsbD0iIzFlMjkzYiIvPgogICAgPHRleHQgeD0iODAiIHk9IjMwIiBmaWxsPSIjOTQ0NzhmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NT1ZFUzwvdGV4dD4KICAgIDx0ZXh0IHg9IjgwIiB5PSI2MCIgZmlsbD0iI2RjMjYyNiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NDI8L3RleHQ+CiAgPC9nPgogIAogIDxnIHRyYW5zbGF0ZSg2MCwgMTkwKSI+CiAgICA8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjgwIiByeD0iMTUzIiBmaWxsPSIjMWUyOTNiIi8+CiAgICA8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjgwIiByeD0iMTUiIGZpbGw9IiMxZTI5M2IiLz4KICAgIDx0ZXh0IHg9IjgwIiB5PSIzMCIgZmlsbD0iIzk0NDc4ZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VElNRTwvdGV4dD4KICAgIDx0ZXh0IHg9IjgwIiB5PSI2MCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjAyOjE1PC90ZXh0PgogIDwvZz4KPC9zdmc+" width="600" alt="15-Puzzle Game Dashboard" style="border-radius: 20px; border: 4px solid #334155;" />
  <p><i><b>Figure 1:</b> The Tactical Engine interface featuring IDA* pathfinding and real-time state analysis.</i></p>
</div>

---

## 🕹️ Game Play

The **15 puzzle** (also called Gem Puzzle, Boss Puzzle, Game of Fifteen, Mystic Square and more) is a **sliding** puzzle. It has 15 square tiles numbered 1 to 15 in a frame that is 4 tile positions high and 4 tile positions wide, with one unoccupied position. Tiles in the same row or column of the open position can be moved by sliding them horizontally or vertically, respectively. The goal of the puzzle is to place the tiles in numerical order (from left to right, top to bottom).

---

## 🏛️ Historical Context

### Origins of the Challenge
The **15-Puzzle** was invented circa **1874** by **Noyes Palmer Chapman**, a postmaster in Canastota, New York. Chapman originally presented the puzzle to his friends as sixteen numbered blocks in a 4x4 grid. By 1880, it became an international phenomenon, often referred to as the "Gem Puzzle."

### The Sam Loyd Controversy
The puzzle's worldwide fame is inextricably linked to the promotional efforts of **Sam Loyd**, a famous American chess player. Loyd falsely claimed for decades that he was the original inventor. He famously offered a $1,000 prize for solving a configuration starting with the "14-15" tiles swapped. This challenge was a clever marketing ploy: it was mathematically impossible to solve, as sliding moves preserve the parity of the permutation.

---

## 📈 Sliding Tile Grouping Theory

*Refined from [Wikipedia: 15 Puzzle](https://en.wikipedia.org/wiki/15_puzzle)*

The transformations of the 15 puzzle form a **groupoid** (not a group, as not all moves can be composed);<sup>[12][13][14]</sup> this groupoid acts on configurations.

Because the combinations of the 15 puzzle can be generated by 3-cycles, it can be proved that the 15 puzzle can be represented by the **alternating group $A_{15}$**.<sup>[15]</sup> In fact, any $2k-1$ sliding puzzle with square tiles of equal size can be represented by **$A_{2k-1}$**.

For the 15 puzzle, lengths of optimal solutions range from 0 to 80 single-tile moves (there are 17 configurations requiring 80 moves)<sup>[4][5]</sup> or 43 multi-tile moves;<sup>[6]</sup> the 8 Puzzle always can be solved in no more than 31 single-tile moves or 24 multi-tile moves (integer sequence A087725). The multi-tile metric counts subsequent moves of the empty tile in the same direction as one.<sup>[6]</sup>

The number of possible positions of the 24 puzzle is $\frac{25!}{2} \approx 7.76 \times 10^{24}$, which is too many to calculate God's number feasibly using brute-force methods. In 2011, lower bounds of 152 single-tile moves or 41 multi-tile moves had been established, as well as upper bounds of 208 single-tile moves or 109 multi-tile moves.<sup>[7][8][9][10]</sup> In 2016, the upper bound was improved to 205 single-tile moves.<sup>[11]</sup>

---

## 🧠 Logic Search Engines & AI Advisor

### 🧮 Math Algorithm Engines
This game includes algorithm search engines which navigates a search space of approximately **10.46 trillion** reachable states ($16! / 2$) to present the player with auto-solving help options. The following three well known search engines have been implemented and selected due to their ability to work quickly within the 4x4 search space. At any given puzzle arrangement, each may offer a particular solution or no solution at all given deliberate timeout constraints.
1.  **Supreme Navigator (IDA*)**: Guaranteed to find the *optimal* path. Uses iterative deepening to manage memory efficiently.
2.  **Instant Velocity (Greedy-Best)**: Prioritizes speed. Uses Manhattan Distance to find "good enough" paths instantly.
3.  **Heuristics**: Combines **Manhattan Distance** with **Linear Conflict** detection to prune trillions of sub-optimal paths.

### 🔑 AI Strategic Advisor
Provides real-time tactical insights using Google's Gemini models.
- **API Key**: Requires a Google Gemini API key provided via `process.env.API_KEY`.
- **Privacy**: No keys are stored in the source code.

---

## 🚀 Deployment & Security

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
*Developed for computational enthusiasts. Mathematical solvability is verified via parity-check on every state initialization.*