const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");
const commitList = document.getElementById("commit-list");
const helpersGrid = document.getElementById("helpers-grid");
const themeToggle = document.getElementById("theme-toggle");
const themeMenu = document.getElementById("theme-menu");
const musicToggle = document.getElementById("music-toggle");
const archiveTheme = document.getElementById("archive-theme");
const usableUrl = (value) => (value && !value.includes("example.com") ? value : "");
const themeKey = "jibo-revival-theme";

const applyTheme = (theme) => {
  if (theme !== "aero") {
    document.body.removeAttribute("data-theme");
  } else {
    document.body.dataset.theme = theme;
  }
  localStorage.setItem(themeKey, theme);
};

applyTheme(localStorage.getItem(themeKey) === "aero" ? "aero" : "default");

if (progressFill && progressLabel && typeof projectProgress !== "undefined") {
  const progressValue = Math.max(0, Math.min(projectProgress.percentage || 0, 100));
  progressFill.style.width = `${progressValue}%`;
  progressLabel.textContent = `${progressValue}% complete`;
}

if (commitList && typeof commits !== "undefined") {
  commits.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "timeline-card";

    const authorsText = (entry.authors || [])
      .map((id) => authors[id]?.name)
      .filter(Boolean)
      .join(", ");

    const chipMarkup = (entry.categories || [])
      .map((category) => `<span class="chip">${category}</span>`)
      .join("");

    const formattedDate = new Date(`${entry.date}T12:00:00`).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    card.innerHTML = `
      <p class="timeline-card__meta">${formattedDate}</p>
      <div class="timeline-card__chips">${chipMarkup}</div>
      <h3>${entry.summary}</h3>
      ${authorsText ? `<p class="timeline-card__authors">By ${authorsText}</p>` : ""}
    `;

    commitList.appendChild(card);
  });
}

if (helpersGrid && typeof authors !== "undefined") {
  Object.values(authors).forEach((author) => {
    const authorUrl = usableUrl(author.url);
    const card = document.createElement(authorUrl ? "a" : "article");
    card.className = "helper-card";

    if (authorUrl) {
      card.href = authorUrl;
      card.target = "_blank";
      card.rel = "noreferrer";
    }

    const avatar = usableUrl(author.pfp)
      ? `<img src="${author.pfp}" alt="${author.initials}" />`
      : `<span>${author.initials}</span>`;

    card.innerHTML = `
      <div class="helper-card__avatar">${avatar}</div>
      <h3>${author.name}${author.pro ? ` <small class="helper-card__pronouns">${author.pro}</small>` : ""}</h3>
      <p>${author.role || "Community Supporter"}</p>
    `;

    helpersGrid.appendChild(card);
  });
}

const setMenuOpen = (open) => {
  if (!themeMenu || !themeToggle) return;
  themeMenu.hidden = !open;
  themeToggle.setAttribute("aria-expanded", String(open));
};

document.body.dataset.theme = document.body.dataset.theme || "default";

if (themeToggle && themeMenu) {
  themeToggle.addEventListener("click", () => {
    setMenuOpen(themeMenu.hidden);
  });

  themeMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme]");
    if (!button) return;
    applyTheme(button.dataset.theme);
    setMenuOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (themeMenu.hidden) return;
    if (themeMenu.contains(event.target) || themeToggle.contains(event.target)) return;
    setMenuOpen(false);
  });
}

if (musicToggle && archiveTheme) {
  musicToggle.addEventListener("click", async () => {
    if (archiveTheme.paused) {
      try {
        await archiveTheme.play();
        musicToggle.setAttribute("aria-pressed", "true");
      } catch {
        musicToggle.setAttribute("aria-pressed", "false");
      }
    } else {
      archiveTheme.pause();
      archiveTheme.currentTime = 0;
      musicToggle.setAttribute("aria-pressed", "false");
    }
  });

  archiveTheme.addEventListener("ended", () => {
    musicToggle.setAttribute("aria-pressed", "false");
  });
}

const forumLink = document.getElementById("forum-wormhole-link");
const wormholeOverlay = document.getElementById("wormhole");
const wormholeCanvas = document.getElementById("wormhole-canvas");
const wormholeDurationMs = 2000;
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isModifiedClick = (event) => (
  event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey
);

let wormholeRaf = 0;
let wormholeTimer = 0;
let wormholeResizeHandler = null;
let wormholeGL = null;

const wormholeVertSrc = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const wormholeFragSrc = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_progress;

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float r = length(p);
  float a = atan(p.y, p.x);

  float speed = mix(2.2, 9.0, u_progress);
  float twist = mix(0.28, 1.35, u_progress);
  float z = 0.65 / max(r, 0.001) + u_time * speed;
  a += z * twist;

  float rings = pow(0.5 + 0.5 * sin(z * 5.5), 28.0);
  float fine = pow(0.5 + 0.5 * sin(z * 16.0), 50.0);
  float lanes = pow(0.5 + 0.5 * sin(a * 8.0), 14.0);
  float wall = smoothstep(0.0, 0.1, r);

  vec3 cyan = vec3(0.094, 0.698, 1.0);
  vec3 deep = vec3(0.12, 0.32, 0.78);
  vec3 ember = vec3(1.0, 0.38, 0.08);
  vec3 amber = vec3(1.0, 0.55, 0.18);
  vec3 col = vec3(0.02, 0.015, 0.03);
  float heat = 0.5 + 0.5 * sin(z * 0.65 + a * 2.0);
  vec3 warm = mix(ember, amber, heat);
  vec3 ringCol = mix(cyan, warm, 0.28);

  col += mix(deep, ringCol, rings) * rings * 1.55 * wall;
  col += mix(cyan, ember, 0.32) * lanes * 0.38 * wall;
  col += mix(vec3(0.75, 0.92, 1.0), amber, 0.22) * fine * 0.55 * wall;

  float core = 0.016 / (r * r + 0.0018);
  col += mix(cyan, amber, 0.2) * core * mix(0.35, 1.15, u_progress);
  col *= 1.0 - smoothstep(0.52, 1.18, r);
  col += mix(vec3(0.55, 0.82, 1.0), amber, 0.25) * pow(u_progress, 5.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const stopWormholeLoop = () => {
  cancelAnimationFrame(wormholeRaf);
  window.clearTimeout(wormholeTimer);
  wormholeRaf = 0;
  wormholeTimer = 0;
  if (wormholeResizeHandler) {
    window.removeEventListener("resize", wormholeResizeHandler);
    wormholeResizeHandler = null;
  }
};

const resetWormhole = () => {
  stopWormholeLoop();
  document.body.classList.remove("wormhole-active");
  if (wormholeOverlay) {
    wormholeOverlay.hidden = true;
    wormholeOverlay.setAttribute("aria-hidden", "true");
    wormholeOverlay.classList.remove("wormhole--css");
  }
};

window.addEventListener("pagehide", stopWormholeLoop);
window.addEventListener("pageshow", resetWormhole);

const initWormholeGL = () => {
  if (!wormholeCanvas) return null;
  if (wormholeGL && !wormholeGL.gl.isContextLost()) return wormholeGL;

  const gl = wormholeCanvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance"
  });
  if (!gl) return null;

  const vert = compileShader(gl, gl.VERTEX_SHADER, wormholeVertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, wormholeFragSrc);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    3, -1,
    -1, 3
  ]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  wormholeGL = {
    gl,
    program,
    uRes: gl.getUniformLocation(program, "u_res"),
    uTime: gl.getUniformLocation(program, "u_time"),
    uProgress: gl.getUniformLocation(program, "u_progress")
  };
  return wormholeGL;
};

const startWormhole = (url) => {
  if (!wormholeOverlay) {
    location.assign(url);
    return;
  }

  stopWormholeLoop();
  wormholeOverlay.hidden = false;
  wormholeOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("wormhole-active");

  const gpu = initWormholeGL();
  const startedAt = performance.now();

  const finish = () => {
    stopWormholeLoop();
    location.assign(url);
  };

  if (!gpu) {
    wormholeOverlay.classList.add("wormhole--css");
    wormholeTimer = window.setTimeout(finish, wormholeDurationMs);
    return;
  }

  wormholeOverlay.classList.remove("wormhole--css");
  const { gl, program, uRes, uTime, uProgress } = gpu;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const width = Math.max(1, Math.floor(window.innerWidth * dpr));
    const height = Math.max(1, Math.floor(window.innerHeight * dpr));
    if (wormholeCanvas.width !== width || wormholeCanvas.height !== height) {
      wormholeCanvas.width = width;
      wormholeCanvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  };

  resize();
  wormholeResizeHandler = resize;
  window.addEventListener("resize", resize);
  gl.useProgram(program);

  const tick = (now) => {
    const progress = Math.min((now - startedAt) / wormholeDurationMs, 1);
    resize();
    gl.uniform2f(uRes, wormholeCanvas.width, wormholeCanvas.height);
    gl.uniform1f(uTime, (now - startedAt) / 1000);
    gl.uniform1f(uProgress, progress);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    wormholeRaf = requestAnimationFrame(tick);
  };

  wormholeRaf = requestAnimationFrame(tick);
  wormholeTimer = window.setTimeout(finish, wormholeDurationMs);
};

if (forumLink) {
  forumLink.addEventListener("click", (event) => {
    if (isModifiedClick(event) || !event.shiftKey) return;

    event.preventDefault();
    const url = forumLink.href;

    if (prefersReducedMotion() || document.body.classList.contains("wormhole-active")) {
      if (!document.body.classList.contains("wormhole-active")) {
        location.assign(url);
      }
      return;
    }

    startWormhole(url);
  });
}
