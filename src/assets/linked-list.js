let instant = false; // Set to true to display all text instantly

const textElement = document.getElementById('text')
const optionButtonsElement = document.getElementById('option-buttons')

let state = {}

function startGame() {
    state = {}
    textNodes.forEach(node => node.visited = false) // Reset visited state
    showTextNode(1)
    clearOptions()
}

let currentTimeout = null;

function showTextNode(textNodeIndex) {
    if (currentTimeout) {
        clearTimeout(currentTimeout);
    }

    const textNode = textNodes.find(textNode => textNode.id === textNodeIndex)
    const text = textNode.text
    let index = 0
    
    function displayText() {
        if (instant) {
            textElement.innerText = text;
            textNode.visited = true; // Set visited to true after the text is fully displayed
            setTimeout(() => displayOptions(textNode.options), 0); // Delay the call to displayOptions
        } else {
            textElement.innerText = text.substring(0, index);
            index++;
            if (index <= text.length) {
                currentTimeout = setTimeout(displayText, 50); // Adjust the delay (in milliseconds) between each letter
            } else {
                textNode.visited = true; // Set visited to true after the text is fully displayed
                displayOptions(textNode.options);
            }
        }
    }
    
    function displayOptions(options) {
        clearOptions();
        
        options.forEach(option => {
            if (showOption(option)) {
                const button = document.createElement('button');
                button.innerText = option.text;
                button.classList.add('btn');
                button.tabIndex = 0; // Make button focusable
                button.addEventListener('click', () => selectOption(option));
                optionButtonsElement.appendChild(button);
                
                if (option.nextNode < 0) {
                    button.classList.add('no-next-node'); // Add a custom CSS class to the button
                }
            }
        });
    }

    displayText();
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

const textNodes = [
    {
        id: 1,
        text: 'Welcome to my interactive page. What would you like to know about?',
        options: [
            {
                text: 'Your Photography Journey',
                nextNode: 2
            },
            {
                text: 'Your Theater Experience',
                nextNode: 4
            },
            {
                text: 'Your Academic and Teaching Background',
                nextNode: 8
            },
            {
                text: 'Do you have Hobbies?',
                nextNode: 12
            },
            {
                text: 'Your Contact Information',
                nextNode: 16
            }
        ],
        visited: false
    },
    {
        id: 111,
        text: 'Welcome back. What more you like to know about?',
        options: [
            {
                text: 'Your Photography Journey',
                nextNode: 2
            },
            {
                text: 'Your Theater Experience',
                nextNode: 4
            },
            {
                text: 'Your Academic and Teaching Background',
                nextNode: 8
            },
            {
                text: 'Do you have Hobbies?',
                nextNode: 12
            },
            {
                text: 'Your Contact Information',
                nextNode: 16
            }
        ],
        visited: false
    },
    {
        id: 2,
        text: 'Anything specific you would like to know?',
        options: [
            {
                text: 'Your gear and travels',
                nextNode: 3
            },
            {
                text: 'What is your approach to photography?',
                nextNode: 21
            }
        ],
        visited: false
    },
    {
        id: 4,
        text: 'Sure. I have worked in the theater industry since forever.',
        options: [
            {
                text: 'Tell me about your experiences',
                nextNode: 5
            },
            {
                text: 'Discover your transition and future plans',
                nextNode: 41
            }
        ],
        visited: false
    },
    {
        id: 8,
        text: 'Sure!',
        options: [
            {
                text: 'Talk about your studies',
                nextNode: 9
            },
            {
                text: 'What is your teaching experiences',
                nextNode: 81
            }
        ],
        visited: false
    },
    {
        id: 12,
        text: 'Oh yes, I do!',
        options: [
            {
                text: 'Talk about your photography!',
                nextNode: 2
            },
            {
                text: 'Do you play computer games?',
                nextNode: 122
            },            
            {
                text: 'Do you do any sports?',
                nextNode: 121
            }
        ],
        visited: false
    },
    {
        id: 3,
        text: 'I acquired my Fujifilm X100V in 2022 to document my travels through Japan, Taiwan, South Korea, and Hong Kong.',
        options: [
            {
                text: 'Can I see some of the photos you took?',
                nextNode: 31
            },
            {
                text: 'Take me back to the begining.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 31,
        text: 'For sure! \n\nHere is a link to some of my favorite photos I took during my trip:\nhttps://www.facebook.com/BaldrianSector/posts/10228912409504335',
        options: [
            {
                text: 'I want to know more.',
                nextNode: 2
            },
            {
                text: 'Where can I see more photos like this?',
                nextNode: 311
            },
            {
                text: 'Take me back to the begining.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 311,
        text: 'I mostly share my pictures on Instagram. Follow me at https://www.instagram.com/baldrian.jpeg/',
        options: [
            {
                text: 'I want to know more.',
                nextNode: 2
            },
            {
                text: 'Enough about all this photography stuff...',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 5,
        text: 'I have worked as a freelance lighting designer in the theater industry, showcasing my technical expertise and aesthetic sense.',
        options: [
            {
                text: 'Take me back to the begining.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 9,
        text: 'Currently, I am studying visual communication at Danish School of Media and Journalism (DMJX). I will be done in 2026. If that year has already passed, and you are reading this, I unfortunately did not keep my website updated for whatever reason. If so you just discovered a time capsule...',
        options: [
            {
                text: 'What is your teaching experiences',
                nextNode: 81
            },
            {
                text: 'Take me back to the begining.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 16,
        text: 'The best way to reach me is through my email: Baldriansector@gmail.com \n\nYou could also try to message me on Instagram at @baldrian.jpeg, but not that some messages get filtered out.',
        options: [
            {
                text: 'Ok I understand. Thank you!',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 21,
        text: 'My approach to photography is all about capturing the essence of the moment and the beauty in the mundane. Its about seeing the world from a different perspective and telling a story through my lens. Whether it is captureing a sunset in Japan or a unique portrait of a friend.',
        options: [
            {
                text: 'I want to know more.',
                nextNode: 2
            },
            {
                text: 'Take me back to the beginning.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 41,
        text: 'My transition from the theater industry was a journey of rediscovery and embracing change. After years of crafting stories through light on stage, I have found a new canvas in the natural world and urban landscapes.',
        options: [
            {
                text: 'Take me back to the beginning.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 81,
        text: 'Through education, I strive to inspire others. My experiences have taught me the importance of continuous learning and the joy of helping others unlock their creative potential. It is also an excellent way to keep my own skills sharp.',
        options: [
            {
                text: 'Talk about your studies',
                nextNode: 9
            },
            {
                text: 'Take me back to the beginning.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 121,
        text: 'Bouldering has become more than just a hobby; its a lifestyle that combines physical challenge with mental strategy. This sport has not only improved my physical health but has also provided a sanctuary where I can clear my mind and focus on the present moment. Its a test of strength, endurance, and problem-solving that keeps me coming back for more.',
        options: [
            
            {
                text: 'Tell me about your other hobbies.',
                nextNode: 12
            },
            {
                text: 'Take me back to the beginning.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 122,
        text: 'Oh yes I do! I a big fan of puzzle games as you might have guessed.\nI believe playing teaches us a lot about ourselves. ',
        options: [
            {
                text: 'Do you have any recommendations?',
                nextNode: 1222
            },
            {
                text: 'How did you get into playing computer games?',
                nextNode: 1221
            },
            {
                text: 'Take me back to the beginning.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 1222,
        text: 'Here is a list of my all-time favorite games: \n\nThe Witness \nThe Talos Principle \nPortal 2 \nThe Stanley Parable \nKeep Talking and Nobody Explodes \n\nEach game offers a unique experience that challenges the mind and encourages creative problem-solving. I have spent countless hours playing each one of them and I highly recommend them to anyone who enjoys a good mental workout or a cooperative tag-team challenge.',
        options: [
            {
                text: 'How did you get into playing computer games?',
                nextNode: 1221
            },
            {
                text: 'Take me back to the beginning.',
                nextNode: 111
            }
        ],
        visited: false
    },
    {
        id: 1221,
        text: 'I started playing computer games at a young age when my farther built me my first computer, and it has been a part of my life ever since. My father has lived in Copenhagen and I grew up on Bornholm, so it was a way for us to stay connected. We played World of Warcraft together for many years. \n\nIt ignited my passion for gaming and has been a source of joy and inspiration ever since. You probalby would not be reading this if it was not for my love playing.',
        options: [
            {
                text: 'Do you have any recommendations?',
                nextNode: 1222
            },
            {
                text: 'Take me back to the beginning.',
                nextNode: 111
            }
        ],
        visited: false
    }
];



startGame()