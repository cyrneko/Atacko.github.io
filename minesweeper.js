// Game configuration
const GAME_CONFIG = {
    beginner: {
      rows: 9,
      cols: 9,
      mines: 10,
    },
    intermediate: {
      rows: 16,
      cols: 16,
      mines: 40,
    },
    expert: {
      rows: 16,
      cols: 30,
      mines: 99,
    },
  }
  
  // Game state
  let gameState = {
    board: [],
    mineLocations: [],
    flaggedCells: [],
    questionCells: [],
    uncoveredCells: [],
    gameOver: false,
    gameWon: false,
    difficulty: "beginner",
    timer: 0,
    timerInterval: null,
    minesRemaining: 0,
  }
  
  // DOM elements
  const gameBoard = document.getElementById("game-board")
  const face = document.getElementById("face")
  const mineHundreds = document.getElementById("mine-hundreds")
  const mineTens = document.getElementById("mine-tens")
  const mineOnes = document.getElementById("mine-ones")
  const timerHundreds = document.getElementById("timer-hundreds")
  const timerTens = document.getElementById("timer-tens")
  const timerOnes = document.getElementById("timer-ones")
  
  // Initialize the game
  function initGame(difficulty = "beginner") {
    // Reset game state
    gameState = {
      board: [],
      mineLocations: [],
      flaggedCells: [],
      questionCells: [],
      uncoveredCells: [],
      gameOver: false,
      gameWon: false,
      difficulty: difficulty,
      timer: 0,
      timerInterval: null,
      minesRemaining: GAME_CONFIG[difficulty].mines,
    }
  
    // Clear the game board
    gameBoard.innerHTML = ""
  
    // Set the grid size
    const { rows, cols } = GAME_CONFIG[difficulty]
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`
  
    // Create the board
    createBoard()
  
    // Place mines
    placeMines()
  
    // Calculate numbers
    calculateNumbers()
  
    // Update mine counter
    updateMineCounter()
  
    // Reset timer
    resetTimer()
  
    // Reset face
    face.textContent = "😊"
  }
  
  // Create the game board
  function createBoard() {
    const { rows, cols } = GAME_CONFIG[gameState.difficulty]
  
    // Initialize board array
    gameState.board = Array(rows)
      .fill()
      .map(() => Array(cols).fill(0))
  
    // Create cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = document.createElement("div")
        cell.className = "cell cell-covered"
        cell.dataset.row = row
        cell.dataset.col = col
  
        // Add event listeners
        cell.addEventListener("mousedown", handleMouseDown)
        cell.addEventListener("mouseup", handleMouseUp)
        cell.addEventListener("contextmenu", handleRightClick)
  
        gameBoard.appendChild(cell)
      }
    }
  }
  
  // Place mines randomly on the board
  function placeMines() {
    const { rows, cols, mines } = GAME_CONFIG[gameState.difficulty]
    const totalCells = rows * cols
  
    // Generate random mine positions
    while (gameState.mineLocations.length < mines) {
      const randomPos = Math.floor(Math.random() * totalCells)
      const row = Math.floor(randomPos / cols)
      const col = randomPos % cols
  
      // Check if position already has a mine
      const posKey = `${row},${col}`
      if (!gameState.mineLocations.includes(posKey)) {
        gameState.mineLocations.push(posKey)
        gameState.board[row][col] = -1 // -1 represents a mine
      }
    }
  }
  
  // Calculate numbers for cells adjacent to mines
  function calculateNumbers() {
    const { rows, cols } = GAME_CONFIG[gameState.difficulty]
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip if cell is a mine
        if (gameState.board[row][col] === -1) continue
  
        // Count adjacent mines
        let count = 0
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
            if (gameState.board[r][c] === -1) count++
          }
        }
  
        gameState.board[row][col] = count
      }
    }
  }
  
  // Handle mouse down event
  function handleMouseDown(e) {
    if (gameState.gameOver) return
  
    // Change face to worried
    if (e.button === 0) {
      // Left click
      face.textContent = "😮"
    }
  }
  
  // Handle mouse up event
  function handleMouseUp(e) {
    if (gameState.gameOver) return
  
    // Reset face
    face.textContent = "😊"
  
    if (e.button === 0) {
      // Left click
      const row = Number.parseInt(this.dataset.row)
      const col = Number.parseInt(this.dataset.col)
  
      // Start timer on first click
      if (gameState.uncoveredCells.length === 0) {
        startTimer()
      }
  
      // Check if cell is flagged or questioned
      const posKey = `${row},${col}`
      if (gameState.flaggedCells.includes(posKey) || gameState.questionCells.includes(posKey)) {
        return
      }
  
      // Uncover cell
      uncoverCell(row, col)
    }
  }
  
  // Handle right click event
  function handleRightClick(e) {
    e.preventDefault()
    if (gameState.gameOver) return
  
    const row = Number.parseInt(this.dataset.row)
    const col = Number.parseInt(this.dataset.col)
    const posKey = `${row},${col}`
  
    // Check if cell is already uncovered
    if (gameState.uncoveredCells.includes(posKey)) {
      return
    }
  
    // Start timer on first right click
    if (
      gameState.uncoveredCells.length === 0 &&
      gameState.flaggedCells.length === 0 &&
      gameState.questionCells.length === 0
    ) {
      startTimer()
    }
  
    // Toggle flag -> question -> none
    if (gameState.flaggedCells.includes(posKey)) {
      // Remove flag, add question
      gameState.flaggedCells = gameState.flaggedCells.filter((pos) => pos !== posKey)
      gameState.questionCells.push(posKey)
      this.classList.remove("cell-flagged")
      this.classList.add("cell-question")
      gameState.minesRemaining++
    } else if (gameState.questionCells.includes(posKey)) {
      // Remove question
      gameState.questionCells = gameState.questionCells.filter((pos) => pos !== posKey)
      this.classList.remove("cell-question")
    } else {
      // Add flag
      gameState.flaggedCells.push(posKey)
      this.classList.add("cell-flagged")
      gameState.minesRemaining--
    }
  
    // Update mine counter
    updateMineCounter()
  }
  
  // Uncover a cell
  function uncoverCell(row, col) {
    const { rows, cols } = GAME_CONFIG[gameState.difficulty]
    const posKey = `${row},${col}`
  
    // Check if cell is already uncovered
    if (gameState.uncoveredCells.includes(posKey)) {
      return
    }
  
    // Add to uncovered cells
    gameState.uncoveredCells.push(posKey)
  
    // Get the cell element
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
  
    // Update cell appearance
    cell.classList.remove("cell-covered")
    cell.classList.add("cell-uncovered")
  
    // Check if it's a mine
    if (gameState.board[row][col] === -1) {
      // Game over
      gameOver(false)
      cell.classList.add("cell-mine")
      return
    }
  
    // If it's a number, show it
    if (gameState.board[row][col] > 0) {
      cell.textContent = gameState.board[row][col]
      cell.classList.add(`cell-${gameState.board[row][col]}`)
    }
  
    // If it's empty, uncover adjacent cells
    if (gameState.board[row][col] === 0) {
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
          if (r !== row || c !== col) {
            uncoverCell(r, c)
          }
        }
      }
    }
  
    // Check if game is won
    checkWin()
  }
  
  // Check if the game is won
  function checkWin() {
    const { rows, cols, mines } = GAME_CONFIG[gameState.difficulty]
    const totalCells = rows * cols
  
    if (gameState.uncoveredCells.length === totalCells - mines) {
      gameOver(true)
    }
  }
  
  // Game over
  function gameOver(isWin) {
    gameState.gameOver = true
    gameState.gameWon = isWin
  
    // Stop timer
    clearInterval(gameState.timerInterval)
  
    // Update face
    face.textContent = isWin ? "😎" : "😵"
  
    // If lost, show all mines
    if (!isWin) {
      revealAllMines()
    } else {
      // Flag all remaining mines
      flagAllMines()
    }
  }
  
  // Reveal all mines
  function revealAllMines() {
    gameState.mineLocations.forEach((posKey) => {
      const [row, col] = posKey.split(",").map(Number)
      const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
  
      // Skip if already flagged correctly
      if (gameState.flaggedCells.includes(posKey)) {
        return
      }
  
      cell.classList.remove("cell-covered")
      cell.classList.add("cell-uncovered", "cell-mine")
    })
  
    // Show incorrectly flagged cells
    gameState.flaggedCells.forEach((posKey) => {
      if (!gameState.mineLocations.includes(posKey)) {
        const [row, col] = posKey.split(",").map(Number)
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
  
        cell.classList.remove("cell-covered", "cell-flagged")
        cell.classList.add("cell-uncovered")
        cell.textContent = "❌"
      }
    })
  }
  
  // Flag all mines (when game is won)
  function flagAllMines() {
    gameState.mineLocations.forEach((posKey) => {
      if (!gameState.flaggedCells.includes(posKey)) {
        const [row, col] = posKey.split(",").map(Number)
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
  
        cell.classList.add("cell-flagged")
        gameState.flaggedCells.push(posKey)
      }
    })
  
    // Update mine counter to 0
    gameState.minesRemaining = 0
    updateMineCounter()
  }
  
  // Start the timer
  function startTimer() {
    gameState.timerInterval = setInterval(() => {
      gameState.timer++
      updateTimer()
  
      // Cap at 999 seconds
      if (gameState.timer >= 999) {
        clearInterval(gameState.timerInterval)
      }
    }, 1000)
  }
  
  // Reset the timer
  function resetTimer() {
    clearInterval(gameState.timerInterval)
    gameState.timer = 0
    updateTimer()
  }
  
  // Update the timer display
  function updateTimer() {
    const hundreds = Math.floor(gameState.timer / 100)
    const tens = Math.floor((gameState.timer % 100) / 10)
    const ones = gameState.timer % 10
  
    timerHundreds.textContent = hundreds
    timerTens.textContent = tens
    timerOnes.textContent = ones
  }
  
  // Update the mine counter display
  function updateMineCounter() {
    const mines = gameState.minesRemaining
    const hundreds = Math.floor(Math.abs(mines) / 100)
    const tens = Math.floor((Math.abs(mines) % 100) / 10)
    const ones = Math.abs(mines) % 10
  
    mineHundreds.textContent = mines < 0 ? "-" : hundreds
    mineTens.textContent = tens
    mineOnes.textContent = ones
  }
  
  // Reset game when face is clicked
  face.addEventListener("click", () => {
    initGame(gameState.difficulty)
  })
  
  // Prevent context menu on right click
  gameBoard.addEventListener("contextmenu", (e) => e.preventDefault())
  
  // Initialize the game
  initGame()
  