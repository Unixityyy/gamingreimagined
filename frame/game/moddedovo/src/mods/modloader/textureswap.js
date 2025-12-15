(function() {
  let old = globalThis.sdk_runtime;
  c2_callFunction("execCode", ["globalThis.sdk_runtime = this.runtime"]);
  let runtime = globalThis.sdk_runtime;
  globalThis.sdk_runtime = old;

  function shuffleTextures() {
    let frames = [];
    for (let type of runtime.types_by_index) {
      if (!type || !type.animations) continue;
      for (let anim of type.animations) {
        for (let frame of anim.frames) {
          if (frame.texture_img) frames.push(frame);
        }
      }
    }

    let textures = frames.map(f => f.texture_img);

    for (let i = textures.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [textures[i], textures[j]] = [textures[j], textures[i]];
    }

    frames.forEach((frame, i) => {
      frame.texture_img = textures[i];
      frame.webGL_texture = null;
    });

    runtime.redraw = true;
    console.log("textures reshuffled chaos!");
  }

  // initial shuffle
  shuffleTextures();

  // repeat every 5 seconds
  setInterval(shuffleTextures, 5000);
})();
