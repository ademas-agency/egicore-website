/**
 * L'envoi réel des formulaires du site, vers /api/liste-attente.
 *
 * Le site compte quatre formulaires — liste d'attente de fin de page,
 * formulaire principal, formulaire partenaire, newsletter du blog — écrits
 * chacun à sa façon, avec leurs propres validations. On ne les réécrit pas :
 * chaque page garde sa logique et appelle cette fonction une fois la saisie
 * jugée valide, à l'endroit exact où la maquette affichait « rien n'a été
 * envoyé ».
 *
 * La clé d'API n'est pas ici : elle vit dans la fonction serveur, hors du
 * dépôt. Cette page ne connaît qu'une adresse.
 */
window.egicoreEnvoyer = function (formulaire, zoneMessage) {
  var f = formulaire,
    msg = zoneMessage;

  function dire(texte) {
    if (msg) msg.textContent = texte;
  }

  var champEmail =
    f.querySelector('input[type="email"]') || f.querySelector('input[name*="mail"]');
  var email = champEmail ? champEmail.value.trim() : "";
  if (!email) {
    dire("Indiquez une adresse e-mail valide, par exemple vous@entreprise.fr.");
    return;
  }

  // Les champs facultatifs : ils n'existent pas dans tous les formulaires.
  function valeur(selecteur) {
    var el = f.querySelector(selecteur);
    if (!el) return "";
    return (el.value !== undefined ? el.value : el.textContent || "").trim();
  }
  var profil = valeur('input[name="profil"]:checked');
  var metier = valeur('[id*="metier"]') || valeur('[id*="secteur"]');
  var nom = valeur('input[name="nom"]') || valeur('[id="pan"]');
  var societe = valeur('input[name="societe"]') || valeur('[id="pas"]');

  var bouton = f.querySelector('[type="submit"]');
  dire("Envoi…");
  if (bouton) bouton.disabled = true;

  fetch("/api/liste-attente", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      profil: profil,
      metier: metier,
      nom: nom,
      societe: societe,
      page: location.pathname,
    }),
  })
    .then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      dire("C’est noté. Vous recevrez un e-mail dès l’ouverture des inscriptions.");
      try {
        f.reset();
      } catch (e) {}
    })
    .catch(function () {
      dire("L’envoi n’a pas abouti. Réessayez dans un instant.");
    })
    .then(function () {
      if (bouton) bouton.disabled = false;
    });
};
