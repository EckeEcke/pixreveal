export type LandingAction =
  | { kind: "solo"; label: string }
  | { kind: "link"; label: string; to: string };

type Step = { title: string; description: string };
type Question = { question: string; answer: string };
type PlayWay = Step & { icon: string; action: string; to: string };

export interface SeoLandingContent {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  description: string;
  image: { src: string; alt: string; width: number; height: number };
  primaryAction: LandingAction;
  secondaryAction: { label: string; to: string };
  facts: string[];
  howEyebrow: string;
  howHeading: string;
  steps: Step[];
  topic: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    link: { label: string; to: string };
  };
  waysDescription: string;
  playWays: PlayWay[];
  faqIntro: string;
  faqs: Question[];
  ctaHeading: string;
  ctaDescription: string;
}

const partyImage = {
  src: "/assets/images/image-partymode.webp",
  alt: "Friends playing PixReveal together, using their phones to guess pixel art on a shared screen",
  width: 970,
  height: 542,
};

const soloAction: LandingAction = { kind: "solo", label: "Play now" };
const hostAction: LandingAction = { kind: "link", label: "Host a game", to: "/play-party?role=host" };
const soloWay: PlayWay = {
  title: "A quick solo game",
  icon: "pixel:user-solid",
  description: "Try Classic, Gravity, Inspect or Survival. Four different ways to uncover the picture.",
  action: "Explore solo modes",
  to: "/singleplayer",
};
const partyWay: PlayWay = {
  title: "Everyone on the couch",
  icon: "pixel:users-solid",
  description: "One shared screen, phones as controllers, and powerups to keep your friends on their toes. For 2–10 players.",
  action: "Host a party",
  to: "/play-party?role=host",
};
const onlineWay: PlayWay = {
  title: "Friends, wherever they are",
  icon: "pixel:globe-solid",
  description: "Invite friends to a private online lobby. Everyone plays on their own screen.",
  action: "Play online",
  to: "/play-online",
};

const soloSteps: Step[] = [
  { title: "Watch the picture appear", description: "Each new pixel is a clue. Look for colors, shapes and the first detail you recognize." },
  { title: "Pick your answer", description: "Choose from four answers before time runs out. In Party mode, buzz in on your phone first." },
  { title: "Make your guess count", description: "In Classic, earlier correct answers earn more points. In Party mode, buzz in first for the chance to answer." },
];
const partySteps: Step[] = [
  { title: "Host on a shared screen", description: "Open PixReveal on a laptop or a screen everyone can see. Create a Party room to get a QR code and room ID." },
  { title: "Join on your phones", description: "Scan the QR code or open the invite link. Enter a nickname and your phone becomes your controller." },
  { title: "Buzz in and pick an answer", description: "Watch the pixel art appear on the shared screen. Buzz in, choose from four answers and use powerups against your friends." },
];
const freeQuestion: Question = {
  question: "Is PixReveal free, and do I need an account?",
  answer: "PixReveal is free to play in your browser. You do not need an account or a download to play solo, host a party, or join friends online.",
};
const multiplayerQuestion: Question = {
  question: "Can I play alone or with friends?",
  answer: "Both. Play Classic, Gravity, Inspect or Survival on your own. For a group, host a Party game on a shared screen with phones as controllers, or invite friends to a private online lobby.",
};
const phoneQuestion: Question = {
  question: "How do phones work as controllers?",
  answer: "The Party host screen shows a QR code and room ID. Scan the code or use the invite link to open a controller in your phone browser. Enter a nickname, then use your phone to buzz in, pick answers and use powerups.",
};
const connectionQuestion: Question = {
  question: "Do all phones need to use the same Wi-Fi?",
  answer: "No. The host screen and every phone need an internet connection, but they can use different Wi-Fi networks or mobile data.",
};

const soloBase: SeoLandingContent = {
  eyebrow: "FREE ONLINE PIXEL GUESSING GAME",
  heading: "Guess the picture.",
  headingAccent: "Pixel by pixel.",
  description: "A picture appears, pixel by pixel. How soon can you spot it? Pick the right answer and score more points for guessing early.",
  image: partyImage,
  primaryAction: soloAction,
  secondaryAction: { label: "Play with friends", to: "/play-party" },
  facts: ["Free to play", "No sign-up", "No download"],
  howEyebrow: "WATCH. GUESS. SCORE.",
  howHeading: "How to play PixReveal",
  steps: soloSteps,
  topic: {
    eyebrow: "YOUR FIRST SOLO GAME",
    heading: "Start with Classic",
    paragraphs: [
      "In Classic, pixels appear at random positions across the drawing. A patch of color might be your first clue; the outline becomes clearer as more pixels appear. You can answer before the whole picture is visible.",
      "Each drawing comes with four answer choices. You select an option rather than typing a name. The other choices can share the drawing's main color or category, so look for a detail that distinguishes your answer from the rest.",
    ],
    link: { label: "Explore the solo modes", to: "/singleplayer" },
  },
  waysDescription: "Start with a quick pixel art quiz, or turn it into a game night. Everything runs in your browser.",
  playWays: [soloWay, partyWay, onlineWay],
  faqIntro: "No drawing skills needed. Just a sharp eye and a good guess.",
  faqs: [],
  ctaHeading: "Ready for your first round?",
  ctaDescription: "Start a free solo game in your browser.",
};

const partyBase: SeoLandingContent = {
  ...soloBase,
  primaryAction: hostAction,
  secondaryAction: { label: "Play online", to: "/play-online" },
  facts: ["2–10 players", "No sign-up", "No download"],
  howEyebrow: "HOST. JOIN. GUESS.",
  howHeading: "How to play with friends",
  steps: partySteps,
  waysDescription: "Share a screen for Party mode, invite friends to an online lobby, or try a solo game first.",
  playWays: [partyWay, onlineWay, soloWay],
  ctaHeading: "Ready to host a game?",
  ctaDescription: "Create a room and invite your friends to join.",
};

export const pixelGuessrLanding: SeoLandingContent = {
  ...soloBase,
  faqs: [
    { question: "Looking for a free Pixel Guessr alternative?", answer: "Try PixReveal if you enjoy recognizing pictures from just a few pixels. Start a free solo game, choose another reveal mode, or invite friends to a Party or online game. Everything runs in your browser." },
    { question: "What is a pixel guessing game?", answer: "A pixel guessing game asks you to recognize a picture as it is gradually revealed. In PixReveal, you choose from four answers before the timer runs out. In Classic mode, earlier correct answers earn more points." },
    freeQuestion,
    multiplayerQuestion,
    { question: "Does it work on phones and computers?", answer: "Yes. You can play in a modern browser on a phone, tablet or computer. In Party mode, the host uses a shared screen and players join on their phones using a QR code, room ID or invite link." },
  ],
};

export const jackboxLanding: SeoLandingContent = {
  ...partyBase,
  eyebrow: "FREE JACKBOX ALTERNATIVE",
  heading: "One shared screen.",
  headingAccent: "Everyone can play.",
  description: "Looking for a free game for your next game night? Host PixReveal on a shared screen, join with your phones and race to recognize the pixel art. Your phone is your buzzer and controller.",
  topic: {
    eyebrow: "FOR YOUR NEXT GAME NIGHT",
    heading: "A party quiz with phone controllers",
    paragraphs: [
      "PixReveal is a pixel art guessing game for 2–10 players. One host screen displays the drawings and scores, while each player has a controller on their phone. You can connect a laptop to a TV so everyone can follow the same reveal.",
      "The phone controller has your buzzer, answer choices and powerups. Recognize the picture, buzz in and choose an answer before time runs out. The host screen is separate from the player controllers, so the person hosting can join with their own phone too.",
    ],
    link: { label: "See how to connect your TV and phones", to: "/phone-controller-party-game" },
  },
  faqs: [
    { question: "Is PixReveal a free Jackbox alternative?", answer: "If you are looking for a party game with a shared screen and phone controllers, PixReveal offers that setup for free. It is a pixel art guessing game: watch the picture appear, buzz in and choose an answer. Hosting and joining both work in your browser." },
    phoneQuestion,
    { question: "How many players can join?", answer: "Party mode supports 2–10 players. Each player joins on their own phone or tablet, while a separate host screen displays the drawings, scores and room code." },
    freeQuestion,
    connectionQuestion,
  ],
};

export const garticLanding: SeoLandingContent = {
  ...partyBase,
  eyebrow: "FREE SKRIBBL.IO & GARTIC PHONE ALTERNATIVE",
  heading: "Guess together.",
  headingAccent: "No drawing needed.",
  description: "Looking for another picture guessing game to play with friends? In PixReveal, the pixel art appears automatically. Watch the reveal, recognize the picture and choose the right answer before time runs out.",
  howEyebrow: "WATCH. GUESS. SCORE.",
  howHeading: "How the guessing works",
  topic: {
    eyebrow: "NO DRAWING TURNS",
    heading: "Everyone guesses the same picture",
    paragraphs: [
      "The drawings are supplied by the game and reveal themselves automatically. Nobody has to sketch while the others wait. Every player watches the same image and tries to recognize it from the pixels already on screen.",
      "Answers are multiple choice, so there is no spelling or typing race. On a shared screen, players buzz in with their phones. In a private online lobby, each friend sees the game on their own device. Choose the setup that fits where you are playing.",
    ],
    link: { label: "Open the private online game setup", to: "/play-online" },
  },
  steps: [
    { title: "Watch the pixel art appear", description: "The drawing reveals itself automatically, one pixel at a time. Nobody needs to take a turn drawing." },
    { title: "Recognize the picture", description: "Use the colors and shapes to work out what you are seeing. In Party mode, hit the buzzer on your phone when you know." },
    { title: "Choose the right answer", description: "Pick from four options before time runs out. Correct answers earn points. In Party mode, the first player to buzz gets the chance to answer." },
  ],
  faqs: [
    { question: "How is PixReveal different from a drawing game?", answer: "Players do not draw pictures or type guesses. PixReveal supplies the pixel art and reveals it automatically. You choose from four answers. If you are looking for a Skribbl.io or Gartic Phone alternative focused on recognizing pictures, you can play solo or with friends." },
    { question: "Do I need to be good at drawing?", answer: "No. Nobody has to draw in PixReveal. You look at the picture as it appears and select the answer you think is correct." },
    multiplayerQuestion,
    { question: "Can I play with strangers?", answer: "PixReveal has private multiplayer lobbies for playing with people you invite. There is no random matchmaking. Share your room ID or invite link with the friends you want to join." },
    freeQuestion,
  ],
};

export const pictureRevealLanding: SeoLandingContent = {
  ...soloBase,
  eyebrow: "FREE ONLINE PICTURE REVEAL GAME",
  heading: "What is the picture?",
  headingAccent: "Watch it appear.",
  description: "An image starts hidden and appears pixel by pixel. Look for the detail that gives it away, then choose from four answers. In this picture reveal game, an earlier correct guess earns more points.",
  topic: {
    eyebrow: "HOW THE IMAGE IS REVEALED",
    heading: "A drawing appears one pixel at a time",
    paragraphs: [
      "The pictures in PixReveal are pixel art drawings of objects, animals and characters. Each new pixel adds color and shape to the image, giving you more clues to recognize the subject.",
      "Classic scatters new pixels across the canvas, while Gravity drops them in from above. In either mode, use the emerging colors and shapes to pick one of four answers. For a different set of drawings each day, try Daily mode from the home screen.",
    ],
    link: { label: "Choose a picture reveal mode", to: "/singleplayer" },
  },
  faqs: [
    { question: "How does the picture reveal work?", answer: "In Classic mode, pixels appear randomly across the image until the drawing becomes recognizable. Gravity mode drops the pixels in from above. Inspect and Survival offer other ways to play with the same pixel art drawings." },
    { question: "How do I answer and earn points?", answer: "Choose from four possible answers before the timer runs out. In Classic, Gravity, Inspect and Online games, earlier correct answers earn more points. Party mode uses fixed points: 1 for a correct answer and -2 for a wrong answer, doubled in bonus and final rounds. Buzz in on your phone to get the chance to answer." },
    multiplayerQuestion,
    { question: "Is there a daily game?", answer: "Yes. Daily mode gives everyone the same drawings and settings for that day. You can submit your result to the daily leaderboard and compare your score with other players." },
    freeQuestion,
  ],
};

export const phoneControllerLanding: SeoLandingContent = {
  ...partyBase,
  eyebrow: "FREE AIRCONSOLE ALTERNATIVE",
  heading: "Play on your screen.",
  headingAccent: "Buzz on your phone.",
  description: "Use your phones as controllers for a free pixel art party game. Open PixReveal on a shared screen, scan the QR code and join in your phone browser. Buzz in when you recognize the picture.",
  faqIntro: "A shared screen, your phones and an internet connection are all you need.",
  topic: {
    eyebrow: "TV AND PHONE SETUP",
    heading: "Connect a screen, then join on your phones",
    paragraphs: [
      "Open PixReveal in a wide browser window on a computer. Connect the computer to your TV with HDMI, or mirror its display so everyone can see the game. Create a Party room to display its QR code and room ID.",
      "Each player scans the code with their phone camera or opens the invite link, then enters a nickname. The controller runs in the phone browser. Both the host and the phones need internet access, but they do not have to use the same Wi-Fi. There is no controller app to install.",
    ],
    link: { label: "Open the Party host setup", to: "/play-party?role=host" },
  },
  faqs: [
    { question: "Is PixReveal a free AirConsole alternative?", answer: "PixReveal is a free party game that uses a shared host screen and phones as controllers. Its gameplay centers on recognizing pixel art as it appears. You can host and join without an account or a controller app." },
    phoneQuestion,
    { question: "How do I play on a TV?", answer: "Host PixReveal in a computer browser and show the computer's display on your TV, for example with HDMI. The shared screen displays the game while players use their phones as controllers." },
    { question: "How large must the host screen be?", answer: "Party hosting requires a browser window at least 1400 pixels wide. If the host window is smaller, the setup page disables hosting and suggests a larger screen. Players can still join on their phones." },
    { question: "Do I need an iPhone or Android app?", answer: "No app is needed. The controller runs in a modern phone browser on iPhone or Android. Scan the QR code with your camera or open the invite link to join." },
    connectionQuestion,
    { question: "What if my phone locks during the game?", answer: "Unlock your phone and return to the controller tab. Party mode attempts to reconnect and synchronize with the running game when the tab becomes active again." },
  ],
};

export const afterworkLanding: SeoLandingContent = {
  ...partyBase,
  eyebrow: "FREE FRIDAY AFTERWORK GAME",
  heading: "A game for your team.",
  headingAccent: "In the browser.",
  description: "Get your coworkers together for a pixel art guessing game. Play on a shared screen in the office or invite a remote team to an online lobby. Recognize the pictures, pick your answers and compare scores.",
  image: {
    src: "/assets/images/image-officegame.webp",
    alt: "Coworkers playing a PixReveal picture guessing game together in the office",
    width: 1374,
    height: 768,
  },
  primaryAction: { kind: "link", label: "Host a team game", to: "/play-party?role=host" },
  secondaryAction: { label: "Remote team", to: "/play-online" },
  howEyebrow: "HOST. INVITE. PLAY.",
  howHeading: "How to play with your team",
  topic: {
    eyebrow: "PLAN A SHORT TEAM GAME",
    heading: "Set the rounds and timer",
    paragraphs: [
      "For a short first game, choose 5 rounds and a 10-second round timer in the host settings. You can also choose 10, 15 or 20 rounds and set the timer to 5, 10, 15 or 20 seconds.",
      "In the office, use a shared meeting room screen and let coworkers join with their phones. For a remote team, open a private online lobby so everyone plays on their own screen. Share the invite link in your team chat; nobody needs to create an account.",
    ],
    link: { label: "Set up a remote team game", to: "/play-online" },
  },
  steps: [
    { title: "Choose your setup", description: "In the office, host Party mode on a screen the team can see. For a remote team, create a private online lobby instead." },
    { title: "Invite your coworkers", description: "Share the room ID or invite link. For a Party game, coworkers can scan the QR code and use their phones as controllers." },
    { title: "Guess the pictures together", description: "Watch the pixel art appear and try to recognize it early. Select an answer before the timer ends and compare scores after the game." },
  ],
  waysDescription: "Choose a setup that fits your team. Play together in the office, join from separate locations, or try a solo game beforehand.",
  playWays: [
    { ...partyWay, title: "Together in the office", description: "Use a meeting room screen for the drawings and phones for buzzers, answers and powerups. For 2–10 players.", action: "Host a team game" },
    { ...onlineWay, title: "A remote team game", description: "Create a private online lobby and share the invite with your coworkers. Everyone plays on their own screen." },
    { ...soloWay, title: "Try it yourself first", description: "Play a solo game to see how the reveals and scoring work before inviting your team." },
  ],
  faqIntro: "How to get your coworkers into a game, in the office or remotely.",
  faqs: [
    { question: "How can we play at a Friday afterwork event?", answer: "Host a Party game on a shared office screen and let coworkers join with their phones. If your team is remote, create an online lobby and send everyone the invite link. Both setups run in the browser." },
    { question: "How many coworkers can join?", answer: "Party mode supports 2–10 players using phone or tablet controllers, plus a separate host screen. For a larger team, you can split into smaller groups and host separate rooms." },
    { question: "Do coworkers need accounts or installed software?", answer: "No. The host and players use their web browsers. Share the room ID, QR code or invite link so everyone can enter a nickname and join." },
    { question: "Do we need drawing skills or special controllers?", answer: "No drawing skills are needed: the pixel art reveals itself automatically. In Party mode, each coworker's phone serves as their controller. In online mode, everyone plays on their own device." },
    { question: "Can we adjust the game length?", answer: "Yes. Before starting, the host can choose the number of rounds and the round timer in the game settings." },
  ],
  ctaHeading: "Ready to play with your team?",
  ctaDescription: "Create a room and share the invite with your coworkers.",
};
