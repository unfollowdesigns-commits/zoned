import type { ServiceCatalog } from "./types";

const en: ServiceCatalog = {
  natal: {
    title: "Natal astrology",
    short: "Natal",
    tagline: "An in-depth study of your birth chart, in its full structure.",
    lede:
      "The natal chart is a symbolic photograph of the sky at the moment of your birth. Reading it in depth reveals your resources, your challenges and the broad orientations of your life.",
    intro: [
      "Reading a natal chart is not a matter of adding up sign descriptions. It means understanding an architecture: the Ascendant as the point of entry, the houses that locate areas of life, the planets that embody psychological functions, the aspects through which they converse, and the rulerships that connect everything.",
      "This consultation is the foundation for all the others. It gives you a clear and nuanced overview of how you function, which we then explore further according to your questions.",
    ],
    explores: [
      "The Ascendant, Midheaven and the angles of the chart",
      "The twelve houses and the areas of life they illuminate",
      "Planets in signs, houses and at their exact degrees",
      "Major aspects and particular configurations",
      "Planetary rulerships and the chart's dominants",
      "Your resources, challenges, and emotional and relational dynamics",
    ],
    approach: [
      "I calculate and study your chart before the session, ranking the elements that structure it: what dominates, what repeats, what is held in tension.",
      "During the consultation I share this reading in a clear and accessible way, then we connect it with your experience and your questions.",
    ],
    questions: [
      "Better understanding my personality and its contradictions",
      "Identifying my resources and my blind spots",
      "Shedding light on my emotional needs and the way I relate",
      "Gaining perspective on a life direction",
    ],
    seoDescription:
      "In-depth natal astrology consultation: Ascendant, houses, planets, aspects, rulerships and degrees to understand your resources and dynamics.",
  },
  psychological: {
    title: "Psychological astrology",
    short: "Psychological",
    tagline: "The chart as a mirror of your inner dynamics.",
    lede:
      "Psychological astrology reads the natal chart through emotional needs, defence mechanisms and inner conflicts, to support a deeper knowledge of yourself.",
    intro: [
      "Some reactions seem beyond our control; some patterns repeat despite ourselves. Psychological astrology offers a symbolic framework to put words to these dynamics and understand their inner logic.",
      "The natal chart then becomes a mirror: it does not tell you who you should be — it shows how the different parts of you converse, and sometimes clash.",
    ],
    explores: [
      "Your fundamental emotional needs and how to nourish them",
      "Defence mechanisms and protective strategies",
      "Inner conflicts symbolised by tense aspects",
      "Behavioural patterns and relational repetitions",
      "The inner resources you can rely on",
      "Avenues for reflection and personal growth suited to your chart",
    ],
    approach: [
      "I pay particular attention to the Moon, the personal planets, tense aspects and the houses linked to inner life and relationships.",
      "The consultation is a space for dialogue: the reading sharpens as you respond, so it stays as close as possible to what you are living.",
    ],
    questions: [
      "Why do certain situations always stir the same emotions?",
      "How can I understand my reactions in close relationships?",
      "Which needs do I tend to neglect?",
      "How can I transform a pattern that weighs on me?",
    ],
    note:
      "Psychological astrology is a symbolic approach to self-knowledge. It is not therapy and does not replace support from a healthcare professional.",
    seoDescription:
      "Psychological astrology: emotional needs, defence mechanisms, inner conflicts and recurring patterns read through your natal chart.",
  },
  relational: {
    title: "Relational astrology",
    short: "Relational",
    tagline: "Synastry and composite charts: the symbolic dynamics of a bond.",
    lede:
      "When two charts meet, they create a unique dialogue. Relational astrology explores what draws you together, what creates tension, and what your relationship is seeking to build.",
    intro: [
      "A relationship is not simply the sum of two personalities. It sets needs, ways of communicating and inner histories resonating with each other. Relational astrology offers two complementary tools to explore it.",
    ],
    sections: [
      {
        title: "Synastry and compatibility",
        body: [
          "Synastry compares two natal charts: how one person's planets touch the other's, and in which houses they resonate.",
          "It sheds light on each person's emotional needs, communication, affinities, areas of tension and the dynamics that characterise the way you are together.",
        ],
      },
      {
        title: "Composite chart",
        body: [
          "The composite chart is calculated from the midpoints of both charts. It represents the relationship itself, as an entity in its own right.",
          "Studying it reveals the symbolic dynamics of the bond, how it works, what is at stake, and the major themes that emerge within it.",
        ],
      },
    ],
    explores: [
      "Each person's emotional needs and love languages",
      "Communication and how disagreements are handled",
      "Natural affinities and points of friction",
      "Significant inter-chart aspects and their degrees",
      "The relationship's own dynamics through the composite",
      "The lessons the bond brings into play",
    ],
    approach: [
      "I study each chart separately before relating them: a meeting can only be understood by knowing those who meet.",
      "The reading aims at understanding, never a verdict: compatibility cannot be reduced to a score.",
    ],
    questions: [
      "Why does this relationship stir such intense emotions in me?",
      "How can I communicate better with my partner?",
      "What is fundamentally at stake in our relationship?",
      "What keeps replaying between us?",
    ],
    seoDescription:
      "Synastry, astrological compatibility and composite charts: exploring the dynamics of a relationship, its affinities, tensions and stakes.",
  },
  karmic: {
    title: "Karmic astrology",
    short: "Karmic",
    tagline: "Lunar nodes, symbolic repetition and axes of growth.",
    lede:
      "Karmic astrology explores the repeating patterns, attachments and symbolic lessons inscribed in the chart, through the axis of the lunar nodes and related factors.",
    intro: [
      "The lunar nodal axis describes a tension between what is familiar — almost too familiar — and what we are called to grow towards. Read alongside the rest of the chart, it illuminates what repeats in a life path and what seeks to evolve.",
      "I approach it as a symbolic language of personal and relational growth, without fatalism: the aim is to understand tendencies, not to submit to a fate.",
    ],
    explores: [
      "The lunar nodal axis in signs, houses and degrees",
      "Aspects to the nodes and their ruling planets",
      "Repeating patterns and symbolic attachments",
      "The lessons and axes of growth suggested by the chart",
      "The karmic dimension of a relationship, when the question calls for it",
    ],
    approach: [
      "The nodes are never read alone: their rulers, aspects and house placement give them their true relief.",
      "The consultation focuses on concrete avenues for stepping out of repetition and opening new possibilities.",
    ],
    questions: [
      "Why do I feel I keep reliving the same situations?",
      "What is my chart inviting me to grow towards?",
      "What is replaying in a relationship that feels 'already known'?",
      "How can I let go of a familiar but limiting pattern?",
    ],
    seoDescription:
      "Karmic astrology: lunar nodes, recurring patterns, attachments and axes of personal and relational growth.",
  },
  progressed: {
    title: "Progressed charts",
    short: "Progressions",
    tagline: "The chart in motion: your stages of inner transformation.",
    lede:
      "Your natal chart evolves symbolically with you. Progressions make it possible to explore inner transformations and the stages of your personal development.",
    intro: [
      "If the natal chart describes a potential, progressions show how it matures over time. The progressed Moon, progressed planets changing sign or house, and their aspects to the natal chart signal inner seasons.",
      "This reading helps to give meaning to a period of life, to understand a transition in progress and to approach the next ones with greater awareness.",
    ],
    explores: [
      "The progressed Moon cycle and your current emotional climate",
      "Progressed planets changing sign and house",
      "Progressed aspects to the natal chart",
      "The major symbolic stages of your development",
      "Insight into a period of transition",
    ],
    approach: [
      "I always relate progressions back to the natal chart: they only make sense in light of the structure they set in motion.",
      "The reading focuses on inner process rather than predicting events.",
    ],
    questions: [
      "What stage am I going through?",
      "Why are my priorities shifting right now?",
      "How can I support an inner transformation?",
      "Which themes will mature in the years ahead?",
    ],
    seoDescription:
      "Progressed charts: progressed Moon and planetary progressions to explore your inner evolution and stages of transformation.",
  },
  degrees: {
    title: "Degrees and planetary configurations",
    short: "Degrees",
    tagline: "The precision of the degree in service of interpretation.",
    lede:
      "Degrees are central to my method. A planet's exact degree, and its context in the chart, refine the understanding of astrological configurations.",
    intro: [
      "Two people born under the same sign can have planets at very different degrees — and therefore charts that look nothing alike. The degree specifies the strength of an aspect, reveals subtle links between planets and highlights configurations that the sign alone does not show.",
      "This attention to detail is what distinguishes a general reading from a truly personal one.",
    ],
    explores: [
      "The exact degrees of planets and angles",
      "Orbs and the exactness of aspects",
      "Sensitive degrees and emphasised points in the chart",
      "Particular configurations (T-square, grand trine, stellium…)",
      "Degree resonances between two charts, in synastry",
    ],
    approach: [
      "I integrate degree reading into the whole chart: a degree only makes sense in context — sign, house, ruler and aspects.",
      "This approach can be the focus of a dedicated consultation or enrich all the others.",
    ],
    questions: [
      "What makes my chart unique beyond the signs?",
      "Why does a particular aspect feel so strong for me?",
      "Which configurations structure my chart?",
      "How can I refine a reading I already know?",
    ],
    seoDescription:
      "In-depth reading of planetary degrees and astrological configurations for a precise, personalised interpretation of the natal chart.",
  },
  healing: {
    title: "Symbolic planetary healing",
    short: "Symbolic healing",
    tagline: "Personalised practices inspired by the symbols of your chart.",
    lede:
      "Starting from your natal chart, I explore the tensions symbolised by certain configurations and the resources that can be mobilised to support personal work.",
    intro: [
      "Each planet symbolises a function: asserting yourself, loving, communicating, building structure, connecting… When a configuration is under tension, the corresponding function can feel difficult to live. Symbolic healing means looking, within the very language of the chart, for ways to befriend it.",
      "Depending on your chart and your needs, this approach can identify activities, introspective practices and avenues for personal development linked to astrological symbols.",
    ],
    explores: [
      "The planets and configurations under tension in your chart",
      "The planetary resources you can lean on",
      "Activities and introspective practices that resonate with your symbols",
      "Concrete, tailored avenues for personal development",
    ],
    approach: [
      "Suggestions are always personalised: they come from your chart and from what is meaningful to you — never from a one-size-fits-all recipe.",
      "This is symbolic work, to be woven into daily life at your own pace.",
    ],
    questions: [
      "How can I live more peacefully with a difficult configuration in my chart?",
      "Which practices could restore me?",
      "How can I draw on my resource planets?",
      "How can I continue the work begun in consultation?",
    ],
    note:
      "This approach is symbolic and oriented towards self-knowledge. It complements any professional care when such care is needed, and never replaces it.",
    seoDescription:
      "Symbolic planetary healing: personalised avenues for reflection and personal growth inspired by your natal chart.",
  },
};

export default en;
