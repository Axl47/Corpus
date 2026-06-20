import { readFileSync, writeFileSync } from "fs";

const translations = {
  en: {
    errorTitle: "Authorization Error",
    missingParams: "Required OAuth parameters are missing.",
    unsupportedResponseType: "Only response_type=code is supported.",
    unsupportedChallengeMethod: "Only S256 code challenge method is supported.",
    unknownClient: "Unknown client. Please re-register your application.",
    redirectUriMismatch: "The redirect URI does not match the registered URIs.",
    noWorkspaces: "You do not have access to any workspaces.",
    corpus: "Corpus",
    title: "Authorize Application",
    subtitle: "{client} is requesting access to your Corpus workspace.",
    signedInAs: "Signed in as {user}",
    permissions: "Requested permissions",
    permReadOnly: "Read workspace content (pages, databases)",
    permReadWrite: "Read workspace content (pages, databases)",
    permCreateEdit: "Create and edit pages and database rows",
    selectWorkspace: "Select workspace",
    authorize: "Authorize",
    deny: "Deny",
    disclaimer:
      "You can revoke this access at any time from Workspace Settings → Tokens.",
  },
  tr: {
    errorTitle: "Yetkilendirme Hatası",
    missingParams: "Gerekli OAuth parametreleri eksik.",
    unsupportedResponseType: "Yalnızca response_type=code desteklenmektedir.",
    unsupportedChallengeMethod:
      "Yalnızca S256 code challenge yöntemi desteklenmektedir.",
    unknownClient: "Bilinmeyen istemci. Lütfen uygulamanızı yeniden kaydedin.",
    redirectUriMismatch: "Yönlendirme URI kayıtlı URI'lerle eşleşmiyor.",
    noWorkspaces: "Hiçbir çalışma alanına erişiminiz yok.",
    corpus: "Corpus",
    title: "Uygulama Yetkilendir",
    subtitle: "{client} uygulaması Corpus çalışma alanınıza erişim istiyor.",
    signedInAs: "{user} olarak giriş yapıldı",
    permissions: "İstenen izinler",
    permReadOnly: "Çalışma alanı içeriğini okuma (sayfalar, veritabanları)",
    permReadWrite: "Çalışma alanı içeriğini okuma (sayfalar, veritabanları)",
    permCreateEdit: "Sayfa ve veritabanı satırları oluşturma ve düzenleme",
    selectWorkspace: "Çalışma alanı seç",
    authorize: "Yetkilendir",
    deny: "Reddet",
    disclaimer:
      "Bu erişimi istediğiniz zaman Çalışma Alanı Ayarları → Tokenlar bölümünden iptal edebilirsiniz.",
  },
  hi: {
    errorTitle: "प्राधिकरण त्रुटि",
    missingParams: "आवश्यक OAuth पैरामीटर गायब हैं।",
    unsupportedResponseType: "केवल response_type=code समर्थित है।",
    unsupportedChallengeMethod: "केवल S256 code challenge विधि समर्थित है।",
    unknownClient: "अज्ञात क्लाइंट। कृपया अपना एप्लिकेशन पुनः पंजीकृत करें।",
    redirectUriMismatch: "रीडायरेक्ट URI पंजीकृत URI से मेल नहीं खाता।",
    noWorkspaces: "आपके पास किसी भी workspace तक पहुंच नहीं है।",
    corpus: "Corpus",
    title: "एप्लिकेशन प्राधिकृत करें",
    subtitle: "{client} आपके Corpus workspace तक पहुंच मांग रहा है।",
    signedInAs: "{user} के रूप में साइन इन",
    permissions: "अनुरोधित अनुमतियां",
    permReadOnly: "Workspace सामग्री पढ़ें (पृष्ठ, डेटाबेस)",
    permReadWrite: "Workspace सामग्री पढ़ें (पृष्ठ, डेटाबेस)",
    permCreateEdit: "पृष्ठ और डेटाबेस पंक्तियां बनाएं और संपादित करें",
    selectWorkspace: "Workspace चुनें",
    authorize: "प्राधिकृत करें",
    deny: "अस्वीकार करें",
    disclaimer:
      "आप इस एक्सेस को कभी भी Workspace Settings → Tokens से रद्द कर सकते हैं।",
  },
  es: {
    errorTitle: "Error de Autorización",
    missingParams: "Faltan parámetros OAuth requeridos.",
    unsupportedResponseType: "Solo se admite response_type=code.",
    unsupportedChallengeMethod:
      "Solo se admite el método S256 de desafío de código.",
    unknownClient:
      "Cliente desconocido. Por favor, vuelva a registrar su aplicación.",
    redirectUriMismatch:
      "La URI de redirección no coincide con las URIs registradas.",
    noWorkspaces: "No tiene acceso a ningún espacio de trabajo.",
    corpus: "Corpus",
    title: "Autorizar Aplicación",
    subtitle:
      "{client} está solicitando acceso a su espacio de trabajo de Corpus.",
    signedInAs: "Sesión iniciada como {user}",
    permissions: "Permisos solicitados",
    permReadOnly:
      "Leer contenido del espacio de trabajo (páginas, bases de datos)",
    permReadWrite:
      "Leer contenido del espacio de trabajo (páginas, bases de datos)",
    permCreateEdit: "Crear y editar páginas y filas de bases de datos",
    selectWorkspace: "Seleccionar espacio de trabajo",
    authorize: "Autorizar",
    deny: "Denegar",
    disclaimer:
      "Puede revocar este acceso en cualquier momento desde Configuración del espacio de trabajo → Tokens.",
  },
  fr: {
    errorTitle: "Erreur d'Autorisation",
    missingParams: "Des paramètres OAuth requis sont manquants.",
    unsupportedResponseType: "Seul response_type=code est pris en charge.",
    unsupportedChallengeMethod:
      "Seule la méthode de défi S256 est prise en charge.",
    unknownClient: "Client inconnu. Veuillez ré-enregistrer votre application.",
    redirectUriMismatch:
      "L'URI de redirection ne correspond pas aux URI enregistrées.",
    noWorkspaces: "Vous n'avez accès à aucun espace de travail.",
    corpus: "Corpus",
    title: "Autoriser l'Application",
    subtitle: "{client} demande l’accès à votre espace de travail Corpus.",
    signedInAs: "Connecté en tant que {user}",
    permissions: "Autorisations demandées",
    permReadOnly:
      "Lire le contenu de l'espace de travail (pages, bases de données)",
    permReadWrite:
      "Lire le contenu de l'espace de travail (pages, bases de données)",
    permCreateEdit:
      "Créer et modifier des pages et des lignes de bases de données",
    selectWorkspace: "Sélectionner l'espace de travail",
    authorize: "Autoriser",
    deny: "Refuser",
    disclaimer:
      "Vous pouvez révoquer cet accès à tout moment depuis Paramètres de l'espace de travail → Tokens.",
  },
  de: {
    errorTitle: "Autorisierungsfehler",
    missingParams: "Erforderliche OAuth-Parameter fehlen.",
    unsupportedResponseType: "Nur response_type=code wird unterstützt.",
    unsupportedChallengeMethod:
      "Nur die S256-Code-Challenge-Methode wird unterstützt.",
    unknownClient:
      "Unbekannter Client. Bitte registrieren Sie Ihre Anwendung erneut.",
    redirectUriMismatch:
      "Der Umleitungs-URI stimmt nicht mit den registrierten URIs überein.",
    noWorkspaces: "Sie haben keinen Zugriff auf Arbeitsbereiche.",
    corpus: "Corpus",
    title: "Anwendung Autorisieren",
    subtitle: "{client} fordert Zugriff auf Ihren Corpus-Arbeitsbereich an.",
    signedInAs: "Angemeldet als {user}",
    permissions: "Angeforderte Berechtigungen",
    permReadOnly: "Arbeitsbereich-Inhalte lesen (Seiten, Datenbanken)",
    permReadWrite: "Arbeitsbereich-Inhalte lesen (Seiten, Datenbanken)",
    permCreateEdit: "Seiten und Datenbankzeilen erstellen und bearbeiten",
    selectWorkspace: "Arbeitsbereich auswählen",
    authorize: "Autorisieren",
    deny: "Ablehnen",
    disclaimer:
      "Sie können diesen Zugriff jederzeit unter Arbeitsbereich-Einstellungen → Token widerrufen.",
  },
};

for (const [locale, keys] of Object.entries(translations)) {
  const path = `messages/${locale}.json`;
  const data = JSON.parse(readFileSync(path, "utf8"));
  data.OAuthAuthorize = keys;
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Updated", path);
}
