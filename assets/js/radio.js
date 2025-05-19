document.addEventListener("DOMContentLoaded", () => {
    // Audio setup
    const audio = new Audio()
    audio.src = "https://radiosource.atacko.cc/radio.mp3"
    audio.crossOrigin = "anonymous"
    audio.loop = true
    audio.volume = 0.5
  
    // DOM elements
    const playButton = document.getElementById("play-button")
    const stopButton = document.getElementById("stop-button")
    const pauseButton = document.getElementById("pause-button")
    const prevButton = document.getElementById("prev-button")
    const nextButton = document.getElementById("next-button")
    const volumeButton = document.getElementById("volume-button")
    const volumeSliderContainer = document.getElementById("volume-slider-container")
    const volumeSliderThumb = document.getElementById("volume-slider-thumb")
    const volumeDisplay = document.getElementById("volume-display")
    const timeDisplay = document.getElementById("time-display")
    const radioPlayer = document.querySelector(".radio-player")
  
    // Window control buttons
    const closeButton = document.querySelector(".window-button.close")
    const minimizeButton = document.querySelector(".window-button.minimize")
    const maximizeButton = document.querySelector(".window-button.maximize")
  
    // Player state
    let isPlaying = false
    let isPaused = false
    let currentTime = 0
    let timer
    let isDraggingVolume = false
  
    // Update volume display
    function updateVolumeDisplay() {
      const volumePercent = Math.round(audio.volume * 100)
      volumeDisplay.textContent = `${volumePercent}%`
  
      // Update slider position
      const sliderTrackWidth = volumeSliderContainer.querySelector(".volume-slider-track").offsetWidth
      const thumbPosition = audio.volume * (sliderTrackWidth - volumeSliderThumb.offsetWidth)
      volumeSliderThumb.style.left = `${thumbPosition}px`
    }
  
    // Update time display
    function updateTimeDisplay() {
      if (isPlaying && !isPaused) {
        currentTime++
        const minutes = Math.floor(currentTime / 60)
        const seconds = currentTime % 60
        timeDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
      }
    }
  
    // Start timer
    function startTimer() {
      timer = setInterval(updateTimeDisplay, 1000)
    }
  
    // Stop timer
    function stopTimer() {
      clearInterval(timer)
    }
  
    // Reset timer
    function resetTimer() {
      currentTime = 0
      timeDisplay.textContent = "0:00"
    }
  
    // Update player status
    function updatePlayerStatus() {
      radioPlayer.classList.remove("playing", "paused", "stopped")
  
      if (isPlaying) {
        if (isPaused) {
          radioPlayer.classList.add("paused")
        } else {
          radioPlayer.classList.add("playing")
        }
      } else {
        radioPlayer.classList.add("stopped")
      }
    }
  
    // Play button click handler
    playButton.addEventListener("click", () => {
      if (!isPlaying || isPaused) {
        audio.play()
        isPlaying = true
        isPaused = false
        startTimer()
        updatePlayerStatus()
      }
    })
  
    // Stop button click handler
    stopButton.addEventListener("click", () => {
      audio.pause()
      audio.currentTime = 0
      isPlaying = false
      isPaused = false
      stopTimer()
      resetTimer()
      updatePlayerStatus()
    })
  
    // Pause button click handler
    pauseButton.addEventListener("click", () => {
      if (isPlaying && !isPaused) {
        audio.pause()
        isPaused = true
        stopTimer()
        updatePlayerStatus()
      } else if (isPlaying && isPaused) {
        audio.play()
        isPaused = false
        startTimer()
        updatePlayerStatus()
      }
    })
  
    // Previous button click handler (non-functional in this version)
    prevButton.addEventListener("click", function () {
      // This would typically go to the previous track
      // For now, just simulate a button press
      this.classList.add("active")
      setTimeout(() => this.classList.remove("active"), 200)
    })
  
    // Next button click handler (non-functional in this version)
    nextButton.addEventListener("click", function () {
      // This would typically go to the next track
      // For now, just simulate a button press
      this.classList.add("active")
      setTimeout(() => this.classList.remove("active"), 200)
    })
  
    // Volume button click handler
    volumeButton.addEventListener("click", () => {
      radioPlayer.classList.toggle("volume-active")
      updateVolumeDisplay()
    })
  
    // Volume slider functionality
    volumeSliderThumb.addEventListener("mousedown", (e) => {
      e.preventDefault()
      isDraggingVolume = true
  
      // Calculate initial position
      const sliderTrack = volumeSliderContainer.querySelector(".volume-slider-track")
      const sliderRect = sliderTrack.getBoundingClientRect()
      const thumbWidth = volumeSliderThumb.offsetWidth
  
      function handleMouseMove(e) {
        if (isDraggingVolume) {
          const relativeX = Math.max(0, Math.min(e.clientX - sliderRect.left, sliderRect.width - thumbWidth))
          const newVolume = relativeX / (sliderRect.width - thumbWidth)
  
          // Set volume (0 to 1)
          audio.volume = Math.max(0, Math.min(1, newVolume))
  
          // Update display
          updateVolumeDisplay()
        }
      }
  
      function handleMouseUp() {
        isDraggingVolume = false
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
  
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    })
  
    // Window control buttons
    closeButton.addEventListener("click", () => {
      // This would typically close the window
      // In an iframe, we can't really close it
      audio.pause()
      isPlaying = false
      isPaused = false
      stopTimer()
      resetTimer()
      updatePlayerStatus()
    })
  
    // Initialize
    updateVolumeDisplay()
    updatePlayerStatus()
  
    // Add button press effect
    const buttons = document.querySelectorAll("button")
    buttons.forEach((button) => {
      button.addEventListener("mousedown", function () {
        this.style.borderStyle = "inset"
      })
  
      button.addEventListener("mouseup", function () {
        this.style.borderStyle = "outset"
      })
  
      button.addEventListener("mouseleave", function () {
        this.style.borderStyle = "outset"
      })
    })
  
    // Add menu hover effect
    const menuItems = document.querySelectorAll(".menu-item")
    menuItems.forEach((item) => {
      item.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "#000080"
        this.style.color = "white"
      })
  
      item.addEventListener("mouseleave", function () {
        this.style.backgroundColor = ""
        this.style.color = ""
      })
    })
  })
  