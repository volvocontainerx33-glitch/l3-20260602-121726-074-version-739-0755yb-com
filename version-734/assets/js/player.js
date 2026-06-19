(() => {
  const shells = document.querySelectorAll(".player-shell");
  shells.forEach((shell) => {
    const video = shell.querySelector("video");
    const cover = shell.querySelector(".player-cover");
    const button = shell.querySelector(".player-button");
    if (!video) return;

    const stream = video.getAttribute("src");
    let ready = false;
    let hls = null;

    video.removeAttribute("src");
    video.load();

    const attach = () => {
      if (ready || !stream) return;
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    const play = () => {
      attach();
      shell.classList.add("is-playing");
      video.controls = true;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {});
      }
    };

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (button) {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener("canplay", () => {
      if (shell.classList.contains("is-playing") && video.paused) {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(() => {});
        }
      }
    });

    window.addEventListener("pagehide", () => {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
