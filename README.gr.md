<div align="center">

<a href="https://webhosting4u.gr">
  <img src="https://webhosting4u.gr/assets/img/wh4u-LogoDark.webp" alt="Webhosting4U" width="280">
</a>

<br><br>

# DomainsReseller MCP Server

**Καταχωρηστε, μεταφερετε και διαχειριστειτε domains απο το IDE σας με φυσικη γλωσσα**

**Σχεδιασμενο για τον domain registrar [Webhosting4U](https://webhosting4u.gr)**

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Streamable_HTTP-5A67D8)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-22C55E)](LICENSE)

Ενας production-ready [Model Context Protocol](https://modelcontextprotocol.io/) server για διαχειριση domain names -- καταχωρησεις, μεταφορες, ανανεωσεις, DNS, nameservers, επαφες, και αλλα -- μεσω **32 MCP εργαλειων** προσβασιμων με φυσικη γλωσσα απο οποιοδηποτε MCP-συμβατο IDE.

Παρεχεται απο [Webhosting4U](https://webhosting4u.gr)

**[English](README.md)** | **[Ελληνικα](#τι-ειναι-αυτο)**

---

</div>

## Τι Ειναι Αυτο;

Αυτος ειναι ενας **MCP server** κατασκευασμενος για τον **[Webhosting4U](https://webhosting4u.gr) domain registrar**. Δινει στον AI βοηθο του IDE σας (VS Code, η οποιοδηποτε αλλο MCP-συμβατο IDE) τη δυνατοτητα να διαχειριζεται domain names για λογαριασμο σας μεσω του Webhosting4U DomainsReseller API. Αντι να συνδεθειτε σε ενα web panel, απλα γραφετε τι θελετε σε φυσικη γλωσσα:

> "Ειναι διαθεσιμο το example.com;"

> "Καταχωρησε το mydomain.io για 2 χρονια"

> "Δειξε μου τα DNS records του mysite.gr"

Ο AI καλει αυτοματα το σωστο εργαλειο. Χωρις χειροκινητες API κλησεις, χωρις web φορμες -- μονο συνομιλια.

### Τι Ειναι το MCP;

Το [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) ειναι ενα ανοικτο προτυπο που επιτρεπει στους AI βοηθους σε IDEs να συνδεονται με εξωτερικα εργαλεια και υπηρεσιες. Αυτος ο server υλοποιει το MCP ωστε το IDE σας να επικοινωνει απευθειας με το API καταχωρησης domains.

---

## Χαρακτηριστικα

- **32 εργαλεια διαχειρισης domains** -- καταχωρηση, μεταφορα, ανανεωση, DNS, nameservers, επαφες, WHOIS, και αλλα
- **Διεπαφη φυσικης γλωσσας** -- ρωτηστε "Ειναι διαθεσιμο το example.com;" και παρτε απαντηση
- **Λειτουργει με οποιοδηποτε MCP-συμβατο IDE** -- VS Code, και οποιονδηποτε editor υποστηριζει Streamable HTTP MCP
- **Σχεδιασμενο για ασφαλεια** -- κρυπτογραφηση API keys, session-based auth, rate limiting, μηδενικη διαρροη δεδομενων
- **Παγκοσμια κατανομη** -- τρεχει στο edge network της Cloudflare για χαμηλη καθυστερηση παγκοσμιως

---

## Προαπαιτουμενα

Για να χρησιμοποιησετε αυτον τον MCP server χρειαζεστε εναν **λογαριασμο Domain Reseller** και ενα **API key** απο τη [Webhosting4U](https://webhosting4u.gr).

1. **Δημιουργια λογαριασμου** -- [Παραγγειλτε ενα πακετο Domain Reseller](https://webhosting4u.gr/customers/index.php?rp=/store/webhosting/domain-reseller). Οι παραγγελιες ελεγχονται και ενεργοποιουνται χειροκινητα.
2. **Ληψη API key** -- Μολις ενεργοποιηθει ο λογαριασμος σας, δημιουργηστε ενα API key απο τον πινακα ελεγχου του reseller.
3. **Προσθηκη πιστωσεων** -- Οι καταχωρησεις, μεταφορες και ανανεωσεις domains απαιτουν διαθεσιμο υπολοιπο στον λογαριασμο σας. Φροντιστε να εχετε επαρκες υπολοιπο πριν απο καθε παραγγελια.

---

## Γρηγορη Εκκινηση

### Βημα 1 -- Συνδεση IDE

Κατευθυνετε τον MCP client σας στο endpoint του server:

```
https://mcp-domains.webhosting4u.gr/mcp
```

**Transport:** Streamable HTTP

<details>
<summary><strong>VS Code</strong> (1.99+)</summary>

1. Ανοιξτε τις Ρυθμισεις του VS Code και ενεργοποιηστε `chat.mcp.enabled`
2. Δημιουργηστε ενα αρχειο `.vscode/mcp.json` στη ριζα του project σας
3. Επικολληστε τη παρακατω ρυθμιση:

```json
{
  "servers": {
    "domains-reseller": {
      "type": "http",
      "url": "https://mcp-domains.webhosting4u.gr/mcp"
    }
  }
}
```

4. Επανεκκινηστε το VS Code

Ο server "domains-reseller" θα εμφανιστει στη λιστα MCP servers σας.

</details>

<details>
<summary><strong>Αλλοι MCP Clients</strong></summary>

Οποιοσδηποτε client που υποστηριζει Streamable HTTP transport μπορει να συνδεθει. Ρυθμιστε τον με:

- **URL:** `https://mcp-domains.webhosting4u.gr/mcp`
- **Transport:** Streamable HTTP
- **Content-Type:** `application/json`
- **Accept:** `application/json, text/event-stream`

</details>

### Βημα 2 -- Συνδεση

Μολις το IDE σας ειναι συνδεδεμενο, ανοιξτε το AI chat και γραψτε:

> Συνδεσε με στον domains reseller με email `your@email.com` και API key `YOUR_API_KEY`

Αντικαταστηστε `your@email.com` με το email του reseller λογαριασμου σας στη Webhosting4U, και `YOUR_API_KEY` με το API key απο τον πινακα ελεγχου σας.

Ο server θα:
1. Επικυρωσει τα credentials σας με το upstream API
2. Κρυπτογραφησει το API key σας και θα το αποθηκευσει με ασφαλεια στον server
3. Επιστρεψει ενα **session token** με ισχυ 12 ωρων

Μετα τη συνδεση, το API key σας δεν αποστελλεται ξανα ποτε. Ολες οι κλησεις εργαλειων χρησιμοποιουν το session token.

### Βημα 3 -- Διαχειριση Domains

Απλα ρωτηστε σε φυσικη γλωσσα. Ο AI θα επιλεξει αυτοματα το σωστο εργαλειο:

| Τι λετε | Τι γινεται |
|---|---|
| *"Ειναι διαθεσιμο το example.com;"* | Ελεγχει τη διαθεσιμοτητα |
| *"Δειξε DNS records για το mydomain.gr"* | Εμφανιζει τα DNS records |
| *"Τι TLDs υποστηριζετε;"* | Εμφανιζει τα διαθεσιμα TLDs |
| *"Ποσο κοστιζει ενα .io domain;"* | Εμφανιζει τιμολογηση TLD |
| *"Καταχωρησε το coolstartup.io για 2 χρονια"* | Καταχωρει το domain (απαιτει πιστωσεις) |
| *"Μεταφερε το mydomain.com με EPP code ABC123"* | Ξεκινα μεταφορα domain |
| *"Ποιο ειναι το υπολοιπο μου;"* | Εμφανιζει τις διαθεσιμες πιστωσεις |
| *"Αποσυνδεσε με"* | Τερματιζει τη συνεδρια |

### Βημα 4 -- Αποσυνδεση

Οταν τελειωσετε, πειτε:

> Αποσυνδεσε με

Αυτο ανακαλει τη συνεδρια σας αμεσα.

---

## Διαθεσιμα Εργαλεια (32)

### Πιστοποιηση

| Εργαλειο | Περιγραφη |
|-----------|-----------|
| `auth_login` | Πιστοποιηση με email + API key, ληψη session token |
| `auth_logout` | Ανακληση session token |

### Διαθεσιμοτητα Domain

| Εργαλειο | Περιγραφη |
|-----------|-----------|
| `domains_lookup` | Ελεγχος αν ενα domain ειναι διαθεσιμο σε ενα η περισσοτερα TLDs |
| `domains_lookup_suggestions` | Εναλλακτικες προτασεις domain names |

### Διαχειριση Domain

| Εργαλειο | Περιγραφη |
|-----------|-----------|
| `domains_information_get` | Αναλυτικες πληροφοριες domain (ληξη, κατασταση, κλπ.) |
| `domains_contact_get` | Στοιχεια επαφης WHOIS |
| `domains_contact_save` | Ενημερωση στοιχειων επαφης WHOIS |
| `domains_nameservers_get` | Nameservers ενος domain |
| `domains_nameservers_save` | Ενημερωση nameservers |
| `domains_nameservers_register` | Καταχωρηση child/glue nameserver |
| `domains_nameservers_modify` | Αλλαγη IP child nameserver |
| `domains_nameservers_delete` | Διαγραφη child nameserver |
| `domains_dns_get` | DNS records |
| `domains_dns_save` | Ενημερωση DNS records |
| `domains_lock_get` | Κατασταση registrar lock |
| `domains_lock_save` | Κλειδωμα η ξεκλειδωμα domain |
| `domains_eppcode_get` | Κωδικος EPP/auth για μεταφορα domain |
| `domains_email_get` | Ρυθμισεις email forwarding |
| `domains_email_save` | Ενημερωση email forwarding |
| `domains_protectid_toggle` | Ενεργοποιηση η απενεργοποιηση WHOIS ID protection |
| `domains_release` | Αποδεσμευση domain σε αλλον registrar |
| `domains_delete` | Αιτημα διαγραφης domain |
| `domains_sync` | Συγχρονισμος κατασταση domain με registry |
| `domains_transfersync` | Συγχρονισμος κατασταση μεταφορας |

### Παραγγελιες και Τιμολογηση

| Εργαλειο | Περιγραφη |
|-----------|-----------|
| `order_domains_register` | Καταχωρηση νεου domain (απαιτει πιστωσεις) |
| `order_domains_transfer` | Μεταφορα domain στον λογαριασμο σας (απαιτει πιστωσεις) |
| `order_domains_renew` | Ανανεωση υπαρχοντος domain (απαιτει πιστωσεις) |
| `order_pricing_domains_get` | Τιμολογηση για καταχωρηση, μεταφορα η ανανεωση |

### Χρεωσεις και Συστημα

| Εργαλειο | Περιγραφη |
|-----------|-----------|
| `billing_credits_get` | Υπολοιπο πιστωσεων λογαριασμου |
| `system_version` | Εκδοση API (χρησιμο ως health check) |
| `tlds_list` | Λιστα ολων των διαθεσιμων TLDs |
| `tlds_pricing_get` | Τιμολογηση ολων των διαθεσιμων TLDs |

---

## Αρχιτεκτονικη

```
+-------------------------+
|   IDE (MCP Client)      |
+------------+------------+
             |
             |  Streamable HTTP (MCP)
             v
+------------+------------+     +----------------------------+
|   Cloudflare Worker     +---->|  Workers KV                |
|                         |     |  (κρυπτογρ. sessions)      |
|   - Auth + validation   |     +----------------------------+
|   - Tool routing        |
|   - Error handling      +---->+----------------------------+
|                         |     |  Durable Objects           |
+------------+------------+     |  (rate limits ανα session) |
             |                  +----------------------------+
             |
             |  HTTPS + HMAC-SHA256    +----------------------------+
             +------------------------>|  D1 Database               |
             |                         |  (audit logs, χωρις PII)   |
             v                         +----------------------------+
+------------+------------+
|  WHMCS DomainsReseller  |
|  API (upstream)         |
+-------------------------+
```

- Τα API keys κρυπτογραφουνται σε ηρεμια με AES-256-GCM
- Rate limiting ανα session μεσω Durable Objects
- Audit logging με ελαχιστοποιηση PII
- Σταθερο upstream URL (χωρις δυνατοτητα SSRF)
- Zod schema validation σε καθε εισοδο

---

<div align="center">

<a href="https://webhosting4u.gr">webhosting4u.gr</a>

Κατασκευασμενο με [Cloudflare Workers](https://workers.cloudflare.com/) και [MCP](https://modelcontextprotocol.io/)

AGPL-3.0 License

</div>
