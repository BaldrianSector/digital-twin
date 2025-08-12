// Instance mode of p5.js
new p5(function (p) {
    const density = "@#$9876543210?/!;:+=-,._      ";
    //const density = "@%#*+=-:. ";
    //const density = "'█▓▒░:.  ";
    //const density = "❦ ༊*·╰⊱♥⊱╮ೃ⁀➷    "

    let video;
    let asciiDiv;
    let originalWidth, originalHeight; // Store original video dimensions

    p.setup = function () {
        asciiDiv = p.createDiv();
        asciiDiv.parent('ascii-container');  // Make sure this div appends within a specific container
        p.noCanvas();
        video = p.createVideo(['assets/videos/animation2-cropped.mp4']);

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