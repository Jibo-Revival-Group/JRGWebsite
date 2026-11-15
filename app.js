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

const wormholeLink = document.getElementById("wiki-wormhole-link");
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
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_travel;
uniform float u_twist;
uniform float u_open;
uniform float u_glow;
uniform float u_progress;

const float TAU = 6.2831853;
const vec3 cyan = vec3(0.094, 0.698, 1.0);
const vec3 deep = vec3(0.10, 0.26, 0.72);
const vec3 ember = vec3(1.0, 0.38, 0.08);
const vec3 amber = vec3(1.0, 0.62, 0.22);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 tunnel(vec2 p) {
  float r = max(length(p), 0.001);
  float z = 0.55 / r + u_travel;
  float a = fract(atan(p.y, p.x) / TAU + z * u_twist);

  // Wispy walls: integer angular frequencies keep the seam invisible
  float w = 0.5 + 0.5 * sin(a * TAU * 6.0 + sin(z * 1.7) * 2.0);
  w *= 0.5 + 0.5 * sin(z * 3.0 + sin(a * TAU * 3.0) * 1.5);
  w = w * w * w;
  float rings = pow(0.5 + 0.5 * sin(z * 6.0), 24.0);

  // Star streaks rushing past
  vec2 g = vec2(a * 48.0, z * 3.0);
  vec2 f = fract(g);
  float h = hash(floor(g));
  float dash = smoothstep(0.45, 0.0, abs(f.x - 0.5)) * smoothstep(0.0, 0.2, f.y) * smoothstep(1.0, 0.5, f.y);
  float star = step(0.93, h) * dash;

  vec3 warm = mix(ember, amber, 0.5 + 0.5 * sin(z * 0.5 + a * TAU));
  vec3 col = deep * w * 0.9;
  col += mix(cyan, warm, 0.35) * rings * 1.3;
  col += mix(vec3(0.85, 0.95, 1.0), amber, step(0.97, h)) * star * 2.2;
  col *= smoothstep(0.0, 0.3, r);
  col += mix(cyan, amber, 0.25) * 0.02 / (r * r + 0.002) * u_glow;
  return col;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float ca = 0.006 + 0.03 * u_progress;
  vec3 col = vec3(
    tunnel(p * (1.0 + ca)).r,
    tunnel(p).g,
    tunnel(p * (1.0 - ca)).b
  );

  // The hole opens from the centre, with a glowing rim while it grows
  float r = length(p);
  float edge = u_open * 1.4;
  float mask = smoothstep(edge, edge - 0.12, r);
  col += cyan * exp(-abs(r - edge) * 35.0) * (1.0 - smoothstep(0.25, 0.45, u_progress)) * 1.5;
  col = 1.0 - exp(-col * 1.25);
  col = mix(col, vec3(1.0), pow(u_progress, 6.0));
  float alpha = max(mask, smoothstep(0.25, 0.45, u_progress));
  gl_FragColor = vec4(col * alpha, alpha);
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
    alpha: true,
    premultipliedAlpha: true,
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
    uTravel: gl.getUniformLocation(program, "u_travel"),
    uTwist: gl.getUniformLocation(program, "u_twist"),
    uOpen: gl.getUniformLocation(program, "u_open"),
    uGlow: gl.getUniformLocation(program, "u_glow"),
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
  const { gl, program, uRes, uTravel, uTwist, uOpen, uGlow, uProgress } = gpu;
  let travel = 0;
  let last = startedAt;

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
    const e = progress * progress;
    // Integrate speed so acceleration never makes the tunnel jump
    travel += (1.2 + 13 * e) * Math.max(0, now - last) / 1000;
    last = now;
    resize();
    gl.uniform2f(uRes, wormholeCanvas.width, wormholeCanvas.height);
    gl.uniform1f(uTravel, travel);
    gl.uniform1f(uTwist, 0.04 + 0.12 * e);
    gl.uniform1f(uOpen, 1 - Math.pow(1 - Math.min(progress / 0.45, 1), 3));
    gl.uniform1f(uGlow, 0.4 + 1.4 * e);
    gl.uniform1f(uProgress, progress);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    wormholeRaf = requestAnimationFrame(tick);
  };

  wormholeRaf = requestAnimationFrame(tick);
  wormholeTimer = window.setTimeout(finish, wormholeDurationMs);
};

if (wormholeLink) {
  wormholeLink.addEventListener("click", (event) => {
    if (isModifiedClick(event) || !event.shiftKey) return;

    event.preventDefault();
    const url = wormholeLink.href;

    if (prefersReducedMotion() || document.body.classList.contains("wormhole-active")) {
      if (!document.body.classList.contains("wormhole-active")) {
        location.assign(url);
      }
      return;
    }

    startWormhole(url);
  });
}
