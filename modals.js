/*
  Модальные глаголы и их заменители.
  Поля:
    id, name, ru, group, functions[], form, past, future, example, translation, trap
*/
const MODALS = [
  {
    id: "can", name: "can", ru: "мочь, уметь", group: "core",
    functions: ["способность", "возможность", "неформальное разрешение", "просьба"],
    form: "can + V1", past: "could", future: "will be able to",
    example: "I can swim, but I can't ski.",
    translation: "Я умею плавать, но не умею кататься на лыжах.",
    trap: "В будущем и перфекте can заменяется на be able to."
  },
  {
    id: "could", name: "could", ru: "мог, мог бы", group: "core",
    functions: ["прошлая способность", "вежливая просьба", "вероятность", "предложение"],
    form: "could + V1", past: "—", future: "—",
    example: "Could you open the window, please?",
    translation: "Не мог бы ты открыть окно, пожалуйста?",
    trap: "Could — не только Past от can; часто это вежливость в настоящем."
  },
  {
    id: "may", name: "may", ru: "можно; возможно", group: "core",
    functions: ["формальное разрешение", "вероятность", "пожелание"],
    form: "may + V1", past: "might (в согласовании)", future: "will be allowed to",
    example: "You may leave after the test.",
    translation: "Вы можете уйти после теста.",
    trap: "May = формальное разрешение; can — более разговорное."
  },
  {
    id: "might", name: "might", ru: "возможно, мог бы", group: "core",
    functions: ["меньшая вероятность", "предположение", "вежливое предложение"],
    form: "might + V1", past: "—", future: "—",
    example: "It might rain later.",
    translation: "Возможно, позже пойдёт дождь.",
    trap: "Might выражает меньшую уверенность, чем may."
  },
  {
    id: "must", name: "must", ru: "должен; обязательно", group: "core",
    functions: ["сильная обязанность", "правило", "уверенность", "запрет (mustn't)"],
    form: "must + V1", past: "had to", future: "will have to",
    example: "You must wear a seatbelt.",
    translation: "Ты должен пристёгиваться.",
    trap: "mustn't = нельзя; don't have to = не обязательно. Это разные вещи."
  },
  {
    id: "have-to", name: "have to", ru: "приходится, должен", group: "equivalent",
    functions: ["обязанность извне", "вынужденность"],
    form: "have/has to + V1", past: "had to", future: "will have to",
    example: "I have to work on Saturday.",
    translation: "Мне приходится работать в субботу.",
    trap: "Have to — не модальный, а заменитель must; меняется по лицам и временам."
  },
  {
    id: "should", name: "should", ru: "следует, стоит", group: "core",
    functions: ["совет", "рекомендация", "ожидание"],
    form: "should + V1", past: "should have + V3 (сожаление)", future: "—",
    example: "You should revise the irregular verbs.",
    translation: "Тебе стоит повторить неправильные глаголы.",
    trap: "Should have + V3 = следовало бы (но не сделал)."
  },
  {
    id: "ought-to", name: "ought to", ru: "следует (формально)", group: "core",
    functions: ["моральный долг", "совет", "ожидание"],
    form: "ought to + V1", past: "ought to have + V3", future: "—",
    example: "You ought to apologise.",
    translation: "Тебе следует извиниться.",
    trap: "После ought всегда to; в вопросах и отрицаниях to сохраняется."
  },
  {
    id: "will", name: "will", ru: "будет; готов", group: "core",
    functions: ["будущее", "обещание", "спонтанное решение", "просьба"],
    form: "will + V1", past: "would", future: "—",
    example: "I'll help you with the bags.",
    translation: "Я помогу тебе с сумками.",
    trap: "Will — не только будущее: это ещё обещания и решения в момент речи."
  },
  {
    id: "would", name: "would", ru: "бы; готов", group: "core",
    functions: ["вежливая просьба", "воображаемая ситуация", "прошлая привычка", "предложение"],
    form: "would + V1", past: "—", future: "—",
    example: "Would you like some tea?",
    translation: "Хочешь чаю?",
    trap: "Would rather = предпочёл бы; would like = хотел бы."
  },
  {
    id: "shall", name: "shall", ru: "следует; буду (формально)", group: "core",
    functions: ["предложение", "совет", "формальное будущее"],
    form: "shall + V1", past: "should", future: "—",
    example: "Shall I open the window?",
    translation: "Мне открыть окно?",
    trap: "В современном английском shall редок; в основном I/we в вопросах."
  },
  {
    id: "need", name: "need", ru: "нужно", group: "semi",
    functions: ["необходимость", "отсутствие необходимости (needn't)"],
    form: "need + V1 / need to + V1", past: "needn't have + V3", future: "will need to",
    example: "You needn't worry.",
    translation: "Тебе не нужно волноваться.",
    trap: "Needn't = нет необходимости; mustn't = нельзя."
  },
  {
    id: "dare", name: "dare", ru: "сметь", group: "semi",
    functions: ["смелость", "возмущение"],
    form: "dare + V1 / dare to + V1", past: "dared", future: "—",
    example: "He daren't tell the truth.",
    translation: "Он не смеет сказать правду.",
    trap: "Dare как модальный — в отрицаниях и вопросах; иначе dare to."
  },
  {
    id: "be-able-to", name: "be able to", ru: "быть в состоянии, мочь", group: "equivalent",
    functions: ["способность", "замена can в будущем и перфекте"],
    form: "am/is/are able to + V1", past: "was/were able to", future: "will be able to",
    example: "She will be able to join us tomorrow.",
    translation: "Она сможет присоединиться к нам завтра.",
    trap: "Was able to = смог (успешно); could = мог вообще."
  },
  {
    id: "be-allowed-to", name: "be allowed to", ru: "иметь разрешение", group: "equivalent",
    functions: ["разрешение", "замена may/can"],
    form: "am/is/are allowed to + V1", past: "was/were allowed to", future: "will be allowed to",
    example: "We aren't allowed to use phones in class.",
    translation: "Нам не разрешают пользоваться телефонами на уроке.",
    trap: "Be allowed to — про разрешение; be able to — про способность."
  },
  {
    id: "be-supposed-to", name: "be supposed to", ru: "предполагается, должен по правилам", group: "equivalent",
    functions: ["ожидание", "правило", "договорённость"],
    form: "am/is/are supposed to + V1", past: "was/were supposed to", future: "will be supposed to",
    example: "You're supposed to be at school by 8.",
    translation: "Ты должен быть в школе к восьми.",
    trap: "Be supposed to = ожидается по правилам/договорённости, не личная обязанность."
  },
  {
    id: "used-to", name: "used to", ru: "раньше делал (привычка)", group: "semi",
    functions: ["прошлая привычка", "прошлое состояние"],
    form: "used to + V1", past: "—", future: "—",
    example: "I used to play chess every day.",
    translation: "Раньше я каждый день играл в шахматы.",
    trap: "Used to + V1 — привычка; be used to + V-ing — быть привычным к."
  },
  {
    id: "had-better", name: "had better", ru: "лучше бы", group: "semi",
    functions: ["сильный совет", "предупреждение"],
    form: "had better + V1", past: "—", future: "—",
    example: "You'd better take an umbrella.",
    translation: "Тебе лучше взять зонт.",
    trap: "Had better = совет с оттенком предупреждения; после него V1 без to."
  }
];

const MODAL_QUESTIONS = [
  {
    q: "She ___ swim when she was five.",
    options: ["can", "could", "must", "should"],
    answer: "could",
    explain: "Прошлая способность → could."
  },
  {
    q: "You ___ smoke here. It's forbidden.",
    options: ["mustn't", "don't have to", "needn't", "might"],
    answer: "mustn't",
    explain: "Запрет → mustn't. Don't have to = не обязательно."
  },
  {
    q: "It's late. You ___ go home.",
    options: ["should", "can", "mustn't", "might"],
    answer: "should",
    explain: "Совет → should."
  },
  {
    q: "___ you open the window, please?",
    options: ["Could", "Must", "Should", "May"],
    answer: "Could",
    explain: "Вежливая просьба → Could you...?"
  },
  {
    q: "I ___ wear a uniform at work. It's the rule.",
    options: ["must", "might", "could", "needn't"],
    answer: "must",
    explain: "Правило и сильная обязанность → must."
  },
  {
    q: "You ___ worry — everything is fine.",
    options: ["needn't", "mustn't", "can't", "shouldn't"],
    answer: "needn't",
    explain: "Нет необходимости → needn't."
  },
  {
    q: "It ___ rain later, but I'm not sure.",
    options: ["might", "must", "should", "can"],
    answer: "might",
    explain: "Неуверенное предположение → might."
  },
  {
    q: "We ___ use phones in class. It's not allowed.",
    options: ["aren't allowed to", "aren't able to", "don't have to", "needn't"],
    answer: "aren't allowed to",
    explain: "Разрешение/запрет → be allowed to."
  },
  {
    q: "She ___ speak three languages.",
    options: ["can", "must", "should", "might"],
    answer: "can",
    explain: "Способность → can."
  },
  {
    q: "You ___ have told me — I could have helped.",
    options: ["should", "must", "could", "need"],
    answer: "should",
    explain: "Should have + V3 = следовало бы (но не сделал)."
  },
  {
    q: "I ___ rather stay at home tonight.",
    options: ["would", "will", "should", "must"],
    answer: "would",
    explain: "Would rather = предпочёл бы."
  },
  {
    q: "You ___ better see a doctor.",
    options: ["had", "would", "should", "must"],
    answer: "had",
    explain: "Had better + V1 = сильный совет."
  },
  {
    q: "He ___ be at home — the lights are on.",
    options: ["must", "can", "should", "might"],
    answer: "must",
    explain: "Уверенность на основе факта → must."
  },
  {
    q: "___ I leave early today?",
    options: ["May", "Must", "Should", "Would"],
    answer: "May",
    explain: "Формальное разрешение → May I...?"
  },
  {
    q: "I ___ study harder next term.",
    options: ["will have to", "must", "can", "should"],
    answer: "will have to",
    explain: "Будущая обязанность → will have to."
  }
];

if (typeof window !== "undefined") {
  window.MODALS = MODALS;
  window.MODAL_QUESTIONS = MODAL_QUESTIONS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { MODALS, MODAL_QUESTIONS };
}
