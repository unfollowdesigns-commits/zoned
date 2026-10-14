// Initial content shared by the seed script and demo mode. Import-free so Node scripts can load it directly.
import type { Client } from "@libsql/client";

type O = [slug: string, key: string, fr: string, en: string, ar: string, sfr: string, sen: string, sar: string, min: number, eur: number, partner: 0 | 1];
export const offerings: O[] = [
  ["theme-natal", "natal", "Thème natal approfondi", "In-depth natal chart", "دراسة معمّقة للخريطة الولادية",
    "Lecture complète de la structure du thème : angles, maisons, planètes, aspects, maîtrises et degrés.",
    "A complete reading of the chart's structure: angles, houses, planets, aspects, rulerships and degrees.",
    "قراءة شاملة لبنية الخريطة: الزوايا والبيوت والكواكب والجوانب والحكّام والدرجات.", 90, 120, 0],
  ["astrologie-psychologique", "psychological", "Astrologie psychologique", "Psychological astrology", "التنجيم النفسي",
    "Besoins émotionnels, mécanismes de défense, conflits intérieurs et schémas répétitifs.",
    "Emotional needs, defence mechanisms, inner conflicts and recurring patterns.",
    "الاحتياجات العاطفية وآليات الدفاع والصراعات الداخلية والأنماط المتكرّرة.", 90, 120, 0],
  ["synastrie", "relational", "Synastrie & compatibilité", "Synastry & compatibility", "السيناستري والتوافق",
    "Les deux thèmes mis en dialogue : affinités, tensions, besoins affectifs et communication.",
    "Two charts in dialogue: affinities, tensions, emotional needs and communication.",
    "حوار بين خريطتين: الانسجام والتوتّرات والاحتياجات العاطفية والتواصل.", 120, 160, 1],
  ["theme-composite", "relational", "Thème composite", "Composite chart", "الخريطة المركّبة",
    "La relation comme entité à part entière : sa dynamique, ses enjeux, ses thèmes majeurs.",
    "The relationship as an entity in its own right: its dynamics, stakes and major themes.",
    "العلاقة ككيان قائم بذاته: ديناميكيتها ورهاناتها وموضوعاتها الكبرى.", 90, 140, 1],
  ["astrologie-karmique", "karmic", "Astrologie karmique", "Karmic astrology", "التنجيم الكارمي",
    "Nœuds lunaires, répétitions symboliques et axes d'évolution personnelle et relationnelle.",
    "Lunar nodes, symbolic repetitions and axes of personal and relational growth.",
    "العقد القمرية والتكرارات الرمزية ومحاور التطوّر الشخصي والعلائقي.", 90, 120, 0],
  ["themes-progresses", "progressed", "Thèmes progressés", "Progressed charts", "الخرائط المتقدّمة",
    "Lune progressée et progressions planétaires : comprendre l'étape que vous traversez.",
    "Progressed Moon and planetary progressions: understanding the stage you are going through.",
    "القمر المتقدّم والتقدّمات الكوكبية: فهم المرحلة التي تعبرها.", 75, 100, 0],
  ["degres-configurations", "degrees", "Degrés & configurations", "Degrees & configurations", "الدرجات والتشكيلات",
    "Lecture fine des degrés, des orbes et des configurations particulières de votre thème.",
    "A fine reading of the degrees, orbs and particular configurations in your chart.",
    "قراءة دقيقة للدرجات والأفلاك والتشكيلات الخاصة في خريطتك.", 60, 90, 0],
  ["guerison-symbolique", "healing", "Guérison symbolique des planètes", "Symbolic planetary healing", "الشفاء الرمزي للكواكب",
    "Pistes et pratiques personnalisées inspirées des symboles de votre thème.",
    "Personalised avenues and practices inspired by the symbols of your chart.",
    "مسارات وممارسات مخصّصة مستوحاة من رموز خريطتك.", 75, 100, 0],
];

export const articles: { locale: string; slug: string; group: string; title: string; excerpt: string; body: string; daysAgo: number }[] = [
  {
    locale: "fr",
    slug: "noeuds-lunaires-un-axe-pas-un-destin",
    group: "noeuds-lunaires",
    title: "Nœuds lunaires : un axe, pas un destin",
    excerpt: "Les nœuds lunaires sont souvent présentés comme une fatalité karmique. Et si on les lisait plutôt comme un axe de croissance ?",
    daysAgo: 6,
    body: `Les nœuds lunaires ne sont pas des planètes : ce sont les deux points où l'orbite de la Lune croise le chemin apparent du Soleil. Toujours exactement opposés, ils dessinent un **axe** qui traverse le thème natal.

## Le familier et l'inconnu

Le nœud Sud décrit ce qui nous est familier — des compétences, des réflexes, parfois des refuges. Le nœud Nord pointe vers ce qui demande un effort, une ouverture, un apprentissage.

> Le nœud Sud n'est pas « mauvais » : c'est une ressource dont on peut devenir prisonnier.

## Lire l'axe dans son contexte

Un axe nodal ne se lit jamais seul. Pour l'interpréter, j'observe notamment :

- les **signes** et les **maisons** occupés par chacun des nœuds ;
- les **planètes qui les maîtrisent** et leur état dans le thème ;
- les **aspects** que les nœuds reçoivent, et leurs degrés précis.

C'est ce contexte qui transforme une formule générale en une lecture personnelle.

## Une invitation, pas une sentence

Dans ma pratique, l'astrologie karmique n'a rien de fataliste. Elle aide à repérer ce qui se répète, à comprendre pourquoi certains schémas nous rassurent autant qu'ils nous limitent — et à identifier des pistes concrètes pour avancer vers de nouveaux possibles.`,
  },
  {
    locale: "en",
    slug: "lunar-nodes-an-axis-not-a-destiny",
    group: "noeuds-lunaires",
    title: "Lunar nodes: an axis, not a destiny",
    excerpt: "The lunar nodes are often presented as karmic fate. What if we read them instead as an axis of growth?",
    daysAgo: 6,
    body: `The lunar nodes are not planets: they are the two points where the Moon's orbit crosses the Sun's apparent path. Always exactly opposite, they draw an **axis** across the natal chart.

## The familiar and the unknown

The South Node describes what is familiar to us — skills, reflexes, sometimes hiding places. The North Node points to what asks for effort, openness and learning.

> The South Node is not "bad": it is a resource we can become captive to.

## Reading the axis in context

A nodal axis is never read alone. To interpret it, I look in particular at:

- the **signs** and **houses** occupied by each node;
- the **planets that rule them** and their condition in the chart;
- the **aspects** the nodes receive, and their exact degrees.

This context is what turns a general formula into a personal reading.

## An invitation, not a sentence

In my practice, karmic astrology is not fatalistic. It helps to recognise what repeats, to understand why some patterns comfort us as much as they limit us — and to identify concrete ways towards new possibilities.`,
  },
  {
    locale: "ar",
    slug: "العقد-القمرية-محور-لا-قدر",
    group: "noeuds-lunaires",
    title: "العقد القمرية: محور لا قدر",
    excerpt: "كثيرًا ما تُقدَّم العقد القمرية كقدر كارمي محتوم. فماذا لو قرأناها كمحور للنموّ؟",
    daysAgo: 6,
    body: `العقد القمرية ليست كواكب، بل هي النقطتان اللتان يتقاطع فيهما مدار القمر مع المسار الظاهري للشمس. وهما متقابلتان دائمًا تمامًا، فترسمان **محورًا** يعبر الخريطة الولادية.

## المألوف والمجهول

تصف العقدة الجنوبية ما هو مألوف لدينا: مهارات وردود أفعال، وأحيانًا ملاجئ. أمّا العقدة الشمالية فتشير إلى ما يتطلّب جهدًا وانفتاحًا وتعلّمًا.

> العقدة الجنوبية ليست «سيئة»: إنها مورد قد نصبح أسرى له.

## قراءة المحور في سياقه

لا يُقرأ محور العقد منفردًا أبدًا. ولتفسيره أنظر خصوصًا إلى:

- **الأبراج** و**البيوت** التي تشغلها كل عقدة؛
- **الكواكب التي تحكمها** وحالتها في الخريطة؛
- **الجوانب** التي تتلقّاها العقد ودرجاتها الدقيقة.

هذا السياق هو ما يحوّل الصيغة العامة إلى قراءة شخصية.

## دعوة لا حكم

في ممارستي، لا يحمل التنجيم الكارمي أيّ طابع قدري. بل يساعد على التعرّف إلى ما يتكرّر، وفهم لماذا تطمئننا بعض الأنماط بقدر ما تقيّدنا، وتحديد مسارات ملموسة نحو إمكانات جديدة.`,
  },
  {
    locale: "fr",
    slug: "pourquoi-les-degres-comptent",
    group: "degres",
    title: "Pourquoi les degrés comptent",
    excerpt: "Deux personnes nées sous le même signe peuvent avoir des thèmes très différents. Le degré est l'une des clés de cette différence.",
    daysAgo: 18,
    body: `On parle souvent de « Vénus en Balance » ou de « Mars en Bélier ». Mais un signe s'étend sur trente degrés — et dans un thème, ces trente degrés ne sont pas équivalents.

## Le degré précise l'aspect

Un trigone exact à un degré près n'a pas la même intensité qu'un trigone à six degrés d'orbe. Le degré permet de **hiérarchiser** les aspects et de repérer ceux qui structurent vraiment le thème.

## Le degré révèle des liens discrets

Certaines planètes, sans former d'aspect majeur, se répondent par leur degré. Ces résonances éclairent parfois des dynamiques que l'on ne s'explique pas autrement.

## Le degré dans son contexte

Un degré n'a de sens qu'au sein du thème : son signe, sa maison, son maître, ses aspects. C'est pourquoi je l'intègre toujours à une lecture d'ensemble, plutôt que de l'interpréter isolément.`,
  },
  {
    locale: "en",
    slug: "why-degrees-matter",
    group: "degres",
    title: "Why degrees matter",
    excerpt: "Two people born under the same sign can have very different charts. The degree is one of the keys to that difference.",
    daysAgo: 18,
    body: `We often speak of "Venus in Libra" or "Mars in Aries". But a sign spans thirty degrees — and in a chart, those thirty degrees are not equivalent.

## The degree refines the aspect

A trine exact to within one degree does not carry the same intensity as a trine with a six-degree orb. The degree makes it possible to **rank** aspects and spot the ones that truly structure the chart.

## The degree reveals subtle links

Some planets, without forming a major aspect, answer each other by degree. These resonances sometimes shed light on dynamics that are otherwise hard to explain.

## The degree in context

A degree only makes sense within the chart: its sign, its house, its ruler, its aspects. That is why I always integrate it into a holistic reading rather than interpreting it on its own.`,
  },
];

const count = async (c: Client, table: string) => Number((await c.execute(`SELECT COUNT(*) AS n FROM ${table}`)).rows[0].n);

/** Fills empty tables. Returns a log of what was created. */
export async function seedContent(
  c: Client,
  opts: { admin?: { email: string; passwordHash: string }; demoSlots?: boolean; now?: number } = {},
): Promise<string[]> {
  const now = opts.now ?? Date.now();
  const log: string[] = [];
  if ((await count(c, "offerings")) === 0) {
    await c.batch(
      offerings.map((o, i) => ({
        sql: `INSERT INTO offerings (slug, service_key, name_fr, name_en, name_ar, summary_fr, summary_en, summary_ar, duration_min, price_cents, currency, requires_partner, active, sort)
              VALUES (?,?,?,?,?,?,?,?,?,?, 'EUR', ?, 1, ?)`,
        args: [o[0], o[1], o[2], o[3], o[4], o[5], o[6], o[7], o[8], o[9] * 100, o[10], (i + 1) * 10],
      })),
      "write",
    );
    log.push(`${offerings.length} consultations`);
  }
  if ((await count(c, "articles")) === 0) {
    await c.batch(
      articles.map((a) => {
        const ts = now - a.daysAgo * 86_400_000;
        return {
          sql: `INSERT INTO articles (locale, slug, title, excerpt, content_md, group_key, status, published_at, created_at, updated_at)
                VALUES (?,?,?,?,?,?, 'published', ?, ?, ?)`,
          args: [a.locale, a.slug, a.title, a.excerpt, a.body, a.group, ts, ts, ts],
        };
      }),
      "write",
    );
    log.push(`${articles.length} articles`);
  }
  if (opts.admin && (await count(c, "admins")) === 0) {
    await c.execute({ sql: "INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)", args: [opts.admin.email, opts.admin.passwordHash, now] });
    log.push(`admin ${opts.admin.email}`);
  }
  if (opts.demoSlots && (await count(c, "slots")) === 0) {
    const stamps: number[] = [];
    for (let d = 2; d <= 30; d++) {
      const day = new Date(now + d * 86_400_000);
      if (day.getUTCDay() === 0 || day.getUTCDay() === 6) continue;
      for (const h of [8, 12, 15]) stamps.push(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, 0));
    }
    await c.batch(stamps.map((st) => ({ sql: "INSERT OR IGNORE INTO slots (starts_at, duration_min, created_at) VALUES (?, 90, ?)", args: [st, now] })), "write");
    log.push(`${stamps.length} demo slots`);
  }
  return log;
}
