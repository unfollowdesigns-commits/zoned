# Guide de l'espace d'administration

Bienvenue, Rania. Cet espace vous permet de gérer votre site **sans aucune compétence technique** : réservations, disponibilités, tarifs, articles, messages et informations légales.

**Adresse :** `https://votre-domaine/admin`

---

## 1. Connexion et sécurité

- Connectez-vous avec votre e-mail et votre mot de passe.
- Après plusieurs essais incorrects, la connexion est bloquée 15 minutes (protection contre les intrusions).
- **Changez votre mot de passe** dès la première connexion : *Paramètres → Mot de passe* (12 caractères minimum, mélangez minuscules, majuscules, chiffres et symboles).
- Vous avez perdu un téléphone ou un ordinateur ? *Paramètres → Déconnecter tous les appareils*.

## 2. Tableau de bord

Il présente l'essentiel : demandes en attente, consultations confirmées, créneaux ouverts et messages non lus. Un avertissement apparaît si aucun créneau n'est ouvert, car les visiteurs ne peuvent alors pas réserver en ligne.

## 3. Créneaux (vos disponibilités)

Les visiteurs ne peuvent réserver **que** les créneaux que vous ouvrez.

- **Générer des créneaux** : choisissez une période, les jours de la semaine, les heures de début (par exemple `10:00, 14:00, 17:30`) et la durée. Les créneaux sont créés en une fois.
- **Ajouter un créneau** : pour une date ponctuelle.
- Cliquez sur **×** pour supprimer un créneau libre. Un créneau réservé ne peut pas être supprimé : refusez ou annulez d'abord la réservation.
- Les horaires sont exprimés dans votre fuseau horaire (*Paramètres*). Chaque visiteur les voit automatiquement dans **son** fuseau horaire.
- Un créneau n'est plus proposé moins de 12 heures avant son début.

## 4. Réservations

Chaque demande arrive avec le statut **En attente**, et vous recevez un e-mail de notification.

Sur la fiche d'une réservation, vous trouvez :
- les coordonnées du client, le format souhaité (visio, téléphone, WhatsApp) ;
- les **données de naissance** (et celles de la seconde personne pour une synastrie ou un thème composite) ;
- les questions et le contexte partagés.

**Changer le statut :**
| Statut | Effet |
|---|---|
| Confirmer | Le client reçoit un e-mail de confirmation, avec votre message éventuel (lien de visio, modalités de règlement…) |
| Refuser / Annuler | Le créneau redevient disponible et le client est prévenu |
| Réalisée | À utiliser après la séance, pour votre suivi |

Le client peut suivre sa demande, ou l'annuler jusqu'au délai défini (48 h par défaut), grâce au lien reçu par e-mail.

**Note interne** : un espace pour vos notes.
**Supprimer la réservation** : efface définitivement les données (droit à l'effacement).

## 5. Consultations & tarifs

Vous pouvez modifier le nom, la description courte (en FR / EN / AR), la durée, le prix, la devise et l'ordre d'affichage.

- **2 personnes** : le formulaire demande alors les données de naissance de la seconde personne.
- **Visible** : décochez pour masquer une consultation sans la supprimer.
- **Approche liée** : la page de l'approche correspondante affiche automatiquement les tarifs de cette consultation.

## 6. Articles (journal)

1. *Articles → Nouvel article*.
2. Saisissez le titre (l'adresse de la page se crée toute seule), un chapô (affiché sur les cartes et dans Google), puis le contenu.
3. Mise en forme simple (Markdown) :
   - `## Titre de section`
   - `**gras**`, `*italique*`
   - `> citation`
   - `- élément de liste`
   - `[texte du lien](https://…)`
   - L'onglet **Aperçu** montre le rendu.
4. Ajoutez une **image de couverture** (JPEG, PNG, WebP, 3 Mo maximum) et son texte alternatif (utile à l'accessibilité et au référencement).
5. Choisissez **Publié** pour la mettre en ligne. Si vous indiquez une date future, l'article est **programmé** et paraîtra automatiquement à cette date.

**Traductions** : pour relier les versions française, anglaise et arabe d'un même article, donnez-leur la même *clé de traduction* (par exemple `noeuds-lunaires`). Le sélecteur de langue du site passe alors directement d'une version à l'autre.

## 7. Messages

Vous y trouvez les messages envoyés depuis le formulaire de contact : bouton **Répondre** (ouvre votre messagerie), marquage lu / non lu, suppression.

## 8. Paramètres

- E-mail de contact, numéro **WhatsApp** (format international en chiffres, par exemple `33612345678`), Instagram.
- Fuseau horaire, délai d'annulation en ligne, durée de conservation des données.
- **Informations légales** (nom, adresse, SIRET, hébergeur) : les pages *Mentions légales* et *Confidentialité* se mettent à jour automatiquement.
- **Purger maintenant** : supprime les réservations et messages plus anciens que la durée de conservation (RGPD). Pensez à le faire régulièrement, par exemple chaque trimestre.
