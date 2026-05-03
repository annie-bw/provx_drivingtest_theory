import type { Question, UserProfile } from "../types";

export const questionBanks = [
  "Ibyapa byo kuburira",
  "Amategeko y’umuhanda",
  "Umwuka n’umuvuduko",
];

export const questions: Question[] = [
  {
    id: "q-1",
    bank: "Ibyapa byo kuburira",
    text: {
      en: "What does this sign indicate?",
      rw: "Iki cyapa cyerekana iki?",
    },
    image: "/src/assets/sign-warning.svg",
    options: [
      {
        id: "a",
        text: { en: "Stop before the road", rw: "Hagarara mbere y’umuhanda" },
      },
      {
        id: "b",
        text: {
          en: "There are roads with stones",
          rw: "Hari imihanda irimo amabuye",
        },
      },
      {
        id: "c",
        text: {
          en: "There is an emergency sign",
          rw: "Hari akamenyetso k’ubutabazi",
        },
      },
      {
        id: "d",
        text: {
          en: "Airport area",
          rw: "Agace k’umuhanda kagaragaramo indege",
        },
      },
    ],
    correctId: "d",
    note: {
      en: "This is a symptom of a sign warning about nearby aircraft.",
      rw: "Iyi ni symptome y’icyapa kiburira indege iri hafi.",
    },
  },
  {
    id: "q-2",
    bank: "Amategeko y’umuhanda",
    text: {
      en: "You have a single road in front of you, you are standing in a line. You can start crossing when...",
      rw: "Ufite umuhanda umwe imbere yawe, urimo guhagarara mu murongo. Urashobora gutangira kuzarenga igihe...",
    },
    options: [
      {
        id: "a",
        text: {
          en: "You first check the direction of the road",
          rw: "Urebye icyerekezo cy’inzira ubanza",
        },
      },
      {
        id: "b",
        text: {
          en: "When the road you are on has low speed",
          rw: "Iyo umuyoboro urimo urimo umuvuduko muke",
        },
      },
      {
        id: "c",
        text: {
          en: "Where the road takes an emergency sign",
          rw: "Aho umuyoboro ufashe ikimenyetso cy’emergency",
        },
      },
      {
        id: "d",
        text: {
          en: "When you do not show the desire to cross",
          rw: "Iyo utagaragaje icyifuzo cyo kurenga",
        },
      },
    ],
    correctId: "a",
    note: {
      en: "When you are at the front of the line, you must first look carefully.",
      rw: "Igihe uri mu murongo w’imbere ugomba kubanza kureba neza.",
    },
  },
  {
    id: "q-3",
    bank: "Umwuka n’umuvuduko",
    text: {
      en: "Can you drive a car at 50 km/h on a road near a school?",
      rw: "Urashobora gutwara imodoka ku muvuduko wa km/h 50 mu muhanda uri hafi y’ishuri?",
    },
    options: [
      {
        id: "a",
        text: {
          en: "Yes, if there is no prohibiting sign",
          rw: "Yego, igihe nta cyapa kibangamiye",
        },
      },
      {
        id: "b",
        text: {
          en: "No, because you must slow down everywhere near the school",
          rw: "Oya, kuko ahantu hose hafi y’ishuri ugomba kugabanya",
        },
      },
      {
        id: "c",
        text: {
          en: "Yes, if there is a special road",
          rw: "Yego, niba hari umuhanda wihariye",
        },
      },
      {
        id: "d",
        text: {
          en: "No, you must stop completely",
          rw: "Oya, ni uguhagarara burundu",
        },
      },
    ],
    correctId: "b",
  },
  {
    id: "q-4",
    bank: "Ibyapa byo kuburira",
    text: {
      en: "What does this sign mean on the road?",
      rw: "Iki cyapa kigaragaza iki mu muhanda?",
    },
    image: "/src/assets/sign-speed.svg",
    options: [
      { id: "a", text: { en: "Maximum speed", rw: "Umuvuduko ntarengwa" } },
      {
        id: "b",
        text: {
          en: "Road allows slow driving",
          rw: "Inzira yemerera kugenda buhoro",
        },
      },
      {
        id: "c",
        text: {
          en: "Do not exceed 50 km/h",
          rw: "Ntukarenze umuvuduko w’ibiro 50",
        },
      },
      {
        id: "d",
        text: { en: "School zone speed", rw: "Umuvuduko w’inzu y’ishuri" },
      },
    ],
    correctId: "a",
    note: {
      en: "This sign indicates the maximum permitted speed on that section of road.",
      rw: "Ibi ni ibimenyetso by’umuvuduko ntarengwa mu muhanda hose.",
    },
  },
  {
    id: "q-5",
    bank: "Amategeko y’umuhanda",
    text: {
      en: "When should you overtake another vehicle on a dedicated lane?",
      rw: "Iyo uri mu muhanda wihariye, ni ryari wasimbura abandi?",
    },
    options: [
      {
        id: "a",
        text: {
          en: "Whenever you want and it is not required",
          rw: "Iyo iyo watuye ahandi ka bitagombwa",
        },
      },
      {
        id: "b",
        text: {
          en: "When the lane boundary allows it",
          rw: "Iyo umupaka w’inzira utuma ubikora",
        },
      },
      {
        id: "c",
        text: {
          en: "When you think they are going too slowly",
          rw: "Iyo ukeka ko bazaguhenda",
        },
      },
      {
        id: "d",
        text: {
          en: "When the vehicle ahead starts to rest",
          rw: "Iyo umuntu uri imbere atangiye kuruhuka",
        },
      },
    ],
    correctId: "b",
    note: {
      en: "Overtake on a dedicated lane only when road markings or signs permit it.",
      rw: "Simbukira mu nzira yihariye gusa iyo hari ikimenyetso cyangwa umupaka ubiyemerera.",
    },
  },
];

export const mockUsers: UserProfile[] = [
  {
    id: 1,
    name: "Jean Baptiste",
    email: "jean@example.com",
    role: "student",
    practiceCompleted: 25,
    examHistory: [
      {
        id: "e-1",
        date: "2024-04-25",
        score: 18,
        total: 20,
        passed: true,
        correctIds: ["q-1", "q-2", "q-3", "q-4", "q-5"],
        selectedAnswers: {},
      },
    ],
  },
  {
    id: 2,
    name: "Marie Claire",
    email: "marie@example.com",
    role: "student",
    practiceCompleted: 15,
    examHistory: [
      {
        id: "e-2",
        date: "2024-04-24",
        score: 12,
        total: 20,
        passed: false,
        correctIds: ["q-1", "q-3"],
        selectedAnswers: {},
      },
    ],
  },
  {
    id: 3,
    name: "Pierre Paul",
    email: "pierre@example.com",
    role: "student",
    practiceCompleted: 30,
    examHistory: [
      {
        id: "e-3",
        date: "2024-04-23",
        score: 19,
        total: 20,
        passed: true,
        correctIds: ["q-1", "q-2", "q-3", "q-4"],
        selectedAnswers: {},
      },
    ],
  },
];
