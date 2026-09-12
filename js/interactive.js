/* ============================================================
   INTERACTIVE BOUQUET - ROMANTIC JAVASCRIPT ENGINE
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Remove loading class from body
  document.body.classList.remove("container");

  // 2. Love notes data for each blossom
  const loveNotes = {
    1: {
      title: "My Amazing Bestie 🌸",
      message:
        "Life is brighter because you're in it. Thank you for being the friend who listens, supports, and fills every moment with laughter and happiness. 💕",
      icon: "🌷",
    },
    2: {
      title: "Favorite Memories ✨",
      message:
        "From endless conversations to unforgettable adventures, every memory with you has a special place in my heart. Thank you for making life so beautiful. 🌸",
      icon: "💖",
    },
    3: {
      title: "Friendship Forever 🦋",
      message:
        "True friendship is rare, and I'm so grateful to have a best friend like you. No matter where life takes us, our bond will always stay strong. 💕✨",
      icon: "🌼",
    },
  };

  // 3. Setup Interactive Flower Clicks
  const flowers = [
    { el: document.querySelector(".flower--1 .flower__leafs"), id: 1 },
    { el: document.querySelector(".flower--2 .flower__leafs"), id: 2 },
    { el: document.querySelector(".flower--3 .flower__leafs"), id: 3 },
  ];

  const modalOverlay = document.getElementById("loveModal");
  const modalIcon = document.getElementById("modalIcon");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  const openedFlowers = new Set();

  flowers.forEach(({ el, id }) => {
    if (!el) return;

    // Append a small glowing hint badge on each flower
    const badge = document.createElement("div");
    badge.className = "flower-hint-badge";
    badge.innerHTML = `✨ Note #${id}`;
    el.parentElement.appendChild(badge);

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openedFlowers.add(id);

      // Spawn burst of hearts at flower position
      const rect = el.getBoundingClientRect();
      createHeartBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        18,
      );

      const note = loveNotes[id];
      modalIcon.textContent = note.icon;
      modalTitle.textContent = note.title;
      modalMessage.innerHTML = note.message;
      modalOverlay.classList.add("active");
    });
  });

  // Close modal on button or backdrop click
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      modalOverlay.classList.remove("active");
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove("active");
      }
    });
  }

  // 4. Background Music Controller
  const audio = new Audio("./img/Floricienta.mp3");
  audio.loop = true;
  audio.volume = 0.65;

  const musicWidget = document.getElementById("musicWidget");
  const musicStatus = document.getElementById("musicStatus");
  let isPlaying = false;

  function tryPlayMusic() {
    audio
      .play()
      .then(() => {
        isPlaying = true;
        if (musicWidget) musicWidget.classList.add("playing");
        if (musicStatus) musicStatus.textContent = "Playing ♪";
      })
      .catch(() => {
        isPlaying = false;
        if (musicWidget) musicWidget.classList.remove("playing");
        if (musicStatus) musicStatus.textContent = "Tap to Play";
      });
  }

  // Auto-attempt playback on first user interaction
  const startAudioOnInteraction = () => {
    if (!isPlaying) {
      tryPlayMusic();
    }
    document.removeEventListener("click", startAudioOnInteraction);
    document.removeEventListener("touchstart", startAudioOnInteraction);
  };
  document.addEventListener("click", startAudioOnInteraction);
  document.addEventListener("touchstart", startAudioOnInteraction);

  // Toggle music on widget click
  if (musicWidget) {
    musicWidget.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        musicWidget.classList.remove("playing");
        musicStatus.textContent = "Paused";
      } else {
        tryPlayMusic();
      }
    });
  }

  // 5. Fullscreen Particle Trail Canvas (Hearts & Sparkles)
  const canvas = document.getElementById("particlesCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let particles = [];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const heartSymbols = ["🌸", "🌷", "🦋", "✨", "🌼", "💖"];

  class Particle {
    constructor(x, y, symbol = null) {
      this.x = x;
      this.y = y;
      this.symbol =
        symbol || heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
      this.size = Math.random() * 18 + 14;
      this.vx = (Math.random() - 0.5) * 3.5;
      this.vy = -(Math.random() * 3 + 2);
      this.opacity = 1;
      this.fade = Math.random() * 0.015 + 0.015;
      this.rotation = (Math.random() - 0.5) * 0.5;
      this.angle = 0;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.03; // slight gravity
      this.angle += this.rotation;
      this.opacity -= this.fade;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.symbol, 0, 0);
      ctx.restore();
    }
  }

  function createHeartBurst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      particles.push(
        new Particle(
          x + (Math.random() - 0.5) * 20,
          y + (Math.random() - 0.5) * 20,
        ),
      );
    }
  }

  // Spawn particle on mouse/touch move and click
  window.addEventListener("pointerdown", (e) => {
    createHeartBurst(e.clientX, e.clientY, 8);
  });

  let throttleMove = 0;
  window.addEventListener("pointermove", (e) => {
    throttleMove++;
    if (throttleMove % 4 === 0) {
      particles.push(new Particle(e.clientX, e.clientY));
    }
  });

  function animateParticles() {
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.opacity <= 0 || p.y > canvas.height + 50) {
          particles.splice(i, 1);
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // 6. Ambient Floating Background Hearts
  function spawnAmbientHeart() {
    const heart = document.createElement("div");
    heart.className = "ambient-heart";
    heart.textContent = Math.random() > 0.5 ? "🌸" : "🦋";
    heart.style.left = Math.random() * 95 + "vw";
    heart.style.fontSize = Math.random() * 16 + 12 + "px";
    const duration = Math.random() * 8 + 7;
    heart.style.animationDuration = duration + "s";
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, duration * 1000);
  }
  setInterval(spawnAmbientHeart, 1200);

  // 7. Grand Finale Modal & Surprise Prompt
  const finaleBtn = document.getElementById("finaleBtn");
  const finaleModal = document.getElementById("finaleModal");
  const finaleCloseBtn = document.getElementById("finaleCloseBtn");
  const finaleOption1 = document.getElementById("finaleOption1");
  const finaleOption2 = document.getElementById("finaleOption2");
  const celebrationMsg = document.getElementById("celebrationMsg");
  const finaleOptionsBox = document.getElementById("finaleOptionsBox");

  function showFinale() {
    if (finaleModal) {
      finaleModal.classList.add("active");
      createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 25);
    }
  }

  if (finaleBtn) {
    finaleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showFinale();
    });
  }

  if (finaleCloseBtn) {
    finaleCloseBtn.addEventListener("click", () => {
      if (finaleModal) finaleModal.classList.remove("active");
    });
  }

  if (finaleModal) {
    finaleModal.addEventListener("click", (e) => {
      if (e.target === finaleModal) {
        finaleModal.classList.remove("active");
      }
    });
  }

  function handleFinaleCelebration(responseText) {
    if (finaleOptionsBox) finaleOptionsBox.style.display = "none";
    if (celebrationMsg) {
      celebrationMsg.style.display = "block";
      celebrationMsg.textContent = responseText;
    }

    // Shower of hearts
    let showerCount = 0;
    const interval = setInterval(() => {
      createHeartBurst(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight * 0.7,
        10,
      );
      showerCount++;
      if (showerCount > 15) clearInterval(interval);
    }, 150);
  }

  if (finaleOption1) {
    finaleOption1.addEventListener("click", (e) => {
      e.stopPropagation();
      handleFinaleCelebration(
        "🌸 Best Friends Forever! Thank you for being such an incredible part of my life. 💕",
      );
    });
  }

  if (finaleOption2) {
    finaleOption2.addEventListener("click", (e) => {
      e.stopPropagation();
      handleFinaleCelebration(
        "✨ You're truly one of a kind! Wishing you endless happiness, success and beautiful memories. 🌷",
      );
    });
  }
});
