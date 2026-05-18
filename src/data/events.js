export const SPECIFIC_EVENTS = {
  0: [
    // --- ΡΕΣΕΨΙΟΝΙΣΤ ΣΥΝΕΝΤΕΥΞΕΙΣ (10) ---
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Βρίσκεσαι στο γραφείο του GM Γεώργιου Μουστάκα για τη συνέντευξη εργασίας ως Ρεσεψιονίστ. Σε κοιτάζει με ένα μείγμα άγχους και αυστηρότητας: «Η ρεσεψιόν είναι η πρώτη γραμμή άμυνας. Αν σκάσει overbooking 5 δωματίων και VIP πελάτης ταυτόχρονα, πώς θα το χειριστείς;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Θα εφαρμόσω Flawless Corporate Diplomacy και θα μεταφέρω τους απλούς guests σε διπλανό μοτέλ.", stress_change: 15, reputation_change: 10, cash_change: 0 },
        { id: 2, text: "Θα προσφέρω δωρεάν ποτά στο μπαρ και θα κρυφτώ πίσω στο γραφείο των κρατήσεων.", stress_change: -10, reputation_change: -15, cash_change: 0 },
        { id: 3, text: "Θα τηλεφωνήσω αμέσως σε εσάς, κύριε Διευθυντά, για να πάρω οδηγίες ευθυγράμμισης.", stress_change: 10, reputation_change: 20, cash_change: 0 }
      ]
    },
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας ακουμπάει τα χέρια του στο γραφείο: «Αν ένας εξαιρετικά αγενής VIP πελάτης σου πετάξει τα κλειδιά στο πρόσωπο ουρλιάζοντας επειδή το δωμάτιο δεν είναι έτοιμο, πώς αντιδράς;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Παίρνω τα κλειδιά, ζητώ ταπεινά συγγνώμη και του κάνω άμεση αναβάθμιση.", stress_change: 20, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Του τα πετάω κι εγώ πίσω λέγοντάς του ότι ο σεβασμός είναι αμοιβαίος στη Faplantica.", stress_change: 10, reputation_change: -30, cash_change: 0 },
        { id: 3, text: "Του χαμογελάω ακίνητος, εφαρμόζοντας τεχνικές διαλογισμού για να μη φωνάξω την ασφάλεια.", stress_change: 30, reputation_change: 10, cash_change: 0 }
      ]
    },
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε κοιτάζει διερευνητικά: «Στη νυχτερινή βάρδια, αν νιώσεις ότι σε παίρνει ο ύπνος πάνω στο desk και δεν υπάρχει κανείς άλλος, τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Πλένω το πρόσωπό μου με παγωμένο νερό, κάνω push-ups και πίνω τριπλό εσπρέσο.", stress_change: 25, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Κλείνω τα μάτια μου για 10 λεπτά πίσω από το stand, ελπίζοντας να μην περάσει κανείς.", stress_change: -10, reputation_change: -20, cash_change: 0 },
        { id: 3, text: "Στήνω ένα ομοίωμα του εαυτού μου από χαρτόνι και κοιμάμαι στον καναπέ του lobby.", stress_change: 15, reputation_change: -35, cash_change: 0 }
      ]
    },
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει νευρικά: «Αν έρθει ο κουμπάρος του ιδιοκτήτη της Faplantica χωρίς κράτηση και απαιτεί το δωμάτιο ενός απλού πελάτη που έχει ήδη πληρώσει, τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Δίνω το δωμάτιο στον κουμπάρο αμέσως και «διώχνω» τον απλό πελάτη με δικαιολογία βλάβης.", stress_change: 15, reputation_change: 10, cash_change: -20 },
        { id: 2, text: "Λέω στον κουμπάρο ευγενικά ότι πρέπει να περιμένει και τηλεφωνώ στον ιδιοκτήτη.", stress_change: 30, reputation_change: 5, cash_change: 0 },
        { id: 3, text: "Του προτείνω να κοιμηθεί στη σουίτα του προσωπικού με έκπτωση.", stress_change: 10, reputation_change: -15, cash_change: 20 }
      ]
    },
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας κουνάει το δάχτυλο: «Θέλουμε 5-αστέρες στο TripAdvisor πάση θυσία. Πώς θα πείσεις έναν εξαιρετικά δυσαρεστημένο πελάτη να γράψει καλή κριτική πριν φύγει;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Του προσφέρω 50% έκπτωση στην επόμενη διαμονή και δωρεάν κρασί.", stress_change: 10, reputation_change: 20, cash_change: -30 },
        { id: 2, text: "Τον παρακαλάω σχεδόν κλαίγοντας, λέγοντας ότι ο Μουστάκας θα με απολύσει.", stress_change: 25, reputation_change: 5, cash_change: 0 },
        { id: 3, text: "Του λέω ότι το σύστημα κριτικών έχει πέσει και του κρατάω τις αποσκευές ως όμηρο.", stress_change: 35, reputation_change: -40, cash_change: 0 }
      ]
    },
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει με αυστηρό ύφος: «Αν στο κλείσιμο του ταμείου της βάρδιάς σου λείπουν 50€, πώς το διαχειρίζεσαι;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Βάζω τα 50€ από την τσέπη μου αμέσως για να μην υπάρχει καμία ασυμφωνία.", stress_change: 15, reputation_change: 15, cash_change: -50 },
        { id: 2, text: "Το αναφέρω με ειλικρίνεια και δέχομαι τις συνέπειες και την επίπληξη.", stress_change: 25, reputation_change: 5, cash_change: 0 },
        { id: 3, text: "Κατηγορώ το σύστημα Fidelio/Opera για συστημικό σφάλμα στρογγυλοποίησης.", stress_change: 30, reputation_change: -10, cash_change: 0 }
      ]
    },
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας ιδρώνει: «Το σύστημα κρατήσεων κολλάει κατά τη διάρκεια check-in ενός group 40 ατόμων που περιμένουν κουρασμένοι στο lobby. Τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Ξεκινάω χειρόγραφη καταγραφή των στοιχείων και τους μοιράζω κλειδιά άμεσα.", stress_change: 35, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Τους ζητάω να περιμένουν στο μπαρ κερνώντας τους δωρεάν αναψυκτικά.", stress_change: 15, reputation_change: 10, cash_change: -20 },
        { id: 3, text: "Κλειδώνομαι στο πίσω γραφείο και προσποιούμαι ότι κάνω επανεκκίνηση στον server.", stress_change: 10, reputation_change: -25, cash_change: 0 }
      ]
    },
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει πονηρά: «Αν μάθεις κρυφά ότι ο Area Operations Manager πρόκειται να απολύσει τον κολλητό σου Bellboy, θα του το πεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Όχι, τηρώ την απόλυτη corporate εχεμύθεια της εταιρείας.", stress_change: 20, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Του το ψιθυρίζω κρυφά στα αποδυτήρια για να προλάβει να βρει άλλη δουλειά.", stress_change: 10, reputation_change: -10, cash_change: 0 },
        { id: 3, text: "Πηγαίνω στον Μουστάκα και ζητάω να απολυθώ εγώ στη θέση του.", stress_change: 35, reputation_change: -5, cash_change: 0 }
      ]
    },
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας κοιτάζει την εμφάνισή σου: «Αν σου κάνω παρατήρηση επειδή η στολή σου δεν είναι τέλεια σιδερωμένη, πώς θα αντιδράσεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Ζητώ συγγνώμη, πηγαίνω αμέσως στα πλυντήρια και ζητώ να μου τη σιδερώσουν επιτόπου.", stress_change: 15, reputation_change: 10, cash_change: 0 },
        { id: 2, text: "Του εξηγώ ότι σιδέρωσα 3 φορές αλλά το ύφασμα της Faplantica είναι χαμηλής ποιότητας.", stress_change: 25, reputation_change: -15, cash_change: 0 },
        { id: 3, text: "Του λέω ότι το τσαλακωμένο look είναι η νέα corporate τάση στο εξωτερικό.", stress_change: 30, reputation_change: -25, cash_change: 0 }
      ]
    },
    {
      role: "Ρεσεψιονίστ",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας κάνει μια βαθιά ερώτηση: «Τι σημαίνει για σένα η έννοια του Corporate Alignment στη Faplantica;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Σημαίνει να θυσιάζω τα πάντα για το καλό και την κερδοφορία της εταιρείας.", stress_change: 25, reputation_change: 20, cash_change: 0 },
        { id: 2, text: "Σημαίνει να κάνω απλά τη δουλειά μου σωστά χωρίς υπερβολικές πιέσεις.", stress_change: 10, reputation_change: 5, cash_change: 0 },
        { id: 3, text: "Σημαίνει να συμφωνώ μαζί σας σε ό,τι κι αν λέτε, κύριε Διευθυντά.", stress_change: 15, reputation_change: 15, cash_change: 0 }
      ]
    },

    // --- ΣΕΡΒΙΤΟΡΟΣ ΣΥΝΕΝΤΕΥΞΕΙΣ (10) ---
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Βρίσκεσαι στο γραφείο του GM Γεώργιου Μουστάκα για τη συνέντευξη εργασίας ως Σερβιτόρος. Παίζει με ένα στυλό νευρικά: «Η σάλα είναι πόλεμος. Αν ένας VIP πελάτης σου πετάξει το κρασί επειδή δεν είναι στη σωστή θερμοκρασία, τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Ζητώ συγγνώμη με corporate χαμόγελο και του φέρνω νέα φιάλη αμέσως.", stress_change: 15, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Του λέω ότι το κρασί είναι μια χαρά και μάλλον δεν ξέρει από καλά κρασιά.", stress_change: -15, reputation_change: -25, cash_change: 0 },
        { id: 3, text: "Παίρνω τη φιάλη, πηγαίνω στην κουζίνα, βάζω παγάκια και του το ξαναφέρνω.", stress_change: 5, reputation_change: 5, cash_change: 10 }
      ]
    },
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε κοιτάζει αυστηρά: «Αν σου πέσει ένας δίσκος γεμάτος ποτήρια σαμπάνιας μπροστά στα μάτια μου, πώς θα αντιδράσεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Μαζεύω τα σπασμένα αμέσως, ζητώ συγγνώμη και φέρνω νέα ποτήρια σε 1 λεπτό.", stress_change: 25, reputation_change: 10, cash_change: -10 },
        { id: 2, text: "Κατηγορώ τον μπουφετζή που έβαλε λάθος κέντρο βάρους στον δίσκο.", stress_change: 15, reputation_change: -15, cash_change: 0 },
        { id: 3, text: "Κάνω μια υπόκλιση και το παρουσιάζω ως καλλιτεχνικό performance καλωσορίσματος.", stress_change: 20, reputation_change: -20, cash_change: 0 }
      ]
    },
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει με μισόκλειστα μάτια: «Ποια είναι η στρατηγική σου για να μεγιστοποιήσεις τα φιλοδωρήματα (tips) από τους VIP πελάτες;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Προσφέρω άψογη, διακριτική εξυπηρέτηση και Flawless Service.", stress_change: 15, reputation_change: 15, cash_change: 10 },
        { id: 2, text: "Τους κάνω συνεχώς κομπλιμέντα και τους κερνάω γλυκά με δικά μου έξοδα.", stress_change: 20, reputation_change: 10, cash_change: -15 },
        { id: 3, text: "Τους λέω με θλιμμένο ύφος ότι ο Μουστάκας μου κρατάει τον μισθό για να με λυπηθούν.", stress_change: 30, reputation_change: -25, cash_change: 30 }
      ]
    },
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει ανήσυχος: «Στον πρωινό μπουφέ τελειώνει το μπέικον και οι πελάτες αρχίζουν να φωνάζουν. Πώς το διαχειρίζεσαι;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Τρέχω στην κουζίνα και πιέζω τον Chef να βγάλει μπέικον τώρα.", stress_change: 25, reputation_change: 10, cash_change: 0 },
        { id: 2, text: "Προτείνω στους πελάτες να δοκιμάσουν τα υγιεινά φρούτα και τα δημητριακά.", stress_change: 15, reputation_change: -5, cash_change: 0 },
        { id: 3, text: "Τους λέω ότι το μπέικον απαγορεύτηκε λόγω νέας κοινοτικής οδηγίας.", stress_change: 20, reputation_change: -20, cash_change: 0 }
      ]
    },
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει με νόημα: «Ο Chef Αντώνης Σάββας είναι εξαιρετικά νευρικός. Αν σου πετάξει ένα πιάτο επειδή άργησες να το πάρεις, τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Το αποφεύγω, παίρνω το επόμενο πιάτο σιωπηλά και συνεχίζω τη δουλειά μου.", stress_change: 30, reputation_change: 10, cash_change: 0 },
        { id: 2, text: "Του το πετάω κι εγώ πίσω λέγοντάς του ότι η σάλα είναι ανώτερη από την κουζίνα.", stress_change: 20, reputation_change: -30, cash_change: 0 },
        { id: 3, text: "Πηγαίνω στη Maitress Κατερίνα να παραπονεθώ για εργασιακό bullying.", stress_change: 15, reputation_change: 5, cash_change: 0 }
      ]
    },
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε κοιτάζει στα μάτια: «Αν σου ζητήσω να κάνεις διπλοβάρδια 16 ωρών επειδή ο συνάδελφός σου ο Μπαλατσούκας δεν ήρθε, τι θα μου απαντήσεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Θα δεχτώ αμέσως, κύριε Διευθυντά! Η Faplantica είναι η οικογένειά μου.", stress_change: 35, reputation_change: 20, cash_change: 30 },
        { id: 2, text: "Θα δεχτώ μόνο αν πληρωθώ τις υπερωρίες μου στο 100%.", stress_change: 20, reputation_change: 10, cash_change: 15 },
        { id: 3, text: "Θα αρνηθώ ευγενικά διότι η σωματική μου υγεία προηγείται.", stress_change: 10, reputation_change: -25, cash_change: 0 }
      ]
    },
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει με σοβαρότητα: «Σερβίρεις λάθος πιάτο σε έναν VIP και αυτός αρχίζει να σε βρίζει χυδαία. Πώς αντιδράς;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Ακούω σιωπηλά, ζητώ ταπεινά συγγνώμη και του φέρνω το σωστό πιάτο αμέσως.", stress_change: 25, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Του απαντώ με ειρωνεία ότι η ευγένεια δεν κοστίζει τίποτα.", stress_change: 15, reputation_change: -25, cash_change: 0 },
        { id: 3, text: "Φωνάζω τον Assistant F&B Manager να αναλάβει το τραπέζι.", stress_change: 10, reputation_change: 5, cash_change: 0 }
      ]
    },
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει: «Η κουζίνα καθυστερεί υπερβολικά τις παραγγελίες σου και οι πελάτες στη σάλα σου φωνάζουν. Πώς το διαχειρίζεσαι;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Τους κερνάω prosecco/χυμούς για να κερδίσω χρόνο και πιέζω τη λάντζα.", stress_change: 25, reputation_change: 15, cash_change: -10 },
        { id: 2, text: "Λέω στους πελάτες με ειλικρίνεια ότι οι μάγειρες στην κουζίνα κοιμούνται όρθιοι.", stress_change: 15, reputation_change: -20, cash_change: 0 },
        { id: 3, text: "Κάνω τον χαμένο στη σάλα και αποφεύγω να περάσω από τα τραπέζια τους.", stress_change: 10, reputation_change: -15, cash_change: 0 }
      ]
    },
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει κοιτώντας τις προδιαγραφές υγιεινής: «Ένας VIP πελάτης σου δείχνει ένα ποτήρι νερού με αποτύπωμα κραγιόν. Τι του απαντάς;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Ζητώ συγγνώμη, αποσύρω το ποτήρι και του φέρνω νέο σφραγισμένο μπουκάλι.", stress_change: 15, reputation_change: 15, cash_change: -5 },
        { id: 2, text: "Του λέω ότι είναι το δικό του κραγιόν από την προηγούμενη γουλιά.", stress_change: 25, reputation_change: -30, cash_change: 0 },
        { id: 3, text: "Του εξηγώ ότι είναι ειδικό eco-friendly σχέδιο πάνω στο γυαλί.", stress_change: 20, reputation_change: -15, cash_change: 0 }
      ]
    },
    {
      role: "Σερβιτόρος",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει με πονηρό χαμόγελο: «Αν σε πιάσουμε να τρως κλεφτά από τις περίσσειες του μπουφέ πίσω στη λάντζα, πώς θα δικαιολογηθείς;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Θα πω ότι έκανα ποιοτικό έλεγχο γεύσης για να προστατεύσω τους πελάτες.", stress_change: 15, reputation_change: 10, cash_change: 0 },
        { id: 2, text: "Θα ζητήσω συγγνώμη και θα υποσχεθώ να μην επαναληφθεί ποτέ.", stress_change: 20, reputation_change: 15, cash_change: 0 },
        { id: 3, text: "Θα του πω ότι με τόσο χαμηλό μισθό, το φαγητό είναι μέρος της αμοιβής μου.", stress_change: 30, reputation_change: -25, cash_change: 0 }
      ]
    },

    // --- ΜΑΓΕΙΡΑΣ ΣΥΝΕΝΤΕΥΞΕΙΣ (10) ---
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Βρίσκεσαι στο γραφείο του GM Γεώργιου Μουστάκα για τη συνέντευξη εργασίας ως Μάγειρας. Σου δείχνει το ρολόι του: «Η κουζίνα είναι κόλαση. Αν σκάσει banquet 200 ατόμων και χαλάσει το κεντρικό πλυντήριο πιάτων, πώς θα αντιδράσεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Θα βάλω τους λαντζέρηδες να πλένουν στο χέρι με 1000% ρυθμό και θα βγάλω το μενού κανονικά.", stress_change: 20, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Θα αρχίσω να ουρλιάζω στους σερβιτόρους να μη φέρνουν άλλα πιάτα στην κουζίνα.", stress_change: -10, reputation_change: -20, cash_change: 0 },
        { id: 3, text: "Θα μαγειρέψω σε σκεύη μίας χρήσης και θα το παρουσιάσω ως eco-friendly concept.", stress_change: 10, reputation_change: 5, cash_change: 0 }
      ]
    },
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει νευρικά: «Στο pick της βάρδιας συνειδητοποιείς ότι δεν έχουμε φρέσκια ντομάτα για τη χωριάτικη σαλάτα των VIP. Τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Αντικαθιστώ με ντοματίνια και το σερβίρω ως 'Gourmet Cherry Tomato Salad'.", stress_change: 15, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Στέλνω έναν βοηθό να κλέψει μερικές ντομάτες από το διπλανό ταβερνάκι.", stress_change: 25, reputation_change: -5, cash_change: -10 },
        { id: 3, text: "Αφαιρώ τη σαλάτα από το μενού και λέω ότι οι ντομάτες τελείωσαν λόγω καύσωνα.", stress_change: 20, reputation_change: -15, cash_change: 0 }
      ]
    },
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει με αυστηρό βλέμμα: «Αν ο Executive Chef Αντώνης Σάββας σου πετάξει ένα τηγάνι στο κεφάλι επειδή δεν έβαλες αρκετό αλάτι, πώς αντιδράς;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Το αποφεύγω, ζητώ συγγνώμη και διορθώνω τη γεύση αμέσως.", stress_change: 30, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Του πετάω μια κατσαρόλα πίσω για να του δείξω ποιος είναι το αφεντικό.", stress_change: 20, reputation_change: -35, cash_change: 0 },
        { id: 3, text: "Βγαίνω από την κουζίνα και κάνω καταγγελία στο σωματείο μαγείρων.", stress_change: 15, reputation_change: -10, cash_change: 0 }
      ]
    },
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει για την ποιότητα: «Ένας VIP πελάτης γυρίζει πίσω το κοτόπουλο ως ωμό. Ο Chef λέει ότι είναι μια χαρά. Ποιον ακούς;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Ακούω τον πελάτη, ξαναψήνω το κοτόπουλο και του το στέλνω τέλειο.", stress_change: 20, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Ακούω τον Chef, στέλνω το ίδιο πιάτο πίσω λέγοντας ότι έτσι είναι το σωστό ψήσιμο.", stress_change: 25, reputation_change: -15, cash_change: 0 },
        { id: 3, text: "Προτείνω στον πελάτη να φάει σούπα για να μην έχουμε φασαρίες με τον Chef.", stress_change: 15, reputation_change: 5, cash_change: 0 }
      ]
    },
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει για τις συνθήκες: «Η θερμοκρασία στην κουζίνα φτάνει τους 48 βαθμούς και ο κλιματισμός έχει χαλάσει. Τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Βάζω πάγο στο σβέρκο μου, πίνω ηλεκτρολύτες και συνεχίζω να μαγειρεύω.", stress_change: 35, reputation_change: 15, cash_change: 0 },
        { id: 2, text: "Μειώνω τον ρυθμό της κουζίνας στο μισό για να μην πάθουμε θερμοπληξία.", stress_change: 15, reputation_change: -10, cash_change: 0 },
        { id: 3, text: "Ανοίγω την πόρτα της κεντρικής κατάψυξης και κάθομαι μέσα.", stress_change: 20, reputation_change: -25, cash_change: 0 }
      ]
    },
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει ανήσυχος: «Έρχεται ξαφνικός έλεγχος HACCP και οι θερμοκρασίες στα ψυγεία δεν έχουν καταγραφεί εδώ και 3 μέρες. Τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Συμπληρώνω τις θερμοκρασίες στο βιβλίο γρήγορα με το χέρι 'κατά προσέγγιση'.", stress_change: 30, reputation_change: 10, cash_change: 0 },
        { id: 2, text: "Λέω την αλήθεια στον ελεγκτή και δέχομαι το πρόστιμο για το ξενοδοχείο.", stress_change: 20, reputation_change: -30, cash_change: -50 },
        { id: 3, text: "Κερνάω τον ελεγκτή το καλύτερο rib-eye για να κάνει τα στραβά μάτια.", stress_change: 15, reputation_change: 15, cash_change: -30 }
      ]
    },
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει για το Food Cost: «Σου ζητάω να αλλάξεις τη συνταγή της σούπας βάζοντας χαμηλότερης ποιότητας υλικά για να γλιτώσουμε 0.50€ ανά μερίδα. Τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Υπακούω αμέσως και προσπαθώ να καλύψω τη διαφορά με μπαχαρικά.", stress_change: 20, reputation_change: 10, cash_change: 0 },
        { id: 2, text: "Σου εξηγώ ότι η πτώση της ποιότητας θα καταστρέψει τη φήμη του εστιατορίου.", stress_change: 25, reputation_change: 15, cash_change: 0 },
        { id: 3, text: "Αρνούμαι κατηγορηματικά και λέω ότι η μαγειρική μου τέχνη δεν παζαρεύεται.", stress_change: 30, reputation_change: -20, cash_change: 0 }
      ]
    },
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει για τις σχέσεις προσωπικού: «Πιάνεις τον Sous Chef να κάνει ανάρμοστα σχόλια για τη Maitress Κατερίνα. Πώς αντιδράς;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Του κάνω αυστηρή παρατήρηση ότι αυτό είναι απαράδεκτο και αντιεπαγγελματικό.", stress_change: 25, reputation_change: 10, cash_change: 0 },
        { id: 2, text: "Δεν ανακατεύομαι, η κουζίνα έχει ήδη αρκετή ένταση.", stress_change: 10, reputation_change: 0, cash_change: 0 },
        { id: 3, text: "Πηγαίνω αμέσως στη Maitress να της το μεταφέρω για να έχω την εύνοιά της.", stress_change: 15, reputation_change: -10, cash_change: 0 }
      ]
    },
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας σε ρωτάει για την ασφάλεια: «Ανοίγεις μια συσκευασία μοσχαρίσιου κρέατος και μυρίζει ελαφρώς περίεργα, αλλά δεν έχουμε άλλο κρέας για το μενού. Τι κάνεις;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Το πετάω αμέσως. Η ασφάλεια των πελατών είναι πάνω από όλα.", stress_change: 20, reputation_change: 15, cash_change: -20 },
        { id: 2, text: "Το πλένω με ξύδι, το μαρινάρω καλά και το ψήνω well-done.", stress_change: 35, reputation_change: -30, cash_change: 15 },
        { id: 3, text: "Το σερβίρω μόνο σε πελάτες που έχουν πιει πολύ και δεν θα καταλάβουν.", stress_change: 30, reputation_change: -35, cash_change: 10 }
      ]
    },
    {
      role: "Μάγειρας",
      scene_title: "Συνέντευξη με τον GM Μουστάκα (Act 0)",
      story_text: "Ο Μουστάκας ολοκληρώνει: «Ο μισθός σου θα είναι 850€ για 12ωρη εργασία, 7 ημέρες την εβδομάδα, χωρίς ρεπό. Πώς σου φαίνεται;»",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Είναι μια εξαιρετική ευκαιρία να αποδείξω την αξία μου στη Faplantica!", stress_change: 35, reputation_change: 20, cash_change: 0 },
        { id: 2, text: "Δέχομαι, αλλά θα ήθελα να συζητήσουμε bonus αποδοτικότητας στο τέλος της σεζόν.", stress_change: 20, reputation_change: 10, cash_change: 10 },
        { id: 3, text: "Του λέω ότι με αυτά τα λεφτά προτιμώ να πάω να δουλέψω delivery.", stress_change: 15, reputation_change: -30, cash_change: 0 }
      ]
    }
  ],
  14: [
    {
      scene_title: "Lobby (Act 14)",
      story_text: "Η Maitress Κατερίνα Τζιούτζιου σε βρίσκει σε μια χαλαρή στιγμή. 'Έχω σκάσει σήμερα! Πες μου κάτι να φτιάξω διάθεση. Θέλω να μου απαγγείλεις τον τίτλο από ένα τραγούδι που σου αρέσει πολύ, τώρα!'",
      requires_text_input: "Ποιο τραγούδι θα της πεις;",
      choices: [
        { id: 0, text: "Απάντηση", stress_change: -10, reputation_change: 5, cash_change: 0, staff_relations_change: 20 }
      ]
    },
    {
      scene_title: "Εστιατόριο (Act 14)",
      story_text: "Ετοιμάζετε την αίθουσα για ένα μεγάλο event. Η Maitress Κατερίνα Τζιούτζιου γυρνάει και σου λέει: 'Πρέπει να βάλουμε μουσική να παίζει. Πες μου το αγαπημένο σου τραγούδι για να το βάλω στη λίστα!'",
      requires_text_input: "Γράψε τον τίτλο του τραγουδιού:",
      choices: [
        { id: 0, text: "Απάντηση", stress_change: -5, reputation_change: 0, cash_change: 0, staff_relations_change: 15 }
      ]
    }
  ],
  20: [
    {
      scene_title: "Κουζίνα (Act 20)",
      story_text: "Ο Executive Chef Αντώνης Σάββας σε στριμώχνει. Αρχίζει να βρίζει χυδαία τη διοίκηση. 'Είναι όλοι τους άχρηστοι, εγώ κρατάω το μαγαζί! Ξέρεις τι έκανε χθες η Ρεσεψιόν;'",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Συμφωνώ μαζί του για να μην τον νευριάσω.", stress_change: 10, reputation_change: -5, cash_change: 0, staff_relations_change: 15 },
        { id: 2, text: "Τον αγνοώ και συνεχίζω τη δουλειά μου.", stress_change: 5, reputation_change: 0, cash_change: 0, staff_relations_change: -10 },
        { id: 3, text: "Τον υπερασπίζομαι, λέγοντας ότι όλοι κάνουν λάθη.", stress_change: 25, reputation_change: 10, cash_change: 0, staff_relations_change: -25 }
      ]
    },
    {
      scene_title: "Διάδρομος (Act 20)",
      story_text: "Περνάει ο Executive Chef Αντώνης Σάββας και κάνει ένα εντελώς απρεπές και σεξουαλικό σχόλιο για μια νέα καμαριέρα που μόλις προσλήφθηκε. Σε κοιτάει και γελάει τοξικά.",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Γελάω αμήχανα και φεύγω γρήγορα.", stress_change: 15, reputation_change: -10, cash_change: 0, staff_relations_change: -5 },
        { id: 2, text: "Του λέω ευθέως ότι αυτά τα σχόλια είναι απαράδεκτα.", stress_change: 30, reputation_change: 15, cash_change: 0, staff_relations_change: -15 },
        { id: 3, text: "Πάω κατευθείαν στον Τάρναβα να κάνω επίσημη αναφορά.", stress_change: 40, reputation_change: 25, cash_change: 0, staff_relations_change: -30 }
      ]
    }
  ],
  22: [
    {
      scene_title: "Αποθήκη Λινών - Ένταση με Φασλί (Act 22)",
      story_text: "Μπαίνεις στην αποθήκη και πετυχαίνεις τον Φασλί (τον κηπουρό/τεχνικό) να κλωτσάει ένα καρότσι και να ουρλιάζει έξαλλος στα αλβανικά: 'Qifsha ropt, ma qifsh krushkun, mut rop qifsh!' επειδή χάλασε η χλοοκοπτική και ο Μουστάκας τον απειλεί με μείωση μισθού. Σε βλέπει και έρχεται κατά πάνω σου με άγριο βλέμμα, έτοιμος για καβγά!",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Τον πλησιάζω ήρεμα, του δίνω ένα παγωμένο νερό και προσπαθώ να τον ηρεμήσω.", stress_change: 15, reputation_change: 5, cash_change: 0, staff_relations_change: 25 },
        { id: 2, text: "Τον βρίζω κι εγώ στα αλβανικά: 'Qifsha ropt Fasli, ik mor krrut!' για να καταλάβει ποιος κάνει κουμάντο.", stress_change: 25, reputation_change: -20, cash_change: 0, staff_relations_change: -15 },
        { id: 3, text: "Κάνω μεταβολή και φεύγω αθόρυβα πριν με αρπάξει από τον λαιμό.", stress_change: -10, reputation_change: 0, cash_change: 0, staff_relations_change: -5 }
      ]
    }
  ],
  24: [
    {
      scene_title: "Εστιατόριο Προσωπικού - Γαστρονομικός Εφιάλτης (Act 24)",
      story_text: "Πηγαίνεις στο εστιατόριο προσωπικού για το μεσημεριανό σου διάλειμμα. Σήμερα το μενού έχει νερόβραστα μακαρόνια με σάλτσα που μοιάζει με λάσπη και κοτόπουλο που φαίνεται να έχει πεθάνει από φυσικά αίτια πριν μια εβδομάδα. Ο μάγειρας της λάντζας σε κοιτάζει γεμάτος περηφάνια: «Φρέσκο πράγμα, corporate alignment στη γεύση!». Το στομάχι σου διαμαρτύρεται έντονα.",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Το τρώω αδιαμαρτύρητα, κάνοντας τον σταυρό μου να μην πάθω τροφική δηλητηρίαση.", stress_change: 20, reputation_change: 0, cash_change: 0, staff_relations_change: 15 },
        { id: 2, text: "Πετάω τον δίσκο στα σκουπίδια και παραγγέλνω κρυφά delivery σουβλάκια από το Roi Mat.", stress_change: -15, reputation_change: 0, cash_change: -10, staff_relations_change: -10 },
        { id: 3, text: "Πηγαίνω στον Μουστάκα και κάνω παράπονο ότι το φαγητό είναι επικίνδυνο για τη δημόσια υγεία.", stress_change: 30, reputation_change: 10, cash_change: 0, staff_relations_change: -25 }
      ]
    }
  ],
  26: [
    {
      scene_title: "Lobby - Πανικός (Act 26)",
      story_text: "Ο Γενικός Διευθυντής Μουστάκας τρέχει κατακόκκινος. 'ΠΟΥ ΕΙΝΑΙ Ο ΠΕΡΑΝΤΩΝΑΚΗΣ;' ουρλιάζει. 'Από τον χθεσινό Γάμο τα παράτησαν ΟΛΑ στην παραλία! Ποτήρια, μπουκάλια, σκουπίδια! Ψάχνω τον Bar Manager να του τα ψάλω, τον έχεις δει;'",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Τον καλύπτω λέγοντας ότι τον είδα να πάει στην αποθήκη.", stress_change: 10, reputation_change: -5, cash_change: 0, staff_relations_change: 20 },
        { id: 2, text: "Του λέω την αλήθεια, ότι πίνει καφέ στο κυλικείο προσωπικού.", stress_change: 5, reputation_change: 10, cash_change: 0, staff_relations_change: -25 },
        { id: 3, text: "Προσφέρομαι να πάω εγώ στην παραλία να μαζέψω το χάος.", stress_change: 30, reputation_change: 20, cash_change: 0, staff_relations_change: 5 }
      ]
    },
    {
      scene_title: "Παραλία - Χάος (Act 26)",
      story_text: "Βλέπεις την παραλία βομβαρδισμένη από τον χθεσινό γάμο. Ξαφνικά σκάει ο Μουστάκας αφρισμένος. 'Είναι εικόνα ξενοδοχείου αυτή; ΠΟΥ ΕΙΝΑΙ Ο ΝΙΚΟΣ Ο ΠΕΡΑΝΤΩΝΑΚΗΣ; Θα τον απολύσω τον Bar Manager σήμερα!'",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Του λέω ότι η βάρδια του Νίκου δεν έχει ξεκινήσει ακόμα.", stress_change: 15, reputation_change: -5, cash_change: 0, staff_relations_change: 15 },
        { id: 2, text: "Συμφωνώ μαζί του και αρχίζω να κατηγορώ και εγώ το Μπαρ.", stress_change: 0, reputation_change: 5, cash_change: 0, staff_relations_change: -20 },
        { id: 3, text: "Παίρνω τηλέφωνο κρυφά τον Νίκο να τον προειδοποιήσω.", stress_change: 10, reputation_change: 0, cash_change: 0, staff_relations_change: 25 }
      ]
    }
  ]
};

export const GENERAL_EVENTS = [
  {
    scene_title: "Πρόβλημα στο Δωμάτιο 402",
    story_text: "Το air condition στο VIP δωμάτιο 402 έσταζε όλο το βράδυ. Ο πελάτης είναι έξαλλος και απειλεί με κακή κριτική στο TripAdvisor αν δεν αποζημιωθεί.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Του δίνω δωρεάν γεύμα και αναβάθμιση δωματίου.", stress_change: -5, reputation_change: 10, cash_change: -30, staff_relations_change: 0 },
      { id: 2, text: "Ζητάω συγγνώμη και στέλνω αμέσως τη συντήρηση.", stress_change: 10, reputation_change: -5, cash_change: 0, staff_relations_change: -5 },
      { id: 3, text: "Του λέω ότι φταίει που το άφησε ανοιχτό με ανοιχτό παράθυρο.", stress_change: 25, reputation_change: -25, cash_change: 0, staff_relations_change: 0 }
    ]
  },
  {
    scene_title: "Ένταση στο Μπαρ",
    story_text: "Ένας πελάτης έχει πιει υπερβολικά πολύ, φωνάζει και ενοχλεί τις διπλανές παρέες. Ο barman σε φωνάζει να βοηθήσεις την κατάσταση.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Καλώ την ασφάλεια (ή την αστυνομία) να τον απομακρύνει.", stress_change: 25, reputation_change: -5, cash_change: 0, staff_relations_change: 10 },
      { id: 2, text: "Προσπαθώ να του μιλήσω ήρεμα και να τον κεράσω έναν καφέ.", stress_change: 10, reputation_change: 10, cash_change: -5, staff_relations_change: 5 },
      { id: 3, text: "Αγνοώ το πρόβλημα, ας τα βρει η βάρδια του μπαρ.", stress_change: -5, reputation_change: -15, cash_change: 0, staff_relations_change: -20 }
    ]
  },
  {
    scene_title: "Κουτσομπολιό στην Καφετιέρα",
    story_text: "Πιάνεις 2 συναδέλφους να τσακώνονται άσχημα για το ποιος έχει πάρει τα περισσότερα ρεπό αυτόν τον μήνα. Η δουλειά έχει μείνει πίσω.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Μπαίνω στη μέση και τους ηρεμώ με διπλωματία.", stress_change: 15, reputation_change: 5, cash_change: 0, staff_relations_change: 10 },
      { id: 2, text: "Τους βάζω τις φωνές να γυρίσουν άμεσα στα πόστα τους.", stress_change: 25, reputation_change: 10, cash_change: 0, staff_relations_change: -15 },
      { id: 3, text: "Πιάνω και εγώ κουβέντα, χρειαζόμουν ένα διάλειμμα.", stress_change: -10, reputation_change: -10, cash_change: 0, staff_relations_change: 20 }
    ]
  },
  {
    scene_title: "Εντολή Περικοπών",
    story_text: "Ήρθε memo από τη διοίκηση. Πρέπει να μειώσουμε άμεσα τα έξοδα ρεύματος. Απαιτούν να κλείσουμε τον κλιματισμό στους διαδρόμους εν μέσω καύσωνα.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Υπακούω τυφλά στην εντολή, η διοίκηση ξέρει καλύτερα.", stress_change: 5, reputation_change: -15, cash_change: 25, staff_relations_change: -10 },
      { id: 2, text: "Κλείνω τα μισά κλιματιστικά για να υπάρχει μια ισορροπία.", stress_change: 15, reputation_change: -5, cash_change: 10, staff_relations_change: 0 },
      { id: 3, text: "Αγνοώ την εντολή, οι πελάτες θα σκάσουν και θα έχουμε παράπονα.", stress_change: 25, reputation_change: 10, cash_change: -20, staff_relations_change: 15 }
    ]
  },
  {
    scene_title: "Χαμένη Κάρτα",
    story_text: "Έχασες το master-key / την κάρτα πρόσβασής σου! Αν το μάθει ο Μουστάκας θα γίνει χαμός. Πρέπει να αποφασίσεις τι θα κάνεις.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Το αναφέρω άμεσα για να ακυρωθεί η κάρτα, αποδεχόμενος το πρόστιμο.", stress_change: 20, reputation_change: 5, cash_change: -15, staff_relations_change: 0 },
      { id: 2, text: "Ψάχνω κρυφά μόνος μου, ρισκάροντας να βρεθεί από πελάτη.", stress_change: 35, reputation_change: -20, cash_change: 0, staff_relations_change: -5 },
      { id: 3, text: "Λέω ψέματα ότι μου την έκλεψαν για να γλιτώσω την ευθύνη.", stress_change: 10, reputation_change: -10, cash_change: 0, staff_relations_change: -15 }
    ]
  },
  {
    scene_title: "Λάθος Κράτηση",
    story_text: "Λόγω λάθους στο σύστημα, δώσαμε το ίδιο δωμάτιο σε δύο διαφορετικές οικογένειες. Και οι δύο είναι στη ρεσεψιόν και απαιτούν το δωμάτιό τους.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Δίνω σε μία οικογένεια την Προεδρική Σουίτα ως αναβάθμιση.", stress_change: 15, reputation_change: 15, cash_change: -40, staff_relations_change: 5 },
      { id: 2, text: "Στέλνω τη μία οικογένεια σε συνεργαζόμενο ξενοδοχείο με δικά μας έξοδα.", stress_change: 25, reputation_change: -5, cash_change: -30, staff_relations_change: 0 },
      { id: 3, text: "Ρίχνω το φταίξιμο στο σύστημα και τους λέω να περιμένουν.", stress_change: 40, reputation_change: -25, cash_change: 0, staff_relations_change: -10 }
    ]
  },
  {
    scene_title: "Έλεγχος Υγειονομικού",
    story_text: "Κλιμάκιο του Υγειονομικού εμφανίζεται ξαφνικά για έλεγχο. Οι κάδοι σκουπιδιών πίσω από την κουζίνα είναι γεμάτοι και μυρίζουν.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Τρέχω και καθαρίζω / κρύβω τα σκουπίδια μόνος μου πριν έρθουν.", stress_change: 30, reputation_change: 10, cash_change: 0, staff_relations_change: -5 },
      { id: 2, text: "Κερνάω τους ελεγκτές καφέδες στο lobby για να καθυστερήσουν.", stress_change: 15, reputation_change: 0, cash_change: -5, staff_relations_change: 0 },
      { id: 3, text: "Αφήνω τον έλεγχο να γίνει κανονικά, δεν είναι δική μου δουλειά.", stress_change: -5, reputation_change: -30, cash_change: -50, staff_relations_change: 10 }
    ]
  },
  {
    scene_title: "Αρρώστια Προσωπικού",
    story_text: "Τρεις υπάλληλοι πήραν τηλέφωνο ότι είναι άρρωστοι σήμερα. Η βάρδια έχει μείνει μισή και οι πελάτες αρχίζουν να εκνευρίζονται από τις καθυστερήσεις.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Δουλεύω υπερωρία και κάνω και τις δικές τους δουλειές.", stress_change: 35, reputation_change: 10, cash_change: 15, staff_relations_change: 20 },
      { id: 2, text: "Παίρνω τηλέφωνο υπαλλήλους με ρεπό να έρθουν εκτάκτως.", stress_change: 20, reputation_change: 0, cash_change: 0, staff_relations_change: -20 },
      { id: 3, text: "Δεν κάνω τίποτα, απλά ζητάω κατανόηση από τους πελάτες.", stress_change: -10, reputation_change: -20, cash_change: 0, staff_relations_change: 5 }
    ]
  },
  {
    scene_title: "Παράπονο Influencer",
    story_text: "Μια γνωστή influencer απαιτεί δωρεάν σαμπάνια στο δωμάτιο, απειλώντας ότι θα κάνει κακό story στο Instagram για το ξενοδοχείο.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Της στέλνω αμέσως τη σαμπάνια για να μην έχουμε φασαρίες.", stress_change: 10, reputation_change: 15, cash_change: -25, staff_relations_change: -5 },
      { id: 2, text: "Της αρνούμαι ευγενικά, αναφέροντας την πολιτική του ξενοδοχείου.", stress_change: 25, reputation_change: -10, cash_change: 0, staff_relations_change: 10 },
      { id: 3, text: "Της λέω ότι αν κάνει story, θα τη μηνύσουμε για δυσφήμιση.", stress_change: 40, reputation_change: -25, cash_change: 0, staff_relations_change: 15 }
    ]
  },
  {
    scene_title: "Διακοπή Ρεύματος",
    story_text: "Μια ξαφνική διακοπή ρεύματος βυθίζει το ξενοδοχείο στο σκοτάδι. Υπάρχει κόσμος εγκλωβισμένος στο ασανσέρ!",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Τρέχω να βάλω μπρος τη γεννήτρια με χειροκίνητο τρόπο.", stress_change: 35, reputation_change: 20, cash_change: 0, staff_relations_change: 15 },
      { id: 2, text: "Καθησυχάζω τον κόσμο με φακούς και καλώ την πυροσβεστική.", stress_change: 15, reputation_change: 5, cash_change: 0, staff_relations_change: 5 },
      { id: 3, text: "Πανικοβάλλομαι και κρύβομαι στο γραφείο.", stress_change: -10, reputation_change: -35, cash_change: 0, staff_relations_change: -20 }
    ]
  },
  {
    scene_title: "Τηλεφώνημα Πανικού",
    role: "Σερβιτόρος",
    story_text: "Το ξυπνητήρι δεν χτύπησε ποτέ! Ξυπνάς από το επίμονο τηλεφώνημα της Maitress Κατερίνας Τζιούτζιου: 'Πού είσαι; Η πρωινή βάρδια έχει ξεκινήσει, ο μπουφές είναι γεμάτος κόσμο και εσύ λείπεις!'",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Λέω ψέματα ότι έπαθα λάστιχο στον δρόμο και έρχομαι σφαίρα.", stress_change: 15, reputation_change: -5, cash_change: 0, staff_relations_change: -5 },
      { id: 2, text: "Λέω την αλήθεια, ζητάω χίλια συγγνώμη και υπόσχομαι να κάνω διπλοβάρδια.", stress_change: 25, reputation_change: 10, cash_change: 0, staff_relations_change: 10 },
      { id: 3, text: "Κλείνω το τηλέφωνο και το γυρνάω στο αθόρυβο. Ας με απολύσουν.", stress_change: -20, reputation_change: -30, cash_change: 0, staff_relations_change: -20 }
    ]
  },
  {
    scene_title: "Λούφα στην Κουζίνα",
    role: "Σερβιτόρος",
    story_text: "Βρίσκεσαι πίσω στην κουζίνα και γυαλίζεις μαχαιροπίρουνα με ρυθμούς χελώνας, χαζεύοντας στο κινητό. Ξαφνικά εμφανίζεται η Maitress Κατερίνα και σε πιάνει στα πράσα!",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Κρύβω γρήγορα το κινητό και προσποιούμαι ότι τρίβω με μανία ένα κουτάλι.", stress_change: 15, reputation_change: -5, cash_change: 0, staff_relations_change: -10 },
      { id: 2, text: "Ζητάω συγγνώμη και της λέω ότι περίμενα να βγουν τα καθαρά σκεύη από το πλυντήριο.", stress_change: 10, reputation_change: 5, cash_change: 0, staff_relations_change: 5 },
      { id: 3, text: "Της λέω με θράσος ότι δουλεύω 12ωρα χωρίς διάλειμμα και δικαιούμαι 5 λεπτά.", stress_change: 25, reputation_change: -20, cash_change: 0, staff_relations_change: -15 }
    ]
  },
  {
    scene_title: "Σύγκρουση στο Μπουφέ",
    role: "Σερβιτόρος",
    story_text: "Ο Βαλάντης ο μπουφετζής τρέχει σαν τρελός με ένα καρότσι γεμάτο πιάτα και σε χτυπάει άσχημα στον αστράγαλο. Αντί να ζητήσει συγγνώμη, σου φωνάζει: 'Φύγε από τη μέση ρε, δεν βλέπεις ότι βιάζομαι;'",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Του φωνάζω κι εγώ και τον σπρώχνω. Δεν θα με πατάει ο κάθε άσχετος!", stress_change: 20, reputation_change: -15, cash_change: 0, staff_relations_change: -25 },
      { id: 2, text: "Παίρνω βαθιά ανάσα, τον αγνοώ και πάω να βάλω πάγο στον αστράγαλό μου.", stress_change: 15, reputation_change: 10, cash_change: 0, staff_relations_change: 5 },
      { id: 3, text: "Του λέω ειρωνικά: 'Μπράβο Βαλάντη, πάρε και δίπλωμα νταλίκας!' και συνεχίζω.", stress_change: 5, reputation_change: 0, cash_change: 0, staff_relations_change: -10 }
    ]
  },
  {
    scene_title: "Το Χανγκόβερ του Μπαλατσούκα",
    role: "Σερβιτόρος",
    story_text: "Ο συνάδελφός σου ο Μπαλατσούκας ήρθε στη βάρδια ολοφάνερα μεθυσμένος μετά από χθεσινοβραδινή έξοδο στο 'Σαράι'. Δεν μπορεί να σταθεί όρθιος και όλη η δουλειά του F&B πέφτει στις δικές σου πλάτες!",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Τον καλύπτω και τρέχω σαν τρελός να βγάλω και τα δικά του τραπέζια για το τιπ.", stress_change: 35, reputation_change: 15, cash_change: 20, staff_relations_change: 35 },
      { id: 2, text: "Πάω κρυφά στη Maitress Κατερίνα και την ενημερώνω για την κατάστασή του.", stress_change: 10, reputation_change: 10, cash_change: 0, staff_relations_change: -30 },
      { id: 3, text: "Του λέω να πάει να κοιμηθεί στις τουαλέτες κι εγώ κάνω μόνο τα απολύτως απαραίτητα.", stress_change: 15, reputation_change: -10, cash_change: 0, staff_relations_change: 10 }
    ]
  },
  {
    scene_title: "Παρατήρηση από Τάρναβα",
    role: "Σερβιτόρος",
    story_text: "Ο Area Operations Manager Ανδρέας Τάρναβας περνάει από το εστιατόριο, κοιτάζει το πάτωμα και σου κάνει αυστηρή παρατήρηση: 'Αυτό το πάτωμα είναι βρώμικο, υπάρχουν ψίχουλα παντού. Αυτή είναι η εικόνα πεντάστερου ξενοδοχείου;'",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Ζητάω αμέσως συγγνώμη και παίρνω τη σφουγγαρίστρα να το καθαρίσω επιτόπου.", stress_change: 20, reputation_change: 10, cash_change: 0, staff_relations_change: 0 },
      { id: 2, text: "Του λέω ότι μόλις σηκώθηκε ένα τραπέζι με 5 παιδιά και θα το καθαρίζαμε τώρα.", stress_change: 10, reputation_change: 5, cash_change: 0, staff_relations_change: 5 },
      { id: 3, text: "Του απαντάω ότι είμαστε μόνο 2 σερβιτόροι για 100 άτομα και δεν προλαβαίνουμε.", stress_change: 25, reputation_change: -15, cash_change: 0, staff_relations_change: -10 }
    ]
  },
  {
    scene_title: "Το Ψυγείο των Κρασιών",
    role: "Σερβιτόρος",
    story_text: "Ο Ανδρέας Τάρναβας ελέγχει το Wine Cooler του εστιατορίου και σε καλεί έξαλλος: 'Το ψυγείο με τα κρασιά έχει λάθος θερμοκρασία! Έχει πάει στους 18 βαθμούς! Θέλετε να σερβίρουμε ζεστή Σαντορίνη στους VIP;'",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Αναλαμβάνω την ευθύνη, ρυθμίζω ξανά τον θερμοστάτη και ελέγχω τα μπουκάλια.", stress_change: 15, reputation_change: 10, cash_change: 0, staff_relations_change: 5 },
      { id: 2, text: "Του λέω ότι η συντήρηση το πείραξε χθες και ότι φταίνε οι τεχνικοί.", stress_change: 10, reputation_change: -5, cash_change: 0, staff_relations_change: -15 },
      { id: 3, text: "Του προτείνω να βάλουμε μερικά μπουκάλια σε σαμπανιέρες με πάγο για άμεση λύση.", stress_change: 5, reputation_change: 15, cash_change: 0, staff_relations_change: 10 }
    ]
  },
  {
    scene_title: "Ουρά Αναμονής",
    role: "Σερβιτόρος",
    story_text: "Είναι ώρα αιχμής στο κεντρικό εστιατόριο. Έχει δημιουργηθεί τεράστια ουρά αναμονής στην είσοδο, οι πελάτες πεινάνε, φωνάζουν και απειλούν με κακά σχόλια επειδή καθυστερούν να καθίσουν!",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Τρέχω να καθαρίσω τραπέζια με ταχύτητα φωτός για να καθίσουν οι επόμενοι.", stress_change: 35, reputation_change: 15, cash_change: 0, staff_relations_change: 10 },
      { id: 2, text: "Πηγαίνω στην ουρά και τους κερνάω prosecco/χυμούς για να ηρεμήσω τα πνεύματα.", stress_change: 15, reputation_change: 20, cash_change: -20, staff_relations_change: 15 },
      { id: 3, text: "Τους λέω ψυχρά ότι αν δεν έχουν κράτηση θα πρέπει να περιμένουν τουλάχιστον μία ώρα.", stress_change: 10, reputation_change: -25, cash_change: 0, staff_relations_change: -10 }
    ]
  },
  // --- ΡΕΣΕΨΙΟΝΙΣΤ EVENTS ---
  {
    scene_title: "VIP με 5 Σκυλιά",
    role: "Ρεσεψιονίστ",
    story_text: "Ένας εκκεντρικός VIP πελάτης σκάει στη ρεσεψιόν με 5 θορυβώδη σκυλιά Chihuahua, απαιτώντας να μείνουν μαζί του, παρόλο που το ξενοδοχείο απαγορεύει αυστηρά τα κατοικίδια.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Κάνω τα στραβά μάτια επειδή είναι VIP και του χρεώνω ειδικό Pet Fee.", stress_change: 15, reputation_change: 15, cash_change: 50 },
      { id: 2, text: "Του αρνούμαι κατηγορηματικά, προτείνοντας να τα αφήσει σε κοντινό ξενοδοχείο ζώων.", stress_change: 25, reputation_change: -10, cash_change: 0 },
      { id: 3, text: "Καλώ τον Μουστάκα να βγάλει το φίδι από την τρύπα.", stress_change: 10, reputation_change: 5, cash_change: 0 }
    ]
  },
  {
    scene_title: "Ο Έλεγχος του Booking.com",
    role: "Ρεσεψιονίστ",
    story_text: "Ένας μυστήριος πελάτης σου ψιθυρίζει ότι είναι κρυφός επιθεωρητής της Booking.com. Απαιτεί δωρεάν αναβάθμιση σε σουίτα, αλλιώς απειλεί να ρίξει τη βαθμολογία μας.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Του δίνω αμέσως την αναβάθμιση για να σώσω τη βαθμολογία.", stress_change: 10, reputation_change: 15, cash_change: -30 },
      { id: 2, text: "Του ζητώ επίσημα διαπιστευτήρια, αλλιώς αρνούμαι την αναβάθμιση.", stress_change: 20, reputation_change: 5, cash_change: 0 },
      { id: 3, text: "Του λέω ειρωνικά ότι κι εγώ είμαι ο κρυφός ιδιοκτήτης του Booking.", stress_change: 30, reputation_change: -20, cash_change: 0 }
    ]
  },
  {
    scene_title: "Η Κλοπή της Πετσέτας",
    role: "Ρεσεψιονίστ",
    story_text: "Μια ηλικιωμένη VIP πελάτισσα κατηγορεί την καμαριέρα ότι της έκλεψε μια «συλλεκτική» πετσέτα θαλάσσης, απειλώντας να φωνάξει την αστυνομία.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Της δίνω μια καινούργια πετσέτα του ξενοδοχείου και ζητώ συγγνώμη.", stress_change: 10, reputation_change: 10, cash_change: -10 },
      { id: 2, text: "Υπερασπίζομαι την καμαριέρα λέγοντας ότι δουλεύει 10 χρόνια εδώ και είναι τίμια.", stress_change: 15, reputation_change: 5, cash_change: 0 },
      { id: 3, text: "Υπόσχομαι να κάνω σωματικό έλεγχο σε όλο το προσωπικό προσωπικά.", stress_change: 25, reputation_change: -15, cash_change: 0 }
    ]
  },
  {
    scene_title: "Το Λάθος Overbooking του Μουστάκα",
    role: "Ρεσεψιονίστ",
    story_text: "Ο Μουστάκας έκανε ο ίδιος κράτηση για τον κουμπάρο του αλλά ξέχασε να την περάσει. Τώρα το ξενοδοχείο είναι 110% γεμάτο και ο κουμπάρος απαιτεί δωμάτιο.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Μεταφέρω έναν απλό πελάτη σε διπλανό μοτέλ για να βολευτεί ο κουμπάρος.", stress_change: 20, reputation_change: -10, cash_change: -20 },
      { id: 2, text: "Τηλεφωνώ στον Μουστάκα να του πω ότι δεν υπάρχει χώρος ούτε για δείγμα.", stress_change: 30, reputation_change: 10, cash_change: 0 },
      { id: 3, text: "Στήνω ένα ράντζο στο γραφείο κρατήσεων και το παρουσιάζω ως VIP Office Experience.", stress_change: 15, reputation_change: 5, cash_change: 10 }
    ]
  },
  {
    scene_title: "Ο Influencer με 50 Followers",
    role: "Ρεσεψιονίστ",
    story_text: "Ένας τύπος στη ρεσεψιόν απαιτεί δωρεάν διαμονή 3 ημερών δείχνοντάς σου το προφίλ του στο TikTok με... 54 followers.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Του γελάω κατάμουτρα και του δίνω κανονικό τιμολόγιο.", stress_change: 10, reputation_change: -5, cash_change: 15 },
      { id: 2, text: "Του προσφέρω ευγενικά ένα δωρεάν κοκτέιλ στο μπαρ αντί για δωμάτιο.", stress_change: 15, reputation_change: 10, cash_change: -5 },
      { id: 3, text: "Του προτείνω να κάνει live stream καθαρίζοντας τις τουαλέτες για promotion.", stress_change: 20, reputation_change: -15, cash_change: 0 }
    ]
  },
  {
    scene_title: "Η Καταιγίδα και η Διαρροή",
    role: "Ρεσεψιονίστ",
    story_text: "Μια ξαφνική μπόρα πλημμυρίζει το lobby και το νερό στάζει πάνω στο πληκτρολόγιο της ρεσεψιόν, απειλώντας να κάψει το σύστημα κρατήσεων.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Βάζω κουβάδες, σκεπάζω τα PC με σακούλες σκουπιδιών και συνεχίζω με το χέρι.", stress_change: 30, reputation_change: 10, cash_change: 0 },
      { id: 2, text: "Φωνάζω έξαλλος τη συντήρηση και σταματάω τα check-in.", stress_change: 20, reputation_change: -10, cash_change: 0 },
      { id: 3, text: "Ανοίγω ομπρέλα μέσα στη ρεσεψιόν και το παρουσιάζω ως Rain Theme Day.", stress_change: 15, reputation_change: 5, cash_change: 0 }
    ]
  },
  {
    scene_title: "Ο Απαιτητικός Συνεδριακός",
    role: "Ρεσεψιονίστ",
    story_text: "Ένας VIP διοργανωτής συνεδρίου απαιτεί να αλλάξουμε το setup της αίθουσας 30 λεπτά πριν την έναρξη επειδή η τρέχουσα διάταξη «δεν έχει καλό φενγκ σούι».",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Τρέχω μαζί με τους bellboys να αλλάξουμε 150 καρέκλες σε χρόνο dt.", stress_change: 35, reputation_change: 20, cash_change: 0 },
      { id: 2, text: "Του εξηγώ ευγενικά ότι η αλλαγή είναι αδύνατη λόγω κανονισμών ασφαλείας.", stress_change: 20, reputation_change: -5, cash_change: 0 },
      { id: 3, text: "Του ζητάω extra χρέωση 200€ για 'Emergency Feng Shui Setup'.", stress_change: 15, reputation_change: 15, cash_change: 50 }
    ]
  },
  {
    scene_title: "Η Χαμένη Βαλίτσα",
    role: "Ρεσεψιονίστ",
    story_text: "Ένας VIP πελάτης ουρλιάζει επειδή ο bellboy έχασε τη βαλίτσα του, η οποία περιέχει «ανεκτίμητης αξίας» έγγραφα.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Ψάχνω προσωπικά σε όλες τις αποθήκες και τα δωμάτια του lobby.", stress_change: 30, reputation_change: 10, cash_change: 0 },
      { id: 2, text: "Ρίχνω την ευθύνη στον bellboy και του λέω να περιμένει την αστυνομία.", stress_change: 20, reputation_change: -20, cash_change: 0 },
      { id: 3, text: "Του προσφέρω 50€ cash από το ταμείο για να αγοράσει ρούχα μέχρι να βρεθεί.", stress_change: 15, reputation_change: 5, cash_change: -25 }
    ]
  },
  {
    scene_title: "Ύποπτος Νυχτερινός Επισκέπτης",
    role: "Ρεσεψιονίστ",
    story_text: "Στη νυχτερινή βάρδια, ένας πελάτης εμφανίζεται φορώντας γυαλιά ηλίου και ζητάει δωμάτιο με ψεύτικο όνομα, προσφέροντας 200€ μετρητά χωρίς απόδειξη.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Του αρνούμαι κατηγορηματικά, τηρώντας τον νόμο και την ασφάλεια.", stress_change: 15, reputation_change: 10, cash_change: 0 },
      { id: 2, text: "Παίρνω τα μετρητά, τον βάζω σε δωμάτιο που φαίνεται κενό και τσεπώνω τα λεφτά.", stress_change: 30, reputation_change: -25, cash_change: 100 },
      { id: 3, text: "Του λέω ότι η ταρίφα για 'μυστικά δωμάτια' είναι τουλάχιστον 400€.", stress_change: 25, reputation_change: -30, cash_change: 200 }
    ]
  },
  {
    scene_title: "Check-Out του Κακού Πληρωτή",
    role: "Ρεσεψιονίστ",
    story_text: "Ένας πελάτης κάνει check-out και ισχυρίζεται ότι η πιστωτική του κάρτα μπλοκαρίστηκε. Υπόσχεται να στείλει έμβασμα μόλις γυρίσει στην πατρίδα του.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Τον κρατάω στη ρεσεψιόν και καλώ αμέσως τη διοίκηση ή την αστυνομία.", stress_change: 35, reputation_change: 10, cash_change: 0 },
      { id: 2, text: "Τον αφήνω να φύγει παίρνοντας υπογραφή σε υπεύθυνη δήλωση.", stress_change: 20, reputation_change: -15, cash_change: -50 },
      { id: 3, text: "Του ζητάω να αφήσει το πανάκριβο ρολόι του ως εγγύηση.", stress_change: 15, reputation_change: 5, cash_change: 30 }
    ]
  },

  // --- ΜΑΓΕΙΡΑΣ EVENTS ---
  {
    scene_title: "Το Χαλασμένο Πλυντήριο Πιάτων",
    role: "Μάγειρας",
    story_text: "Το κεντρικό πλυντήριο πιάτων της κουζίνας σκάει βγάζοντας καπνούς εν μέσω banquet 150 ατόμων. Τα καθαρά πιάτα τελειώνουν!",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Βάζω όλη την ομάδα (ακόμα και τους βοηθούς) να πλένουν στο χέρι με τρελούς ρυθμούς.", stress_change: 35, reputation_change: 15, cash_change: 0 },
      { id: 2, text: "Σερβίρω τα ορεκτικά σε ξύλινες σανίδες κοπής για να γλιτώσω πιάτα.", stress_change: 15, reputation_change: 5, cash_change: 10 },
      { id: 3, text: "Σταματάω τη ροή του φαγητού και ενημερώνω ότι έχουμε τεχνικό πρόβλημα.", stress_change: 25, reputation_change: -20, cash_change: 0 }
    ]
  },
  {
    scene_title: "Η Έλλειψη Φρέσκου Αστακού",
    role: "Μάγειρας",
    story_text: "Ένας VIP πελάτης απαιτεί αστακομακαρονάδα, αλλά ο προμηθευτής δεν έφερε αστακούς σήμερα. Έχουμε μόνο κατεψυγμένες γαρίδες.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Πηγαίνω ο ίδιος στο τραπέζι και του προτείνω ένα φρέσκο ψάρι ημέρας.", stress_change: 15, reputation_change: 15, cash_change: 0 },
      { id: 2, text: "Φτιάχνω το πιάτο με τις γαρίδες και το σερβίρω ως 'Μικρασιάτικο Αστακό'.", stress_change: 25, reputation_change: -15, cash_change: 20 },
      { id: 3, text: "Του στέλνω σκέτη μακαρονάδα με σάλτσα ντομάτας χρεώνοντας κανονικά.", stress_change: 30, reputation_change: -30, cash_change: 10 }
    ]
  },
  {
    scene_title: "Η Φωτιά στο Τηγάνι",
    role: "Μάγειρας",
    story_text: "Ένας νέος βοηθός βάζει φωτιά σε ένα τηγάνι με λάδι. Ο καπνός είναι πυκνός και κινδυνεύει να ανάψει το αυτόματο σύστημα πυρόσβεσης.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Σκεπάζω αμέσως το τηγάνι με μεταλλικό καπάκι και σβήνω τη φωτιά.", stress_change: 25, reputation_change: 15, cash_change: 0 },
      { id: 2, text: "Πετάω νερό στο τηγάνι (πράγμα εξαιρετικά επικίνδυνο!).", stress_change: 50, reputation_change: -30, cash_change: -50 },
      { id: 3, text: "Τρέχω έξω φωνάζοντας 'ΦΩΤΙΑ' και πανικοβάλλω τη σάλα.", stress_change: 40, reputation_change: -40, cash_change: 0 }
    ]
  },
  {
    scene_title: "Ο Chef Αντώνης Σάββας σε Κρίση",
    role: "Μάγειρας",
    story_text: "Ο Executive Chef Αντώνης Σάββας ουρλιάζει στους πάντες επειδή κάποιος του πήρε το καλό του μαχαίρι. Απειλεί να απολύσει όλη τη βάρδια.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Του προσφέρω το δικό μου μαχαίρι για να τον ηρεμήσω.", stress_change: 15, reputation_change: 10, cash_change: 0 },
      { id: 2, text: "Ψάχνω κρυφά στην κουζίνα μέχρι να βρω το μαχαίρι του.", stress_change: 25, reputation_change: 5, cash_change: 0 },
      { id: 3, text: "Του λέω ότι η υστερία του δεν βοηθάει καθόλου τη δουλειά.", stress_change: 35, reputation_change: -15, cash_change: 0 }
    ]
  },
  {
    scene_title: "Το Καμένο Φιλέτο του Μουστάκα",
    role: "Μάγειρας",
    story_text: "Το φιλέτο rib-eye για το τραπέζι του GM Μουστάκα κάηκε επειδή ξεχάστηκες μιλώντας στο τηλέφωνο. Ο Μουστάκας περιμένει ήδη 20 λεπτά.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Πετάω το καμένο, βάζω νέο φιλέτο στη σχάρα και τρέχω τη φωτιά στο full.", stress_change: 30, reputation_change: 5, cash_change: -10 },
      { id: 2, text: "Κόβω τα καμένα μέρη, βάζω πολύ σάλτσα από πάνω και το στέλνω έτσι.", stress_change: 20, reputation_change: -20, cash_change: 0 },
      { id: 3, text: "Λέω ότι το κρέας είχε πρόβλημα και του προτείνω κοτόπουλο.", stress_change: 15, reputation_change: -5, cash_change: 0 }
    ]
  },
  {
    scene_title: "Ο Vegan με Αλλεργία στη Γλουτένη",
    role: "Μάγειρας",
    story_text: "Ένας πελάτης ζητάει gluten-free vegan μουσακά (που δεν υπάρχει). Απειλεί να πάθει αναφυλαξία αν βρει ίχνος ζωικού προϊόντος ή γλουτένης.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Του φτιάχνω επί τόπου μια ειδική σαλάτα με ψητά λαχανικά και κινόα.", stress_change: 20, reputation_change: 15, cash_change: 0 },
      { id: 2, text: "Του σερβίρω τον κανονικό μουσακά λέγοντας ψέματα ότι είναι vegan.", stress_change: 35, reputation_change: -35, cash_change: 10 },
      { id: 3, text: "Του λέω ευγενικά ότι δεν μπορούμε να εγγυηθούμε 100% απουσία γλουτένης.", stress_change: 15, reputation_change: 10, cash_change: 0 }
    ]
  },
  {
    scene_title: "Έφοδος του Μουστάκα στην Κουζίνα",
    role: "Μάγειρας",
    story_text: "Ο Μουστάκας μπαίνει στην κουζίνα με άσπρο γάντι για να ελέγξει αν υπάρχει σκόνη πάνω από τα ψυγεία. Αν βρει κάτι, θα γίνει χαμός.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Τρέχω μπροστά του και σκουπίζω γρήγορα με ένα πανί.", stress_change: 25, reputation_change: 10, cash_change: 0 },
      { id: 2, text: "Του λέω ότι η κουζίνα καθαρίζεται στο τέλος της βάρδιας βάσει HACCAP.",
        stress_change: 15, reputation_change: 5, cash_change: 0 },
      { id: 3, text: "Του ρίχνω επίτηδες λίγο αλεύρι στο σακάκι για να αποσπάσω την προσοχή του.", stress_change: 30, reputation_change: -15, cash_change: 0 }
    ]
  },
  {
    scene_title: "Διακοπή Νερού στην Κουζίνα",
    role: "Μάγειρας",
    story_text: "Το νερό κόβεται ξαφνικά στο pick της προετοιμασίας για το βραδινό buffet. Δεν μπορούμε να πλύνουμε λαχανικά ούτε να βράσουμε ζυμαρικά!",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Χρησιμοποιώ εμφιαλωμένα νερά από το μπαρ για τις βασικές ανάγκες.", stress_change: 30, reputation_change: 15, cash_change: -20 },
      { id: 2, text: "Σταματάω τα βραστά και το γυρνάω αποκλειστικά σε ψητά και τηγανητά.", stress_change: 20, reputation_change: 5, cash_change: 0 },
      { id: 3, text: "Κηρύσσω στάση εργασίας στην κουζίνα μέχρι να φτιαχτεί η βλάβη.", stress_change: 15, reputation_change: -25, cash_change: 0 }
    ]
  },
  {
    scene_title: "Κλοπή των Φιλέτων",
    role: "Μάγειρας",
    story_text: "Παρατηρείς ότι ένας συνάδελφός σου κρύβει ακριβά φιλέτα rib-eye στην τσάντα του πριν σχολάσει. Αν τον καρφώσεις θα σε πουν ρουφιάνο, αν όχι θα έχουμε έλλειμμα.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Του μιλάω κατ' ιδίαν και του λέω να τα επιστρέψει αμέσως.", stress_change: 20, reputation_change: 5, cash_change: 0 },
      { id: 2, text: "Πηγαίνω στον Chef Σάββα και τον ενημερώνω κρυφά.", stress_change: 15, reputation_change: 10, cash_change: 0 },
      { id: 3, text: "Του ζητάω να μοιραστούμε τη λεία για να κρατήσω το στόμα μου κλειστό.", stress_change: 25, reputation_change: -20, cash_change: 30 }
    ]
  },
  {
    scene_title: "Η Χαλασμένη Κατάψυξη",
    role: "Μάγειρας",
    story_text: "Η κεντρική κατάψυξη της κουζίνας ανέβασε θερμοκρασία στους +5 βαθμούς. Κρέατα και θαλασσινά αξίας 5.000€ κινδυνεύουν να χαλάσουν.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Μεταφέρω όλα τα ευπαθή προϊόντα στις καταψύξεις του μπαρ και των lobby.", stress_change: 35, reputation_change: 15, cash_change: 0 },
      { id: 2, text: "Καλώ αμέσως επείγουσα τεχνική υποστήριξη με δικά μας έξοδα.", stress_change: 20, reputation_change: 10, cash_change: -50 },
      { id: 3, text: "Τα αφήνω έτσι ελπίζοντας ότι θα φτιαχτεί μόνο του μέχρι το πρωί.", stress_change: 45, reputation_change: -35, cash_change: 0 }
    ]
  },

  // --- ΕΠΙΠΛΕΟΝ ΣΕΡΒΙΤΟΡΟΣ EVENTS ---
  {
    scene_title: "Ο VIP που δεν Αφήνει Τιπ",
    role: "Σερβιτόρος",
    story_text: "Ένα τραπέζι VIP με λογαριασμό 500€ σε κράτησε στο πόδι 3 ώρες με παράλογες απαιτήσεις. Στο τέλος, πληρώνουν με κάρτα και δεν αφήνουν ούτε σεντ τιπ.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Τους ευχαριστώ με το πιο ψεύτικο corporate χαμόγελο και υποκλίνομαι.", stress_change: 25, reputation_change: 15, cash_change: 0 },
      { id: 2, text: "Τους λέω ειρωνικά: 'Ελπίζω η υπηρεσία μας να μην επιβάρυνε τον προϋπολογισμό σας'.", stress_change: 15, reputation_change: -10, cash_change: 0 },
      { id: 3, text: "«Ξεχνάω» να τους φέρω τα ρέστα από τα μετρητά που άφησαν για το πάρκινγκ.", stress_change: 20, reputation_change: -15, cash_change: 15 }
    ]
  },
  {
    scene_title: "Ατύχημα με το Δίσκο",
    role: "Σερβιτόρος",
    story_text: "Σκοντάφτεις πάνω σε μια ξαπλώστρα στην πισίνα και ο δίσκος με τις 4 μπίρες προσγειώνεται πάνω στην πανάκριβη τσάντα μιας VIP πελάτισσας.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Ζητώ χίλια συγγνώμη, παίρνω την τσάντα και τρέχω να την καθαρίσω στο στεγνό καθάρισμα.", stress_change: 30, reputation_change: 10, cash_change: -15 },
      { id: 2, text: "Ρίχνω το φταίξιμο στον πελάτη που άφησε την ξαπλώστρα στη μέση του διαδρόμου.", stress_change: 25, reputation_change: -20, cash_change: 0 },
      { id: 3, text: "Προσφέρω δωρεάν μπουκάλι σαμπάνιας για να ξεχαστεί το συμβάν.", stress_change: 15, reputation_change: 15, cash_change: -40 }
    ]
  },
  {
    scene_title: "Το Πιστόλι του Πελάτη",
    role: "Σερβιτόρος",
    story_text: "Ένα τραπέζι έφαγε κανονικά και έφυγε κρυφά («πιστόλι») εκμεταλλευόμενο το ότι έτρεχες να πάρεις άλλη παραγγελία. Ο λογαριασμός είναι 80€.",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Το αναφέρω στη διοίκηση και δέχομαι να αφαιρεθεί το ποσό από τον μισθό μου.", stress_change: 20, reputation_change: 10, cash_change: -40 },
      { id: 2, text: "Τρέχω στο parking να τους προλάβω πριν μπουν στο αυτοκίνητο.", stress_change: 35, reputation_change: 5, cash_change: 0 },
      { id: 3, text: "Χρεώνω τα πιάτα τους κρυφά στο δωμάτιο ενός άλλου VIP που δεν ελέγχει ποτέ.", stress_change: 25, reputation_change: -25, cash_change: 40 }
    ]
  }
];
