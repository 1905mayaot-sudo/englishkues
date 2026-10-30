/*
  12 времён английского языка.
  Поля:
    id, group (Past/Present/Future), aspect (Simple/Continuous/Perfect/Perfect Continuous),
    name, ru, formula, negative, question, markers[], use[], example, translation, mistake
*/
const TENSES = [
  {
    id: "present-simple", group: "Present", aspect: "Simple",
    name: "Present Simple", ru: "Настоящее простое",
    formula: "V1 / V1 + -s",
    negative: "do/does not + V1",
    question: "Do/Does + subject + V1?",
    markers: ["always", "usually", "often", "sometimes", "every day", "on Mondays"],
    use: ["факты и истины", "привычки", "расписание", "инструкции"],
    example: "She works at a bank.",
    translation: "Она работает в банке.",
    mistake: "Не добавляй -s в вопросах и отрицаниях: Does she work? / She doesn't work."
  },
  {
    id: "present-continuous", group: "Present", aspect: "Continuous",
    name: "Present Continuous", ru: "Настоящее длительное",
    formula: "am/is/are + V-ing",
    negative: "am/is/are not + V-ing",
    question: "Am/Is/Are + subject + V-ing?",
    markers: ["now", "at the moment", "today", "these days", "look!"],
    use: ["действие прямо сейчас", "временная ситуация", "запланированное будущее", "раздражающая привычка с always"],
    example: "I'm revising for my exam right now.",
    translation: "Я сейчас готовлюсь к экзамену.",
    mistake: "Не используй Continuous с state verbs (know, love, want), если речь о состоянии."
  },
  {
    id: "present-perfect", group: "Present", aspect: "Perfect",
    name: "Present Perfect", ru: "Настоящее совершённое",
    formula: "have/has + V3",
    negative: "have/has not + V3",
    question: "Have/Has + subject + V3?",
    markers: ["just", "already", "yet", "ever", "never", "since", "for"],
    use: ["результат к настоящему", "опыт", "незаконченный период", "действие с since/for"],
    example: "I have just finished my homework.",
    translation: "Я только что закончил домашнюю работу.",
    mistake: "Не используй Present Perfect с точным прошедшим временем: yesterday, last week, in 2010."
  },
  {
    id: "present-perfect-continuous", group: "Present", aspect: "Perfect Continuous",
    name: "Present Perfect Continuous", ru: "Настоящее совершенно-длительное",
    formula: "have/has been + V-ing",
    negative: "have/has not been + V-ing",
    question: "Have/Has + subject + been + V-ing?",
    markers: ["for", "since", "lately", "recently", "all day"],
    use: ["длительность до настоящего", "процесс с результатом", "объяснение видимого результата"],
    example: "She has been learning English for five years.",
    translation: "Она учит английский уже пять лет.",
    mistake: "Не путай с Present Perfect: здесь важен процесс и длительность, а не результат."
  },
  {
    id: "past-simple", group: "Past", aspect: "Simple",
    name: "Past Simple", ru: "Прошедшее простое",
    formula: "V2",
    negative: "did not + V1",
    question: "Did + subject + V1?",
    markers: ["yesterday", "ago", "last week", "in 2010", "when"],
    use: ["завершённое действие", "последовательность событий", "прошлая привычка", "история"],
    example: "We visited London last summer.",
    translation: "Прошлым летом мы посетили Лондон.",
    mistake: "После did глагол возвращается в V1: Did you go? (не went)."
  },
  {
    id: "past-continuous", group: "Past", aspect: "Continuous",
    name: "Past Continuous", ru: "Прошедшее длительное",
    formula: "was/were + V-ing",
    negative: "was/were not + V-ing",
    question: "Was/Were + subject + V-ing?",
    markers: ["at 5 pm yesterday", "while", "when", "all evening"],
    use: ["процесс в прошлом", "фон для события", "прерванное действие", "параллельные действия"],
    example: "I was cooking when she called.",
    translation: "Я готовил, когда она позвонила.",
    mistake: "Для завершённого действия используй Past Simple, а не Continuous."
  },
  {
    id: "past-perfect", group: "Past", aspect: "Perfect",
    name: "Past Perfect", ru: "Прошедшее совершённое",
    formula: "had + V3",
    negative: "had not + V3",
    question: "Had + subject + V3?",
    markers: ["by", "before", "after", "when", "already"],
    use: ["действие до другого прошлого", "причина в прошлом", "последовательность с before/after"],
    example: "She had left before I arrived.",
    translation: "Она ушла до того, как я пришёл.",
    mistake: "Past Perfect не заменяет Past Simple; он нужен, только когда важен порядок событий."
  },
  {
    id: "past-perfect-continuous", group: "Past", aspect: "Perfect Continuous",
    name: "Past Perfect Continuous", ru: "Прошедшее совершенно-длительное",
    formula: "had been + V-ing",
    negative: "had not been + V-ing",
    question: "Had + subject + been + V-ing?",
    markers: ["for", "since", "before", "all day"],
    use: ["длительность до прошлого момента", "причина видимого результата в прошлом"],
    example: "He had been working for ten hours before he stopped.",
    translation: "Он работал десять часов, прежде чем остановился.",
    mistake: "Не используй с state verbs; для состояния — Past Perfect."
  },
  {
    id: "future-simple", group: "Future", aspect: "Simple",
    name: "Future Simple", ru: "Будущее простое",
    formula: "will + V1",
    negative: "will not (won't) + V1",
    question: "Will + subject + V1?",
    markers: ["tomorrow", "next week", "in the future", "I think", "probably"],
    use: ["предсказание", "спонтанное решение", "обещание", "предложение"],
    example: "I'll call you tomorrow.",
    translation: "Я позвоню тебе завтра.",
    mistake: "Для заранее запланированного будущего чаще используют be going to или Present Continuous."
  },
  {
    id: "future-continuous", group: "Future", aspect: "Continuous",
    name: "Future Continuous", ru: "Будущее длительное",
    formula: "will be + V-ing",
    negative: "will not be + V-ing",
    question: "Will + subject + be + V-ing?",
    markers: ["at 5 pm tomorrow", "this time next week", "all day tomorrow"],
    use: ["процесс в будущем", "запланированное действие в конкретный момент", "вежливый вопрос о планах"],
    example: "At 8 pm I will be studying.",
    translation: "В восемь вечера я буду заниматься.",
    mistake: "Не путай с Future Simple: Continuous — процесс, а не факт или решение."
  },
  {
    id: "future-perfect", group: "Future", aspect: "Perfect",
    name: "Future Perfect", ru: "Будущее совершённое",
    formula: "will have + V3",
    negative: "will not have + V3",
    question: "Will + subject + have + V3?",
    markers: ["by", "by the time", "before", "by next month"],
    use: ["завершится до будущего момента", "результат к сроку"],
    example: "By Friday I will have finished the course.",
    translation: "К пятнице я закончу курс.",
    mistake: "Не используй Future Perfect для простого будущего факта; нужен дедлайн."
  },
  {
    id: "future-perfect-continuous", group: "Future", aspect: "Perfect Continuous",
    name: "Future Perfect Continuous", ru: "Будущее совершенно-длительное",
    formula: "will have been + V-ing",
    negative: "will not have been + V-ing",
    question: "Will + subject + have been + V-ing?",
    markers: ["for", "by ... for", "by the time"],
    use: ["длительность к будущему моменту", "подчёркивание процесса и результата"],
    example: "By June I will have been learning English for three years.",
    translation: "К июню я буду учить английский уже три года.",
    mistake: "Редкое время; не используй, если нет длительности и будущего дедлайна."
  }
];

const TENSE_QUESTIONS = [
  {
    q: "She ___ to school every day.",
    options: ["Present Simple", "Present Continuous", "Present Perfect", "Past Simple"],
    answer: "Present Simple",
    explain: "Every day — маркер привычки → Present Simple."
  },
  {
    q: "Look! It ___.",
    options: ["Present Continuous", "Present Simple", "Past Continuous", "Future Simple"],
    answer: "Present Continuous",
    explain: "Look! — действие прямо сейчас → Present Continuous."
  },
  {
    q: "I ___ already ___ my homework.",
    options: ["Present Perfect", "Past Simple", "Present Continuous", "Past Perfect"],
    answer: "Present Perfect",
    explain: "Already + результат к настоящему → Present Perfect."
  },
  {
    q: "They ___ for two hours.",
    options: ["Present Perfect Continuous", "Present Perfect", "Past Continuous", "Future Continuous"],
    answer: "Present Perfect Continuous",
    explain: "For two hours + процесс до настоящего → Present Perfect Continuous."
  },
  {
    q: "We ___ London last summer.",
    options: ["Past Simple", "Present Perfect", "Past Continuous", "Past Perfect"],
    answer: "Past Simple",
    explain: "Last summer — завершённое прошлое → Past Simple."
  },
  {
    q: "I ___ when you called.",
    options: ["Past Continuous", "Past Simple", "Past Perfect", "Present Continuous"],
    answer: "Past Continuous",
    explain: "Процесс в прошлом, который прервали → Past Continuous."
  },
  {
    q: "She ___ before I arrived.",
    options: ["Past Perfect", "Past Simple", "Past Continuous", "Present Perfect"],
    answer: "Past Perfect",
    explain: "Действие до другого прошлого → Past Perfect."
  },
  {
    q: "He ___ for ten hours before he stopped.",
    options: ["Past Perfect Continuous", "Past Perfect", "Past Continuous", "Present Perfect Continuous"],
    answer: "Past Perfect Continuous",
    explain: "Длительность до прошлого момента → Past Perfect Continuous."
  },
  {
    q: "I think it ___ tomorrow.",
    options: ["Future Simple", "Future Continuous", "Future Perfect", "Present Continuous"],
    answer: "Future Simple",
    explain: "Предсказание с I think → Future Simple."
  },
  {
    q: "At 8 pm I ___.",
    options: ["Future Continuous", "Future Simple", "Future Perfect", "Present Continuous"],
    answer: "Future Continuous",
    explain: "Процесс в конкретный момент будущего → Future Continuous."
  },
  {
    q: "By Friday I ___ the course.",
    options: ["Future Perfect", "Future Simple", "Future Continuous", "Present Perfect"],
    answer: "Future Perfect",
    explain: "Результат к дедлайну by Friday → Future Perfect."
  },
  {
    q: "By June I ___ English for three years.",
    options: ["Future Perfect Continuous", "Future Simple", "Future Continuous", "Present Perfect Continuous"],
    answer: "Future Perfect Continuous",
    explain: "Длительность к будущему моменту → Future Perfect Continuous."
  }
];

if (typeof window !== "undefined") {
  window.TENSES = TENSES;
  window.TENSE_QUESTIONS = TENSE_QUESTIONS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TENSES, TENSE_QUESTIONS };
}
