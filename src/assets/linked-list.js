let instant = true; // Set to true to display all text instantly

const textElement = document.getElementById('text')
const optionButtonsElement = document.getElementById('option-buttons')
const cursorSpan = textElement.querySelector('.cursor');
const navigationEl = document.getElementById('navigation');

console.log(navigationEl);

let navigationLinks = [
    {text: "home", link: 1},
    {text: "introduction", link: 0},

]

function updateNavigationLinks(node) {
    if (node.navLinks[0].text === "home") {
        console.log("Resetting navigation links");
        navigationLinks = node.navLinks;
        console.log(navigationLinks);
    } else {
        console.log("Updating navigation links");
        navigationLinks = [navigationLinks[0], ...node.navLinks.slice(1)];
    }
}

let user = { 
    name: "",
    email: undefined,
    age: undefined,
}

let state = {}

function startGame() {
    state = {}
    textNodes.forEach(node => node.visited = false) // Reset visited states
    showTextNode(0)
    updateNavigationEl() // Initial update
    clearOptions()
}

let currentTimeout = null;

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

    const cursorSpan = document.createElement('span');
    cursorSpan.classList.add('cursor');
    cursorSpan.textContent = '|'; // Cursor symbol
    textElement.appendChild(cursorSpan);

    function displayNextCharacter() {

        cursorSpan.classList.remove('blink'); // Stop blinking when typing starts

        if (index < hiddenSpans.length) {
            hiddenSpans[index].classList.remove('hidden');
            index++;
            currentTimeout = setTimeout(displayNextCharacter, 42);
        } else {
            textNode.visited = true;
            displayOptions(textNode.options, textNode.inputFields);
            cursorSpan.classList.add('blink');
        }
    }

    // Ensure you also handle the 'instant' case by adding/removing the blink class appropriately
    if (instant) {
        hiddenSpans.forEach(span => span.classList.remove('hidden'));
        textNode.visited = true;
        cursorSpan.classList.add('blink'); // Resume blinking immediately for instant display
        setTimeout(() => {
            displayOptions(textNode.options, textNode.inputFields);
        }, 0);
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
        });

        const submitButton = document.createElement('button');
        submitButton.innerText = "Submit";
        submitButton.classList.add('btn');
        submitButton.addEventListener('click', () => collectInputData(inputFields));
        optionButtonsElement.appendChild(submitButton);
    } else {
        options.forEach(option => {
            if (showOption(option)) {
                const button = document.createElement('button');
                button.innerText = option.text;
                button.classList.add('btn');
                button.addEventListener('click', () => selectOption(option));
                optionButtonsElement.appendChild(button);
            }
        });
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

function updateNavigationEl() {
    navigationEl.innerHTML = '';
    navigationLinks.forEach(element => {
        const navButton = document.createElement('p');
        navButton.innerText = '/' + element.text;
        navButton.classList.add('nav-btn');
        navButton.addEventListener('click', () => {
            showTextNode(element.link);
            clearOptions();
        });
        navigationEl.appendChild(navButton);
    });
}

const textNodes = [
    {
        id: 1,
        text: () => `Welcome ${user.name} to my interactive page. *What would you like to know about?*`,
        navLinks: [{text: "home", link: 111}],
        options: [
            {
                text: `Your Photography Journey`,
                nextNode: 2
            },
            {
                text: `Your Theater Experience`,
                nextNode: 4
            },
            {
                text: `Your Academic and Teaching Background`,
                nextNode: 8
            },
            {
                text: `Do you have Hobbies?`,
                nextNode: 12
            },
            {
                text: `Your Contact Information`,
                nextNode: 16
            },
            {
                text: `Lets get in contact.`,
                nextNode: 1234
            }
        ],
        visited: false,
    },
    {
        id: 111,
        text: () => `Welcome back ${user.name}. What more would you like to know about?`,
        navLinks: [{text: "home", link: 111}],
        options: [
            {
                text: `Your Photography Journey`,
                nextNode: 2
            },
            {
                text: `Your Theater Experience`,
                nextNode: 4
            },
            {
                text: `Your Academic and Teaching Background`,
                nextNode: 8
            },
            {
                text: `Do you have Hobbies?`,
                nextNode: 12
            },
            {
                text: `Your Contact Information`,
                nextNode: 16
            }
        ],
        visited: false
    },
    {
        id: 2,
        text: `Anything specific you would like to know?`,
        navLinks: [{text: "hobbies", link: 12}, {text: `photography`, link: 2},],
        options: [
            {
                text: `Your gear and travels`,
                nextNode: 3
            },
            {
                text: `What is your approach to photography?`,
                nextNode: 21
            },
            {
                text: `Can I see some of your photos?`,
                nextNode: 31
            }
        ],
        visited: false
    },
    {
        id: 4,
        text: `Sure. I have worked in the theater industry since forever.`,
        navLinks: [{text: "theater", link: 4}],
        options: [
            {
                text: `Tell me about your experiences`,
                nextNode: 5
            },
            {
                text: `Discover your transition and future plans`,
                nextNode: 41
            }
        ],
        visited: false
    },
    {
        id: 8,
        text: `Sure!`,
        navLinks: [{text: "academics", link: 8}],
        options: [
            {
                text: `Talk about your studies`,
                nextNode: 9
            },
            {
                text: `What is your teaching experiences`,
                nextNode: 81
            }
        ],
        visited: false
    },
    {
        id: 12,
        text: `Oh yes, I do!`,
        navLinks: [{text: "hobbies", link: 12}],
        options: [
            {
                text: `Talk about your photography!`,
                nextNode: 2
            },
            {
                text: `Do you play computer games?`,
                nextNode: 122
            },            
            {
                text: `Do you do any sports?`,
                nextNode: 121
            }
        ],
        visited: false
    },
    {
        id: 3,
        text: `I acquired my Fujifilm X100V in 2022 to document my travels through Japan, Taiwan, South Korea, and Hong Kong.`,
        options: [
            {
                text: `Take me back to the begining.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 31,
        text: `For sure! <br/><br/> ![View of Tokyo from Tokyo Skytree](src/assets/images/East-Asia/Tokyo.JPG)`,
        options: [
            {
                text: `I want to know more.`,
                nextNode: 2
            },
            {
                text: `Where can I see more photos like this?`,
                nextNode: 311
            },
            {
                text: `Take me back to the begining.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 311,
        text: `I mostly share my pictures on Instagram. Follow me at [@baldrian.jpeg](https://www.instagram.com/baldrian.jpeg/)`,
        options: [
            {
                text: `I want to know more.`,
                nextNode: 2
            },
            {
                text: `Enough about all this photography stuff...`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 5,
        text: `I have worked as a freelance lighting designer in the theater industry, showcasing my technical expertise and aesthetic sense.`,
        options: [
            {
                text: `Take me back to the beginning.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 9,
        text: `Currently, I am studying visual communication at Danish School of Media and Journalism (DMJX). I will be done in 2026. If that year has already passed, and you are reading this, I unfortunately did not keep my website updated for whatever reason. If so, you just discovered a time capsule...`,
        options: [
            {
                text: `What is your teaching experiences`,
                nextNode: 81
            },
            {
                text: `Take me back to the beginning.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 16,
        text: `The best way to reach me is through my email: [baldriansector@gmail.com](mailto:baldriansector@gmail.com) <br/><br/>You could also try to message me on Instagram at [@baldrian.jpeg](https://www.instagram.com/baldrian.jpeg/), but note that some messages get filtered out.`,
        options: [
            {
                text: `Ok, I understand. Thank you!`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 21,
        text: `My approach to photography is all about capturing the essence of the moment and the beauty in the mundane. It's about seeing the world from a different perspective and telling a story through my lens. Whether it is capturing a sunset in Japan or a unique portrait of a friend.`,
        options: [
            {
                text: `I want to know more.`,
                nextNode: 2
            },
            {
                text: `Take me back to the beginning.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 41,
        text: `My transition from the theater industry was a journey of rediscovery and embracing change. After years of crafting stories through light on stage, I have found a new canvas in the natural world and urban landscapes.`,
        options: [
            {
                text: `Take me back to the beginning.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 81,
        text: `Through education, I strive to inspire others. My experiences have taught me the importance of continuous learning and the joy of helping others unlock their creative potential. It is also an excellent way to keep my own skills sharp.`,
        options: [
            {
                text: `Talk about your studies`,
                nextNode: 9
            },
            {
                text: `Take me back to the beginning.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 121,
        text: `Bouldering has become more than just a hobby; it's a lifestyle that combines physical challenge with mental strategy. This sport has not only improved my physical health but has also provided a sanctuary where I can clear my mind and focus on the present moment. It's a test of strength, endurance, and problem-solving that keeps me coming back for more.`,
        navLinks: [{text: "hobbies", link: 12}, {text: "sports", link: 121}],
        options: [
            {
                text: `Tell me about your other hobbies.`,
                nextNode: 12
            },
            {
                text: `Take me back to the beginning.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 122,
        text: `Oh yes, I do! I am a big fan of puzzle games, as you might have guessed.<br/>I believe playing teaches us a lot about ourselves.`,
        navLinks: [{text: "hobbies", link: 12}, {text: "games", link: 122}],
        options: [
            {
                text: `Do you have any recommendations?`,
                nextNode: 1222
            },
            {
                text: `How did you get into playing computer games?`,
                nextNode: 1221
            },
            {
                text: `Take me back to the beginning.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 1222,
        text: `Here is a list of my all-time favorite games: <br/><br/>- [The Witness](https://store.steampowered.com/app/210970/The_Witness/) <br/>- [The Talos Principle](https://store.steampowered.com/app/257510/The_Talos_Principle/) <br/>- [The Talos Principle 2](https://store.steampowered.com/app/835960/The_Talos_Principle_2/) <br/>- [The Stanley Parable](https://store.steampowered.com/app/221910/The_Stanley_Parable/) <br/>- [Portal](https://store.steampowered.com/app/400/Portal/) <br/>- [Portal 2](https://store.steampowered.com/app/620/Portal_2/) <br/>- [Keep Talking and Nobody Explodes](https://store.steampowered.com/app/341800/Keep_Talking_and_Nobody_Explodes/) <br/><br/>Each game offers a unique experience that challenges the mind and encourages creative problem-solving. I have spent countless hours playing each one of them and I highly recommend them to anyone who enjoys a good mental workout or a cooperative tag-team challenge.`,
        options: [
            {
                text: `How did you get into playing computer games?`,
                nextNode: 1221
            },
            {
                text: `Take me back to the beginning.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 1221,
        text: `I started playing computer games at a young age when my father built me my first computer, and it has been a part of my life ever since. My father has lived in Copenhagen, and I grew up on Bornholm, so it was a way for us to stay connected. We played World of Warcraft together for many years. <br/><br/>It ignited my passion for gaming and has been a source of joy and an amazing way to connect with friends and family ever since. I think games can be a form of art that we can draw upon for inspiration and teach us about ourselves. You probably would not be reading this if it was not for my love of playing.`,
        options: [
            {
                text: `Do you have any recommendations?`,
                nextNode: 1222
            },
            {
                text: `Take me back to the beginning.`,
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 1234,
        text: `Please enter your contact information:`,
        inputFields: [
            {label: "Name", type: "text", key: "name"},
            {label: "Email", type: "email", key: "email"},
            {label: "Age", type: "number", key: "age"}
        ],
        options: [], // You might not have options for an input node
        nextNode: 1 // Optional: Specify the next node after submission
    },
    {
        id: 12345,
        text: `${user.name}, thank you for your information. I recorded that your email is ${user.email} and your age is ${user.age}. We will be in touch soon!`,
        options: [
            {
                text: `Take me back to the beginning.`,
                nextNode: 12345
            }
        ],
        nextNode: 17 // Optional: Specify the next node after submission
    },
    {
        id: 0,
        text: `What should I call you?`,
        inputFields: [
            {type: "text", key: "name"},
        ],
        nextNode: 1
    }
];

startGame()