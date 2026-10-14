import type { ServiceCatalog } from "./types";

const fr: ServiceCatalog = {
  natal: {
    title: "Astrologie natale",
    short: "Natale",
    tagline: "L'étude approfondie de votre thème de naissance, dans toute sa structure.",
    lede:
      "Le thème natal est une photographie symbolique du ciel au moment de votre naissance. Sa lecture approfondie permet d'explorer vos ressources, vos défis et les grandes orientations de votre vie.",
    intro: [
      "Lire un thème natal, ce n'est pas additionner des descriptions de signes. C'est comprendre une architecture : l'Ascendant qui donne l'angle d'entrée, les maisons qui situent les domaines de vie, les planètes qui incarnent les fonctions psychiques, leurs aspects qui les font dialoguer et les maîtrises qui relient le tout.",
      "Cette consultation est le socle de toutes les autres. Elle vous offre une vision d'ensemble claire et nuancée de votre fonctionnement, que nous approfondissons ensuite selon vos questions.",
    ],
    explores: [
      "L'Ascendant, le Milieu du Ciel et les angles du thème",
      "Les douze maisons et les domaines de vie qu'elles éclairent",
      "Les planètes en signes, en maisons et à leurs degrés précis",
      "Les aspects majeurs et les configurations particulières",
      "Les maîtrises planétaires et les dominantes du thème",
      "Vos ressources, vos défis et vos dynamiques émotionnelles et relationnelles",
    ],
    approach: [
      "Je calcule et j'étudie votre thème en amont de la séance, en hiérarchisant les éléments qui le structurent : ce qui domine, ce qui se répète, ce qui est mis en tension.",
      "Pendant la consultation, je vous restitue cette lecture de manière claire et accessible, puis nous la relions à votre vécu et à vos questions.",
    ],
    questions: [
      "Mieux comprendre ma personnalité et mes contradictions",
      "Identifier mes ressources et mes points de vigilance",
      "Éclairer mes besoins affectifs et ma façon d'être en relation",
      "Prendre du recul sur une orientation de vie",
    ],
    seoDescription:
      "Consultation d'astrologie natale approfondie : Ascendant, maisons, planètes, aspects, maîtrises et degrés pour comprendre vos ressources et vos dynamiques.",
    faq: [
      { q: "Qu'est-ce qu'un thème natal ?", a: "Le thème natal est la carte du ciel au moment exact et au lieu de votre naissance. Il indique la position des planètes dans les douze signes et les douze maisons, ainsi que les angles qu'elles forment entre elles (les aspects). C'est la base de toute lecture astrologique personnalisée." },
      { q: "Pourquoi l'heure de naissance est-elle importante ?", a: "L'heure de naissance détermine l'Ascendant et la position des maisons, qui changent environ toutes les deux heures pour l'Ascendant et beaucoup plus vite pour les degrés. Sans heure, la lecture reste possible mais se concentre sur les planètes, les signes et les aspects." },
      { q: "Que vais-je apprendre lors d'une lecture de thème natal ?", a: "La consultation met en lumière la structure de votre thème : vos dominantes, vos ressources, vos zones de tension, vos besoins affectifs et la manière dont ces éléments s'articulent. Elle se termine par des pistes de réflexion reliées à vos propres questions." },
    ],
  },
  psychological: {
    title: "Astrologie psychologique",
    short: "Psychologique",
    tagline: "Le thème comme miroir de vos dynamiques intérieures.",
    lede:
      "L'astrologie psychologique lit le thème natal sous l'angle des besoins émotionnels, des mécanismes de défense et des conflits intérieurs, pour favoriser une meilleure connaissance de soi.",
    intro: [
      "Certaines réactions semblent nous échapper ; certains schémas se répètent malgré nous. L'astrologie psychologique propose une grille de lecture symbolique pour mettre des mots sur ces dynamiques et comprendre leur logique intérieure.",
      "Le thème natal devient alors un miroir : il ne dit pas qui vous devez être, il éclaire la manière dont vos différentes parts dialoguent — et parfois s'opposent.",
    ],
    explores: [
      "Vos besoins émotionnels fondamentaux et la manière de les nourrir",
      "Les mécanismes de défense et les stratégies de protection",
      "Les conflits intérieurs symbolisés par les aspects de tension",
      "Les schémas comportementaux et les répétitions relationnelles",
      "Les ressources psychiques sur lesquelles vous appuyer",
      "Des pistes de réflexion et de développement personnel adaptées à votre thème",
    ],
    approach: [
      "J'accorde une attention particulière à la Lune, aux planètes personnelles, aux aspects de tension et aux maisons liées à l'intériorité et aux relations.",
      "La consultation est un espace d'échange : la lecture se précise au fil de vos retours, pour rester au plus près de ce que vous vivez.",
    ],
    questions: [
      "Pourquoi certaines situations réveillent-elles toujours les mêmes émotions ?",
      "Comment comprendre mes réactions dans les relations proches ?",
      "Quels besoins ai-je tendance à négliger ?",
      "Comment transformer un schéma qui me pèse ?",
    ],
    note:
      "L'astrologie psychologique est une démarche symbolique de connaissance de soi. Elle ne constitue pas une thérapie et ne remplace pas un accompagnement par un professionnel de santé.",
    seoDescription:
      "Astrologie psychologique : besoins émotionnels, mécanismes de défense, conflits intérieurs et schémas répétitifs lus à travers votre thème natal.",
    faq: [
      { q: "Qu'est-ce que l'astrologie psychologique ?", a: "L'astrologie psychologique utilise le thème natal comme une grille de lecture symbolique de la personnalité : besoins émotionnels, mécanismes de défense, conflits intérieurs et schémas répétitifs. Son objectif est la connaissance de soi, pas la prédiction d'événements." },
      { q: "L'astrologie psychologique remplace-t-elle une thérapie ?", a: "Non. Il s'agit d'une démarche symbolique de connaissance de soi. Elle peut accompagner une réflexion personnelle mais ne remplace jamais un suivi par un psychologue, un psychiatre ou un autre professionnel de santé." },
      { q: "Quels éléments du thème sont les plus étudiés ?", a: "La Lune, les planètes personnelles (Soleil, Mercure, Vénus, Mars), les aspects de tension comme les carrés et les oppositions, ainsi que les maisons liées à l'intériorité et aux relations." },
    ],
  },
  relational: {
    title: "Astrologie relationnelle",
    short: "Relationnelle",
    tagline: "Synastrie et thème composite : la dynamique symbolique d'un lien.",
    lede:
      "Deux thèmes qui se rencontrent créent un dialogue unique. L'astrologie relationnelle explore ce qui vous rapproche, ce qui vous met en tension et ce que votre relation cherche à construire.",
    intro: [
      "Une relation n'est pas la simple somme de deux personnalités. Elle met en résonance des besoins, des modes de communication et des histoires intérieures. L'astrologie relationnelle propose deux outils complémentaires pour l'explorer.",
    ],
    sections: [
      {
        title: "Synastrie et compatibilité",
        body: [
          "La synastrie compare les deux thèmes natals : comment les planètes de l'un touchent celles de l'autre, et dans quelles maisons elles viennent résonner.",
          "Elle éclaire les besoins affectifs de chacun, la communication, les affinités, les zones de tension et les dynamiques qui caractérisent votre façon d'être ensemble.",
        ],
      },
      {
        title: "Thème composite",
        body: [
          "Le thème composite est calculé à partir des points médians des deux thèmes. Il représente la relation elle-même, comme une entité à part entière.",
          "Son étude révèle la dynamique symbolique du lien, son fonctionnement, ses enjeux et les thèmes majeurs qui s'y manifestent.",
        ],
      },
    ],
    explores: [
      "Les besoins affectifs et les langages amoureux de chacun",
      "La communication et la gestion des désaccords",
      "Les affinités naturelles et les zones de friction",
      "Les aspects inter-thèmes significatifs et leurs degrés",
      "La dynamique propre de la relation à travers le composite",
      "Les apprentissages que le lien met en jeu",
    ],
    approach: [
      "J'étudie séparément chaque thème avant de les mettre en relation : on ne peut comprendre une rencontre qu'en connaissant ceux qui se rencontrent.",
      "La lecture vise la compréhension, jamais le verdict : une compatibilité ne se résume pas à un score.",
    ],
    questions: [
      "Pourquoi cette relation me fait-elle vivre des émotions si intenses ?",
      "Comment mieux communiquer avec mon ou ma partenaire ?",
      "Quels sont les enjeux de fond de notre couple ?",
      "Qu'est-ce qui se rejoue entre nous ?",
    ],
    seoDescription:
      "Synastrie, compatibilité astrologique et thème composite : explorer la dynamique d'une relation, ses affinités, ses tensions et ses enjeux.",
    faq: [
      { q: "Qu'est-ce que la synastrie ?", a: "La synastrie est la comparaison de deux thèmes natals. Elle étudie comment les planètes d'une personne entrent en résonance avec celles de l'autre, afin d'éclairer les affinités, les tensions, la communication et les besoins affectifs au sein d'une relation." },
      { q: "Quelle est la différence entre synastrie et thème composite ?", a: "La synastrie compare deux thèmes pour comprendre l'interaction entre deux personnes. Le thème composite est un thème unique calculé à partir des points médians des deux thèmes : il représente la relation elle-même, comme une entité à part entière." },
      { q: "Faut-il les données de naissance des deux personnes ?", a: "Oui. Pour une synastrie ou un thème composite, la date, le lieu et idéalement l'heure de naissance des deux personnes sont nécessaires. L'accord de la seconde personne est recommandé." },
    ],
  },
  karmic: {
    title: "Astrologie karmique",
    short: "Karmique",
    tagline: "Nœuds lunaires, répétitions symboliques et axes d'évolution.",
    lede:
      "L'astrologie karmique explore les schémas répétitifs, les attachements et les apprentissages symboliques inscrits dans le thème, à travers l'axe des nœuds lunaires et les facteurs qui s'y rattachent.",
    intro: [
      "L'axe des nœuds lunaires dessine une tension entre ce qui est familier — presque trop — et ce vers quoi nous sommes appelés à grandir. Sa lecture, reliée au reste du thème, éclaire ce qui se répète dans un parcours et ce qui cherche à évoluer.",
      "Je l'aborde comme un langage symbolique d'évolution personnelle et relationnelle, sans fatalisme : il s'agit de comprendre des tendances, pas de subir un destin.",
    ],
    explores: [
      "L'axe des nœuds lunaires en signes, en maisons et à leurs degrés",
      "Les aspects aux nœuds et les planètes qui les maîtrisent",
      "Les schémas répétitifs et les attachements symboliques",
      "Les apprentissages et les axes d'évolution suggérés par le thème",
      "La dimension karmique d'une relation, lorsque la question le demande",
    ],
    approach: [
      "Les nœuds ne sont jamais lus seuls : leurs maîtres, leurs aspects et leur position dans les maisons donnent leur véritable relief.",
      "La consultation met l'accent sur des pistes concrètes pour sortir des répétitions et investir de nouveaux possibles.",
    ],
    questions: [
      "Pourquoi ai-je l'impression de revivre les mêmes situations ?",
      "Vers quoi mon thème m'invite-t-il à évoluer ?",
      "Que se rejoue-t-il dans une relation qui me semble « déjà connue » ?",
      "Comment me détacher d'un schéma familier mais limitant ?",
    ],
    seoDescription:
      "Astrologie karmique : nœuds lunaires, schémas répétitifs, attachements et axes d'évolution personnelle et relationnelle.",
    faq: [
      { q: "Que sont les nœuds lunaires en astrologie ?", a: "Les nœuds lunaires sont les deux points où l'orbite de la Lune croise l'écliptique, le chemin apparent du Soleil. Toujours opposés, le nœud Sud et le nœud Nord forment un axe que l'astrologie karmique interprète comme un mouvement entre le familier et ce qui demande à se développer." },
      { q: "L'astrologie karmique parle-t-elle de vies antérieures ?", a: "Dans mon approche, l'astrologie karmique est lue comme un langage symbolique d'évolution : elle éclaire les schémas qui se répètent et les axes de croissance, sans affirmations invérifiables ni fatalisme." },
      { q: "À qui s'adresse une consultation karmique ?", a: "Aux personnes qui ont le sentiment de revivre les mêmes situations, dans leur vie personnelle ou leurs relations, et qui souhaitent comprendre ces répétitions pour s'en dégager." },
    ],
  },
  progressed: {
    title: "Thèmes progressés",
    short: "Progressions",
    tagline: "Le thème en mouvement : vos étapes de transformation intérieure.",
    lede:
      "Le thème natal évolue symboliquement avec vous. Les progressions permettent d'explorer les transformations intérieures et les étapes de votre développement personnel.",
    intro: [
      "Si le thème natal décrit un potentiel, les progressions montrent comment il mûrit dans le temps. La Lune progressée, les changements de signe ou de maison des planètes progressées et leurs aspects au thème natal signalent des saisons intérieures.",
      "Cette lecture aide à donner du sens à une période de vie, à comprendre une transition en cours et à préparer les suivantes avec plus de conscience.",
    ],
    explores: [
      "Le cycle de la Lune progressée et votre climat émotionnel actuel",
      "Les changements de signe et de maison des planètes progressées",
      "Les aspects progressés au thème natal",
      "Les grandes étapes symboliques de votre développement",
      "L'éclairage d'une période de transition",
    ],
    approach: [
      "Je relie toujours les progressions au thème natal : elles n'ont de sens qu'à la lumière de la structure qu'elles font évoluer.",
      "La lecture s'intéresse au processus intérieur plutôt qu'à la prédiction d'événements.",
    ],
    questions: [
      "Quelle étape suis-je en train de traverser ?",
      "Pourquoi mes priorités changent-elles en ce moment ?",
      "Comment accompagner une transformation intérieure ?",
      "Quels thèmes vont mûrir dans les années à venir ?",
    ],
    seoDescription:
      "Thèmes progressés : Lune progressée et progressions planétaires pour explorer vos évolutions intérieures et vos étapes de transformation.",
    faq: [
      { q: "Qu'est-ce qu'un thème progressé ?", a: "Le thème progressé fait évoluer symboliquement le thème natal dans le temps, selon la règle « un jour après la naissance pour une année de vie ». Il permet d'observer les étapes de maturation intérieure d'une personne." },
      { q: "Qu'est-ce que la Lune progressée ?", a: "La Lune progressée avance d'environ un signe tous les deux ans et demi. Sa position décrit le climat émotionnel d'une période et les besoins qui deviennent prioritaires à ce moment de la vie." },
      { q: "Les progressions prédisent-elles des événements ?", a: "Ma lecture des progressions s'intéresse au processus intérieur : comprendre une transition, donner du sens à une période. Elle ne vise pas à prédire des événements précis." },
    ],
  },
  degrees: {
    title: "Degrés et configurations planétaires",
    short: "Degrés",
    tagline: "La précision du degré au service de l'interprétation.",
    lede:
      "Les degrés occupent une place centrale dans ma méthode. Le degré exact d'une planète, et son contexte dans le thème, affinent la compréhension des configurations astrologiques.",
    intro: [
      "Deux personnes nées sous le même signe peuvent avoir des planètes à des degrés très différents — et donc des thèmes qui ne se ressemblent pas. Le degré précise l'intensité d'un aspect, révèle des liens discrets entre planètes et met en lumière des configurations que le signe seul ne laisse pas voir.",
      "Cette attention au détail est ce qui distingue une lecture générale d'une lecture véritablement personnelle.",
    ],
    explores: [
      "Les degrés précis des planètes et des angles",
      "Les orbes et l'exactitude des aspects",
      "Les degrés sensibles et les points mis en relief dans le thème",
      "Les configurations particulières (T-carré, grand trigone, stellium…)",
      "Les résonances de degrés entre deux thèmes, en synastrie",
    ],
    approach: [
      "J'intègre la lecture des degrés à l'ensemble du thème : un degré n'a de sens que dans son contexte — signe, maison, maître et aspects.",
      "Cette approche peut faire l'objet d'une consultation dédiée ou enrichir toutes les autres.",
    ],
    questions: [
      "Qu'est-ce qui rend mon thème singulier au-delà des signes ?",
      "Pourquoi tel aspect est-il si marquant pour moi ?",
      "Quelles configurations structurent mon thème ?",
      "Comment affiner une lecture que je connais déjà ?",
    ],
    seoDescription:
      "Lecture approfondie des degrés planétaires et des configurations astrologiques pour une interprétation précise et personnalisée du thème natal.",
    faq: [
      { q: "Pourquoi les degrés comptent-ils en astrologie ?", a: "Un signe s'étend sur trente degrés. Le degré exact d'une planète précise l'intensité de ses aspects, révèle des liens discrets avec d'autres planètes et distingue deux thèmes qui semblent identiques à l'échelle des signes." },
      { q: "Qu'est-ce qu'un orbe ?", a: "L'orbe est l'écart, en degrés, entre un aspect parfait et la position réelle de deux planètes. Plus l'orbe est faible, plus l'aspect est exact et marquant dans le thème." },
      { q: "Qu'est-ce qu'une configuration planétaire ?", a: "C'est un ensemble d'aspects reliant trois planètes ou plus, comme le T-carré, le grand trigone ou le stellium. Ces structures concentrent l'énergie du thème et en orientent souvent la lecture." },
    ],
  },
  healing: {
    title: "Guérison symbolique des planètes",
    short: "Guérison symbolique",
    tagline: "Des pratiques personnalisées, inspirées des symboles de votre thème.",
    lede:
      "À partir de votre thème natal, j'explore les tensions symbolisées par certaines configurations et les ressources qui peuvent être mobilisées pour accompagner un travail personnel.",
    intro: [
      "Chaque planète symbolise une fonction : s'affirmer, aimer, communiquer, se structurer, se relier… Lorsqu'une configuration est en tension, la fonction correspondante peut sembler difficile à vivre. La guérison symbolique consiste à rechercher, dans le langage même du thème, des manières de l'apprivoiser.",
      "Selon votre thème et vos besoins, cette approche permet d'identifier des activités, des pratiques d'introspection et des pistes de développement personnel en lien avec les symboles astrologiques.",
    ],
    explores: [
      "Les planètes et configurations en tension dans votre thème",
      "Les ressources planétaires sur lesquelles vous appuyer",
      "Des activités et pratiques d'introspection en résonance avec vos symboles",
      "Des pistes de développement personnel concrètes et adaptées",
    ],
    approach: [
      "Les propositions sont toujours personnalisées : elles découlent de votre thème et de ce qui a du sens pour vous, jamais d'une recette générale.",
      "Il s'agit d'un travail symbolique, à intégrer à votre rythme dans votre quotidien.",
    ],
    questions: [
      "Comment vivre plus sereinement une configuration difficile de mon thème ?",
      "Quelles pratiques pourraient me ressourcer ?",
      "Comment m'appuyer sur mes planètes ressources ?",
      "Comment prolonger le travail commencé en consultation ?",
    ],
    note:
      "Cette démarche s'inscrit dans une perspective symbolique et de connaissance de soi. Elle est complémentaire à toute prise en charge professionnelle lorsque celle-ci est nécessaire, et ne s'y substitue jamais.",
    seoDescription:
      "Guérison symbolique des planètes : pistes personnalisées de réflexion et de développement personnel inspirées de votre thème natal.",
    faq: [
      { q: "Qu'est-ce que la guérison symbolique des planètes ?", a: "C'est une approche qui part des configurations tendues du thème natal pour proposer des pratiques personnelles (activités, introspection, rituels du quotidien) en résonance avec le symbolisme des planètes concernées, afin d'apprivoiser les fonctions qu'elles représentent." },
      { q: "S'agit-il d'un soin médical ?", a: "Non. Le terme « guérison » est employé au sens symbolique. Cette démarche de connaissance de soi complète, sans jamais la remplacer, toute prise en charge médicale ou psychologique nécessaire." },
      { q: "Les pratiques proposées sont-elles personnalisées ?", a: "Oui. Elles découlent de votre thème et de ce qui a du sens pour vous ; il n'y a pas de recette générale." },
    ],
  },
};

export default fr;
