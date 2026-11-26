/**
 * भोजपुरी (Bhojpuri — Bihar) — the invitation in the family's own language.
 *
 * Written as Bhojpuri is actually spoken in the Bhojpur region, not Hindi with a
 * word swapped: "नेवता" for an invitation, "मया" for love, "हमनी" for we, "खातिर"
 * for for, "बाट जोहत बानी" for we are waiting. Warm and respectful, the way an
 * invitation is read aloud in a Bihari home - no slang, nothing that would need
 * explaining to a grandparent. The couple's names stay in Latin script
 * ({couple}), and only translated keys appear: anything missing falls back to English.
 */
export const bho = {
  meta: { code: 'bho', label: 'भोजपुरी', native: 'भोजपुरी' },

  wedding: {
    label: 'बियाह के नेवता',

    copy: {
      families: 'अपना परिवार के संगे',
      invite: 'आपके अपना बियाह के उत्सव में सादर नेवता देलन जा',
    },

    celebration: {
      label: 'मया के उत्सव',
      titleTop: 'दू आत्मा के',
      titleLead: 'पबित्तर',
      titleAccent: 'मिलन',
      message:
        'अपना परिवार के आशीर्वाद से, हमनी आपके एह सुन्दर सुरुआत आ दू आत्मा के मिलन के उत्सव में सादर नेवता देलन जा।',
    },

    celebrations: {
      label: 'उत्सव सभ',
      title: 'खुशी के संगे',
      intro: 'ऊ रसम सभ जे हमनी के परिवार के जोड़ेलीं — हर एक के अपन रंग आ अपन बनाव।',
      events: [
        {
          label: 'घाम आ आशीर्वाद',
          name: 'हल्दी',
          description: 'घाम, आशीर्वाद, हँसी आ हल्दी के परंपरा के उत्सव।',
        },
        {
          label: 'मेहंदी आ परंपरा',
          name: 'मेहंदी',
          description: 'मेहंदी, परंपरा, परिवार आ खुशी के सुन्दर उत्सव।',
        },
        {
          label: 'पबित्तर मिलन',
          name: 'बियाह संस्कार',
          description: '{couple} के पबित्तर मिलन — आशीर्वाद, परिवार आ मया से घेरल।',
        },
      ],
    },

    timeline: {
      eyebrow: 'बियाह के सफर',
      title: 'उत्सव के दिन',
      intro: 'हर मिलन, हर रसम, हर पल — एक साथे रहे के उत्सव।',
    },

    rsvp: {
      eyebrow: 'आपके आवल ही हमर उपहार बा',
      titleLead: 'हमनी चाहल जा',
      titleAccent: 'आप हमनी साथे रहीं',
      intro:
        'आपके आवे से हमर उत्सव आउरो खास हो जाई। कृपया बताईं कि आप हमनी साथे रहबें कि ना।',

      accept: {
        label: 'खुशी-खुशी हाँ',
        note: 'हमनी जश्न में रहब',
        confirm: 'हमरा बड़ा खुशी बा कि आप हमनी साथे रहबें।',
      },

      decline: {
        label: 'दुःख संगे ना आ पाइब',
        note: 'हम ना आ पाइब, बाकिर दिल से साथे बानी',
        message: 'बतावे खातिर धन्यवाद। आपके बिना कमी लागी, आ हमनी आपके याद करब।',
      },

      submitNote:
        'आपके जवाब सीधे हमरा तक पहुँचेला आ खाली हमरा बियाह खातिर रखल जाला। ईमेल देवल बराबरी के बा — पुष्टि चाहीं त लिखीं।',

      received: {
        sent: 'आपके जवाब पहुँच गइल! पुष्टि के ईमेल आपके इनबॉक्स में भेजल गइल बा। ❤️',
        failed:
          'आपके जवाब पहुँच गइल! अभी पुष्टि के ईमेल ना भेजल जा सकल, बाकिर आपके जवाब हमरा मिल गइल बा। ❤️',
        skipped: 'आपके जवाब हमरा मिल गइल बा। हमनी उत्सव में आपके आवे के बाट जोहत बानी! ❤️',
        declined: 'आपके जवाब हमरा मिल गइल। धन्यवाद।',
      },

      errorNote: 'आपके जवाब भेजे में कुछ अड़चन आइल। कृपया फेरु कोशिश कीं।',
    },

    closing: {
      eyebrow: 'मया आ आशीर्वाद के साथे',
      titleLead: 'हमनी बड़े बेसबरी से',
      titleAccentLead: 'बाट जोहत बानी',
      titleAccent: 'आपके साथे',
      message:
        'जेह दिन हमरा दिल आ परिवार एक होई, ओह दिन तक मया, खुशी आ आशीर्वाद हमनी सभके घेरल रहखे।',
      signoff: 'हमेशा मया के साथे।',
    },

    guests: {
      eyebrow: 'मया के उत्सव',
      titleLead: 'हमर',
      titleAccent: 'प्यारा मेहमान',
      intro: 'हमरा खुशी के हिस्सा बनले खातिर धन्यवाद',
      loading: 'आशीर्वाद जुटत बा…',
      empty: 'हमर उत्सव अपन पहिला आशीर्वाद के बाट जोहत बा।',
      error: 'अभी मेहमान के लिस्ट तक ना पहुँच पाइल।',
      retry: 'फेरु कोशिश कीं',
      showAll: 'सब {count} मेहमान देखीं',
      showLess: 'कम मेहमान देखीं',
      signoff: 'मया के साथे,',
      announceOne: 'एक मेहमान हाँ कहलक।',
      announceSuffix: 'मेहमान हाँ कहलन।',
    },
  },

  gallery: {
    label: 'साथे रहे के कला',
    titleLead: 'यादें',
    titleAccentLead: 'जे बनलीं',
    titleAccent: 'अमर',
    intro: 'हर नजर, हर मुस्कान, हर छोट-सा पल हमेशा खातिर संजोए जोग याद बन जाला।',
    images: [
      { alt: 'नमूना चित्र: पारंपरिक भारतीय कपड़ा में जोड़ी' },
      { alt: 'नमूना चित्र: पारंपरिक कपड़ा में भारतीय दुलहिन' },
      { alt: 'नमूना चित्र: भारतीय बियाह के समारोह के पल' },
      { alt: 'नमूना चित्र: बियाह में मेहंदी लागल हाथ' },
    ],
  },

  ui: {
    intro: {
      label: 'बियाह के नेवता',
      taglineLead: 'मया के',
      taglineAccent: 'उत्सव',
      supporting: 'हर सुन्दर सुरुआत खातिर एगो सुन्दर नेवता।',
      open: 'नेवता खोलीं',
    },

    hero: {
      and: 'आ',
    },

    details: {
      day: 'दिन',
      hour: 'समय',
      place: 'जगह',
      location: 'इलाका',
      address: 'पता',
    },

    music: {
      launch: 'बियाह के संगीत',
      launchIdle: 'बियाह के संगीत चलाईं',
      seek: 'गीत में आगे-पीछे जाईं',
      previous: 'पहिलका गीत',
      next: 'अगिला गीत',
      play: 'संगीत चलाईं',
      pause: 'संगीत रोकीं',
      failed: 'ई गीत लोड ना हो पाइल।',
      tracks: { song1: 'गीत 1', song2: 'गीत 2' },
    },

    autoScroll: {
      playing: 'आपन-आप चलत बा',
      resuming: 'फेरु शुरू',
      paused: 'रुकल बा',
      finished: 'सफर पूरा',
      pauseAction: 'आपन-आप स्क्रॉल रोकीं',
      resumeAction: 'आपन-आप स्क्रॉल फेरु चालू करीं',
      stopAction: 'एह बेरा खातिर आपन-आप स्क्रॉल बंद करीं',
    },

    switcher: {
      label: 'भाषा',
      choose: 'नेवता के भाषा चुनीं',
    },

    rsvpForm: {
      legend: 'आपके जवाब के बिवरण',
      help: 'क्या आप हमनी साथे रहबें?',
      optional: 'बराबरी के',
      name: 'आपके नाम',
      namePlaceholder: 'जे नाम से हमनी आपके बोलाईं',
      nameRequired: 'कृपया अपन नाम लिखीं, ताकि हमरा पता चल जाव कि जवाब केकर बा।',
      guests: 'आपके साथे आवे वाला मेहमान',
      email: 'ईमेल पता',
      emailPlaceholder: 'जहाँ हमनी पुष्टि भेज सकीं, जदि आप चाहीं',
      emailInvalid: 'ई पता कुछ ठीक ना लागत।',
      emailHint: 'एके खाली छोड़ दीं, तबो आपके जवाब पूरा बा।',
      note: 'जोड़ी खातिर एगो बात',
      notePlaceholder: 'कोनो शुभकामना, आशीर्वाद भा याद साझा करीं',
      declineNotePlaceholder: 'कोनो शुभकामना भा आशीर्वाद लिखीं',
      submit: 'हमर जवाब भेजीं',
      submitting: 'आपके जवाब भेजल जा रहल बा',
    },

    rsvpSection: {
      thanks: 'धन्यवाद, {name}।',
      dearGuest: 'प्यारा मेहमान',
      partyOf: 'हमनी {count} लोग के जत्था दर्ज कइनी।',
      change: 'अपन जवाब बदलीं',
    },

    api: {
      timeout: 'आपके जवाब पहुँचे में बड़ा देर लागल। कृपया कनेक्शन जाँच के फेरु कोशिश कीं।',
      rateLimited:
        'एह डिवाइस से हमरा कई गो जवाब मिल चुकल बा। कृपया थोड़ी देर बाद कोशिश कीं।',
      invalid: 'कुछ बिवरण फेरु से देखे के जरूरत बा। कृपया जाँच के फेरु भेजीं।',
      fallback: 'अभी आपके जवाब ना भेज पाइनी। कृपया थोड़ी देर बाद कोशिश कीं।',
    },
  },
};

export default bho;
