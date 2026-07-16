const projectProgress = {
  percentage: 84
};

// Hello! You're probably here to credit yourself.
// Let me (ZaneDev) show you how
// The list below is how you can add yourself
// First, make sure the person above you has added a comma to their closing bracket (the } symbol)
// If so then you're ready.
// First, add your initals. (e.g. Kevin Kor -> kk, ZaneDev -> zv (I used my last name), Jaked -> jk, etc)
// From here you have a lot of things you can use for describing yourself. I'll list them off
// 
// name -> pretty self explanatory. just use a string containing your name
// initals -> make these your name initals used previously
// pfp -> link to your profile picture (preferably add it to the assets folder)
// url -> link to your website (e.g. zane.org, mgdproductions.com, kevinblog.sytes.net, etc.)
// role -> What you've done in the project. This defaults to "Community Supporter"
// pro -> Your pronouns :D. Use this to tell people your prefered pronouns (e.g. he/him, she/her, they/them, he/they, she/they, they/he/she, etc (there are basically an infinite amount of pronouns))

const authors = {
  kk: {
    name: "Kevin Kor",
    initials: "KK",
    pfp: "assets/pfp/kevin.png",
    url: "https://kevinblog.sytes.net/",
    pro: "she is preferred",
    role: "Project Lead & Organizer"
  },
  jk: {
    name: "Jaked",
    initials: "JK",
    pfp: "assets/pfp/jake.webp",
    role: "OpenJibo Server Maintainer"
  },
  zv: {
    name: "ZaneDev",
    initials: "ZV",
    pfp: "assets/pfp/zane.jpeg",
    url: "https://zane.org",
    pro: "they/any",
    role: "JiboOs Contributor & 5x1 (OpenJibo) Host & etc"
  },
  jc: {
    name: "JackCain",
    pfp: "assets/pfp/jack.webp",
    initials: "JC",
    role: ""
  },
  ww: {
    name: "Wyatt Woolford",
    initials: "WW",
    pfp: "assets/pfp/wyatt.webp",
    role: "Discord Server Booster"
  },
  ma: {
    name: "Maaarcna",
    initials: "MA",
    pfp: "assets/pfp/maaarcna.webp",
    url: "https://marcnoguera.dev",
    pro: "he/him",
    role: ""
  },
  mc: {
    name: "Marcel",
    initials: "MC",
    pfp: "assets/pfp/marcel.webp",
    url: "https://www.mgdproductions.com/",
    role: ""
  },
  rg: {
    name: "RobotGuy",
    initials: "RG",
    pfp: "assets/pfp/robotguy.webp",
    role: ""
  },
  zm: {
    name: "Zetoman",
    initials: "ZM",
    pfp: "assets/pfp/zetoman.webp",
    role: ""
  },
  ps: {
    name: "Padre_San",
    initials: "PS",
    pfp: "assets/pfp/padre_san.webp",
    role: ""
  },
  ar: {
    name: "Alex Rose (Expert at Jiboeology)",
    initials: "AR",
    pfp: "assets/pfp/jibotolgyst.png",
    role: "Cheif Jiboeologist and Internet Dumb Dum"
  },
  de: {
    name: "Dee",
    initials: "DE",
    pfp: "assets/pfp/dee.webp",
    role: ""
  },
  dm: {
    name: "Demme",
    initials: "DM",
    pfp: "assets/pfp/demme.webp",
    pro: "she/they",
    role: "Community Manager & Assist"
  },
};

const commits = [
  {
    date: "2026-03-15",
    categories: ["RCM", "Firmware"],
    summary: "Abusing the RCM to access eMMC. Was able to read the entire eMMC, and from there enter a developer mode.",
    authors: ["kk", "zv"]
  },
  {
    date: "2026-03-03",
    categories: ["Board", "Firmware"],
    summary: "BOOTROM dump was a lost battle. The team is currently trying to get a custom version of U-Boot working.",
    authors: ["kk"]
  }
];
