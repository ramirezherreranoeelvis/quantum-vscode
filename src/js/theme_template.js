(function () {
      //====================================
      // Theme replacement CSS (Glow styles)
      //====================================
      const tokenReplacements = {
            /* Red */
            fe4450: "color: #fff5f6; text-shadow: 0 0 2px #000, 0 0 10px #fc1f2cFF, 0 0 5px #fc1f2cFF, 0 0 25px #fc1f2cFF; backface-visibility: hidden;",
            /* Neon pink  f92aad*/
            ff7edb: "color: #ff00b7; text-shadow: 0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #dc078e; backface-visibility: hidden;",
            /* Yellow */
            fede5d: "color: #f4eee4; text-shadow: 0 0 2px #393a33, 0 0 8px #f39f05FF, 0 0 2px #f39f05FF; backface-visibility: hidden;",
            /* Green */
            "72f1b8": "color: #42FF9E; text-shadow: 0 0 2px #100c0f, 0 0 10px #257c5572, 0 0 35px #21272472; backface-visibility: hidden;",
            /* Purple */
            b267e6: "color: #f2e0ff; text-shadow: 0 0 2px #000000, 0 0 5px #9500ff, 0 0 10px #9500ff; backface-visibility: hidden;",
            /* blue */
            "36f9f6": "color: #fdfdfd; text-shadow: 0 0 2px #001716, 0 0 8px #03edf9cF, 0 0 6px #03edf9cF; backface-visibility: hidden;",
            /* Celeste */
            "2ac3dd": "color: #d3edff;text-shadow: 0 0 2px #03b8ff, 0 0 8px #008cff72, 0 0 6px #006eff9c; backface-visibility: hidden;",
            /* arroy pink */
            ffe2fd: "color: #ffe2fd;text-shadow: 0 0 2px #f805ec, 0 0 8px #f3059072, 0 0 6px #f305b8a9; backface-visibility: hidden;",
            /* verde */
            "00f150": "color: #e4f4e4; text-shadow: 0 0 2px #333a35, 0 0 8px #05f32d, 0 0 2px #05f311; backface-visibility: hidden;",
      };

      //=============================
      // Helper functions
      //=============================

      /**
       * @summary Check if the style element exists and that it has synthwave '84 color content
       * @param {HTMLElement} tokensEl the style tag
       * @param {object} replacements key/value pairs of colour hex and the glow styles to replace them with
       * @returns {boolean}
       */
      const themeStylesExist = (tokensEl, replacements) => {
            return (
                  tokensEl.innerText !== "" &&
                  Object.keys(replacements).every((color) => {
                        return tokensEl.innerText
                              .toLowerCase()
                              .includes(`#${color}`);
                  })
            );
      };

      /**
       * @summary Search and replace colours within a CSS definition
       * @param {string} styles the text content of the style tag
       * @param {object} replacements key/value pairs of colour hex and the glow styles to replace them with
       * @returns
       */
      const replaceTokens = (styles, replacements) =>
            Object.keys(replacements).reduce((acc, color) => {
                  const re = new RegExp(`color: #${color};`, "gi");
                  return acc.replace(re, replacements[color]);
            }, styles);

      /**
       * @summary Checks if a theme is applied, and that the theme belongs to the Synthwave 84 family
       * @returns {boolean}
       */
      const usingSynthwave = () => {
            const appliedTheme = document.querySelector(
                  '[class*="theme-json"]'
            );
            const synthWaveTheme = document.querySelector(
                  '[class*="GatomontesRoseIII-quantum-vscode-themes"]'
            );
            return appliedTheme && synthWaveTheme;
      };

      /**
       * @summary Checks if the theme is synthwave, and that the styles exist, ready for replacement
       * @param {HTMLElement} tokensEl the style tag
       * @param {object} replacements key/value pairs of colour hex and the glow styles to replace them with
       * @returns
       */
      const readyForReplacement = (tokensEl, tokenReplacements) =>
            tokensEl
                  ? // only init if we're using a Synthwave 84 subtheme
                    usingSynthwave() &&
                    // does it have content ?
                    themeStylesExist(tokensEl, tokenReplacements)
                  : false;

      /**
       * @summary Attempts to bootstrap the theme
       * @param {boolean} disableGlow
       * @param {MutationObserver} obs
       */
      const initNeonDreams = (disableGlow, obs) => {
            const tokensEl = document.querySelector(".vscode-tokens-styles");

            if (
                  !tokensEl ||
                  !readyForReplacement(tokensEl, tokenReplacements)
            ) {
                  return;
            }

            // Add the theme styles if they don't already exist in the DOM
            if (!document.querySelector("#quantum-synthwave-theme-styles")) {
                  const initialThemeStyles = tokensEl.innerText;

                  // Replace tokens with glow styles
                  let updatedThemeStyles = !disableGlow
                        ? replaceTokens(initialThemeStyles, tokenReplacements)
                        : initialThemeStyles;

                  /* append the remaining styles */
                  updatedThemeStyles = `${updatedThemeStyles}[CHROME_STYLES]`;

                  const newStyleTag = document.createElement("style");
                  newStyleTag.setAttribute("id", "quantum-synthwave-theme-styles");
                  newStyleTag.innerText = updatedThemeStyles.replace(
                        /(\r\n|\n|\r)/gm,
                        ""
                  );
                  document.body.appendChild(newStyleTag);

                  console.log("Quantum Synthwave: NEON QUANTUM initialised!");
            }

            // disconnect the observer because we don't need it anymore
            if (obs) {
                  obs.disconnect();
                  obs = null;
            }
      };

      /**
       * @summary A MutationObserver callback that attempts to bootstrap the theme and assigns a retry attempt if it fails
       */
      const watchForBootstrap = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                  if (
                        mutation.type === "attributes" ||
                        mutation.type === "childList"
                  ) {
                        // does the style div exist yet?
                        const tokensEl = document.querySelector(
                              ".vscode-tokens-styles"
                        );
                        if (readyForReplacement(tokensEl, tokenReplacements)) {
                              // If everything we need is ready, then initialise
                              initNeonDreams([DISABLE_GLOW], observer);
                        } else {
                              if (tokensEl) {
                                    // sometimes VS code takes a while to init the styles content, so if there stop this observer and add an observer for that
                                    observer.disconnect();
                                    observer.observe(tokensEl, {
                                          childList: true,
                                    });
                              }
                        }
                  }
            }
      };

      //=============================
      // Start bootstrapping!
      //=============================
      // Grab body node
      const bodyNode = document.querySelector("body");
      // Use a mutation observer to check when we can bootstrap the theme
      const observer = new MutationObserver(watchForBootstrap);
      /* watch for both attribute and childList changes because, depending on 
  the VS code version, the mutations might happen on the body, or they might 
  happen on a nested div */
      observer.observe(bodyNode, { attributes: true, childList: true });
})();
