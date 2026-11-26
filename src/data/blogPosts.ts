export interface BlogText {
  text: string;
  to?: string;
  href?: string;
  strong?: boolean;
}

export interface BlogPost {
  id: string;
  date: string;
  title: string;
  content: BlogText[];
}

export const blogPosts: BlogPost[] = [
  {
    "id": "2026-10-11-play-pixreveal-on-reddit",
    "date": "2026-10-11",
    "title": "Play PixReveal on Reddit!",
    "content": [
      {
        "text": "PixReveal now has its own sub on Reddit and is available as a Reddit game! "
      },
      {
        "text": "Join the sub",
        "href": "https://www.reddit.com/r/pixreveal/"
      },
      {
        "text": " to play the classic mode right in your browser. Once the app is reviewed, PixReveal can be added to other subs as well. Stay tuned!"
      }
    ]
  },
  {
    "id": "2026-10-04-new-achievement-system-and-unlockable-content",
    "date": "2026-10-04",
    "title": "New achievement system and unlockable content!",
    "content": [
      {
        "text": "Achievements now guide you through PixReveal's main features. Complete them to unlock bonus avatars and text animations for your player name. The achievement system works without any signup or login. To see your progress, simply click on the avatar in the page header."
      }
    ]
  },
  {
    "id": "2026-09-20-improved-pixel-art-editor",
    "date": "2026-09-20",
    "title": "Improved pixel art editor",
    "content": [
      {
        "text": "The editor got a big upgrade today. Better controls with visual feedback, a visual overhaul and new features: a flood feature letting you fill all adjecent pixels, a mirror feature mirroring the pixels you draw horizontally and a forwards/backwards feature letting you revert or return your last drawn pixels. Check out the new "
      },
      {
        "text": "Editor",
        "to": "/editor"
      },
      {
        "text": " now!"
      }
    ]
  },
  {
    "id": "2026-09-09-new-category-filter-and-settings",
    "date": "2026-09-09",
    "title": "New category filter and settings",
    "content": [
      {
        "text": "You are playing with your grandparents and they have no idea, who Mario and Luigi are? Or you are hanging out with your gaming buddies, who find guessing animals rather boring? PixReveal now has an easy way to configure the game: set the drawing mix to "
      },
      {
        "text": "nerdy, mixed or general.",
        "strong": true
      },
      {
        "text": ". Nerdy only shows you drawings from the categories anime, cartoons, movies or gaming. While general contains only objects, people, nature and food. Additionally the filter settings are now available in the different game mode hubs. When setting up a party or online game. And in the hub page for the singleplayer modes. So for your next round of PixReveal, don't forget to adjust the game to your likings."
      }
    ]
  },
  {
    "id": "2026-09-07-new-highlight-images-in-online-gameover",
    "date": "2026-09-07",
    "title": "New highlight images in Online Gameover",
    "content": [
      {
        "text": "Online mode is played in parallel. But you want to see how your friends actually did? Online mode now shows what your friends answered and what they saw while answering. The game over screen now shows a toggling gallery for you to discuss, amaze and laugh."
      }
    ]
  },
  {
    "id": "2026-09-07-new-highlight-images-in-party-gameover",
    "date": "2026-09-07",
    "title": "New highlight images in Party Gameover",
    "content": [
      {
        "text": "We all know this kind of moment: the image is practically completely revealed, yet your friend guessed wrong. Or that one friend, who sees only two pixels and immidiately knows the answer. To make these moments more memorable, I added a highlight image to the game over screen in Partymode. The image is a snapshot of the moment when the player guessed correctly or incorrectly. This way you can relive the moment and see how your friends reacted to it."
      }
    ]
  },
  {
    "id": "2026-09-06-new-live-badge-for-twitch-stream",
    "date": "2026-09-06",
    "title": "New Live Badge for Twitch Stream!",
    "content": [
      {
        "text": "You can now see a live badge next to the player avatar whenever I am streaming PixReveal on Twitch. Viewers can join the game directly through the stream chat and compete by guessing the pixel art in real time. My channel is still brand new, so for now this is mostly a just-for-fun test to see how Stream Mode works with a live audience. "
      },
      {
        "text": "Watch the stream",
        "href": "https://www.twitch.tv/eckeeckeecke"
      },
      {
        "text": " and play along!"
      }
    ]
  },
  {
    "id": "2026-09-05-new-stream-mode-for-youtube-and-twitch",
    "date": "2026-09-05",
    "title": "New Stream Mode for YouTube and Twitch!",
    "content": [
      {
        "text": "PixReveal now has a dedicated Stream Mode for YouTube and Twitch! Let your viewers play along directly through the chat: they can answer with the full word or simply type 1, 2, 3 or 4. Each stream round runs for 15 minutes, with live scoring and a leaderboard for everyone taking part. The setup is simple: choose your platform, connect your chat and start playing. "
      },
      {
        "text": "Try Stream Mode",
        "to": "/stream"
      },
      {
        "text": " now!"
      }
    ]
  },
  {
    "id": "2026-09-05-edit-avatar-on-lobby-screen",
    "date": "2026-09-05",
    "title": "Edit avatar on lobby screen",
    "content": [
      {
        "text": "Finally added a feature that I had on my list for quite a while: enabling you to edit your avatar on the lobby screen! Before you could only edit your avatar before joining. Now you can change your avatar and player name while waiting for the game to start. Just click on your player card and the edit modal will open. This QOL feature is available for both party and online mode."
      }
    ]
  },
  {
    "id": "2026-08-31-screen-scaling-and-party-game-over-emotes-available-now",
    "date": "2026-08-31",
    "title": "Screen Scaling and Party Game Over emotes available now!",
    "content": [
      {
        "text": "Since Partymode is best hosted on a TV, I added scaling to PixReveal. The game will now scale to fit your screen, so you can enjoy the game on any device. Additionally I added emotes to the Game Over screen in Partymode. You can now react to the game's outcome with emojis."
      }
    ]
  },
  {
    "id": "2026-08-16-join-party-game-in-progress-possible-now",
    "date": "2026-08-16",
    "title": "Join party game in progress possible now!",
    "content": [
      {
        "text": "Partymode supports up to 10 players. If you wanted to join a running game, you had to wait until the end of the round. Now you can see the QR code/room id right on the host screen, join the game and start playing immidiately!"
      }
    ]
  },
  {
    "id": "2026-08-15-improved-canvas-contrast",
    "date": "2026-08-15",
    "title": "Improved canvas contrast",
    "content": [
      {
        "text": "One topic that I had on my list for quite a while: black pixels on the canvas were really hard to see. How solve it? Coloring the background lighter? Breaks the design. Making black pixels lighter? Also did not look appealing. In the end I went with a slightly brighter background plus a simple pattern to get the black pixels to pop out more, making it way easier to figure out the pixel drawing."
      }
    ]
  },
  {
    "id": "2026-08-15-new-hint-system-for-partymode",
    "date": "2026-08-15",
    "title": "New hint system for Partymode!",
    "content": [
      {
        "text": "In the past Partymode worked like this: the pixel art gets revealed pixel by pixel, but players could only see the answers once they buzzered. To make it more player friendly and give players a better chance to guess, I added a new hint mechanic. Once the timer reaches 5, the robot moderator (I will call him PixBot from now on) will tell the 4 answer options. This should give players the confidence to hit the buzzer and score some precious stars."
      }
    ]
  },
  {
    "id": "2026-08-11-major-update-to-party-mode",
    "date": "2026-08-11",
    "title": "Major update to party mode!",
    "content": [
      {
        "text": "PixReveal's most popular game mode, Partymode, has received a massive local multiplayer upgrade with three new powerups, bringing the total to six. Instead of starting with all abilities, a dynamic balancing mechanic now grants a random powerup exclusively to the player in last place, introducing a layer of strategic mystery to matches. Players can hold up to three powerups at a time, with new acquisitions automatically replacing the oldest one if the inventory is full."
      }
    ]
  },
  {
    "id": "2026-08-07-new-game-stats-and-animations",
    "date": "2026-08-07",
    "title": "New game stats and animations",
    "content": [
      {
        "text": "Thanks to everyone playing Singleplayer mode, a brand-new feature is here! You can now see how your score stacks up against other players at the end of every round (e.g., \"Better than 90% of players\"). Plus, a huge visual overhaul is live: feel the thrill with a satisfying zoom on correct answers and watch pixels collapse when you miss!"
      }
    ]
  },
  {
    "id": "2026-08-06-new-navigation-for-singleplayer",
    "date": "2026-08-06",
    "title": "New navigation for singleplayer",
    "content": [
      {
        "text": "The Daily Challenge and Classic mode are by far the most popular singleplayer options on PixReveal. So I've given the homepage a refresh: instead of a single \"Singleplayer\" tile, you'll now find a \"Play Now\" option that takes you straight into the action. The Daily Challenge takes its place right on the homepage too, so you can jump into it directly without any extra clicks. \"Submit Your Art\" and the full singleplayer mode selection have moved further down the page to make room."
      }
    ]
  },
  {
    "id": "2026-08-05-maximum-amount-of-players-in-multiplayer-raised-to-10",
    "date": "2026-08-05",
    "title": "Maximum amount of players in multiplayer raised to 10!",
    "content": [
      {
        "text": "Now up to 10 people can play together in local party or online multiplayer. This means more chaos, more powerups, more competition, more fun! I also added a daily champion card that you see on the homepage if you won yesterday's daily challenge. Have you already played today's daily challenge?"
      }
    ]
  },
  {
    "id": "2026-08-01-major-update-for-party-multiplayer",
    "date": "2026-08-01",
    "title": "Major Update for Party Multiplayer!",
    "content": [
      {
        "text": "The party mode is the core element of PixReveal. To increase the quality of the multiplayer, I tweaked the mechanics: if a player buzzers and gives a wrong answer, the round continues and the other players get a chance to buzzer themselves. This way buzzer spamming gets less rewarding, all players are more involved and the game becomes more dynamic."
      }
    ]
  },
  {
    "id": "2026-07-31-keyboard-controls-added",
    "date": "2026-07-31",
    "title": "Keyboard Controls added",
    "content": [
      {
        "text": "To enable better highscore strats, I added keyboard controls to the answer buttons in PixReveal. Press 1, 2, 3 or 4 on your keyboard to select the according answer. You can also display small key hints on the answer buttons by clicking the \"⌨️\" icon on the top right of the game screen. Especially in Inspect mode this should come in quite handy. On mobile this option is not available."
      }
    ]
  },
  {
    "id": "2026-07-30-confetti-effect-added",
    "date": "2026-07-30",
    "title": "Confetti Effect added",
    "content": [
      {
        "text": "Victories deserve a proper celebration! Setting a new highscore in Survival Mode, winning a local party game or beat your friends in an online match. Any of these achievements now trigger a confetti animation to reward you for your achievements in PixReveal. I will also add an info soon to inform you, if you won the Daily Challenge of the previous day. Stay tuned."
      }
    ]
  },
  {
    "id": "2026-07-24-support-pixreveal-on-ko-fi",
    "date": "2026-07-24",
    "title": "Support PixReveal on Ko-fi",
    "content": [
      {
        "text": "My priority remains keeping PixReveal 100% free for everyone. Still I have running costs to host PixReveal. If you enjoy playing and want to support the project, I’ve set up a Ko-fi page! Any support helps cover server costs and fuels future updates. "
      },
      {
        "text": "PixReveal on Ko-fi",
        "href": "https://ko-fi.com/pixreveal"
      }
    ]
  },
  {
    "id": "2026-07-20-fill-button-for-the-pixel-art-editor",
    "date": "2026-07-20",
    "title": "Fill button for the pixel art editor",
    "content": [
      {
        "text": "I highly appreciate users submitting pixel art to PixReveal via my "
      },
      {
        "text": "Editor",
        "to": "/editor"
      },
      {
        "text": "! Thank you all! Since I saw some users coloring the background, I added a fill button. By clicking it every pixel without a set color will be turned into the currently selected color."
      }
    ]
  },
  {
    "id": "2026-07-14-adding-more-juice-shake-effect-on-low-timer",
    "date": "2026-07-14",
    "title": "Adding more juice: Shake effect on low timer",
    "content": [
      {
        "text": "To make the gameplay more exciting I added a shake effect. When the timer reaches 3 or lower, the canvas starts shaking. Increasing the tension and dynamics of PixReveal. The shake effect is available in all game modes."
      }
    ]
  },
  {
    "id": "2026-07-09-adding-more-juice-shine-effect-after-answering",
    "date": "2026-07-09",
    "title": "Adding more juice: Shine effect after answering",
    "content": [
      {
        "text": "\"Juice\" describes audio visual elements that make a game feel more \"gamey\". To achieve this I added a shine effect on the feedback animation after giving an answer ✅/❌ and on the revealed drawing. The effect is available in all game modes."
      }
    ]
  },
  {
    "id": "2026-06-10-improved-game-round-generation",
    "date": "2026-06-10",
    "title": "Improved game round generation",
    "content": [
      {
        "text": "When you start a game of PixReveal, a random set of quiz rounds is being generated for you. To increase the fun and avoid annoying early repetition of drawings between rounds, I tweaked the algorithm to create as many unique sets of drawings as possible before repeating one. Since PixReveal now has over 200 unique drawings including user generated content, it will take you a while until you see a drawing you already know."
      }
    ]
  },
  {
    "id": "2026-06-05-hall-of-fame-for-daily-challenge-winners",
    "date": "2026-06-05",
    "title": "Hall of Fame for Daily Challenge winners",
    "content": [
      {
        "text": "So far PixReveal only had a daily leaderboard for the current day and the day before. This felt a bit lame. I wanted to honor the winners more. Therefore I added a Hall of Fame, where each daily winner is displayed with their name, avatar, score and the date they won. You can check it out here: "
      },
      {
        "text": "enter Hall of Fame",
        "to": "/hall-of-fame"
      }
    ]
  },
  {
    "id": "2026-05-28-new-sudden-death-added-to-party-mode",
    "date": "2026-05-28",
    "title": "New sudden death added to party mode!",
    "content": [
      {
        "text": "For the case of multiple players having the most points at the end of party mode, I added sudden death. Keep playing until there is only one winner! If you were not among the top players, you can still react to the game using emotes or influence the outcome by using your remaining powerups. Along with new sudden death there also is a new party title awarded for the survivor."
      }
    ]
  },
  {
    "id": "2026-05-27-more-music-and-adjusted-difficulty",
    "date": "2026-05-27",
    "title": "More music and adjusted difficulty!",
    "content": [
      {
        "text": "Listening to the same music over and over again gets tedious, right? To keep things fresh I added a random song selection, choosing one of four songs to play during gameplay. Additionally as a consequence of player feedback I adjusted the difficulty of Inspect mode. By making the lens larger, it is now easier to spot the hidden pixel art and more enjoyable for all players."
      }
    ]
  },
  {
    "id": "2026-05-23-new-bonus-rounds-in-singleplayer-and-online-multiplayer",
    "date": "2026-05-23",
    "title": "New Bonus rounds in singleplayer and online multiplayer!",
    "content": [
      {
        "text": "Local party multiplayer already had them. Now singleplayer and online mutlplayer have them, too! Bonus rounds mix up the gameplay by making it harder to guess. But at the same time you get the chance to score twice as much! Inspect mode and Survival won't have these bonus rounds, since it does not fit the gameplay style. These will get their own additional mechanics. Stay tuned!"
      }
    ]
  },
  {
    "id": "2026-05-17-bonus-rounds-in-party-multiplayer",
    "date": "2026-05-17",
    "title": "Bonus rounds in party multiplayer",
    "content": [
      {
        "text": "Jackbox style party mode becomes more dynamic! New bonus rounds added: blur, sepia and black&white. On top of that in a bonus round points and malus are doubled. You can win 2 points, but you could also lose 4 points! Classic risk versus reward. In the final round points are also doubled now to guarantee an exciting finish!"
      }
    ]
  },
  {
    "id": "2026-05-16-party-multiplayer-titles-and-moderator-improvements",
    "date": "2026-05-16",
    "title": "Party multiplayer titles and moderator improvements",
    "content": [
      {
        "text": "The game over view for the party mode got an upgrade! The moderator now comments on the results of the game. Players earn titles based on the way they played. The saboteur used the most powerups while the pacifist did not use any at all. Manage to answer correctly while scrambled powerup is active to earn a title. Or the spammer title for spamming emojis. We all know a person like that... Additionally the game over screen now provides emoji statistics: how many emojis were clicked and which emoji was the most popular. Upcoming multiplayer feature will be bonus rounds, mixing up the gameplay and offering a chance to gain bonus points."
      }
    ]
  },
  {
    "id": "2026-05-15-powerups-in-multiplayer",
    "date": "2026-05-15",
    "title": "Powerups in multiplayer",
    "content": [
      {
        "text": "Next step to give the local party multiplayer more of a jackbox vibe: I just added powerups! Use the freeze powerup to stop your friends from hitting the buzzer. Turn the lights out for a few seconds to make it harder to guess. Or sabotage them even further by scrambling up the answer options. Besides that the first version of my moderator robot (not AI) is introduced. In the future it will be more prominent on PixReveal. Stay tuned!"
      }
    ]
  },
  {
    "id": "2026-05-14-emotes-in-party-multiplayer",
    "date": "2026-05-14",
    "title": "Emotes in Party Multiplayer",
    "content": [
      {
        "text": "To improve the \"party feeling\" of the jackbox style party multiplayer, I added an emote feature. Send reactions from your phone to the host device to react to the current game (or distract other players). Following soon is statistics about used emotes in the end of the round."
      }
    ]
  },
  {
    "id": "2026-05-12-user-art-gallery",
    "date": "2026-05-12",
    "title": "User Art Gallery",
    "content": [
      {
        "text": "PixReveal features a pixel art editor to submit your own pixel art to be added to the game. Out of appreciation for art created, I built a "
      },
      {
        "text": "user art gallery",
        "to": "/user-gallery"
      },
      {
        "text": " page displaying all (approved) user generated drawings. You can also use the gallery to check if your drawing was already approved. If it is not listed yet, then approval is still pending."
      }
    ]
  },
  {
    "id": "2026-05-11-qr-codes-for-sharing-multiplayer-invite-link",
    "date": "2026-05-11",
    "title": "QR codes for sharing multiplayer invite link",
    "content": [
      {
        "text": "Multiplayer mode is one of the most popular features on PixReveal! To make it easier to play together, I added QR codes as option to share the invite link. This becomes especially handy in Local Party Mode. When the game is displayed on the home device, simply scan the QR code from the TV/monitor and you can join immidiately. No need to type in the room id manually or trying to figure out how to get the invite link sent from PC to a smartphone. I am also working on further improving the connection handling and adding more gameplay features to the multiplayer. So stay tuned!"
      }
    ]
  },
  {
    "id": "2026-05-01-daily-challenges-added",
    "date": "2026-05-01",
    "title": "Daily Challenges added",
    "content": [
      {
        "text": "It was in planning for a while, now I can finally announce that daily challenges are available on PixReveal! Solve a new set of pixel art drawings every day and put your name on the leaderboard! All players play the same set per day. The game mode varies between Classic Reveal, Gravity and Inspect. Check every day for a new quick challenge and compete with the world for the top rank."
      }
    ]
  },
  {
    "id": "2026-04-24-ui-aesthetics-update-tile-refinement",
    "date": "2026-04-24",
    "title": "UI & Aesthetics Update: Tile Refinement",
    "content": [
      {
        "text": "I’ve overhauled the main menu and mode selection grids to enhance visual clarity and player intuition. By introducing a dynamic color-coding system, each game mode now carries its own distinct visual identity—ranging from vibrant \"Survival Red\" to \"Gravity Green.\" I also refined the Relative Color Syntax in CSS to ensure that every tile maintains its signature neon glow while improving contrast against the dark, pixel background. This adjustment doesn't just make the interface pop. It streamlines navigation, allowing you to identify your favorite game modes at a single glance."
      }
    ]
  },
  {
    "id": "2026-04-17-new-user-generated-content-submit-your-own-pixel-art",
    "date": "2026-04-17",
    "title": "New User Generated Content: Submit your own pixel art",
    "content": [
      {
        "text": "The core of PixReveal is its art, and now you can be a part of it. I have officially launched the User-Generated Content (UGC) "
      },
      {
        "text": "Editor",
        "to": "/editor"
      },
      {
        "text": ", allowing players to create and submit their own pixel art masterpieces directly within pixreveal.com. Once a design is submitted, it enters my moderation queue for a quick quality check. As soon as I’ve approved the submission, your artwork will be seamlessly integrated into the game, making it playable for everyone in both Solo and Multiplayer modes. To include user generated content, activate UGC in the settings. The bridge between the editor and the live game ensures a constantly evolving library of fresh, high-quality challenges for the community."
      }
    ]
  },
  {
    "id": "2026-04-10-local-party-mode-added-the-free-jackbox-alternative",
    "date": "2026-04-10",
    "title": "Local Party Mode Added: The Free Jackbox Alternative",
    "content": [
      {
        "text": "Bring the party to your living room with the new Local Party Mode — a completely free alternative to classic party games. The perfect game for your weekend! It works just like a classic Jackbox session: one central device, like your laptop or TV, acts as the Big Screen to display the drawing reveal and live rankings. Meanwhile, everyone else joins the fun using their smartphones as controllers. Internet connection required. The gameplay is fast and frantic: your phone displays a massive buzzer. The moment you think you recognize the pixel art, hit it! Only then will the four answer possibilities appear on your device. It’s a high-stakes race of speed and recognition that turns any gathering into a competitive pixel-guessing arena — no expensive consoles or extra controllers/apps required."
      }
    ]
  }
];
