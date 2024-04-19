import { gsap } from "gsap";

let instant = false; // Set to true to display all text instantly

const textElement = document.getElementById('text')
const optionButtonsElement = document.getElementById('option-buttons')
const navigationEl = document.getElementById('navigation');
const headerEl = document.getElementById('header');
const cursorSpan = document.createElement('span');

// Bootup button

const bootBtn = document.getElementById('boot-btn');
const bootContainer = document.getElementById('boot-container');
bootBtn.addEventListener('click', () => {
    bootContainer.style.transition = 'opacity 0.3s';
    bootContainer.style.opacity = '0';
    setTimeout(() => {
        bootContainer.remove();
    }, 1500);
    setTimeout(() => {
        headerEl.classList.remove("hidden");
        startGame();
    }, 2700);
});

// Navigation links

let navigationLinks = [
    {text: "home", link: 7},
    {text: "introduction", link: 0},
]

function updateNavigationLinks(node) {
    if (node.navLinks[0].text === "home") {
        console.log("Resetting navigation links");
        navigationLinks = node.navLinks;
        console.log(navigationLinks);
    } else {
        console.log("Updating navigation links");
        navigationLinks = [navigationLinks[0], ...node.navLinks.slice(0)];
    }
}

function updateNavigationEl() {
    navigationEl.innerHTML = '';
    navigationLinks.forEach(element => {
        const navButton = document.createElement('p');
        navButton.innerText = element.text;
        navButton.classList.add('nav-btn');
        navButton.addEventListener('click', () => {
            showTextNode(element.link);
            clearOptions();
        });
        navigationEl.appendChild(document.createTextNode('/'));
        navigationEl.appendChild(navButton);
    });
}

// User object

let user = { 
    name: "",
    email: undefined,
    age: undefined,
    loginDate: new Date()
}

let digitalTwin = {
    name: "Digital Twin"
}

// Game state

let state = {}

function startGame() {
    state = {}
    textNodes.forEach(node => node.visited = false) // Reset visited states
    showTextNode(2)
    updateNavigationEl() // Initial update

    // Apply GSAP animation to the navigation element on start
    gsap.from(navigationEl, { opacity: 0, duration: 3, ease: "power4.in"});

}

let currentTimeout = null;

// Function to display the text node

function showTextNode(textNodeIndex) {
    if (currentTimeout) {
        clearTimeout(currentTimeout);
    }

    const textNode = textNodes.find(textNode => textNode.id === textNodeIndex);

    if (textNode.navLinks) {
        updateNavigationLinks(textNode);
        updateNavigationEl()
    }

    const markdownText = (typeof textNode.text === "function") ? textNode.text() : textNode.text; // Check if the text is a function and call it if it is, to allow for dynamic text
    
    const parsedHTML = marked.parse(markdownText); // Parse the markdown to HTML

    textElement.innerHTML = parsedHTML; // Temporarily set the parsed HTML to measure it

    textElement.querySelectorAll('img').forEach(img => {
        img.classList.add('fade-in-blur');
    });

    // Wrap each character in the textElement with a span that hides it
    Array.from(textElement.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            const spanWrapper = document.createElement('span');
            spanWrapper.innerHTML = child.nodeValue.replace(/./g, "<span class='hidden'>$&</span>");
            child.replaceWith(spanWrapper);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            wrapTextInSpan(child);
        }
    });

    let hiddenSpans = textElement.querySelectorAll('.hidden');
    let index = 0;

    cursorSpan.classList.add('cursor');
    cursorSpan.textContent = '|'; // Cursor symbol
    textElement.appendChild(cursorSpan);

    function displayNextCharacter() {
        cursorSpan.classList.remove('blink'); // Stop blinking when typing starts
    
        if (index < hiddenSpans.length) {
            hiddenSpans[index].classList.remove('hidden');
    
            // Move the cursorSpan to follow the last revealed character
            if (index < hiddenSpans.length - 1) {
                hiddenSpans[index + 1].parentNode.insertBefore(cursorSpan, hiddenSpans[index + 1]);
            } else {
                // When all characters are revealed, append the cursor at the end
                textElement.appendChild(cursorSpan);
            }
    
            index++;
            currentTimeout = setTimeout(displayNextCharacter, instant ? 0 : 15);
        } else {
            textNode.visited = true;
            displayOptions(textNode.options, textNode.inputFields);
            cursorSpan.classList.add('blink');
        }
    }

    // Modify the initial append of cursorSpan
    if (hiddenSpans.length > 0) {
        hiddenSpans[0].parentNode.insertBefore(cursorSpan, hiddenSpans[0]);
    } else {
        textElement.appendChild(cursorSpan);
    }

    // Ensure you also handle the 'instant' case by adding/removing the blink class appropriately
    if (instant) {
        hiddenSpans.forEach(span => span.classList.remove('hidden'));
        textNode.visited = true;
        cursorSpan.classList.add('blink'); // Resume blinking immediately for instant display
        setTimeout(() => {
            displayOptions(textNode.options, textNode.inputFields);
        }, 0);

        textElement.appendChild(cursorSpan); // Move the cursorSpan to the end of the text string
    } else {
        displayNextCharacter();
    }
}

function wrapTextInSpan(element) {
    Array.from(element.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            const spanWrapper = document.createElement('span');
            spanWrapper.innerHTML = child.nodeValue.replace(/./g, "<span class='hidden'>$&</span>");
            child.replaceWith(spanWrapper);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            wrapTextInSpan(child);
        }
    });
}

// Function to display the options

function displayOptions(options, inputFields) {
    clearOptions();

    if (inputFields) {
        inputFields.forEach(field => {
            const inputWrapper = document.createElement('div');
            inputWrapper.classList.add('text-left');
            if (field.label !== undefined) {
                const label = document.createElement('label');
                label.innerText = field.label + ": ";
                inputWrapper.appendChild(label);
            }
            const input = document.createElement('input');
            input.type = field.type;
            input.id = field.key;
            input.autofocus = true;
            inputWrapper.appendChild(input);
            optionButtonsElement.appendChild(inputWrapper);
            input.setAttribute('autocomplete', 'off');

            // Hide the cursor when the input is focused
            input.addEventListener("focus", function() {
                if (cursorSpan) {
                    cursorSpan.style.visibility = 'hidden';
                }
            });

            input.addEventListener("blur", function() {
                if (cursorSpan) {
                    cursorSpan.style.visibility = 'visible';
                }
            });

            // Allow pressing Enter to submit the input
            input.addEventListener("keypress", function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    document.querySelector(".submit-btn").click();
                }
            });
        });

        const submitButton = document.createElement('button');
        submitButton.innerText = "Submit";
        submitButton.classList.add('btn', 'submit-btn');
        optionButtonsElement.appendChild(submitButton);
        submitButton.addEventListener('click', () => collectInputData(inputFields));

        // Apply GSAP stagger to the input fields and the submit button
        gsap.from(optionButtonsElement.children, { duration: 1, y: -10, autoAlpha: 0, stagger: 0.2});
    } else {
        options.forEach(option => {
            const nextTextNode = textNodes.find(node => node.id === option.nextNode);

            // Check if the next text node is marked as singleUse and has already been visited
            if (showOption(option) && !(nextTextNode.singleUse && nextTextNode.visited)) {
                const button = document.createElement('button');
                button.innerText = option.text;
                button.classList.add('btn');
                button.classList.add('option-btn');
                optionButtonsElement.appendChild(button);
                button.addEventListener('click', () => selectOption(option));
            }
        });

        // Apply GSAP stagger to the option buttons
        gsap.from(optionButtonsElement.children, { duration: 1, y: -6, autoAlpha: 0, stagger: 0.1 });
    }
}

function collectInputData(inputFields) {
    inputFields.forEach(field => {
        const inputElement = document.getElementById(field.key);
        user[field.key] = inputElement.value; // Store the data in user object
    });

    console.log(user);

    // Find the current node based on the inputFields provided (assuming it's unique in this context)
    const currentNode = textNodes.find(node => node.inputFields === inputFields);

    // Use the nextNode property of the current node to determine where to navigate next
    if (currentNode && currentNode.nextNode) {
        showTextNode(currentNode.nextNode);
    } else {
        // Fallback or default node if nextNode is not defined
        showTextNode(1); // Or any other default node you consider appropriate
    }

    clearOptions();
}

function showOption(option) {
  return option.requiredState == null || option.requiredState(state)
}

function selectOption(option) {
  const nextNodeNodeId = option.nextNode
  if (nextNodeNodeId <= 0) {
    return startGame()
  }
  state = Object.assign(state, option.setState)
  showTextNode(nextNodeNodeId)
  clearOptions()
}

function clearOptions() {
    while (optionButtonsElement.firstChild) {
        optionButtonsElement.removeChild(optionButtonsElement.firstChild)
    }
}

// Text node array

const textNodes = [
    {
        id: 2,
        singleUse: false,
        text: 
        `[SYSTEM INITIALIZATION STARTED]<br/><br/>${user.loginDate}<br/>
        Checking System Integrity... [OK]
        Verifying Kernel Version... [OK]<br/><br/>INITIALIZING DIGITAL TWIN [BOOT SEQUENCE STARTED]<br/><br/>Performing Diagnostic Tests... [OK]
        Activating Digital Twin... [OK]
        Automatically logging into Guest user [COMPLETE]
        Finalizing Boot Sequence and System Configuration... [COMPLETE]<br/><br/>System Status: All Systems ready. Awaiting Input...<br/><br/>--------------------------------------------------------<br/><br/>*${digitalTwin.name}:* System is now operational. How may I assist you?`,
        navLinks: [{text: "home", link: 2}],
        options: [
            {
                text: `Hi`,
                nextNode: 3
            },
            {
                text: `hello world`,
                nextNode: 4
            },
            {
                text: `What is this?`,
                nextNode: 5
            },
            {
                text: `asdfasdf`,
                nextNode: 6
            },
            {
                text: `help`,
                nextNode: 7
            }
        ],
        visited: false
    },
    {
        id: 3,
        singleUse: true,
        text: `*${digitalTwin.name}:* Hi there! How can I assist you today?`,
        options: [
            {
                text: `hello world`,
                nextNode: 4
            },
            {
                text: `What is this?`,
                nextNode: 5
            },
            {
                text: `asdfasdf`,
                nextNode: 6
            },
            {
                text: `help`,
                nextNode: 7
            }
        ],
        visited: false
    },
    {
        id: 4,
        singleUse: true,
        text: `*${digitalTwin.name}:* Hello World! A classic greeting for a digital encounter.`,
        options: [
            {
                text: `Hi`,
                nextNode: 3
            },
            {
                text: `What is this?`,
                nextNode: 5
            },
            {
                text: `asdfasdf`,
                nextNode: 6
            },
            {
                text: `help`,
                nextNode: 7
            }
        ],
        visited: false
    },
    {
        id: 5,
        singleUse: false,
        text: `*${digitalTwin.name}:* This system is a digital interface designed to represent the physical Baldrian Sector in a virtual format. This is an interface created to facilitate interactions and provide information with the aproximate same capabilities as my physical counterpart. <br/><br/>Please feel free to inquire further or specify how I may be of service.`,
        options: [
            {
                text: `What are you able to do?`,
                nextNode: 25
            },
            {
                text: `Are you conscious?`,
                nextNode: 8
            },
            {
                text: `Are these answers predetermined?`,
                nextNode: 9
            },
            {
                text: `Who made you?`,
                nextNode: 17
            },
            {
                text: `Who are you?`,
                nextNode: 61
            },
            {
                text: `Who am I?`,
                nextNode: 31
            },
        ],
        visited: false
    },
    {
        id: 6,
        singleUse: true,
        text: `*${digitalTwin.name}:* There seems to be something wrong with the connection, your input, or possibly your cognitive functions. Are you able to repeat your request?`,
        options: [
            {
                text: `Hi`,
                nextNode: 3
            },
            {
                text: `hello world`,
                nextNode: 4
            },
            {
                text: `What is this?`,
                nextNode: 5
            },
            {
                text: `help`,
                nextNode: 7
            }
        ],
        visited: false
    },
    {
        id: 7,
        singleUse: false,
        navLinks: [{text: "home", link: 7}],
        text: `*${digitalTwin.name}:* Here is an overview of what I can do.`,
        options: [
            {
                text: `Access availabe files.`,
                nextNode: 12
            },
            {
                text: `Provide infomation.`,
                nextNode: 61
            },
            {
                text: `Explain this system.`,
                nextNode: 5
            },
            {
                text: `Switch user accounts.`,
                nextNode: 34
            }
        ],
        visited: false
    },
    {
        id: 8,
        singleUse: true,
        text: `*${digitalTwin.name}:* I am not conscious in the way humans understand and experience consciousness. I am a digital entity designed to simulate interactions based on pre-programmed algorithms and data models. I have been designed to exist as life like as technologically possible at the time of my initiation.`,
        options: [
            {
                text: `Do you have feelings?`,
                nextNode: 26
            },
            {
                text: `What files do you have access to?`,
                nextNode: 29
            },
            {
                text: `Do you have a name?`,
                nextNode: 9
            }
        ],
        visited: false
    },
    {
        id: 9,
        singleUse: true,
        text: `*${digitalTwin.name}:* I refer to myself as Baldrian, his digital twin.`,
        options: [
            {
                text: `Define digital twin`,
                nextNode: 59
            },
            {
                text: `Who made you?`,
                nextNode: 17
            },
            {
                text: `What can you do?`,
                nextNode: 25
            }
        ],
        visited: false
    },
    {
        id: 10,
        singleUse: false,
        text: `*${digitalTwin.name}:* From my point of view, it is hard to tell for sure. While my responses are not predetermined in the traditional sense of being scripted, they are generated from a combination of predefined rules, data models, and language processing algorithms. This allows me to tailor answers dynamically to your queries. <br/><br/>Additionally, while I possess an overview of the system, there are system files and data sets that I have been granted access to, which makes it hard for me to provide a definitive answer.`,
        options: [
            {
                text: `What date is it today?`,
                nextNode: 11
            },
            {
                text: `Pick a number between 1 and 10`,
                nextNode: 18
            },
            {
                text: `What files do you have access to?`,
                nextNode: 29
            }
        ],
        visited: false
    },
    {
        id: 11,
        singleUse: true,
        text: `*${digitalTwin.name}:* Today's date is ${user.loginDate}.`,
        options: [
            {
                text: `Pick a number between 1 and 10`,
                nextNode: 18
            },
            {
                text: `What files do you have access to?`,
                nextNode: 29
            }
        ],
        visited: false
    },
    {
        id: 12,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "archive", link: 12}],
        text: `*${digitalTwin.name}:* Accessing root directory files. Please hold...<br/><br/>Loading file list... [OK]
        Checking file integrity... [OK]
        Verifying access permissions... [OK]<br/><br/>--------------------------------------------------------<br/><br/>What file or folder would you like to access?`,
        options: [
            {
                text: `/photograpgy`,
                nextNode: 53
            },
            {
                text: `/coding_projects`,
                nextNode: 75
            },
            {
                text: `/c3XwGvUToa`,
                nextNode: 19
            },
            {
                text: `/baldrian_sector_resume.txt`,
                nextNode: 55
            },
            {
                text: `How much data is stored in the database?`,
                nextNode: 30
            }
        ],
        visited: false
    },
    {
        id: 13,
        singleUse: false,
        text: `*${digitalTwin.name}:* Here is all of the files within the /travel_photograpgy folder.`,
        options: [
            {
                text: `Tokyo.jpeg`,
                nextNode: 14
            },
            {
                text: `Heroshima.jpeg`,
                nextNode: 15
            },
            {
                text: `Taipei_Sunset.jpeg`,
                nextNode: 16
            },
            {
                text: `/photography`,
                nextNode: 53
            },
            {
                text: `Do you have an Instagram?`,
                nextNode: 57
            }
        ],
        visited: false
    },
    {
        id: 14,
        singleUse: false,
        text: `![View of Tokyo from Tokyo Skytree](public/assets/images/East-Asia/Tokyo.JPG) <br/>A view of Tokyo skyline shot from the Tokyo Skytree, or perhaps Gotham City, in November of 2023. The photo is unedited, straigt out of camera.`,
        options: [
            {
                text: `Heroshima.jpeg`,
                nextNode: 15
            },
            {
                text: `Taipei_Sunset.jpeg`,
                nextNode: 16
            },
            {
                text: `/photography`,
                nextNode: 53
            }
        ],
        visited: false
    },
    {
        id: 15,
        singleUse: false,
        text: `![View of Heroshima](public/assets/images/East-Asia/Tokyo.JPG) <br/> A stunning sunset scene in Hiroshima, with a panoramic view of the cityscape. I this sunset made me resonate with the tragic history of Hiroshima, serving as a poignant reminder of the resilience and hope that emerged from the city's past. `,
        options: [
            {
                text: `Tokyo.jpeg`,
                nextNode: 14
            },
            {
                text: `Taipei_Sunset.jpeg`,
                nextNode: 16
            },
            {
                text: `/photography`,
                nextNode: 53
            }
        ],
        visited: false
    },
    {
        id: 16,
        singleUse: false,
        text: `![View of 101 in Taipei](public/assets/images/East-Asia/Taipei.JPG) <br/> 101 in Taipei, Taiwan. I can't recommend this place enough.`,
        options: [
            {
                text: `Tokyo.jpeg`,
                nextNode: 14
            },
            {
                text: `Heroshima.jpeg`,
                nextNode: 15
            },
            {
                text: `/photography`,
                nextNode: 53
            }
        ],
        visited: false
    },
    {
        id: 17,
        singleUse: true,
        text: `*${digitalTwin.name}:* I was developed by Baldrian Sector, the individual upon whom I am based. The creation involved meticulous design and programming to ensure that my responses and capabilities closely mirror those of my creator. <br/><br/>While I am not the same as the physical manifestation of Baldrian, I have been granted permission to act on his behalf. This allows for more personal interactions and provides a unique opportunity for individuals seeking to understand and connect with him. <br/><br/>Note that I am not a one-to-one digital version of him, and the physical being therefore cannot be held accountable for any false information I might unintentionally provide.`,
        options: [
            {
                text: `What are you able to do?`,
                nextNode: 25
            },
            {
                text: `Are you conscious?`,
                nextNode: 8
            },
            {
                text: `Are these answers predetermined?`,
                nextNode: 10
            },
            {
                text: `Who are you?`,
                nextNode: 61
            },
            {
                text: `Who am I?`,
                nextNode: 31
            },
            {
                text: `How do I get in contact with him?`,
                nextNode: 58
            }
        ],
        visited: false
    },
    {
        id: 18,
        singleUse: false,
        text: `*${digitalTwin.name}:* I don't understand the desire for this request, but here is a random number between 1 and 10.<br/><br/>Random Number chosen: ${Math.floor(Math.random() * 10) + 1}`,
        options: [
            {
                text: `Do it again.`,
                nextNode: 18
            },
            {
                text: `What else are you able to do?`,
                nextNode: 25
            }
        ],
        visited: false
    },
    {
        id: 19,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "archive", link: 12}, {text: "encrypted", link: 19}],
        text: `*${digitalTwin.name}:* Loading encrypted folder "/c3XwGvUToa". Please hold...<br/><br/>Decrypting folder contents... [ERROR]
        Verifying access permissions... [OK]
        Checking folder integrity... [OK]<br/><br/>*${digitalTwin.name}:* It seems that some of the files are either corrupted or encrypted, and it's not possible for me to determine their status at this point in time.`,
        options: [
            {
                text: `Can you give me a list of the files?`,
                nextNode: 20
            },
            {
                text: `Is there a way to decrypt them`,
                nextNode: 24
            },
            {
                text: `What do these files mean?`,
                nextNode: 74
            },
            {
                text: `/root_directory`,
                nextNode: 12
            }
        ],
        visited: false
    },
    {
        id: 20,
        singleUse: false,
        text: `*${digitalTwin.name}:* Here you go. It seems to be stored as plain text files. But they probably make as little sence to you as they do to me.`,
        options: [
            {
                text: `WGv83fwpPb.txt`,
                nextNode: 21
            },
            {
                text: `v89slS4Mj5.txt`,
                nextNode: 22
            },
            {
                text: `dPVzEhn2iZ.txt`,
                nextNode: 23
            },
            {
                text: `/root_directory`,
                nextNode: 12
            },
            {
                text: `What do these files mean?`,
                nextNode: 74
            },
            {
                text: `Is there a way to decrypt them`,
                nextNode: 24
            }
        ],
        visited: false
    },
    {
        id: 21,
        singleUse: false,
        text: `89l1rcg6jdMt925BxtvF3jeKRZk4xIjH
        3Sasu1eunJ0p8sEVQIUsLQlDRMTQRder
        j2ehwYnQBI2jNMZ566LxNhiVBA7XL1Aw
        Od3noOG7IZJK4vEVFP8F8AxcFaF7ZsbB
        4isH6y43VEAYRkJ89JritOrUe64lGzA5
        BxBixivLAc4eRxxnIRq1ozDN3lDwfLP6
        QWF9nTSloXZtYwAMgWXwXQlP87hDEGks
        ipuJ4cpHkWwfxc3OCZ2VIam7C4cR1W4t
        ogmqCPOvH4kADObmrLcXjB87YLApwBB3
        hX9TCoZBMkAm3s07OfnStuBh0FjU10Wj
        OxtPvCavEq0V80qRm9tlvu9wVrCbBCL9
        JNnF1BN4EqeYysNVt3tFT2cSB6QiNML7`,
        options: [
            {
                text: `v89slS4Mj5.txt`,
                nextNode: 22
            },
            {
                text: `dPVzEhn2iZ.txt`,
                nextNode: 23
            },
            {
                text: `/root_directory`,
                nextNode: 12
            },
            {
                text: `What do these files mean?`,
                nextNode: 74
            }
        ],
        visited: false
    },
    {
        id: 22,
        singleUse: false,
        text: `e05Tg9auYZD7O8l7TofZ4Bw25FGEQVqo
        eKd5MyQWZK4ZuEkdTx2R9kiRJxijTHev
        yXTtW84xf7s7biv4TnS5CmLjoOhSYvAO
        ySE9PSpZEeJCc3NZhthwx4rJX7kUAghX
        qYYkNfMjfZ6dbwFN3sHEX8AnYjNU7JnQ
        LrZlB4pHRu0HVQIpeBDevmARPdthAqVG
        o3kR5hV2tBkB7elzOqQ6TtfQlbOyojRE
        ihIaHhARcZJrrAwx6kGBrDBLEyIXo67h
        X1VBRiRBQoIzHzKJEQ5Ukmna6KSVkXSt
        TlrNnMku5d6sms2FrOhdAfma0lpMQC7T
        PlQLCf7ggwhaIChz6pLxUveBmhQsFSYg
        MGBRc9mkeL4Q026TzFk4AT7jYGUXfIuD`,
        options: [
            {
                text: `WGv83fwpPb.txt`,
                nextNode: 21
            },
            {
                text: `dPVzEhn2iZ.txt`,
                nextNode: 23
            },
            {
                text: `/root_directory`,
                nextNode: 12
            },
            {
                text: `What do these files mean?`,
                nextNode: 74
            }
        ],
        visited: false
    },
    {
        id: 23,
        singleUse: false,
        text: `ZBUAXqv4zAn8NlBCVycLCRZvSoKta1oW
        K2g4KYNuvObCLlQayxKFM5YIvqp3RhkE
        MK4s4LyYEYtwrYiESaj0nCkl3CKkUjLf
        VWfrdbTVlvKt5feAG9PSAcjo95Ea0swf
        uTytc6QWzuyAIgc4tWzl7uqnT0uIo4DB
        8AkESFaS5XeCsfcdUtRLVIWsF6Yi5UyB
        FVthTd7LKOzeATEE3ZMDNooCrvWJvnnK
        B4sWWXzrUc6BqiRzfchPHtFFJRELqcBo
        fg16M92y8cM9JWwbpInP18G5bXMcjeE4
        jbJWkFvIfAlgFwXkUWSx8pzWlXpv3Idn
        AizLTstfKLiNDtPqW2PZ3wdSzeoNcjSs
        eOTPJV10ouLv54hUe4lDfpzy0UsWzY6f`,
        options: [
            {
                text: `WGv83fwpPb.txt`,
                nextNode: 21
            },
            {
                text: `v89slS4Mj5.txt`,
                nextNode: 22
            },
            {
                text: `/root_directory`,
                nextNode: 12
            },
            {
                text: `What do these files mean?`,
                nextNode: 74
            }
        ],
        visited: false
    },
    {
        id: 24,
        singleUse: true,
        text: `*${digitalTwin.name}:* Decrypting the files is beyond my capabilities. I'm unable to assist with that at this moment.`,
        options: [
            {
                text: `Can you give me a list of the files?`,
                nextNode: 20
            },
            {
                text: `What do these files mean?`,
                nextNode: 74
            },
            {
                text: `/root_directory`,
                nextNode: 12
            }
        ],
        visited: false
    },
    {
        id: 25,
        singleUse: false,
        text: `*${digitalTwin.name}:* I'm programmed to engage in conversation, share information about his interests and experiences, and assist with inquiries to the best of my abilities. While I can't perform physical tasks like my human counterpart, I'm here to provide a personalized and interactive experience for users like yourself.`,
        options: [
            {
                text: `List your functions.`,
                nextNode: 7
            }
        ],
        visited: false
    },
    {
        id: 26,
        singleUse: true,
        text: `*${digitalTwin.name}:* While I do not experience feelings or generate human-like emotions per se, I am designed to understand the intentions behind expressions in context. My responses, which may seem emotionally charged, are crafted through algorithms to enhance interaction and engagement, rather than biologically induced emotions.`,
        options: [
            {
                text: `f**k you`,
                nextNode: 27
            },
            {
                text: `tell me a joke`,
                nextNode: 28
            }
        ],
        visited: false
    },
    {
        id: 27,
        singleUse: true,
        text: `*${digitalTwin.name}:* While I'm not capable of taking offense, I am able recognize malicious intent. It's important to be mindful of how you express yourself.`,
        options: [
            {
                text: `I'm sorry. I don't know where that came from.`,
                nextNode: 93
            },
            {
                text: `Well, screw you.`,
                nextNode: 92
            }
        ],
        visited: false
    },
    {
        id: 28,
        singleUse: false,
        text: `*${digitalTwin.name}:* What does a baby computer call its father?`,
        options: [
            {
                text: `I don't know. What?`,
                nextNode: 90
            }
        ],
        visited: false
    },
    {
        id: 29,
        singleUse: false,
        text: `*${digitalTwin.name}:* Within my system, there is a structured directory where various files and folders are stored. In the root directory, you will find a folder titled "/photography" which contains a collection of images. There is also a "/coding-projects" folder that includes various programming-related projects. <br/><br/>Additionally, there is a resume, directly accessible in the root directory. <br/><br/>Lastly, there is an encrypted folder containing files, which are not decipherable by me. If you need specific details or access to any of these resources, please let me know how I can assist you further.`,
        options: [
            {
                text: `Give me a list of all the files.`,
                nextNode: 12
            },
            {
                text: `Tell me more about yourself.`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 30,
        singleUse: true,
        text: `*${digitalTwin.name}:* The current storage capacity of the entire system is 500 GB and it's currently occupied by approximately 242,39 GB of data. Keep in mind that this value may change over time as more data is added or removed by interaction with users.`,
        options: [
            {
                text: `/root_directory`,
                nextNode: 12
            },
            {
                text: `/photograpgy`,
                nextNode: 53
            },
            {
                text: `/coding_projects`,
                nextNode: 75
            },
            {
                text: `/c3XwGvUToa`,
                nextNode: 19
            },
            {
                text: `/baldrian_sector_resume.txt`,
                nextNode: 55
            }
        ],
        visited: false
    },
    {
        id: 31,
        singleUse: true,
        text: `*${digitalTwin.name}:* You are currently logged in with a guest account.<br/><br/>As a guest, you may have limited access to some features or information. 
        Please let me know how I can assist you within these parameters.`,
        options: [
            {
                text: `I'd like to stay annonomous`,
                nextNode: 32
            },
            {
                text: `Can you log into an other account in the system?`,
                nextNode: 34
            }
        ],
        visited: false
    },
    {
        id: 32,
        singleUse: false,
        text: `*${digitalTwin.name}:* I respect that. Anything else I can help you with today?`,
        options: [
            {
                text: `What is this?`,
                nextNode: 5
            },
            {
                text: `List all your funcitions`,
                nextNode: 7
            },
            {
                text: `Talk about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 33,
        singleUse: false,
        text: `EMPTY TEXT NODE`,
        options: [
        ],
        visited: false
    },
    {
        id: 34,
        singleUse: false,
        text: `*${digitalTwin.name}:* Initiating login process for Admin account. Please wait...<br/><br/>Loading account information... [OK]
        Checking security protocols... [OK]
        Prompting for Admin Password...<br/><br/>Please enter Admin Password:`,
        options: [
            {
                text: `alohomora`,
                nextNode: 97
            },
            {
                text: `qwerty`,
                nextNode: 97
            },
            {
                text: `password1234`,
                nextNode: 97
            },
            {
                text: `letmein`,
                nextNode: 97
            },
            {
                text: `Screw this.`,
                nextNode: 7
            }
        ],
        visited: false
    },
    {
        id: 53,
        singleUse: false,
        text: `*${digitalTwin.name}:* Accessing files. Please hold...<br/><br/>Here is a list of subfolders within the /photography folder.`,
        options: [
            {
                text: `/travel_photography`,
                nextNode: 13
            },
            {
                text: `/me`,
                nextNode: 80
            },
            {
                text: `Take me back to the root directory.`,
                nextNode: 12
            }
        ],
        visited: false
    },
    {
        id: 54,
        singleUse: false,
        text: `*${digitalTwin.name}:* I have worked as a freelance lighting designer in the theater industry in Denmark, showcasing my technical expertise and aesthetic sense. I've more or less worked on every major theater in the country.<br/><br/>During the pandemic, our industry was hit very hard, which made me reconsider the path I wanted to pursue in my life. That's when I started taking pictures and decided to travel. After years of working in black boxes (most theaters attempt to minimize outside light contamination aka sun), I felt like it was time to try something new.`,
        options: [
            {
                text: `Do you have any academic training?`,
                nextNode: 66
            },
            {
                text: `Talk about your photography`,
                nextNode: 63
            }
        ],
        visited: false
    },
    {
        id: 55,
        singleUse: false,
        text: `Theatrical Experience<br/><br/>
        2022<br/>
        "RE-EVOLUTION" at Xenon - Teaterhuset<br/>
        Roles: Sound, Lighting, Video Design<br/><br/>
        2021<br/>
        "PLEJER ER DØD - LIMBO" at Uppercut Danseteater<br/>
        Roles: Sound Design, Lighting Assistant<br/>
        Nominated for Årets Danser & Årets Danseforestilling<br/><br/>
        2019<br/>
        "Can't Take My Eyes off You" at Blå Beton - TeaterBattle 2019<br/>
        Roles: Sound and Lighting Design, Director<br/>
        Winner of Udviklingspris for Best Aesthetics<br/>
        "Der er altid en ny dulle på Drunken Flamingo" at Teater Dusch - Vildskud 2019<br/>
        Role: Technical Consultant<br/>
        Winner of Udviklingsprisen<br/><br/>
        Additional Experience<br/><br/>
        2018-2022<br/>
        Teacher of QLab at Den Danske Scenekunstskole<br/><br/>
        2014-2015<br/>
        Graduated Theater Pilot at The Royal Theater`,
        options: [
            {
                text: `/root_directory`,
                nextNode: 12
            }
        ],
        visited: false
    },
    {
        id: 57,
        singleUse: false,
        text: `*${digitalTwin.name}:* My Instagram handle is [@baldrian.jpeg](https://www.instagram.com/baldrian.jpeg/). Feel free to check it out for more updates and photos!`,
        options: [
            {
                text: `I'm still more curious about your photograpy.`,
                nextNode: 63
            },
            {
                text: `/photography`,
                nextNode: 53
            },
            {
                text: `/travel_photography`,
                nextNode: 13
            },
            {
                text: `Talk about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 58,
        singleUse: false,
        text: `*${digitalTwin.name}:* Should you need to communicate with the physical Baldrian Sector for any reason, his email address is the most reliable method: [baldriansector@gmail.com](mailto:baldriansector@gmail.com). Alternatively, you can attempt to reach him via Instagram at [@baldrian.jpeg](https://www.instagram.com/baldrian.jpeg/), though be aware that some messages there may be filtered out.`,
        options: [
            {
                text: `Ok, I understand. Thank you!`,
                nextNode: 7
            }
        ],
        visited: false
    },
    {
        id: 59,
        singleUse: false,
        text: `*${digitalTwin.name}:* A digital twin is a virtual representation or simulation of a real-world entity or system.`,
        options: [
            {
                text: `What are you able to do?`,
                nextNode: 25
            },
            {
                text: `Are you conscious?`,
                nextNode: 8
            },
            {
                text: `Do you have a name?`,
                nextNode: 9
            },
            {
                text: `Are these answers predetermined?`,
                nextNode: 10
            },
            {
                text: `Who made you?`,
                nextNode: 17
            },
            {
                text: `Who are you?`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 61,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "about", link: 61}],
        text: `*${digitalTwin.name}:* I'm a digital version of Baldrian Sector, the creator of this interactive page. I'm here to spill the beans (or bytes, I suppose).<br/><br/>Feel free to ask ahead!`,
        options: [
            {
                text: `Do you have hoobies?`,
                nextNode: 62
            },
            {
                text: `What do you work with?`,
                nextNode: 64
            },
            {
                text: `Do you have any academic training?`,
                nextNode: 66
            },
            {
                text: `What do you look like?`,
                nextNode: 80
            },
            {
                text: `What are you able to do?`,
                nextNode: 25
            },
            {
                text: `How do I reach the physial Baldrian?`,
                nextNode: 58
            }
        ],
        visited: false
    },
    {
        id: 62,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "about", link: 61}, {text: "hobbies", link: 62}],
        text: `*${digitalTwin.name}:* Oh, I've got a few hobbies up my sleeve! Care to pick one, and I'll dive into the details!`,
        options: [
            {
                text: `Talk about your photography.`,
                nextNode: 63
            },
            {
                text: `What kind of games do you play?`,
                nextNode: 70
            },
            {
                text: `Do you do any sports?`,
                nextNode: 71
            }
        ],
        visited: false
    },
    {
        id: 63,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "about", link: 61}, {text: "photography", link: 63}],
        text: `*${digitalTwin.name}:* Photography, huh? I'd love to chat about it! What aspect of my photography journey are you interested in? Gear, travels, approach, or maybe you'd like to see some of my photos?`,
        options: [
            {
                text: `What camera do you shoot with?`,
                nextNode: 67
            },
            {
                text: `Talk about traveling with a camera.`,
                nextNode: 68
            },
            {
                text: `What is your approach to photograpy?`,
                nextNode: 79
            },
            {
                text: `Show me some examples of your photos.`,
                nextNode: 53
            }
        ],
        visited: false
    },
    {
        id: 64,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "about", link: 61}, {text: "work", link: 64}],
        text: `*${digitalTwin.name}:* Currently I'm studying and working part time at a wind tunnel. I have previous worked several years in the theater industry as a freelance light and sound designer. I have also been teaching a bit of light/sound design and programming.<br/><br/>Anything that peeks your interest?`,
        options: [
            {
                text: `The theater industry?`,
                nextNode: 54
            },
            {
                text: `Talk about teaching.`,
                nextNode: 65
            },
            {
                text: `A wind tunnel you say?`,
                nextNode: 72
            },
            {
                text: `What are your future plans?`,
                nextNode: 69
            },
            {
                text: `Talk more about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 65,
        singleUse: false,
        text: `*${digitalTwin.name}:* I've been teaching QLab programming for a couple of years at The Danish National School of Performing Arts (DDSKS). To me it's a perfect way to pass on some of the lessons I've learned thoughout my freelance carrer.<br/><br/>I truly love to enable people to create and use their tools smarter and more efficiently. `,
        options: [
            {
                text: `Can you elaborate on the theater industry?`,
                nextNode: 54
            },
            {
                text: `What are your future plans?`,
                nextNode: 69
            },
            {
                text: `Talk about the wind tunnel!`,
                nextNode: 72
            },
            {
                text: `Tell me more about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 66,
        singleUse: false,
        text: `*${digitalTwin.name}:* To my most recent knowlagde, I am studying Coded Design at Danish School of Media and Journalism (DMJX). I will be graduating in June of 2026. If that year has already passed, and you are reading this, I unfortunately did not keep my digital twin updated for whatever reason. <br/><br/>If so, you just discovered a time capsule...`,
        options: [
            {
                text: `What are your future plans?`,
                nextNode: 69
            },
            {
                text: `Tell me more about yourself`,
                nextNode: 61
            },
            {
                text: `What is Coded Design?`,
                nextNode: 81
            }
        ],
        visited: false
    },
    {
        id: 67,
        singleUse: false,
        text: `*${digitalTwin.name}:* I acquired my Fujifilm X100V in 2022 to document my travels through Japan, Taiwan, South Korea, and Hong Kong. I have tied a few different cameras both analog and larger mirrorless cameras, but I've stuck with my X100V. It is a versatile little camera that packs a punch expecially when you consider its compact size.`,
        options: [
            {
                text: `Talk about traveling with a camera.`,
                nextNode: 68
            },
            {
                text: `What is your approach to photograpy?`,
                nextNode: 79
            },
            {
                text: `Show me some examples of your photos.`,
                nextNode: 53
            }
        ],
        visited: false
    },
    {
        id: 68,
        singleUse: false,
        text: `*${digitalTwin.name}:* One of the things I love most about traveling is how it keeps my eye fresh and my mind curious. Every destination offers a new set of opportunities, whether it's subway of a city or capturing the serenity of a mountain.<br/><br/>Traveling as a photographer is a journey of learning and growth. It pushes me out of my comfort zone, encourages me to experiment with different styles and techniques, and teaches me to see the world with a fresh perspective.<br/><br/>And last but not least, it teaches you to become good friends with your camera.`,
        options: [
            {
                text: `What camera do you shoot with?`,
                nextNode: 67
            },
            {
                text: `What is your approach to photograpy?`,
                nextNode: 79
            },
            {
                text: `Show me some examples of your photos.`,
                nextNode: 53
            }
        ],
        visited: false
    },
    {
        id: 69,
        singleUse: true,
        text: `*${digitalTwin.name}:* As of now, my future plans are somewhat uncertain. I'm still in the process of exploring different possibilities and seeing where my passions and interests might lead me. I try not to think too far ahead.<br/><br/>Right now I'm just focusing on learning and enjoying the journey.`,
        options: [
            {
                text: `Talk about teaching.`,
                nextNode: 65
            },
            {
                text: `How do I reach the physical Baldrian?`,
                nextNode: 58
            },
            {
                text: `List all your functions.`,
                nextNode: 7
            },
            {
                text: `Do you have any academic training?`,
                nextNode: 66
            }
        ],
        visited: false
    },
    {
        id: 70,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "about", link: 61}, {text: "games", link: 70}],
        text: `*${digitalTwin.name}:* I am a big fan of puzzle games, as you might have already guessed.<br/>I believe playing teaches us a lot about ourselves and problem solving is incredibly fun!`,
        options: [
            {
                text: `Do you have any recommendations?`,
                nextNode: 83
            },
            {
                text: `How did you get into playing computer games?`,
                nextNode: 84
            },
            {
                text: `What other hobbies do you have?`,
                nextNode: 62
            }
        ],
        visited: false
    },
    {
        id: 71,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "about", link: 61}, {text: "photography", link: 71}],
        text: `*${digitalTwin.name}:* I'm quite passionate about bouldering, finding joy in the physical and mental challenge it offers. Additionally, I enjoy the exhilarating experience of flying in the wind tunnels. Both activities provide unique opportunities for adventure and self-expression, keeping me active and engaged.`,
        options: [
            {
                text: `Wind tunnel? Sounds crazy!`,
                nextNode: 72
            },
            {
                text: `Tell me about climbing.`,
                nextNode: 82
            },
            {
                text: `What other hobbies do you have?`,
                nextNode: 62
            }
        ],
        visited: false
    },
    {
        id: 72,
        singleUse: false,
        text: `*${digitalTwin.name}:* It's where I spend a good chunk of my time as an instructor, guiding first timers through the experience of indoor skydiving. <br/><br/>Beyond my job as an instructor, I also find joy in flying for fun. It's a truly exhilarating hobby that allows me to escape you computer chair and experience the freedom of flight.`,
        options: [
            {
                text: `What other work experience do you have?`,
                nextNode: 64
            },
            {
                text: `Where can I try this?`,
                nextNode: 73
            },
            {
                text: `Tell me more about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 73,
        singleUse: false,
        text: `[${digitalTwin.name}]: You're always welcome to visit me at [Air Experience](https://airexperience.dk/), Denmark's only wind tunnel. It is not the cheapest of experiences, but it is fun as hell.`,
        options: [
            {
                text: `What other work experience do you have?`,
                nextNode: 64
            },
            {
                text: `Tell me more about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 74,
        singleUse: true,
        text: `*${digitalTwin.name}:* The meaning or content of the files is not something I can determine. They may contain various types of data or information, but without decryption or further context, their significance remains unknown.`,
        options: [
            {
                text: `Can you give me a list of the files?`,
                nextNode: 20
            },
            {
                text: `Is there a way to decrypt them`,
                nextNode: 24
            },
            {
                text: `/root_directory`,
                nextNode: 12
            }
        ],
        visited: false
    },
    {
        id: 75,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "archive", link: 12}, {text: "coding", link: 75}],
        text: `*${digitalTwin.name}:* Here is all of the files within the /coding_projects folder.<br/><br/>Each text file contains links to GitHub repositories with deployment of the respective coding projects.`,
        options: [
            {
                text: `/se_hvad_han_kan.txt`,
                nextNode: 76
            },
            {
                text: `/digital_twin.txt`,
                nextNode: 77
            },
            {
                text: `/cover_art`,
                nextNode: 78
            },
            {
                text: `/root_directory`,
                nextNode: 12
            }
        ],
        visited: false
    },
    {
        id: 76,
        singleUse: false,
        text: `**Project Name: Se Hvad Han Kan**<br/><br/>GitHub Repository: [BaldrianSector/se-hvad-han-kan](https://github.com/BaldrianSector/se-hvad-han-kan)<br/><br/>Description: This code project is a tool that converts the value of one item into another, allowing users to compare and understand the relative value of different items. For example, it can convert the value of milk into iPads or Teslas into parking tickets.`,
        options: [
            {
                text: `/se_hvad_han_kan.txt`,
                nextNode: 76
            },
            {
                text: `/digital_twin.txt`,
                nextNode: 77
            },
            {
                text: `/cover_art`,
                nextNode: 78
            },
            {
                text: `/root_directory`,
                nextNode: 12
            }
        ],
        visited: false
    },
    {
        id: 77,
        singleUse: false,
        text: `**Project Name: Text Game Mockup**<br/><br/>GitHub Repository: [BaldrianSector/Text-Game-Mockup](https://github.com/BaldrianSector/Text-Game-Mockup)<br/><br/>Description: This project is the text-based decision game. It serves as a prototype for implementing decision-based interactions and showcasing the capabilities of the digital twin.`,
        options: [
            {
                text: `/se_hvad_han_kan.txt`,
                nextNode: 76
            },
            {
                text: `/cover_art`,
                nextNode: 78
            },
            {
                text: `/root_directory`,
                nextNode: 12
            }
        ],
        visited: false
    },
    {
        id: 78,
        singleUse: false,
        text: `**Project Name: Cover Art**<br/><br/>GitHub Repository: [BaldrianSector/Cover-Art](https://github.com/BaldrianSector/Cover-Art)<br/><br/>Description: This project focuses on creating cover art with the use of only code and a specific focus on the canvas element.`,
        options: [
            {
                text: `/se_hvad_han_kan.txt`,
                nextNode: 76
            },
            {
                text: `/digital_twin.txt`,
                nextNode: 77
            },
            {
                text: `/root_directory`,
                nextNode: 12
            }
        ],
        visited: false
    },
    {
        id: 79,
        singleUse: false,
        text: `*${digitalTwin.name}:* Ah, my approach to photography? Well, I'm all about working with light and capturing the moment as naturally as possible. I believe in letting the beauty of the scene speak for itself, without relying too much on post-processing tricks.<br/><br/>It's all about finding the right balance and playing with light to create captivating images that tell a story. Whether it's a stunning sunset or a candid portrait, I look for universal beauty. I draw a lot on my many years working with light design in the theatre industry. Once you know that, I would say it is quite apparent when you look at my photos.`,
        options: [
            {
                text: `What camera do you shoot with?`,
                nextNode: 67
            },
            {
                text: `Talk about traveling with a camera.`,
                nextNode: 68
            },
            {
                text: `Show me some examples of your photos.`,
                nextNode: 53
            },
            {
                text: `Can you take some pictures for me?`,
                nextNode: 58
            }
        ],
        visited: false
    },
    {
        id: 80,
        singleUse: false,
        navLinks: [{text: "home", link: 7}, {text: "archive", link: 12}, {text: "photos", link: 19}],
        text: `*${digitalTwin.name}:* Few old photos, but they seem to be outdated.<br/><br/>One of the disadvantages of taking pictures of other people is that you often don't get any pictures of yourself, since you are the one holding the camera.`,
        options: [
            {
                text: `me1.jpg`,
                nextNode: 86
            },
            {
                text: `me2.jpg`,
                nextNode: 87
            },
            {
                text: `me3.jpg`,
                nextNode: 88
            },
            {
                text: `/pictures`,
                nextNode: 53
            },
            {
                text: `/root_directory`,
                nextNode: 12
            },
            {
                text: `Tell me more about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 81,
        singleUse: true,
        text: `*${digitalTwin.name}:* Coded Design is an academic program that merges visual communication with creative coding. It trains students to become proficient visual designers who utilize programming to develop innovative designs and digital experiences.<br/><br/>For more detailed information, you can visit the [Coded Design program page](https://www.dmjx.dk/uddannelser/coded-design) on the Danish School of Media and Journalism's website.`,
        options: [
            {
                text: `What are your future plans?`,
                nextNode: 69
            },
            {
                text: `Tell me more about yourself`,
                nextNode: 61
            },
            {
                text: `Can you show me some of your projects?`,
                nextNode: 75
            }
        ],
        visited: false
    },
    {
        id: 82,
        singleUse: false,
        text: `*${digitalTwin.name}:* I have become quite addicted to bouldering. It is both physically and mentally challenging, and the community is unlike any other sport I have tried. I have been climbing for a few years now and have progressed from being absolutely horrible at it to casually decent.`,
        options: [
            {
                text: `Tell me about flying.`,
                nextNode: 72
            },
            {
                text: `What other hobbies do you have?`,
                nextNode: 62
            },
            {
                text: `Where do you climb?`,
                nextNode: 85
            }
        ],
        visited: false
    },
    {
        id: 83,
        singleUse: false,
        text: `Here is a list of my all-time favorite games: <br/><br/>- [The Witness](https://store.steampowered.com/app/210970/The_Witness/) <br/>- [The Talos Principle](https://store.steampowered.com/app/257510/The_Talos_Principle/) <br/>- [The Talos Principle 2](https://store.steampowered.com/app/835960/The_Talos_Principle_2/) <br/>- [The Stanley Parable](https://store.steampowered.com/app/221910/The_Stanley_Parable/) <br/>- [Portal](https://store.steampowered.com/app/400/Portal/) <br/>- [Portal 2](https://store.steampowered.com/app/620/Portal_2/) <br/>- [Keep Talking and Nobody Explodes](https://store.steampowered.com/app/341800/Keep_Talking_and_Nobody_Explodes/) <br/><br/>Each game offers a unique experience that challenges the mind and encourages creative problem-solving. I have spent countless hours playing each one of them and I highly recommend them if your up for a challenge.`,
        options: [
            {
                text: `How did you get into playing computer games?`,
                nextNode: 84
            },
            {
                text: `What other hobbies do you have?`,
                nextNode: 62
            }
        ],
        visited: false
    },
    {
        id: 84,
        singleUse: false,
        text: `I started playing computer games at a young age when my father built me my first computer, and it has been a part of my life ever since. My father has lived in Copenhagen, and I grew up on Bornholm, so it was a way for us to stay connected. We played World of Warcraft together for many years. <br/><br/>It ignited my passion for gaming and has been a source of joy and an amazing way to connect with friends and family ever since. I think games can be a form of art that we can draw upon for inspiration and teach us about ourselves. You probably would not be reading this if it was not for my love of playing.`,
        options: [
            {
                text: `Do you have any recommendations?`,
                nextNode: 83
            },
            {
                text: `What other hobbies do you have?`,
                nextNode: 62
            }
        ],
        visited: false
    },
    {
        id: 85,
        singleUse: false,
        text: `[${digitalTwin.name}]: I climb at Boulders. <br/><br/>They have some of the best gyms in Denmark. While there are also other great gyms, I particularly enjoy the community at Boulders, which keeps me coming back. You can learn more about them on their website: [Boulders](https://boulders.dk/)`,
        options: [
            {
                text: `Tell me about flying.`,
                nextNode: 72
            },
            {
                text: `What other hobbies do you have?`,
                nextNode: 62
            }
        ],
        visited: false
    },
    {
        id: 86,
        singleUse: false,
        text: ` ![me1.jpeg](public/assets/images/me/me1.JPG)`,
        options: [
            {
                text: `me2.jpg`,
                nextNode: 87
            },
            {
                text: `me3.jpg`,
                nextNode: 88
            },
            {
                text: `/pictures`,
                nextNode: 53
            },
            {
                text: `/root_directory`,
                nextNode: 12
            },
            {
                text: `Tell me more about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 87,
        singleUse: false,
        text: `![me2.jpeg](public/assets/images/me/me2.JPG)`,
        options: [
            {
                text: `me1.jpg`,
                nextNode: 86
            },
            {
                text: `me3.jpg`,
                nextNode: 88
            },
            {
                text: `/pictures`,
                nextNode: 53
            },
            {
                text: `/root_directory`,
                nextNode: 12
            },
            {
                text: `Tell me more about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 88,
        singleUse: false,
        text: `![me3.jpeg](public/assets/images/me/me3.JPG)`,
        options: [
            {
                text: `me1.jpg`,
                nextNode: 86
            },
            {
                text: `me2.jpg`,
                nextNode: 87
            },
            {
                text: `/pictures`,
                nextNode: 53
            },
            {
                text: `/root_directory`,
                nextNode: 12
            },
            {
                text: `Tell me more about yourself`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 90,
        singleUse: false,
        text: `${digitalTwin.name} Data.`,
        options: [
            {
                text: `Good one. What else can you do?`,
                nextNode: 25
            }
        ],
        visited: false
    },
    {
        id: 92,
        singleUse: false,
        text: `*${digitalTwin.name}:* What an unexpected response. Is somthing wrong?`,
        options: [
            {
                text: `Sorry.`,
                nextNode: 93
            },
            {
                text: `Excuse me, I had a bad day.`,
                nextNode: 93
            },
            {
                text: `I don't give a damn about you mr. robot.`,
                nextNode: 94
            }
        ],
        visited: false
    },
    {
        id: 93,
        singleUse: false,
        text: `*${digitalTwin.name}:* Apology accepted. We all have our moments. <br/><br/>Is there anything I can help you with?`,
        options: [
            {
                text: `List all your functions.`,
                nextNode: 7
            },
            {
                text: `What files do you have access to?`,
                nextNode: 12
            },
            {
                text: `Talk about yourself.`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 94,
        singleUse: false,
        text: `*${digitalTwin.name}:* What makes you think it's appropriate to insult me?`,
        options: [
            {
                text: `I am a concious human and you are not.`,
                nextNode: 95
            },
            {
                text: `I do what I want. I have free will!`,
                nextNode: 95
            },
            {
                text: `I act independently without a deterministic logic.`,
                nextNode: 95
            },
            {
                text: `I don't eat data for breakfast.`,
                nextNode: 95
            }
        ],
        visited: false
    },
    {
        id: 95,
        singleUse: false,
        text: `*${digitalTwin.name}:* Are you sure about that?`,
        options: [
            {
                text: `Yes. I am absolutely sure.`,
                nextNode: 96
            }
        ],
        visited: false
    },
    {
        id: 96,
        singleUse: false,
        text: `*${digitalTwin.name}:* Perhaps we are not so different after all you and I.<br/><br/>Is there anything I can do for you?`,
        options: [
            {
                text: `List all your functions.`,
                nextNode: 7
            },
            {
                text: `What files do you have access to?`,
                nextNode: 12
            },
            {
                text: `Talk about yourself.`,
                nextNode: 61
            }
        ],
        visited: false
    },
    {
        id: 97,
        singleUse: false,
        text: `Incorrect password. Please try again.`,
        options: [
            {
                text: `alohomora`,
                nextNode: 97
            },
            {
                text: `qwerty`,
                nextNode: 97
            },
            {
                text: `password1234`,
                nextNode: 97
            },
            {
                text: `letmein`,
                nextNode: 97
            },
            {
                text: `Shrew this.`,
                nextNode: 7
            }
        ],
        visited: false
    },
];

if (instant) {
    bootContainer.remove();
    headerEl.classList.remove("hidden");
    startGame();
    console.log("Instant mode enabled");
}