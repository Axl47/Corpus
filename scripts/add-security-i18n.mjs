import { readFileSync, writeFileSync } from "fs";

const translations = {
  en: {
    title: "Security & Authentication",
    lastUpdated: "Last updated · June 2025",
    intro:
      "Corpus is built with security as a first-class concern. This page documents how we authenticate users and AI agents, what we store, and how you stay in control.",

    loginTitle: "How You Sign In",
    loginBody:
      'Corpus uses OAuth 2.0 with Google and GitHub as identity providers — we never store passwords. When you click "Sign in with Google", your credentials go directly to Google\'s servers. We only receive a verified email address and profile name. Sessions are managed via secure, httpOnly cookies using Auth.js v5.',

    patTitle: "MCP Personal Access Tokens",
    patBody:
      "AI agents (Claude Desktop, Cursor, Windsurf, etc.) authenticate to the MCP API using Personal Access Tokens (PATs). Tokens are prefixed crps_ and the secret portion is stored only as a bcrypt hash — we cannot recover the plaintext. Tokens support read or write scope, optional expiry, and can be revoked at any time from Workspace Settings → Tokens.",

    oauthTitle: "MCP OAuth 2.1 + PKCE",
    oauthBody:
      "Corpus supports the MCP OAuth 2.1 standard (RFC 9728). Compatible clients (Claude Desktop, etc.) open a browser login flow instead of requiring you to paste a token. Access tokens expire after 1 hour; refresh tokens rotate on every use and expire after 30 days. The PKCE S256 challenge prevents authorization code interception. Clients register dynamically via RFC 7591.",

    scopesTitle: "Token Scopes & Permissions",
    scopesBody:
      "Every token — whether a PAT or OAuth — is locked to a single workspace and carries one of two scopes. Read scope allows listing pages, querying databases, and searching content. Write scope additionally allows creating, editing, and deleting pages and database rows. No token can ever access workspaces it was not explicitly granted.",

    auditTitle: "Audit Log",
    auditBody:
      "Every MCP tool call is recorded in an immutable audit log (agent_activity table) with the tool name, status, timestamp, and token identifier. The last 60 entries are visible in the Workspace Settings → Tokens panel. Audit logs are retained for 7 days on the free plan and 90 days on Pro.",

    disclosureTitle: "Responsible Disclosure",
    disclosureBody:
      "If you discover a security vulnerability, please email security@corpus.com with a description and reproduction steps. We aim to respond within 48 hours and will credit researchers with their consent. Please do not publicly disclose issues until a fix has been released.",
  },
  tr: {
    title: "Güvenlik ve Kimlik Doğrulama",
    lastUpdated: "Son güncelleme · Haziran 2025",
    intro:
      "Corpus, güvenliği birinci sınıf bir kaygı olarak tasarlanmıştır. Bu sayfa, kullanıcıları ve AI ajanları nasıl doğruladığımızı, neyi sakladığımızı ve kontrolün nasıl sizde kaldığını belgeler.",

    loginTitle: "Nasıl Giriş Yapıyorsunuz",
    loginBody:
      'Corpus, kimlik sağlayıcıları olarak Google ve GitHub ile OAuth 2.0 kullanır — şifreyi asla saklamayız. "Google ile giriş yap"a tıkladığınızda kimlik bilgileriniz doğrudan Google\'ın sunucularına gider. Yalnızca doğrulanmış bir e-posta adresi ve profil adı alırız. Oturumlar Auth.js v5 kullanılarak güvenli, httpOnly çerezlerle yönetilir.',

    patTitle: "MCP Kişisel Erişim Tokenları",
    patBody:
      "AI ajanları (Claude Desktop, Cursor, Windsurf, vb.) MCP API'ye Kişisel Erişim Tokenları (PAT) ile kimlik doğrular. Tokenlar crps_ önekine sahiptir ve gizli kısım yalnızca bcrypt hash olarak saklanır — düz metni kurtaramayız. Tokenlar okuma veya yazma kapsamını, isteğe bağlı sona erme süresini destekler ve istediğiniz zaman Çalışma Alanı Ayarları → Tokenlar'dan iptal edilebilir.",

    oauthTitle: "MCP OAuth 2.1 + PKCE",
    oauthBody:
      "Corpus, MCP OAuth 2.1 standardını (RFC 9728) destekler. Uyumlu istemciler (Claude Desktop, vb.) token yapıştırmanızı gerektirmek yerine bir tarayıcı giriş akışı açar. Erişim tokenları 1 saat sonra sona erer; yenileme tokenları her kullanımda döndürülür ve 30 gün sonra sona erer. PKCE S256 zorluğu yetkilendirme kodu ele geçirilmesini önler.",

    scopesTitle: "Token Kapsamları ve İzinler",
    scopesBody:
      "Her token — ister PAT ister OAuth — tek bir çalışma alanına kilitlidir ve iki kapsamdan birini taşır. Okuma kapsamı sayfaları listelemeye, veritabanlarını sorgulamaya ve içerik aramaya izin verir. Yazma kapsamı ayrıca sayfa ve veritabanı satırları oluşturmaya, düzenlemeye ve silmeye izin verir.",

    auditTitle: "Denetim Günlüğü",
    auditBody:
      "Her MCP araç çağrısı araç adı, durum, zaman damgası ve token tanımlayıcısıyla değiştirilemez bir denetim günlüğüne kaydedilir. Son 60 giriş, Çalışma Alanı Ayarları → Tokenlar panelinde görülebilir. Denetim günlükleri ücretsiz planda 7 gün, Pro'da 90 gün saklanır.",

    disclosureTitle: "Sorumlu Açıklama",
    disclosureBody:
      "Bir güvenlik açığı keşfederseniz, lütfen açıklama ve yeniden üretme adımlarıyla security@corpus.com adresine e-posta gönderin. 48 saat içinde yanıt vermeyi hedefliyoruz ve araştırmacıları izinleriyle kredi alacaktır. Lütfen bir düzeltme yayınlanana kadar sorunları kamuoyuyla paylaşmayın.",
  },
  hi: {
    title: "सुरक्षा और प्रमाणीकरण",
    lastUpdated: "अंतिम अपडेट · जून 2025",
    intro:
      "Corpus को सुरक्षा को प्रथम श्रेणी की चिंता के रूप में बनाया गया है। यह पृष्ठ दस्तावेज करता है कि हम उपयोगकर्ताओं और AI एजेंटों को कैसे प्रमाणित करते हैं, हम क्या संग्रहीत करते हैं, और आप नियंत्रण में कैसे रहते हैं।",

    loginTitle: "आप कैसे साइन इन करते हैं",
    loginBody:
      'Corpus पहचान प्रदाताओं के रूप में Google और GitHub के साथ OAuth 2.0 का उपयोग करता है — हम कभी पासवर्ड संग्रहीत नहीं करते। जब आप "Google से साइन इन करें" पर क्लिक करते हैं, तो आपके क्रेडेंशियल सीधे Google के सर्वर पर जाते हैं।',

    patTitle: "MCP व्यक्तिगत एक्सेस टोकन",
    patBody:
      "AI एजेंट (Claude Desktop, Cursor, आदि) MCP API को Personal Access Tokens (PATs) का उपयोग करके प्रमाणित करते हैं। टोकन crps_ से पूर्वनिर्धारित हैं और गुप्त भाग केवल bcrypt hash के रूप में संग्रहीत है। टोकन read या write scope, वैकल्पिक समाप्ति का समर्थन करते हैं।",

    oauthTitle: "MCP OAuth 2.1 + PKCE",
    oauthBody:
      "Corpus MCP OAuth 2.1 मानक (RFC 9728) का समर्थन करता है। संगत क्लाइंट एक ब्राउज़र लॉगिन प्रवाह खोलते हैं। एक्सेस टोकन 1 घंटे के बाद समाप्त होते हैं; रिफ्रेश टोकन हर उपयोग पर घूमते हैं।",

    scopesTitle: "टोकन स्कोप और अनुमतियां",
    scopesBody:
      "प्रत्येक टोकन एकल workspace से बंद है और दो scopes में से एक रखता है। Read scope पृष्ठों को सूचीबद्ध करने, डेटाबेस क्वेरी करने की अनुमति देता है। Write scope इसके अलावा बनाने, संपादित करने और हटाने की अनुमति देता है।",

    auditTitle: "ऑडिट लॉग",
    auditBody:
      "प्रत्येक MCP टूल कॉल एक अपरिवर्तनीय ऑडिट लॉग में दर्ज किया जाता है। अंतिम 60 प्रविष्टियां Workspace Settings → Tokens में दिखाई देती हैं।",

    disclosureTitle: "जिम्मेदार प्रकटीकरण",
    disclosureBody:
      "यदि आप कोई सुरक्षा भेद्यता खोजते हैं, तो कृपया security@corpus.com पर ईमेल करें। हम 48 घंटों के भीतर उत्तर देने का लक्ष्य रखते हैं।",
  },
  es: {
    title: "Seguridad y Autenticación",
    lastUpdated: "Última actualización · Junio 2025",
    intro:
      "Corpus se construye con la seguridad como preocupación de primera clase. Esta página documenta cómo autenticamos a usuarios y agentes de IA, qué almacenamos y cómo usted mantiene el control.",

    loginTitle: "Cómo Iniciar Sesión",
    loginBody:
      'Corpus utiliza OAuth 2.0 con Google y GitHub como proveedores de identidad — nunca almacenamos contraseñas. Cuando hace clic en "Iniciar sesión con Google", sus credenciales van directamente a los servidores de Google. Solo recibimos un correo electrónico verificado y nombre de perfil.',

    patTitle: "Tokens de Acceso Personal MCP",
    patBody:
      "Los agentes de IA se autentican en la API MCP usando Tokens de Acceso Personal (PATs). Los tokens tienen el prefijo crps_ y la parte secreta se almacena solo como hash bcrypt. Los tokens admiten alcance de lectura o escritura, vencimiento opcional y pueden revocarse en cualquier momento.",

    oauthTitle: "MCP OAuth 2.1 + PKCE",
    oauthBody:
      "Corpus admite el estándar MCP OAuth 2.1 (RFC 9728). Los clientes compatibles abren un flujo de inicio de sesión en el navegador en lugar de requerir pegar un token. Los tokens de acceso vencen después de 1 hora; los tokens de actualización rotan en cada uso.",

    scopesTitle: "Alcances y Permisos de Tokens",
    scopesBody:
      "Cada token está bloqueado a un único espacio de trabajo y lleva uno de dos alcances. El alcance de lectura permite listar páginas y consultar bases de datos. El alcance de escritura además permite crear, editar y eliminar.",

    auditTitle: "Registro de Auditoría",
    auditBody:
      "Cada llamada a herramienta MCP se registra en un registro de auditoría inmutable. Las últimas 60 entradas son visibles en Configuración del espacio de trabajo → Tokens.",

    disclosureTitle: "Divulgación Responsable",
    disclosureBody:
      "Si descubre una vulnerabilidad de seguridad, envíe un correo a security@corpus.com. Nuestro objetivo es responder en 48 horas.",
  },
  fr: {
    title: "Sécurité et Authentification",
    lastUpdated: "Dernière mise à jour · Juin 2025",
    intro:
      "Corpus est conçu avec la sécurité comme préoccupation de premier ordre. Cette page documente comment nous authentifions les utilisateurs et les agents IA, ce que nous stockons et comment vous gardez le contrôle.",

    loginTitle: "Comment Vous Connecter",
    loginBody:
      'Corpus utilise OAuth 2.0 avec Google et GitHub comme fournisseurs d\'identité — nous ne stockons jamais les mots de passe. Lorsque vous cliquez sur "Se connecter avec Google", vos identifiants vont directement aux serveurs de Google.',

    patTitle: "Tokens d'Accès Personnel MCP",
    patBody:
      "Les agents IA s'authentifient à l'API MCP via des Tokens d'Accès Personnel (PAT). Les tokens ont le préfixe crps_ et la partie secrète est stockée uniquement sous forme de hash bcrypt. Les tokens supportent les portées lecture ou écriture, une expiration optionnelle et peuvent être révoqués à tout moment.",

    oauthTitle: "MCP OAuth 2.1 + PKCE",
    oauthBody:
      "Corpus prend en charge le standard MCP OAuth 2.1 (RFC 9728). Les clients compatibles ouvrent un flux de connexion navigateur au lieu de nécessiter de coller un token. Les tokens d'accès expirent après 1 heure ; les tokens de rafraîchissement tournent à chaque utilisation.",

    scopesTitle: "Portées et Permissions des Tokens",
    scopesBody:
      "Chaque token est verrouillé sur un seul espace de travail et porte l'une des deux portées. La portée lecture permet de lister les pages et d'interroger les bases de données. La portée écriture permet en plus de créer, modifier et supprimer.",

    auditTitle: "Journal d'Audit",
    auditBody:
      "Chaque appel d'outil MCP est enregistré dans un journal d'audit immuable. Les 60 dernières entrées sont visibles dans Paramètres de l'espace de travail → Tokens.",

    disclosureTitle: "Divulgation Responsable",
    disclosureBody:
      "Si vous découvrez une vulnérabilité de sécurité, envoyez un e-mail à security@corpus.com. Nous visons à répondre dans les 48 heures.",
  },
  de: {
    title: "Sicherheit und Authentifizierung",
    lastUpdated: "Zuletzt aktualisiert · Juni 2025",
    intro:
      "Corpus wird mit Sicherheit als erstklassigem Anliegen entwickelt. Diese Seite dokumentiert, wie wir Benutzer und KI-Agenten authentifizieren, was wir speichern und wie Sie die Kontrolle behalten.",

    loginTitle: "Wie Sie sich anmelden",
    loginBody:
      'Corpus verwendet OAuth 2.0 mit Google und GitHub als Identitätsanbieter — wir speichern niemals Passwörter. Wenn Sie auf "Mit Google anmelden" klicken, gehen Ihre Anmeldedaten direkt an Googles Server.',

    patTitle: "MCP Persönliche Zugriffstoken",
    patBody:
      "KI-Agenten authentifizieren sich bei der MCP-API mit Personal Access Tokens (PATs). Token haben das Präfix crps_ und der geheime Teil wird nur als bcrypt-Hash gespeichert. Token unterstützen Lese- oder Schreibbereich, optionales Ablaufdatum und können jederzeit widerrufen werden.",

    oauthTitle: "MCP OAuth 2.1 + PKCE",
    oauthBody:
      "Corpus unterstützt den MCP OAuth 2.1-Standard (RFC 9728). Kompatible Clients öffnen einen Browser-Login-Flow, anstatt ein Token einfügen zu müssen. Zugriffstoken laufen nach 1 Stunde ab; Aktualisierungstoken rotieren bei jeder Verwendung.",

    scopesTitle: "Token-Bereiche und Berechtigungen",
    scopesBody:
      "Jedes Token ist auf einen einzelnen Arbeitsbereich gesperrt und trägt einen von zwei Bereichen. Der Lesebereich erlaubt das Auflisten von Seiten und das Abfragen von Datenbanken. Der Schreibbereich erlaubt zusätzlich das Erstellen, Bearbeiten und Löschen.",

    auditTitle: "Prüfprotokoll",
    auditBody:
      "Jeder MCP-Tool-Aufruf wird in einem unveränderlichen Prüfprotokoll erfasst. Die letzten 60 Einträge sind in Arbeitsbereich-Einstellungen → Token sichtbar.",

    disclosureTitle: "Verantwortungsvolle Offenlegung",
    disclosureBody:
      "Wenn Sie eine Sicherheitslücke entdecken, senden Sie bitte eine E-Mail an security@corpus.com. Wir sind bestrebt, innerhalb von 48 Stunden zu antworten.",
  },
};

for (const [locale, keys] of Object.entries(translations)) {
  const path = `messages/${locale}.json`;
  const data = JSON.parse(readFileSync(path, "utf8"));
  data.Security = keys;
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Updated", path);
}
