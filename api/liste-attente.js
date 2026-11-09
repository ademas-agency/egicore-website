/**
 * Inscription à la liste d'attente → Brevo.
 *
 * Le site est entièrement statique : il ne peut pas porter la clé d'API, qui
 * serait lisible par n'importe quel visiteur et utilisable pour envoyer en
 * notre nom. Cette fonction est le seul endroit du projet qui la connaît ;
 * elle vit dans les variables d'environnement Vercel, jamais dans le dépôt.
 *
 * Variables attendues :
 *   BREVO_API_KEY   obligatoire — clé d'API v3 (Brevo → SMTP & API)
 *   BREVO_LIST_ID   facultatif  — identifiant de la liste de destination
 *
 * Sans BREVO_API_KEY, la fonction répond 503 et le formulaire affiche un
 * message honnête, plutôt que de laisser croire à un envoi qui n'a pas eu lieu.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Les champs libres sont bornés : ils viennent du navigateur. */
function propre(valeur, max = 120) {
  return typeof valeur === "string" ? valeur.trim().slice(0, max) : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  const cle = process.env.BREVO_API_KEY;
  if (!cle) {
    console.error("[liste-attente] BREVO_API_KEY absente");
    return res
      .status(503)
      .json({ erreur: "Le service d'inscription est momentanément indisponible." });
  }

  const corps = typeof req.body === "string" ? safeParse(req.body) : req.body || {};
  const email = propre(corps.email, 180).toLowerCase();

  if (!EMAIL.test(email)) {
    return res.status(400).json({ erreur: "Adresse e-mail invalide." });
  }

  const attributs = {
    PROFIL: propre(corps.profil, 20),
    METIER: propre(corps.metier, 120),
    PAGE_INSCRIPTION: propre(corps.page, 180),
  };

  const liste = Number.parseInt(process.env.BREVO_LIST_ID ?? "", 10);

  try {
    const reponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": cle,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: attributs,
        listIds: Number.isInteger(liste) ? [liste] : undefined,
        // Une adresse déjà inscrite met à jour ses attributs au lieu
        // d'échouer : réessayer ne doit jamais ressembler à une erreur.
        updateEnabled: true,
      }),
    });

    // 201 créé, 204 mis à jour : les deux sont des succès.
    if (reponse.status === 201 || reponse.status === 204) {
      return res.status(200).json({ ok: true });
    }

    // Le détail de l'erreur reste côté serveur : il peut nommer la liste,
    // le compte, ou la raison du refus.
    const detail = await reponse.text();
    console.error("[liste-attente] Brevo", reponse.status, detail.slice(0, 500));
    return res
      .status(502)
      .json({ erreur: "L'inscription n'a pas pu être enregistrée." });
  } catch (erreur) {
    console.error("[liste-attente] appel Brevo impossible", erreur);
    return res
      .status(502)
      .json({ erreur: "L'inscription n'a pas pu être enregistrée." });
  }
}

function safeParse(texte) {
  try {
    return JSON.parse(texte);
  } catch {
    return {};
  }
}
