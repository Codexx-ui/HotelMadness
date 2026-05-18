export const SPECIFIC_EVENTS = {
  7: [
    {
      scene_title: "Διάδρομος Προσωπικού (Act 7)",
      story_text: "Σε πλησιάζει ο ρεσεψιονίστ γελώντας πονηρά. 'Έμαθες για το νέο παιχνίδι που φτιάξανε για τον Τάρναβα μετά τις τόσες μαλακίες που έχει κάνει;' Σου στέλνει κρυφά το link: https://codexx-ui.github.io/Thesfapa/",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Μπαίνω αμέσως να παίξω και να του σπάσω τα μούτρα!", stress_change: -15, reputation_change: 0, cash_change: 0, staff_relations_change: 15 },
        { id: 2, text: "Αστο καλύτερα, θα μας δουν από τις κάμερες.", stress_change: 5, reputation_change: 0, cash_change: 0, staff_relations_change: -5 },
        { id: 3, text: "Το προωθώ σε όλο το προσωπικό για να γελάσουμε!", stress_change: -5, reputation_change: -5, cash_change: 0, staff_relations_change: 25 }
      ]
    },
    {
      scene_title: "Αποδυτήρια Προσωπικού (Act 7)",
      story_text: "Βρίσκεις ένα χαρτάκι κολλημένο στο ντουλάπι σου. Γράφει: 'Ο Τάρναβας πρέπει να πληρώσει. Έμαθες για το νέο παιχνίδι που φτιάξανε για τον Τάρναβα μετά τις τόσες μαλακίες που έχει κάνει; Μπες εδώ: https://codexx-ui.github.io/Thesfapa/'",
      requires_text_input: null,
      choices: [
        { id: 1, text: "Μπαίνω να παίξω, πρέπει να ξεσκάσω.", stress_change: -10, reputation_change: 0, cash_change: 0, staff_relations_change: 5 },
        { id: 2, text: "Πετάω το χαρτάκι στα σκουπίδια, δεν ασχολούμαι.", stress_change: 5, reputation_change: 5, cash_change: 0, staff_relations_change: -10 },
        { id: 3, text: "Ψάχνω να βρω ποιος το κόλλησε για να τον καρφώσω.", stress_change: 15, reputation_change: 10, cash_change: 0, staff_relations_change: -25 }
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
    role: "Βοηθός Σερβιτόρου",
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
    role: "Βοηθός Σερβιτόρου",
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
    role: "Βοηθός Σερβιτόρου",
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
    role: "Βοηθός Σερβιτόρου",
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
    role: "Βοηθός Σερβιτόρου",
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
    role: "Βοηθός Σερβιτόρου",
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
    role: "Βοηθός Σερβιτόρου",
    story_text: "Είναι ώρα αιχμής στο κεντρικό εστιατόριο. Έχει δημιουργηθεί τεράστια ουρά αναμονής στην είσοδο, οι πελάτες πεινάνε, φωνάζουν και απειλούν με κακά σχόλια επειδή καθυστερούν να καθίσουν!",
    requires_text_input: null,
    choices: [
      { id: 1, text: "Τρέχω να καθαρίσω τραπέζια με ταχύτητα φωτός για να καθίσουν οι επόμενοι.", stress_change: 35, reputation_change: 15, cash_change: 0, staff_relations_change: 10 },
      { id: 2, text: "Πηγαίνω στην ουρά και τους κερνάω prosecco/χυμούς για να ηρεμήσω τα πνεύματα.", stress_change: 15, reputation_change: 20, cash_change: -20, staff_relations_change: 15 },
      { id: 3, text: "Τους λέω ψυχρά ότι αν δεν έχουν κράτηση θα πρέπει να περιμένουν τουλάχιστον μία ώρα.", stress_change: 10, reputation_change: -25, cash_change: 0, staff_relations_change: -10 }
    ]
  }
];
