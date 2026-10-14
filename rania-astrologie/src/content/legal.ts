import type { Locale } from "@/i18n/config";

export type LegalDoc = { title: string; updated: string; sections: { h: string; p: string[] }[] };

type Vars = { name: string; email: string; address: string; legalId: string; host: string; retentionMonths: number };

export function privacyPolicy(locale: Locale, v: Vars): LegalDoc {
  if (locale === "en")
    return {
      title: "Privacy policy",
      updated: "Last updated",
      sections: [
        { h: "Data controller", p: [`${v.name} — ${v.address}. Contact: ${v.email}.`] },
        {
          h: "Data collected",
          p: [
            "Contact form: name, email, optional phone number, subject and message.",
            "Booking request: name, email, optional phone number, preferred format, birth data (date, time, place) of the person concerned and, for relational consultations, of the second person, as well as the questions you choose to share.",
            "No advertising or tracking cookies are used. The only cookie set is a strictly necessary session cookie for the site administrator.",
          ],
        },
        {
          h: "Purposes and legal basis",
          p: [
            "Your data is used solely to answer your messages, prepare and conduct your consultation, and send the related emails (receipt, confirmation, cancellation). The legal basis is your consent and the performance of the service you request.",
            "Birth data is considered personal data: it is never used for any other purpose, never sold and never shared with third parties for marketing.",
          ],
        },
        {
          h: "Retention",
          p: [`Messages and booking data are kept for no longer than ${v.retentionMonths} months after the last exchange, unless a legal obligation requires otherwise, and are then deleted.`],
        },
        {
          h: "Recipients and processors",
          p: [`Data is accessible only to ${v.name}. Technical processors: website host (${v.host}), database and email providers, bound by confidentiality obligations.`],
        },
        {
          h: "Security",
          p: ["Data is transmitted over an encrypted connection (HTTPS). Access to the administration area is protected by strong authentication, and links sent by email use single-purpose, unguessable tokens."],
        },
        {
          h: "Your rights",
          p: [
            `Under the GDPR you have the right to access, rectify, erase, restrict and object to the processing of your data, as well as the right to data portability and to withdraw your consent at any time. Write to ${v.email}.`,
            "You may also lodge a complaint with your data protection authority (in France: CNIL, www.cnil.fr).",
          ],
        },
      ],
    };
  if (locale === "ar")
    return {
      title: "سياسة الخصوصية",
      updated: "آخر تحديث",
      sections: [
        { h: "المسؤول عن المعالجة", p: [`${v.name} — ${v.address}. للتواصل: ${v.email}.`] },
        {
          h: "البيانات المجمَّعة",
          p: [
            "نموذج التواصل: الاسم، البريد الإلكتروني، رقم الهاتف (اختياري)، الموضوع والرسالة.",
            "طلب الحجز: الاسم، البريد الإلكتروني، رقم الهاتف (اختياري)، الصيغة المفضّلة، بيانات الميلاد (التاريخ والساعة والمكان) للشخص المعني، وللشخص الثاني في الاستشارات العلائقية، إضافة إلى الأسئلة التي تختار مشاركتها.",
            "لا يستخدم الموقع أيّ ملفات تعريف ارتباط إعلانية أو تتبّعية. الملفّ الوحيد المستخدم ضروري تقنيًا لجلسة مديرة الموقع.",
          ],
        },
        {
          h: "الأغراض والأساس القانوني",
          p: [
            "تُستخدم بياناتك حصريًا للردّ على رسائلك، وتحضير استشارتك وإجرائها، وإرسال الرسائل المرتبطة بها (الاستلام، التأكيد، الإلغاء). والأساس القانوني هو موافقتك وتنفيذ الخدمة التي تطلبها.",
            "تُعدّ بيانات الميلاد بيانات شخصية: لا تُستخدم أبدًا لأيّ غرض آخر، ولا تُباع، ولا تُشارك مع أطراف ثالثة لأغراض تسويقية.",
          ],
        },
        { h: "مدّة الاحتفاظ", p: [`تُحفظ الرسائل وبيانات الحجز مدّة لا تتجاوز ${v.retentionMonths} شهرًا بعد آخر تواصل، ما لم يفرض التزام قانوني خلاف ذلك، ثم تُحذف.`] },
        { h: "المستفيدون والمعالِجون", p: [`لا يطّلع على البيانات سوى ${v.name}. المعالِجون التقنيون: مستضيف الموقع (${v.host})، ومزوّدا قاعدة البيانات والبريد الإلكتروني، الملتزمون بواجب السرّية.`] },
        { h: "الأمان", p: ["تُنقل البيانات عبر اتصال مشفّر (HTTPS). والدخول إلى فضاء الإدارة محميّ بمصادقة قويّة، والروابط المرسَلة بالبريد تعتمد رموزًا فريدة يتعذّر تخمينها."] },
        {
          h: "حقوقك",
          p: [
            `وفقًا للائحة العامة لحماية البيانات (RGPD)، لك الحق في الاطّلاع على بياناتك وتصحيحها وحذفها وتقييد معالجتها والاعتراض عليها، وفي نقلها، وفي سحب موافقتك في أيّ وقت. راسلني على ${v.email}.`,
            "ويمكنك أيضًا تقديم شكوى إلى سلطة حماية البيانات المختصّة (في فرنسا: CNIL، www.cnil.fr).",
          ],
        },
      ],
    };
  return {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour",
    sections: [
      { h: "Responsable du traitement", p: [`${v.name} — ${v.address}. Contact : ${v.email}.`] },
      {
        h: "Données collectées",
        p: [
          "Formulaire de contact : nom, e-mail, téléphone (facultatif), sujet et message.",
          "Demande de réservation : nom, e-mail, téléphone (facultatif), format souhaité, données de naissance (date, heure, lieu) de la personne concernée et, pour les consultations relationnelles, de la seconde personne, ainsi que les questions que vous choisissez de partager.",
          "Aucun cookie publicitaire ou de mesure d'audience n'est utilisé. Le seul cookie déposé est un cookie de session strictement nécessaire à l'administratrice du site.",
        ],
      },
      {
        h: "Finalités et base légale",
        p: [
          "Vos données servent uniquement à répondre à vos messages, à préparer et réaliser votre consultation, et à vous envoyer les e-mails associés (accusé de réception, confirmation, annulation). La base légale est votre consentement et l'exécution de la prestation que vous demandez.",
          "Les données de naissance sont des données personnelles : elles ne sont jamais utilisées à d'autres fins, jamais vendues ni transmises à des tiers à des fins commerciales.",
        ],
      },
      { h: "Durée de conservation", p: [`Les messages et données de réservation sont conservés au maximum ${v.retentionMonths} mois après le dernier échange, sauf obligation légale contraire, puis supprimés.`] },
      { h: "Destinataires et sous-traitants", p: [`Les données ne sont accessibles qu'à ${v.name}. Sous-traitants techniques : hébergeur du site (${v.host}), fournisseurs de base de données et d'envoi d'e-mails, tenus à la confidentialité.`] },
      { h: "Sécurité", p: ["Les données transitent par une connexion chiffrée (HTTPS). L'accès à l'espace d'administration est protégé par une authentification forte, et les liens envoyés par e-mail reposent sur des jetons uniques et impossibles à deviner."] },
      {
        h: "Vos droits",
        p: [
          `Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition, d'un droit à la portabilité et du droit de retirer votre consentement à tout moment. Écrivez à ${v.email}.`,
          "Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).",
        ],
      },
    ],
  };
}

export function legalNotice(locale: Locale, v: Vars): LegalDoc {
  const t = {
    fr: ["Mentions légales", "Éditrice du site", "Hébergement", "Propriété intellectuelle", "Responsabilité",
      `Nom : ${v.name}`, `Adresse : ${v.address}`, `Identification : ${v.legalId}`, `Contact : ${v.email}`,
      "L'ensemble des contenus de ce site (textes, visuels, identité graphique) est protégé. Toute reproduction sans autorisation préalable est interdite.",
      "Les consultations d'astrologie relèvent d'une démarche symbolique et de connaissance de soi. Elles ne constituent ni un diagnostic, ni un conseil médical, psychologique, juridique ou financier."],
    en: ["Legal notice", "Site publisher", "Hosting", "Intellectual property", "Liability",
      `Name: ${v.name}`, `Address: ${v.address}`, `Registration: ${v.legalId}`, `Contact: ${v.email}`,
      "All content on this site (texts, visuals, visual identity) is protected. Any reproduction without prior permission is prohibited.",
      "Astrology consultations are a symbolic approach to self-knowledge. They do not constitute a diagnosis, nor medical, psychological, legal or financial advice."],
    ar: ["الإشعار القانوني", "ناشرة الموقع", "الاستضافة", "الملكية الفكرية", "المسؤولية",
      `الاسم: ${v.name}`, `العنوان: ${v.address}`, `رقم التسجيل: ${v.legalId}`, `للتواصل: ${v.email}`,
      "جميع محتويات هذا الموقع (النصوص والمرئيات والهوية البصرية) محمية، ويُمنع أيّ نسخ لها دون إذن مسبق.",
      "تندرج الاستشارات الفلكية في إطار مقاربة رمزية لمعرفة الذات، ولا تشكّل تشخيصًا ولا استشارة طبية أو نفسية أو قانونية أو مالية."],
  }[locale];
  return {
    title: t[0],
    updated: locale === "fr" ? "Dernière mise à jour" : locale === "en" ? "Last updated" : "آخر تحديث",
    sections: [
      { h: t[1], p: [t[5], t[6], t[7], t[8]] },
      { h: t[2], p: [v.host] },
      { h: t[3], p: [t[9]] },
      { h: t[4], p: [t[10]] },
    ],
  };
}
