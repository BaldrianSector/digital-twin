// Instance mode of p5.js
new p5(function (p) {
    const density = "@#$9876543210?/!;:+=-,._      ";
    //const density = "@%#*+=-:. ";
    //const density = "'█▓▒░:.  ";
    //const density = "❦ ༊*·╰⊱♥⊱╮ೃ⁀➷    "

    let video;
    let asciiDiv;
    let originalWidth, originalHeight; // Store original video dimensions
    let playButton; // Add play button for mobile

    p.setup = function () {
        asciiDiv = p.createDiv();
        asciiDiv.parent('ascii-container');  // Make sure this div appends within a specific container
        p.noCanvas();

        // Create video with additional attributes for mobile compatibility
        video = p.createVideo(['assets/videos/animation2-cropped.mp4']);

        // Set video attributes for autoplay and muting
        video.elt.muted = true;
        video.elt.autoplay = true;
        video.elt.playsInline = true; // Important for iOS
        video.elt.loop = true;

        // Store original dimensions immediately after video creation
        // These will be the actual video file dimensions
        originalWidth = video.width;
        originalHeight = video.height;

        // Responsive video sizing based on screen width
        let scaleFactor;
        if (p.windowWidth < 420 || p.windowHeight < 399) {
            scaleFactor = 10; // Small size for narrow screens
        } else if (p.windowWidth < 769 || p.windowHeight < 520) {
            scaleFactor = 6; // Smaller size for mobile screens
        } else {
            scaleFactor = 5; // Original size for larger screens
        }

        video.size(originalWidth / scaleFactor, originalHeight / scaleFactor);
        video.volume(0);
        video.speed(1);
        video.loop();
        video.style('display', 'none');  // Hide the video element completely

        // Run resize function on first load to ensure proper sizing
        p.windowResized();

        // Create a play button for mobile devices
        playButton = p.createButton('▶ Tap to Start');
        playButton.parent('ascii-container');
        playButton.style('position', 'absolute');
        playButton.style('top', '50%');
        playButton.style('left', '50%');
        playButton.style('transform', 'translate(-50%, -50%)');
        playButton.style('z-index', '1000');
        playButton.style('padding', '10px 20px');
        playButton.style('font-size', '16px');
        playButton.style('background', 'rgba(0,0,0,0.8)');
        playButton.style('color', 'white');
        playButton.style('border', 'none');
        playButton.style('border-radius', '5px');
        playButton.style('cursor', 'pointer');

        // Initially hide the play button
        playButton.style('display', 'none');

        // Try to play the video immediately
        video.elt.play().catch(() => {
            // If autoplay fails, show the play button
            playButton.style('display', 'block');
        });

        // Handle play button click
        playButton.mousePressed(() => {
            video.elt.play().then(() => {
                playButton.style('display', 'none');
            }).catch(console.error);
        });

        // Also try to play on any user interaction with the page
        const tryPlay = () => {
            video.elt.play().then(() => {
                playButton.style('display', 'none');
                document.removeEventListener('touchstart', tryPlay);
                document.removeEventListener('click', tryPlay);
            }).catch(() => {
                playButton.style('display', 'block');
            });
        };

        document.addEventListener('touchstart', tryPlay, { once: true });
        document.addEventListener('click', tryPlay, { once: true });
    };

    // Add window resize handler to adjust video size dynamically
    p.windowResized = function () {
        let scaleFactor;
        if (p.windowWidth < 540 || p.windowHeight < 399) {
            scaleFactor = 10; // Small size for narrow screens
        } else if (p.windowWidth < 769 || p.windowHeight < 520) {
            scaleFactor = 6; // Smaller size for mobile screens
        } else {
            scaleFactor = 5; // Original size for larger screens
        }

        // Always calculate from original dimensions to avoid cumulative scaling
        video.size(originalWidth / scaleFactor, originalHeight / scaleFactor);
    };

    p.draw = function () {
        video.loadPixels();
        let asciiImage = "";
        for (let j = 0; j < video.height; j++) {
            for (let i = 0; i < video.width; i++) {
                const pixelIndex = (i + j * video.width) * 4;
                const r = video.pixels[pixelIndex + 0];
                const g = video.pixels[pixelIndex + 1];
                const b = video.pixels[pixelIndex + 2];
                const avg = (r + g + b) / 3;
                const len = density.length;
                const charIndex = p.floor(p.map(avg, 0, 255, len, 0));
                const c = density.charAt(charIndex);
                if (c == " ") {
                    asciiImage += '<span class="ascii-char">&nbsp;</span>';
                } else {
                    asciiImage += `<span class="ascii-char">${c}</span>`;
                }
            }
            asciiImage += '<br/>';
        }
        asciiDiv.html(asciiImage);
    };
});