/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   data/courses.js — the course catalogue
   ----------------------------------------------------------------------------
   The curriculum itself. Kept as plain data so that the same shape can later
   be served by the API (GET /api/courses) with no change to the views.

   Writing rules for everything in this file, applied throughout:
     · Titles say what you will be able to DO, not what the topic is called.
     · No jargon without a plain-language gloss in the same sentence.
     · Lessons run 8-14 minutes. Nothing longer; attention is a courtesy.
     · Every course opens with why it matters and ends with a practice run.
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});

  CS95.courses = [
    {
      id: "safety",
      icon: "shield",
      name: "Spotting AI Scams",
      shelf: "Safety",
      priority: true,
      tagline: "Recognise voice cloning, deepfakes and the new wave of convincing fake messages.",
      summary:
        "Criminals now use AI to copy a familiar voice from a few seconds of audio, and to write " +
        "letters and emails with no spelling mistakes to give them away. This course shows you " +
        "exactly what those attempts look and sound like, and gives you one simple habit that " +
        "defeats nearly all of them.",
      outcomes: [
        "Name the three things every AI scam needs from you: urgency, secrecy and money.",
        "Set up a family pass phrase that a cloned voice cannot know.",
        "Check a suspicious photo or video for the tell-tale signs of AI generation.",
        "Hang up, verify and report — in that order — without feeling rude."
      ],
      lessons: [
        { title: "Why the old advice about spelling mistakes no longer works", minutes: 9 },
        { title: "The grandparent call, rebuilt with a cloned voice", minutes: 12 },
        { title: "Your family pass phrase: setting one up tonight", minutes: 8 },
        { title: "Deepfake photos and videos: four things to look at", minutes: 11 },
        { title: "Text messages that know your name and your bank", minutes: 10 },
        { title: "Practice run: ten messages, real or fake?", minutes: 14 }
      ]
    },
    {
      id: "prompting",
      icon: "balloon",
      name: "Talking To AI Clearly",
      shelf: "Everyday",
      tagline: "Prompting taught as what it really is — briefing a capable new assistant.",
      summary:
        "You have spent a lifetime asking people for things clearly: a pharmacist, a mechanic, " +
        "a new employee on their first day. That is the whole skill. This course maps that " +
        "experience directly onto AI assistants, so you start from expertise rather than from zero.",
      outcomes: [
        "Brief an assistant the way you would brief a capable stranger.",
        "Give context, purpose and audience in one short paragraph.",
        "Ask for a redraft instead of accepting the first answer.",
        "Recognise when the assistant is guessing, and say so."
      ],
      lessons: [
        { title: "It is a new assistant, not a search box", minutes: 10 },
        { title: "The four things worth saying every time", minutes: 12 },
        { title: "Asking for it again, but shorter / warmer / plainer", minutes: 9 },
        { title: "When the answer is confidently wrong", minutes: 11 },
        { title: "Practice run: brief the assistant on a real errand", minutes: 13 }
      ]
    },
    {
      id: "writing",
      icon: "book",
      name: "Writing With Help",
      shelf: "Everyday",
      tagline: "Letters, emails and family stories that still sound like you.",
      summary:
        "An AI assistant is at its best on the blank page: the difficult letter to an insurer, " +
        "the note to a grandchild you keep rewriting, the family story you have been meaning to " +
        "set down for years. The rule throughout this course is that your voice stays yours.",
      outcomes: [
        "Turn a rough set of notes into a clear letter in one pass.",
        "Keep your own phrasing while letting the assistant fix the structure.",
        "Draft a firm complaint that stays polite and gets read.",
        "Record a family story by talking, not typing."
      ],
      lessons: [
        { title: "The difficult letter you have been putting off", minutes: 12 },
        { title: "Making it sound like you and not like a robot", minutes: 10 },
        { title: "Complaints that get answered", minutes: 11 },
        { title: "Telling a family story out loud and keeping it", minutes: 13 }
      ]
    },
    {
      id: "voice",
      icon: "mic",
      name: "Hands-Free With Your Voice",
      shelf: "Everyday",
      tagline: "Do it by speaking when typing is slow, painful or simply annoying.",
      summary:
        "Speaking to a device is often the shortest route for anyone with arthritis, tremor, or " +
        "eyes that tire on small print. This course covers the assistants already built into the " +
        "phone or speaker you own, and where their limits genuinely are.",
      outcomes: [
        "Set reminders, timers and appointments by speaking.",
        "Have the news, the weather and your messages read aloud.",
        "Dictate a message and correct it without a keyboard.",
        "Know which tasks a voice assistant should never be trusted with."
      ],
      lessons: [
        { title: "Waking it up and getting it to listen", minutes: 8 },
        { title: "Reminders, timers and the medicine cabinet", minutes: 10 },
        { title: "Dictating a message and fixing what it heard", minutes: 11 },
        { title: "What not to do by voice — banking and passwords", minutes: 9 }
      ]
    },
    {
      id: "health",
      icon: "pulse",
      name: "AI For Health And Wellbeing",
      shelf: "Daily Life",
      tagline: "Understand your own records, prepare for appointments, keep track of medication.",
      summary:
        "AI cannot diagnose you and this course never suggests it can. What it can do is translate " +
        "a letter full of medical terms into plain English, help you arrive at an appointment with " +
        "your questions written down, and keep a medication schedule straight.",
      outcomes: [
        "Turn a hospital letter into plain English you can act on.",
        "Arrive at an appointment with five clear written questions.",
        "Keep a medication and dosage list that you can hand to anyone.",
        "Spot health advice that is confidently made up."
      ],
      lessons: [
        { title: "Reading a letter from the hospital, in plain English", minutes: 11 },
        { title: "Writing down your questions before the appointment", minutes: 9 },
        { title: "A medication list that fits in your wallet", minutes: 10 },
        { title: "Where AI health advice goes wrong, and why", minutes: 12 }
      ]
    },
    {
      id: "money",
      icon: "coins",
      name: "Money, Budgets And Fraud Alerts",
      shelf: "Daily Life",
      tagline: "Track spending, read statements and catch unusual charges early.",
      summary:
        "Banks already run AI on your account looking for unusual activity. This course puts you " +
        "on the same footing: reading a statement properly, setting the alerts your bank already " +
        "offers, and knowing precisely which number to ring when something looks wrong.",
      outcomes: [
        "Read a bank or card statement line by line with confidence.",
        "Switch on the fraud alerts your bank already provides for free.",
        "Build a simple monthly budget you will actually keep.",
        "Know the one thing your bank will never ask you for."
      ],
      lessons: [
        { title: "What the alerts from your bank actually mean", minutes: 10 },
        { title: "A budget on one page", minutes: 12 },
        { title: "Subscriptions you forgot you were paying for", minutes: 9 },
        { title: "The call that claims to be from your bank", minutes: 11 }
      ]
    },
    {
      id: "cognitive",
      icon: "brain",
      name: "Memory, Notes And Organisation",
      shelf: "Daily Life",
      tagline: "Use AI as a second memory for names, dates and where you put things.",
      summary:
        "Not a brain-training gimmick. Practical scaffolding: a running list the assistant can " +
        "search for you, summaries of long documents, and a daily routine that takes five minutes " +
        "and removes a great deal of low-grade worry.",
      outcomes: [
        "Keep one searchable list instead of fifteen scraps of paper.",
        "Get a long document down to five honest bullet points.",
        "Build a five-minute morning routine that holds the week together.",
        "Set up a reminder that actually reaches you in time."
      ],
      lessons: [
        { title: "One list, searchable, on whatever device is nearest", minutes: 9 },
        { title: "Long document in, five bullet points out", minutes: 11 },
        { title: "The five-minute morning routine", minutes: 8 },
        { title: "Names, faces and the family tree", minutes: 10 }
      ]
    },
    {
      id: "workforce",
      icon: "briefcase",
      name: "AI At Work After 55",
      shelf: "Working Life",
      tagline: "For people still in the workforce — expertise plus AI, not AI instead of expertise.",
      summary:
        "Built for employers and public-sector partners upskilling experienced staff. The framing " +
        "throughout is that decades of judgement is the scarce asset and AI is the multiplier. " +
        "Examples are drawn from the learner's own sector, not from a technology company.",
      outcomes: [
        "Identify the three tasks in your own week worth handing to AI first.",
        "Check AI output against professional judgement, and document the check.",
        "Explain to a colleague what the tool can and cannot be trusted with.",
        "Follow your employer's rules on confidential information."
      ],
      lessons: [
        { title: "Your experience is the scarce part", minutes: 10 },
        { title: "Three tasks from your own week", minutes: 12 },
        { title: "Checking the work before it goes out with your name on it", minutes: 13 },
        { title: "Confidential information: what must never be pasted in", minutes: 11 },
        { title: "Explaining it to the colleague at the next desk", minutes: 9 }
      ]
    }
  ];

  CS95.shelves = ["Safety", "Everyday", "Daily Life", "Working Life"];

  CS95.courseById = function (id) {
    return CS95.courses.filter(function (course) { return course.id === id; })[0] || null;
  };

  CS95.courseMinutes = function (course) {
    return course.lessons.reduce(function (total, lesson) { return total + lesson.minutes; }, 0);
  };
})();
