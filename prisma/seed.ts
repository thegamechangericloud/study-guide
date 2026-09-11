/**
 * Demo/reference data for local development and review.
 *
 * Seeds: the MINERD-aligned level/cycle/grade structure, the subject
 * catalog, one demo school with a user for every role, a classroom with
 * enrolled students, and one fully authored, PUBLISHED demonstration
 * lesson for each of the five age-interface groups (spec section 2 and
 * Phase 1 acceptance criteria, section 13).
 *
 * This is illustrative content for the prototype, not reviewed MINERD
 * curriculum — see docs/09-content-production-plan.md for how real
 * curriculum content is authored, reviewed, and published.
 */
import { PrismaClient, EducationLevel, AgeInterfaceGroup } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(plain: string) {
  return bcrypt.hash(plain, 10);
}

async function main() {
  console.log("Seeding curriculum structure…");

  // ---------------------------------------------------------------------
  // Cycles & grades
  // ---------------------------------------------------------------------
  const initialCycle = await prisma.cycle.create({
    data: { level: EducationLevel.INITIAL, name: "Ciclo Único", order: 1 },
  });
  const primaryCycle1 = await prisma.cycle.create({
    data: { level: EducationLevel.PRIMARY, name: "Primer Ciclo", order: 1 },
  });
  const primaryCycle2 = await prisma.cycle.create({
    data: { level: EducationLevel.PRIMARY, name: "Segundo Ciclo", order: 2 },
  });
  const secondaryCycle1 = await prisma.cycle.create({
    data: { level: EducationLevel.SECONDARY, name: "Primer Ciclo", order: 1 },
  });
  const secondaryCycle2 = await prisma.cycle.create({
    data: { level: EducationLevel.SECONDARY, name: "Segundo Ciclo", order: 2 },
  });

  type GradeSeed = {
    key: string;
    level: EducationLevel;
    cycleId: string | null;
    name: string;
    order: number;
    minAge: number;
    maxAge: number;
    ageGroup: AgeInterfaceGroup;
  };

  const gradeSeeds: GradeSeed[] = [
    { key: "PREKINDER", level: "INITIAL", cycleId: initialCycle.id, name: "Pre-Kínder", order: 1, minAge: 3, maxAge: 4, ageGroup: "EARLY_EXPLORERS" },
    { key: "KINDER", level: "INITIAL", cycleId: initialCycle.id, name: "Kínder", order: 2, minAge: 4, maxAge: 5, ageGroup: "EARLY_EXPLORERS" },
    { key: "PREPRIMARIO", level: "INITIAL", cycleId: initialCycle.id, name: "Preprimario", order: 3, minAge: 5, maxAge: 6, ageGroup: "BEGINNING_READERS" },

    { key: "P1", level: "PRIMARY", cycleId: primaryCycle1.id, name: "1er Grado", order: 1, minAge: 6, maxAge: 7, ageGroup: "BEGINNING_READERS" },
    { key: "P2", level: "PRIMARY", cycleId: primaryCycle1.id, name: "2do Grado", order: 2, minAge: 7, maxAge: 8, ageGroup: "BEGINNING_READERS" },
    { key: "P3", level: "PRIMARY", cycleId: primaryCycle1.id, name: "3er Grado", order: 3, minAge: 8, maxAge: 9, ageGroup: "DEVELOPING_LEARNERS" },
    { key: "P4", level: "PRIMARY", cycleId: primaryCycle2.id, name: "4to Grado", order: 4, minAge: 9, maxAge: 10, ageGroup: "DEVELOPING_LEARNERS" },
    { key: "P5", level: "PRIMARY", cycleId: primaryCycle2.id, name: "5to Grado", order: 5, minAge: 10, maxAge: 11, ageGroup: "DEVELOPING_LEARNERS" },
    { key: "P6", level: "PRIMARY", cycleId: primaryCycle2.id, name: "6to Grado", order: 6, minAge: 11, maxAge: 12, ageGroup: "INDEPENDENT_LEARNERS" },

    { key: "S1", level: "SECONDARY", cycleId: secondaryCycle1.id, name: "1er Año de Secundaria", order: 1, minAge: 12, maxAge: 13, ageGroup: "INDEPENDENT_LEARNERS" },
    { key: "S2", level: "SECONDARY", cycleId: secondaryCycle1.id, name: "2do Año de Secundaria", order: 2, minAge: 13, maxAge: 14, ageGroup: "SECONDARY_LEARNERS" },
    { key: "S3", level: "SECONDARY", cycleId: secondaryCycle1.id, name: "3er Año de Secundaria", order: 3, minAge: 14, maxAge: 15, ageGroup: "SECONDARY_LEARNERS" },
    { key: "S4", level: "SECONDARY", cycleId: secondaryCycle2.id, name: "4to Año de Secundaria", order: 4, minAge: 15, maxAge: 16, ageGroup: "SECONDARY_LEARNERS" },
    { key: "S5", level: "SECONDARY", cycleId: secondaryCycle2.id, name: "5to Año de Secundaria", order: 5, minAge: 16, maxAge: 17, ageGroup: "SECONDARY_LEARNERS" },
    { key: "S6", level: "SECONDARY", cycleId: secondaryCycle2.id, name: "6to Año de Secundaria", order: 6, minAge: 17, maxAge: 18, ageGroup: "SECONDARY_LEARNERS" },
  ];

  const grades: Record<string, { id: string }> = {};
  for (const g of gradeSeeds) {
    grades[g.key] = await prisma.grade.create({
      data: {
        level: g.level,
        cycleId: g.cycleId,
        name: g.name,
        order: g.order,
        minAge: g.minAge,
        maxAge: g.maxAge,
        defaultAgeGroup: g.ageGroup,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Subjects
  // ---------------------------------------------------------------------
  const subjectSeeds = [
    { code: "SPANISH", name: "Lengua Española y Alfabetización" },
    { code: "MATH", name: "Matemática" },
    { code: "SCIENCE", name: "Ciencias Naturales" },
    { code: "SOCIAL", name: "Ciencias Sociales" },
    { code: "ENGLISH", name: "Inglés" },
    { code: "ART", name: "Educación Artística" },
    { code: "PE", name: "Educación Física, Salud y Bienestar" },
    { code: "RELIGIOUS", name: "Formación Humana y Religiosa Integral" },
    { code: "BIBLE", name: "Estudios Bíblicos", isFaithBased: true },
    { code: "DIGITAL", name: "Alfabetización Digital y Tecnología" },
    { code: "CITIZENSHIP", name: "Ciudadanía y Valores Dominicanos" },
    { code: "SEL", name: "Aprendizaje Socioemocional" },
  ];
  const subjects: Record<string, { id: string }> = {};
  for (const s of subjectSeeds) {
    subjects[s.code] = await prisma.subject.create({ data: s });
  }

  // ---------------------------------------------------------------------
  // Demo school & users (one per role)
  // ---------------------------------------------------------------------
  console.log("Seeding demo school and users…");

  const school = await prisma.school.create({
    data: {
      name: "Escuela Demostración Estudia RD",
      brandingColor: "#0f8b8d",
      province: "Distrito Nacional",
      bibleStudiesEnabled: false,
    },
  });

  const demoPassword = await hash("Demo1234!");

  const platformAdmin = await prisma.user.create({
    data: {
      name: "Admin Plataforma",
      email: "platform-admin@estudiard.demo",
      passwordHash: demoPassword,
      role: "PLATFORM_ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  const schoolAdmin = await prisma.user.create({
    data: {
      name: "Directora Carmen Reyes",
      email: "admin@estudiard.demo",
      passwordHash: demoPassword,
      role: "SCHOOL_ADMIN",
      schoolId: school.id,
      emailVerifiedAt: new Date(),
    },
  });

  const teacher = await prisma.user.create({
    data: {
      name: "Maestra Rosa Pérez",
      email: "maestra@estudiard.demo",
      passwordHash: demoPassword,
      role: "TEACHER",
      schoolId: school.id,
      emailVerifiedAt: new Date(),
    },
  });

  const parent = await prisma.user.create({
    data: {
      name: "Ana Martínez",
      email: "familia@estudiard.demo",
      passwordHash: demoPassword,
      role: "PARENT",
      emailVerifiedAt: new Date(),
    },
  });

  // ---------------------------------------------------------------------
  // Classroom & enrollment
  // ---------------------------------------------------------------------
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      label: "2026-2027",
      startsOn: new Date("2026-08-24"),
      endsOn: new Date("2027-06-18"),
    },
  });

  const classroom = await prisma.classroom.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      gradeId: grades.P1.id,
      section: "A",
      classCode: "RD1A-7742",
    },
  });
  await prisma.classroomTeacher.create({
    data: { classroomId: classroom.id, teacherId: teacher.id },
  });

  // ---------------------------------------------------------------------
  // Student profiles
  // ---------------------------------------------------------------------
  console.log("Seeding student profiles…");
  const pin = await hash("1234");

  const camila = await prisma.studentProfile.create({
    data: {
      displayName: "Camila",
      avatarKey: "🦋",
      pinHash: pin,
      ageInterfaceGroup: "EARLY_EXPLORERS",
      currentGradeId: grades.PREKINDER.id,
      schoolId: school.id,
      createdById: parent.id,
    },
  });
  const josue = await prisma.studentProfile.create({
    data: {
      displayName: "Josué",
      avatarKey: "🦜",
      pinHash: pin,
      ageInterfaceGroup: "BEGINNING_READERS",
      currentGradeId: grades.P1.id,
      schoolId: school.id,
      createdById: parent.id,
    },
  });
  const valentina = await prisma.studentProfile.create({
    data: {
      displayName: "Valentina",
      avatarKey: "🌺",
      pinHash: pin,
      ageInterfaceGroup: "DEVELOPING_LEARNERS",
      currentGradeId: grades.P4.id,
      schoolId: school.id,
      createdById: parent.id,
    },
  });
  const miguel = await prisma.studentProfile.create({
    data: {
      displayName: "Miguel",
      avatarKey: "🐢",
      pinHash: pin,
      ageInterfaceGroup: "INDEPENDENT_LEARNERS",
      currentGradeId: grades.S1.id,
      schoolId: school.id,
      createdById: parent.id,
    },
  });
  const sofia = await prisma.studentProfile.create({
    data: {
      displayName: "Sofía",
      avatarKey: "🐬",
      pinHash: pin,
      ageInterfaceGroup: "SECONDARY_LEARNERS",
      currentGradeId: grades.S4.id,
      schoolId: school.id,
      createdById: parent.id,
    },
  });
  const diego = await prisma.studentProfile.create({
    data: {
      displayName: "Diego",
      avatarKey: "🌴",
      pinHash: pin,
      ageInterfaceGroup: "BEGINNING_READERS",
      currentGradeId: grades.P1.id,
      schoolId: school.id,
      createdById: teacher.id, // teacher-created profile, no linked parent account
    },
  });

  for (const child of [camila, josue, valentina, miguel, sofia]) {
    await prisma.guardianship.create({
      data: { userId: parent.id, studentProfileId: child.id, relationship: "MOTHER", isPrimary: true },
    });
    await prisma.consentRecord.create({
      data: {
        guardianId: parent.id,
        studentProfileId: child.id,
        type: "ACCOUNT_CREATION",
        granted: true,
        grantedAt: new Date(),
      },
    });
  }

  await prisma.enrollment.createMany({
    data: [
      { classroomId: classroom.id, studentProfileId: josue.id, gradeId: grades.P1.id },
      { classroomId: classroom.id, studentProfileId: diego.id, gradeId: grades.P1.id },
    ],
  });

  // ---------------------------------------------------------------------
  // Demonstration lessons — one per age-interface group
  // ---------------------------------------------------------------------
  console.log("Seeding demonstration lessons…");

  async function publishedLesson(params: {
    subjectId: string;
    gradeId: string;
    unitTitle: string;
    lessonTitle: string;
    recommendedAge: string;
    objectives: string[];
    vocabulary: string[];
    explanation: string;
    order?: number;
  }) {
    const unit = await prisma.unit.create({
      data: {
        subjectId: params.subjectId,
        gradeId: params.gradeId,
        title: params.unitTitle,
        order: 1,
      },
    });
    const lesson = await prisma.lesson.create({
      data: {
        unitId: unit.id,
        title: params.lessonTitle,
        recommendedAge: params.recommendedAge,
        objectives: params.objectives,
        prerequisites: [],
        vocabulary: params.vocabulary,
        explanation: params.explanation,
        accessibilityNotes:
          "Compatible con lectura de pantalla, alto contraste y narración por voz.",
        teacherNotes: "Lección de demostración revisada para el prototipo Fase 1.",
        parentExtension: "Comenta con tu hijo/a lo que aprendió usando ejemplos de la vida diaria.",
        sourceAttribution: "Estudia RD — contenido de demostración, Fase 1.",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: schoolAdmin.id,
        order: params.order ?? 1,
      },
    });
    // Full approval trail so the workflow is demonstrable end-to-end.
    for (const [from, to] of [
      ["DRAFT", "ACADEMIC_REVIEW"],
      ["ACADEMIC_REVIEW", "SAFETY_REVIEW"],
      ["SAFETY_REVIEW", "APPROVED"],
      ["APPROVED", "PUBLISHED"],
    ] as const) {
      await prisma.contentApproval.create({
        data: { lessonId: lesson.id, fromStatus: from, toStatus: to, reviewerId: schoolAdmin.id },
      });
    }

    const competency = await prisma.competency.create({
      data: {
        subjectId: params.subjectId,
        gradeId: params.gradeId,
        type: "FUNDAMENTAL",
        description: params.objectives[0],
      },
    });
    await prisma.lessonCompetency.create({ data: { lessonId: lesson.id, competencyId: competency.id } });

    return lesson;
  }

  // 1) Early Explorers — Pre-Kínder — Spanish literacy: the letter M
  const lessonM = await publishedLesson({
    subjectId: subjects.SPANISH.id,
    gradeId: grades.PREKINDER.id,
    unitTitle: "El abecedario",
    lessonTitle: "La letra M de mango",
    recommendedAge: "3-4 años",
    objectives: ["Reconocer la letra M y su sonido en palabras familiares"],
    vocabulary: ["mango", "mariposa", "mesa"],
    explanation: "Los niños exploran la letra M a través de un cuento corto, trazo y un juego de emparejar.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonM.id, type: "NARRATED_STORY", title: "Cuento: La letra M", order: 1,
      content: { sentences: [
        "Esta es la letra M.",
        "M de mango, la fruta dulce del patio.",
        "M de mariposa, que vuela de flor en flor.",
        "M de mesa, donde comemos en familia.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonM.id, type: "DRAWING", title: "Traza la letra M", order: 2,
      content: { letter: "M", instructions: "Usa tu dedo o el mouse para trazar la letra M." },
    },
  });
  const matchM = await prisma.activity.create({
    data: {
      lessonId: lessonM.id, type: "MATCHING", title: "Empareja las palabras", order: 3,
      content: { pairs: [
        { left: "mango", right: "🥭" },
        { left: "mariposa", right: "🦋" },
        { left: "mesa", right: "🪑" },
      ] },
    },
  });
  const quizM = await prisma.activity.create({
    data: { lessonId: lessonM.id, type: "QUIZ", title: "¿Qué sabes de la M?", order: 4, content: {} },
  });
  const qM1 = await prisma.question.create({
    data: { activityId: quizM.id, prompt: "¿Cuál palabra empieza con la letra M?", order: 1, explanation: "¡Mango empieza con M!" },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qM1.id, label: "Mango", isCorrect: true, order: 1 },
      { questionId: qM1.id, label: "Sol", isCorrect: false, order: 2 },
      { questionId: qM1.id, label: "Perro", isCorrect: false, order: 3 },
    ],
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonM.id, type: "PRINTABLE_WORKSHEET", title: "Practica en papel: la letra M", order: 5,
      content: {
        instructions: "Imprime esta hoja y practica escribiendo la letra M y las palabras.",
        items: ["M — M — M", "mango", "mariposa", "mesa"],
      },
    },
  });
  void matchM;

  // 2) Beginning Readers — 1er Grado — decodable story with Dominican setting
  const lessonColmado = await publishedLesson({
    subjectId: subjects.SPANISH.id,
    gradeId: grades.P1.id,
    unitTitle: "Lectura guiada",
    lessonTitle: "Ana va al colmado",
    recommendedAge: "6-7 años",
    objectives: ["Leer un texto decodificable corto y responder preguntas de comprensión"],
    vocabulary: ["colmado", "pan", "mandado"],
    explanation: "Un cuento decodificable sobre un mandado al colmado del barrio, con práctica de lectura, vocabulario y escritura.",
    order: 2,
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonColmado.id, type: "READING_PASSAGE", title: "Lee el cuento", order: 1,
      content: {
        passage: "Ana va al colmado. Ana lleva un peso. Ana compra pan. El colmado está cerca de casa.",
        words: ["Ana", "va", "al", "colmado.", "Ana", "lleva", "un", "peso.", "Ana", "compra", "pan.", "El", "colmado", "está", "cerca", "de", "casa."],
      },
    },
  });
  const quizColmado = await prisma.activity.create({
    data: { lessonId: lessonColmado.id, type: "QUIZ", title: "¿Qué recuerdas?", order: 2, content: {} },
  });
  const qC1 = await prisma.question.create({
    data: { activityId: quizColmado.id, prompt: "¿A dónde va Ana?", order: 1, explanation: "Ana va al colmado." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qC1.id, label: "Al colmado", isCorrect: true, order: 1 },
      { questionId: qC1.id, label: "A la escuela", isCorrect: false, order: 2 },
      { questionId: qC1.id, label: "Al parque", isCorrect: false, order: 3 },
    ],
  });
  const qC2 = await prisma.question.create({
    data: { activityId: quizColmado.id, prompt: "¿Qué compra Ana?", order: 2, explanation: "Ana compra pan." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qC2.id, label: "Pan", isCorrect: true, order: 1 },
      { questionId: qC2.id, label: "Leche", isCorrect: false, order: 2 },
      { questionId: qC2.id, label: "Arroz", isCorrect: false, order: 3 },
    ],
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonColmado.id, type: "DRAG_AND_DROP", title: "Ordena la oración", order: 3,
      content: {
        prompt: "Ordena las palabras para formar la oración:",
        wordBank: ["al", "Ana", "va", "colmado."],
        correctOrder: ["Ana", "va", "al", "colmado."],
      },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonColmado.id, type: "MATCHING", title: "Empareja el vocabulario", order: 4,
      content: { pairs: [
        { left: "colmado", right: "🏪" },
        { left: "pan", right: "🍞" },
        { left: "peso", right: "💰" },
      ] },
    },
  });

  // 3) Developing Learners — 4to Grado — Math with Dominican pesos
  const lessonFracciones = await publishedLesson({
    subjectId: subjects.MATH.id,
    gradeId: grades.P4.id,
    unitTitle: "Fracciones",
    lessonTitle: "Fracciones con el peso dominicano",
    recommendedAge: "9-10 años",
    objectives: ["Representar fracciones sencillas usando el peso dominicano (RD$) como contexto"],
    vocabulary: ["fracción", "mitad", "cuarto", "peso"],
    explanation: "Los estudiantes exploran fracciones repartiendo RD$100 entre amigos y relacionándolo con mitades y cuartos.",
    order: 3,
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonFracciones.id, type: "NARRATED_STORY", title: "RD$100 entre amigos", order: 1,
      content: { sentences: [
        "Yesenia tiene RD$100 y quiere compartirlos con un amigo.",
        "Si los divide en 2 partes iguales, cada parte es 1/2, es decir RD$50.",
        "Si los divide en 4 partes iguales, cada parte es 1/4, es decir RD$25.",
        "Entre más partes iguales hagamos, más pequeña es cada fracción.",
      ] },
    },
  });
  const matchFrac = await prisma.activity.create({
    data: {
      lessonId: lessonFracciones.id, type: "MATCHING", title: "Empareja la fracción", order: 2,
      content: { pairs: [
        { left: "1/2 de RD$100", right: "RD$50" },
        { left: "1/4 de RD$100", right: "RD$25" },
        { left: "1/10 de RD$100", right: "RD$10" },
      ] },
    },
  });
  const quizFrac = await prisma.activity.create({
    data: { lessonId: lessonFracciones.id, type: "QUIZ", title: "Practica fracciones", order: 3, content: {} },
  });
  const qF1 = await prisma.question.create({
    data: { activityId: quizFrac.id, prompt: "¿Cuánto es 1/2 de RD$200?", order: 1, explanation: "La mitad de 200 es 100." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qF1.id, label: "RD$100", isCorrect: true, order: 1 },
      { questionId: qF1.id, label: "RD$50", isCorrect: false, order: 2 },
      { questionId: qF1.id, label: "RD$150", isCorrect: false, order: 3 },
    ],
  });
  void matchFrac;

  // 4) Independent Learners — 1er Año Secundaria — geography
  const lessonGeo = await publishedLesson({
    subjectId: subjects.SOCIAL.id,
    gradeId: grades.S1.id,
    unitTitle: "Geografía dominicana",
    lessonTitle: "Las regiones de la República Dominicana",
    recommendedAge: "12-13 años",
    objectives: ["Identificar las principales regiones geográficas de la República Dominicana"],
    vocabulary: ["Cibao", "región Sur", "región Este", "Santo Domingo"],
    explanation: "Un recorrido narrado por las regiones del país: el Cibao, el Sur y el Este, con su capital, Santo Domingo, la primera ciudad de América.",
    order: 4,
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonGeo.id, type: "NARRATED_STORY", title: "Un recorrido por el país", order: 1,
      content: { sentences: [
        "La República Dominicana se organiza en varias regiones geográficas.",
        "El Cibao, en el norte, es conocido por su agricultura y el Valle del Yaque.",
        "La región Sur incluye zonas áridas y la Sierra de Bahoruco.",
        "La región Este es famosa por sus playas, como Bávaro y Punta Cana.",
        "Santo Domingo, la capital, fue la primera ciudad europea permanente de América.",
      ] },
    },
  });
  const matchGeo = await prisma.activity.create({
    data: {
      lessonId: lessonGeo.id, type: "MATCHING", title: "Empareja la región", order: 2,
      content: { pairs: [
        { left: "Cibao", right: "Valle del Yaque" },
        { left: "Región Este", right: "Bávaro y Punta Cana" },
        { left: "Región Sur", right: "Sierra de Bahoruco" },
      ] },
    },
  });
  const quizGeo = await prisma.activity.create({
    data: { lessonId: lessonGeo.id, type: "QUIZ", title: "Comprueba lo aprendido", order: 3, content: {} },
  });
  const qG1 = await prisma.question.create({
    data: { activityId: quizGeo.id, prompt: "¿Cuál fue la primera ciudad europea permanente de América?", order: 1, explanation: "Santo Domingo, fundada en 1496-1498." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qG1.id, label: "Santo Domingo", isCorrect: true, order: 1 },
      { questionId: qG1.id, label: "Santiago", isCorrect: false, order: 2 },
      { questionId: qG1.id, label: "La Habana", isCorrect: false, order: 3 },
    ],
  });
  void matchGeo;

  // 5) Secondary Learners — 4to Año Secundaria — Natural Sciences / ecosystems
  const lessonEco = await publishedLesson({
    subjectId: subjects.SCIENCE.id,
    gradeId: grades.S4.id,
    unitTitle: "Ecosistemas",
    lessonTitle: "Ecosistemas de la República Dominicana",
    recommendedAge: "15-16 años",
    objectives: ["Comparar las características de distintos ecosistemas dominicanos"],
    vocabulary: ["ecosistema", "humedal", "bioma", "endémico"],
    explanation: "Estudio de tres ecosistemas representativos del país: el Lago Enriquillo, la Bahía de las Águilas y la Sierra de Bahoruco.",
    order: 5,
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonEco.id, type: "NARRATED_STORY", title: "Tres ecosistemas, un país", order: 1,
      content: { sentences: [
        "El Lago Enriquillo es el punto más bajo del Caribe y hogar de cocodrilos americanos.",
        "Bahía de las Águilas conserva una de las costas más prístinas del Caribe.",
        "La Sierra de Bahoruco alberga bosques nublados con especies endémicas únicas.",
        "Cada ecosistema tiene condiciones distintas de agua, suelo y clima.",
      ] },
    },
  });
  const matchEco = await prisma.activity.create({
    data: {
      lessonId: lessonEco.id, type: "MATCHING", title: "Empareja el ecosistema", order: 2,
      content: { pairs: [
        { left: "Lago Enriquillo", right: "Cocodrilo americano" },
        { left: "Bahía de las Águilas", right: "Costa prístina" },
        { left: "Sierra de Bahoruco", right: "Bosque nublado" },
      ] },
    },
  });
  const quizEco = await prisma.activity.create({
    data: { lessonId: lessonEco.id, type: "QUIZ", title: "Evaluación", order: 3, content: {} },
  });
  const qE1 = await prisma.question.create({
    data: { activityId: quizEco.id, prompt: "¿Qué especie habita en el Lago Enriquillo?", order: 1, explanation: "El cocodrilo americano." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qE1.id, label: "Cocodrilo americano", isCorrect: true, order: 1 },
      { questionId: qE1.id, label: "Oso panda", isCorrect: false, order: 2 },
      { questionId: qE1.id, label: "Pingüino", isCorrect: false, order: 3 },
    ],
  });
  void matchEco;

  // ---------------------------------------------------------------------
  // Additional demonstration lessons — broader subject/grade coverage.
  // Same illustrative-content framing as the five lessons above: not
  // reviewed MINERD curriculum, see docs/09-content-production-plan.md.
  // ---------------------------------------------------------------------
  console.log("Seeding additional demonstration lessons…");

  // 6) Early Explorers — Pre-Kínder — Spanish literacy: the letter P
  const lessonPina = await publishedLesson({
    subjectId: subjects.SPANISH.id,
    gradeId: grades.PREKINDER.id,
    unitTitle: "El abecedario",
    lessonTitle: "La letra P de piña",
    recommendedAge: "3-4 años",
    objectives: ["Reconocer la letra P y su sonido en palabras familiares"],
    vocabulary: ["piña", "pelota", "pato"],
    explanation: "Los niños exploran la letra P a través de un cuento corto y un juego de emparejar.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonPina.id, type: "NARRATED_STORY", title: "Cuento: La letra P", order: 1,
      content: { sentences: [
        "Esta es la letra P.",
        "P de piña, la fruta dorada del campo.",
        "P de pelota, que rueda y rebota.",
        "P de pato, que nada en el río.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonPina.id, type: "MATCHING", title: "Empareja las palabras", order: 2,
      content: { pairs: [
        { left: "piña", right: "🍍" },
        { left: "pelota", right: "⚽" },
        { left: "pato", right: "🦆" },
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonPina.id, type: "PRINTABLE_WORKSHEET", title: "Practica en papel: la letra P", order: 3,
      content: {
        instructions: "Imprime esta hoja y practica escribiendo la letra P y las palabras.",
        items: ["P — P — P", "piña", "pelota", "pato"],
      },
    },
  });

  // 7) Early Explorers — Pre-Kínder — Math: counting to 5
  const lessonContar5 = await publishedLesson({
    subjectId: subjects.MATH.id,
    gradeId: grades.PREKINDER.id,
    unitTitle: "Los números",
    lessonTitle: "Contamos hasta 5 con cocos",
    recommendedAge: "3-4 años",
    objectives: ["Contar objetos del 1 al 5"],
    vocabulary: ["uno", "dos", "tres", "cuatro", "cinco"],
    explanation: "Los niños practican contar usando cocos de una palmera, del 1 al 5.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonContar5.id, type: "NARRATED_STORY", title: "Cuento: Los cocos de la palmera", order: 1,
      content: { sentences: [
        "En el patio hay una palmera con cocos.",
        "Un coco, dos cocos, tres cocos.",
        "Cuatro cocos, cinco cocos en el suelo.",
        "¡Contamos los cocos juntos!",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonContar5.id, type: "MATCHING", title: "Empareja el número", order: 2,
      content: { pairs: [
        { left: "1", right: "🥥" },
        { left: "3", right: "🥥🥥🥥" },
        { left: "5", right: "🥥🥥🥥🥥🥥" },
      ] },
    },
  });

  // 8) Early Explorers — Kínder — Spanish literacy: the letter S
  const lessonSol = await publishedLesson({
    subjectId: subjects.SPANISH.id,
    gradeId: grades.KINDER.id,
    unitTitle: "El abecedario",
    lessonTitle: "La letra S de sol",
    recommendedAge: "4-5 años",
    objectives: ["Reconocer la letra S y su sonido en palabras familiares"],
    vocabulary: ["sol", "sapo", "silla"],
    explanation: "Los niños exploran la letra S mediante un cuento y trazo de la letra.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonSol.id, type: "NARRATED_STORY", title: "Cuento: La letra S", order: 1,
      content: { sentences: [
        "Esta es la letra S.",
        "S de sol, que calienta la playa.",
        "S de sapo, que salta en el jardín.",
        "S de silla, donde nos sentamos.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonSol.id, type: "DRAWING", title: "Traza la letra S", order: 2,
      content: { letter: "S", instructions: "Usa tu dedo o el mouse para trazar la letra S." },
    },
  });

  // 9) Early Explorers — Kínder — SEL: my emotions
  const lessonEmociones = await publishedLesson({
    subjectId: subjects.SEL.id,
    gradeId: grades.KINDER.id,
    unitTitle: "Mis emociones",
    lessonTitle: "Mis emociones",
    recommendedAge: "4-5 años",
    objectives: ["Identificar y nombrar emociones básicas (alegría, tristeza, enojo, miedo)"],
    vocabulary: ["feliz", "triste", "enojado", "asustado"],
    explanation: "Los niños aprenden a reconocer y nombrar sus emociones para expresarlas de forma saludable.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonEmociones.id, type: "NARRATED_STORY", title: "Cuento: ¿Cómo me siento hoy?", order: 1,
      content: { sentences: [
        "A veces me siento feliz, como cuando juego con mis amigos.",
        "A veces me siento triste, como cuando pierdo mi juguete.",
        "A veces me siento enojado, y está bien decirlo con calma.",
        "Hablar de cómo me siento me ayuda a sentirme mejor.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonEmociones.id, type: "MATCHING", title: "Empareja la emoción", order: 2,
      content: { pairs: [
        { left: "feliz", right: "😊" },
        { left: "triste", right: "😢" },
        { left: "enojado", right: "😠" },
      ] },
    },
  });

  // 10) Beginning Readers — Preprimario — Spanish literacy: the letter A
  const lessonAgua = await publishedLesson({
    subjectId: subjects.SPANISH.id,
    gradeId: grades.PREPRIMARIO.id,
    unitTitle: "El abecedario",
    lessonTitle: "La letra A de agua",
    recommendedAge: "5-6 años",
    objectives: ["Reconocer la letra A y su sonido en palabras familiares"],
    vocabulary: ["agua", "árbol", "abeja"],
    explanation: "Los niños exploran la letra A mediante un cuento, trazo y un juego de emparejar.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonAgua.id, type: "NARRATED_STORY", title: "Cuento: La letra A", order: 1,
      content: { sentences: [
        "Esta es la letra A.",
        "A de agua, que bebemos todos los días.",
        "A de árbol, que da sombra fresca.",
        "A de abeja, que hace miel dulce.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonAgua.id, type: "MATCHING", title: "Empareja las palabras", order: 2,
      content: { pairs: [
        { left: "agua", right: "💧" },
        { left: "árbol", right: "🌳" },
        { left: "abeja", right: "🐝" },
      ] },
    },
  });

  // 11) Beginning Readers — Preprimario — Math: shapes
  const lessonFiguras = await publishedLesson({
    subjectId: subjects.MATH.id,
    gradeId: grades.PREPRIMARIO.id,
    unitTitle: "Las figuras geométricas",
    lessonTitle: "Figuras geométricas",
    recommendedAge: "5-6 años",
    objectives: ["Identificar círculo, cuadrado y triángulo en objetos cotidianos"],
    vocabulary: ["círculo", "cuadrado", "triángulo"],
    explanation: "Los niños identifican figuras geométricas básicas comparándolas con objetos del entorno.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonFiguras.id, type: "NARRATED_STORY", title: "Cuento: Formas por todas partes", order: 1,
      content: { sentences: [
        "El sol es redondo, como un círculo.",
        "La ventana tiene cuatro lados iguales, es un cuadrado.",
        "El techo de la casa tiene forma de triángulo.",
        "¡Las figuras están en todas partes!",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonFiguras.id, type: "MATCHING", title: "Empareja la figura", order: 2,
      content: { pairs: [
        { left: "círculo", right: "⚪" },
        { left: "cuadrado", right: "🟦" },
        { left: "triángulo", right: "🔺" },
      ] },
    },
  });

  // 12) Beginning Readers — 1er Grado — Math: addition with pesos
  const lessonSumas = await publishedLesson({
    subjectId: subjects.MATH.id,
    gradeId: grades.P1.id,
    unitTitle: "Sumas y restas",
    lessonTitle: "Sumamos con pesos dominicanos",
    recommendedAge: "6-7 años",
    objectives: ["Resolver sumas sencillas usando el peso dominicano como contexto"],
    vocabulary: ["suma", "peso", "total"],
    explanation: "Los estudiantes practican sumas sencillas comprando cosas del colmado con pesos dominicanos.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonSumas.id, type: "NARRATED_STORY", title: "Cuento: De compras en el colmado", order: 1,
      content: { sentences: [
        "Pedro compra un pan por RD$10.",
        "Luego compra un jugo por RD$15.",
        "RD$10 más RD$15 son RD$25 en total.",
        "Pedro paga RD$25 y recibe su compra.",
      ] },
    },
  });
  const quizSumas = await prisma.activity.create({
    data: { lessonId: lessonSumas.id, type: "QUIZ", title: "Practica sumas", order: 2, content: {} },
  });
  const qSumas1 = await prisma.question.create({
    data: { activityId: quizSumas.id, prompt: "¿Cuánto es RD$10 más RD$15?", order: 1, explanation: "10 + 15 = 25." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qSumas1.id, label: "RD$25", isCorrect: true, order: 1 },
      { questionId: qSumas1.id, label: "RD$20", isCorrect: false, order: 2 },
      { questionId: qSumas1.id, label: "RD$30", isCorrect: false, order: 3 },
    ],
  });

  // 13) Beginning Readers — 1er Grado — Social studies: community helpers
  const lessonHeroes = await publishedLesson({
    subjectId: subjects.SOCIAL.id,
    gradeId: grades.P1.id,
    unitTitle: "Mi comunidad",
    lessonTitle: "Los héroes de mi comunidad",
    recommendedAge: "6-7 años",
    objectives: ["Reconocer el trabajo de las personas que ayudan en la comunidad"],
    vocabulary: ["bombero", "maestro", "médico", "comunidad"],
    explanation: "Los estudiantes conocen a las personas que trabajan para ayudar a la comunidad todos los días.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonHeroes.id, type: "NARRATED_STORY", title: "Cuento: Quienes nos ayudan", order: 1,
      content: { sentences: [
        "El bombero apaga incendios y nos protege.",
        "La maestra nos enseña a leer y escribir.",
        "El médico cuida nuestra salud cuando estamos enfermos.",
        "Todos ellos son héroes de nuestra comunidad.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonHeroes.id, type: "MATCHING", title: "Empareja la profesión", order: 2,
      content: { pairs: [
        { left: "bombero", right: "🚒" },
        { left: "maestra", right: "📚" },
        { left: "médico", right: "🩺" },
      ] },
    },
  });

  // 14) Beginning Readers — 2do Grado — Spanish: a day at the beach
  const lessonPlaya = await publishedLesson({
    subjectId: subjects.SPANISH.id,
    gradeId: grades.P2.id,
    unitTitle: "Lectura guiada",
    lessonTitle: "Un día en la playa",
    recommendedAge: "7-8 años",
    objectives: ["Leer un texto decodificable corto y responder preguntas de comprensión"],
    vocabulary: ["playa", "arena", "concha"],
    explanation: "Un cuento decodificable sobre un paseo a la playa, con práctica de lectura y comprensión.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonPlaya.id, type: "READING_PASSAGE", title: "Lee el cuento", order: 1,
      content: {
        passage: "Rosa va a la playa. Rosa ve el mar azul. Rosa junta conchas en la arena. Rosa es feliz.",
        words: ["Rosa", "va", "a", "la", "playa.", "Rosa", "ve", "el", "mar", "azul.", "Rosa", "junta", "conchas", "en", "la", "arena.", "Rosa", "es", "feliz."],
      },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonPlaya.id, type: "DRAG_AND_DROP", title: "Ordena la oración", order: 2,
      content: {
        prompt: "Ordena las palabras para formar la oración:",
        wordBank: ["mar", "el", "ve", "Rosa"],
        correctOrder: ["Rosa", "ve", "el", "mar"],
      },
    },
  });

  // 15) Beginning Readers — 2do Grado — Math: subtraction at the market
  const lessonRestas = await publishedLesson({
    subjectId: subjects.MATH.id,
    gradeId: grades.P2.id,
    unitTitle: "Sumas y restas",
    lessonTitle: "Restamos en el mercado",
    recommendedAge: "7-8 años",
    objectives: ["Resolver restas sencillas usando el peso dominicano como contexto"],
    vocabulary: ["resta", "cambio", "mercado"],
    explanation: "Los estudiantes practican restas calculando el cambio al pagar en el mercado.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonRestas.id, type: "NARRATED_STORY", title: "Cuento: El cambio en el mercado", order: 1,
      content: { sentences: [
        "Marta compra mangos por RD$30.",
        "Marta paga con un billete de RD$50.",
        "RD$50 menos RD$30 son RD$20 de cambio.",
        "El vendedor le da RD$20 a Marta.",
      ] },
    },
  });
  const quizRestas = await prisma.activity.create({
    data: { lessonId: lessonRestas.id, type: "QUIZ", title: "Practica restas", order: 2, content: {} },
  });
  const qRestas1 = await prisma.question.create({
    data: { activityId: quizRestas.id, prompt: "¿Cuánto es RD$50 menos RD$30?", order: 1, explanation: "50 - 30 = 20." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qRestas1.id, label: "RD$20", isCorrect: true, order: 1 },
      { questionId: qRestas1.id, label: "RD$30", isCorrect: false, order: 2 },
      { questionId: qRestas1.id, label: "RD$10", isCorrect: false, order: 3 },
    ],
  });

  // 16) Developing Learners — 3er Grado — Math: multiplication tables
  const lessonTablas = await publishedLesson({
    subjectId: subjects.MATH.id,
    gradeId: grades.P3.id,
    unitTitle: "Multiplicación",
    lessonTitle: "La tabla del 2 y del 5",
    recommendedAge: "8-9 años",
    objectives: ["Practicar las tablas de multiplicar del 2 y del 5"],
    vocabulary: ["multiplicación", "tabla", "producto"],
    explanation: "Los estudiantes practican las tablas del 2 y del 5 usando ejemplos con pares de zapatos y billetes de RD$5.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonTablas.id, type: "NARRATED_STORY", title: "Cuento: Pares y billetes", order: 1,
      content: { sentences: [
        "Cada par de zapatos tiene 2 zapatos.",
        "3 pares de zapatos son 3 × 2 = 6 zapatos.",
        "Cada billete vale RD$5.",
        "4 billetes son 4 × 5 = RD$20.",
      ] },
    },
  });
  const quizTablas = await prisma.activity.create({
    data: { lessonId: lessonTablas.id, type: "QUIZ", title: "Practica las tablas", order: 2, content: {} },
  });
  const qTablas1 = await prisma.question.create({
    data: { activityId: quizTablas.id, prompt: "¿Cuánto es 4 × 5?", order: 1, explanation: "4 × 5 = 20." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qTablas1.id, label: "20", isCorrect: true, order: 1 },
      { questionId: qTablas1.id, label: "15", isCorrect: false, order: 2 },
      { questionId: qTablas1.id, label: "25", isCorrect: false, order: 3 },
    ],
  });

  // 17) Developing Learners — 3er Grado — Science: animals of the DR
  const lessonAnimalesRD = await publishedLesson({
    subjectId: subjects.SCIENCE.id,
    gradeId: grades.P3.id,
    unitTitle: "Animales de mi país",
    lessonTitle: "Animales de la República Dominicana",
    recommendedAge: "8-9 años",
    objectives: ["Identificar animales representativos de la fauna dominicana"],
    vocabulary: ["cotorra", "manatí", "iguana", "fauna"],
    explanation: "Los estudiantes conocen animales característicos de la fauna dominicana y dónde viven.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonAnimalesRD.id, type: "NARRATED_STORY", title: "Cuento: Animales de mi tierra", order: 1,
      content: { sentences: [
        "La cotorra dominicana es un ave verde muy colorida.",
        "El manatí vive en las aguas cálidas de nuestras costas.",
        "La iguana rinoceronte vive en Isla Cabritos, en el Lago Enriquillo.",
        "Todos estos animales son parte de la fauna de nuestro país.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonAnimalesRD.id, type: "MATCHING", title: "Empareja el animal", order: 2,
      content: { pairs: [
        { left: "cotorra", right: "🦜" },
        { left: "manatí", right: "🌊" },
        { left: "iguana", right: "🦎" },
      ] },
    },
  });

  // 18) Developing Learners — 4to Grado — Science: weather and seasons
  const lessonClima = await publishedLesson({
    subjectId: subjects.SCIENCE.id,
    gradeId: grades.P4.id,
    unitTitle: "El tiempo y el clima",
    lessonTitle: "El clima y las estaciones",
    recommendedAge: "9-10 años",
    objectives: ["Describir las características del clima tropical dominicano"],
    vocabulary: ["clima", "temporada seca", "temporada de lluvia", "huracán"],
    explanation: "Los estudiantes exploran el clima tropical de la República Dominicana y sus dos temporadas principales.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonClima.id, type: "NARRATED_STORY", title: "Cuento: Nuestro clima tropical", order: 1,
      content: { sentences: [
        "La República Dominicana tiene un clima tropical, cálido todo el año.",
        "Hay una temporada seca y una temporada de lluvia.",
        "Entre junio y noviembre puede haber huracanes en el Caribe.",
        "Es importante prepararse cuando se anuncia un huracán.",
      ] },
    },
  });
  const quizClima = await prisma.activity.create({
    data: { lessonId: lessonClima.id, type: "QUIZ", title: "Comprueba lo aprendido", order: 2, content: {} },
  });
  const qClima1 = await prisma.question.create({
    data: { activityId: quizClima.id, prompt: "¿Qué tipo de clima tiene la República Dominicana?", order: 1, explanation: "Un clima tropical, cálido todo el año." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qClima1.id, label: "Tropical", isCorrect: true, order: 1 },
      { questionId: qClima1.id, label: "Polar", isCorrect: false, order: 2 },
      { questionId: qClima1.id, label: "Desértico", isCorrect: false, order: 3 },
    ],
  });

  // 19) Developing Learners — 4to Grado — Social studies: provinces
  const lessonProvincias = await publishedLesson({
    subjectId: subjects.SOCIAL.id,
    gradeId: grades.P4.id,
    unitTitle: "División política",
    lessonTitle: "Las provincias de mi país",
    recommendedAge: "9-10 años",
    objectives: ["Reconocer que la República Dominicana se divide en provincias"],
    vocabulary: ["provincia", "municipio", "división política"],
    explanation: "Los estudiantes aprenden que el país se organiza en provincias y municipios, cada uno con su capital.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonProvincias.id, type: "NARRATED_STORY", title: "Cuento: Un país de provincias", order: 1,
      content: { sentences: [
        "La República Dominicana se divide en 31 provincias y un Distrito Nacional.",
        "Cada provincia tiene una ciudad capital.",
        "Santiago es la capital de la provincia Santiago.",
        "Conocer las provincias nos ayuda a entender nuestro país.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonProvincias.id, type: "MATCHING", title: "Empareja la provincia", order: 2,
      content: { pairs: [
        { left: "Distrito Nacional", right: "Santo Domingo" },
        { left: "Santiago", right: "Ciudad Corazón" },
        { left: "La Altagracia", right: "Punta Cana" },
      ] },
    },
  });

  // 20) Developing Learners — 5to Grado — Science: plants
  const lessonPlantas = await publishedLesson({
    subjectId: subjects.SCIENCE.id,
    gradeId: grades.P5.id,
    unitTitle: "Los seres vivos",
    lessonTitle: "Las plantas y sus partes",
    recommendedAge: "10-11 años",
    objectives: ["Identificar las partes principales de una planta y su función"],
    vocabulary: ["raíz", "tallo", "hoja", "fotosíntesis"],
    explanation: "Los estudiantes exploran las partes de una planta y cómo cada una ayuda a la planta a vivir y crecer.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonPlantas.id, type: "NARRATED_STORY", title: "Cuento: Las partes de la planta", order: 1,
      content: { sentences: [
        "La raíz absorbe agua y nutrientes del suelo.",
        "El tallo sostiene la planta y transporta agua hacia arriba.",
        "Las hojas usan la luz del sol para hacer fotosíntesis.",
        "Cada parte de la planta tiene un trabajo importante.",
      ] },
    },
  });
  const quizPlantas = await prisma.activity.create({
    data: { lessonId: lessonPlantas.id, type: "QUIZ", title: "Comprueba lo aprendido", order: 2, content: {} },
  });
  const qPlantas1 = await prisma.question.create({
    data: { activityId: quizPlantas.id, prompt: "¿Qué parte de la planta absorbe agua del suelo?", order: 1, explanation: "La raíz." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qPlantas1.id, label: "La raíz", isCorrect: true, order: 1 },
      { questionId: qPlantas1.id, label: "La hoja", isCorrect: false, order: 2 },
      { questionId: qPlantas1.id, label: "La flor", isCorrect: false, order: 3 },
    ],
  });

  // 21) Developing Learners — 5to Grado — Digital literacy: internet safety
  const lessonInternet = await publishedLesson({
    subjectId: subjects.DIGITAL.id,
    gradeId: grades.P5.id,
    unitTitle: "Uso responsable de la tecnología",
    lessonTitle: "Uso seguro de internet",
    recommendedAge: "10-11 años",
    objectives: ["Reconocer reglas básicas de seguridad al usar internet"],
    vocabulary: ["contraseña", "privado", "internet seguro"],
    explanation: "Los estudiantes aprenden reglas básicas para navegar en internet de forma segura y responsable.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonInternet.id, type: "NARRATED_STORY", title: "Cuento: Navegando seguro", order: 1,
      content: { sentences: [
        "Nunca compartas tu contraseña con nadie, ni con amigos.",
        "No compartas tu dirección ni tu número de teléfono en internet.",
        "Si algo en internet te hace sentir incómodo, dile a un adulto de confianza.",
        "Usar internet con cuidado nos mantiene seguros.",
      ] },
    },
  });
  const quizInternet = await prisma.activity.create({
    data: { lessonId: lessonInternet.id, type: "QUIZ", title: "Comprueba lo aprendido", order: 2, content: {} },
  });
  const qInternet1 = await prisma.question.create({
    data: { activityId: quizInternet.id, prompt: "¿Qué debes hacer si algo en internet te incomoda?", order: 1, explanation: "Decirle a un adulto de confianza." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qInternet1.id, label: "Decirle a un adulto de confianza", isCorrect: true, order: 1 },
      { questionId: qInternet1.id, label: "Ignorarlo y seguir solo/a", isCorrect: false, order: 2 },
      { questionId: qInternet1.id, label: "Compartirlo con desconocidos", isCorrect: false, order: 3 },
    ],
  });

  // 22) Independent Learners — 6to Grado — Social studies: Independence
  const lessonIndependencia = await publishedLesson({
    subjectId: subjects.SOCIAL.id,
    gradeId: grades.P6.id,
    unitTitle: "Historia dominicana",
    lessonTitle: "La Independencia Dominicana",
    recommendedAge: "11-12 años",
    objectives: ["Explicar el significado del 27 de febrero de 1844 para la República Dominicana"],
    vocabulary: ["independencia", "Trinitarios", "Duarte", "1844"],
    explanation: "Los estudiantes conocen el proceso de la Independencia Dominicana, liderado por los Trinitarios y Juan Pablo Duarte.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonIndependencia.id, type: "NARRATED_STORY", title: "Cuento: El 27 de febrero", order: 1,
      content: { sentences: [
        "Juan Pablo Duarte fundó la sociedad secreta La Trinitaria.",
        "Los Trinitarios soñaban con un país libre e independiente.",
        "El 27 de febrero de 1844 se proclamó la Independencia Dominicana.",
        "Desde entonces, celebramos esta fecha como nuestra fiesta patria más importante.",
      ] },
    },
  });
  const quizIndependencia = await prisma.activity.create({
    data: { lessonId: lessonIndependencia.id, type: "QUIZ", title: "Comprueba lo aprendido", order: 2, content: {} },
  });
  const qIndep1 = await prisma.question.create({
    data: { activityId: quizIndependencia.id, prompt: "¿En qué fecha se proclamó la Independencia Dominicana?", order: 1, explanation: "El 27 de febrero de 1844." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qIndep1.id, label: "27 de febrero de 1844", isCorrect: true, order: 1 },
      { questionId: qIndep1.id, label: "16 de agosto de 1863", isCorrect: false, order: 2 },
      { questionId: qIndep1.id, label: "12 de octubre de 1492", isCorrect: false, order: 3 },
    ],
  });

  // 23) Independent Learners — 6to Grado — English: colors and numbers
  const lessonColors = await publishedLesson({
    subjectId: subjects.ENGLISH.id,
    gradeId: grades.P6.id,
    unitTitle: "Basic vocabulary",
    lessonTitle: "Colors and numbers in English",
    recommendedAge: "11-12 años",
    objectives: ["Identify basic colors and numbers in English"],
    vocabulary: ["red", "blue", "green", "one", "two", "three"],
    explanation: "Students practice basic English vocabulary for colors and numbers 1-5.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonColors.id, type: "NARRATED_STORY", title: "Story: Colors around us", order: 1,
      content: { sentences: [
        "The sky is blue and the grass is green.",
        "A ripe mango can be red, yellow, or orange.",
        "One, two, three — let's count together!",
        "Learning colors and numbers helps us describe the world.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonColors.id, type: "MATCHING", title: "Match the word", order: 2,
      content: { pairs: [
        { left: "red", right: "🔴" },
        { left: "blue", right: "🔵" },
        { left: "three", right: "3️⃣" },
      ] },
    },
  });

  // 24) Independent Learners — 1er Año Secundaria — Science: human body
  const lessonCuerpo = await publishedLesson({
    subjectId: subjects.SCIENCE.id,
    gradeId: grades.S1.id,
    unitTitle: "El cuerpo humano",
    lessonTitle: "El cuerpo humano: sistemas",
    recommendedAge: "12-13 años",
    objectives: ["Describir la función básica de los sistemas circulatorio y respiratorio"],
    vocabulary: ["sistema circulatorio", "sistema respiratorio", "corazón", "pulmones"],
    explanation: "Los estudiantes exploran cómo el sistema circulatorio y el sistema respiratorio trabajan juntos para mantenernos vivos.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonCuerpo.id, type: "NARRATED_STORY", title: "Cuento: Dos sistemas, un cuerpo", order: 1,
      content: { sentences: [
        "El corazón bombea sangre por todo el cuerpo.",
        "El sistema circulatorio lleva oxígeno y nutrientes a cada célula.",
        "Los pulmones toman oxígeno del aire cuando respiramos.",
        "El sistema respiratorio y el circulatorio trabajan juntos constantemente.",
      ] },
    },
  });
  const quizCuerpo = await prisma.activity.create({
    data: { lessonId: lessonCuerpo.id, type: "QUIZ", title: "Evaluación", order: 2, content: {} },
  });
  const qCuerpo1 = await prisma.question.create({
    data: { activityId: quizCuerpo.id, prompt: "¿Qué órgano bombea la sangre por el cuerpo?", order: 1, explanation: "El corazón." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qCuerpo1.id, label: "El corazón", isCorrect: true, order: 1 },
      { questionId: qCuerpo1.id, label: "El estómago", isCorrect: false, order: 2 },
      { questionId: qCuerpo1.id, label: "El hígado", isCorrect: false, order: 3 },
    ],
  });

  // 25) Independent Learners — 1er Año Secundaria — Art: merengue y bachata
  const lessonMerengue = await publishedLesson({
    subjectId: subjects.ART.id,
    gradeId: grades.S1.id,
    unitTitle: "Música dominicana",
    lessonTitle: "Merengue y bachata: música dominicana",
    recommendedAge: "12-13 años",
    objectives: ["Reconocer el merengue y la bachata como géneros musicales originarios de la República Dominicana"],
    vocabulary: ["merengue", "bachata", "acordeón", "güira"],
    explanation: "Los estudiantes descubren el merengue y la bachata, dos géneros musicales nacidos en la República Dominicana.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonMerengue.id, type: "NARRATED_STORY", title: "Cuento: Los ritmos de mi país", order: 1,
      content: { sentences: [
        "El merengue es el ritmo nacional de la República Dominicana.",
        "Se toca con acordeón, güira y tambora.",
        "La bachata nació en los campos dominicanos y hoy se escucha en todo el mundo.",
        "Ambos géneros son parte importante de nuestra identidad cultural.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonMerengue.id, type: "MATCHING", title: "Empareja el instrumento", order: 2,
      content: { pairs: [
        { left: "güira", right: "🥁" },
        { left: "acordeón", right: "🪗" },
        { left: "guitarra", right: "🎸" },
      ] },
    },
  });

  // 26) Secondary Learners — 2do Año Secundaria — Social studies: Restoration
  const lessonRestauracion = await publishedLesson({
    subjectId: subjects.SOCIAL.id,
    gradeId: grades.S2.id,
    unitTitle: "Historia dominicana",
    lessonTitle: "La Restauración Dominicana",
    recommendedAge: "13-14 años",
    objectives: ["Explicar el significado de la Guerra de Restauración (1863-1865)"],
    vocabulary: ["Restauración", "anexión", "Gregorio Luperón"],
    explanation: "Los estudiantes conocen la Guerra de Restauración, que devolvió la independencia al país tras la anexión a España.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonRestauracion.id, type: "NARRATED_STORY", title: "Cuento: La lucha por la Restauración", order: 1,
      content: { sentences: [
        "En 1861 el país fue anexado nuevamente a España.",
        "Muchos dominicanos se levantaron en armas contra la anexión.",
        "Gregorio Luperón fue uno de los líderes de la Guerra de Restauración.",
        "En 1865 España se retiró y la República Dominicana volvió a ser independiente.",
      ] },
    },
  });
  const quizRest = await prisma.activity.create({
    data: { lessonId: lessonRestauracion.id, type: "QUIZ", title: "Comprueba lo aprendido", order: 2, content: {} },
  });
  const qRest1 = await prisma.question.create({
    data: { activityId: quizRest.id, prompt: "¿Qué país había anexado a la República Dominicana antes de la Restauración?", order: 1, explanation: "España." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qRest1.id, label: "España", isCorrect: true, order: 1 },
      { questionId: qRest1.id, label: "Francia", isCorrect: false, order: 2 },
      { questionId: qRest1.id, label: "Haití", isCorrect: false, order: 3 },
    ],
  });

  // 27) Secondary Learners — 2do Año Secundaria — English: present tense
  const lessonVerbos = await publishedLesson({
    subjectId: subjects.ENGLISH.id,
    gradeId: grades.S2.id,
    unitTitle: "Grammar basics",
    lessonTitle: "Present tense verbs",
    recommendedAge: "13-14 años",
    objectives: ["Use present tense verbs correctly in simple sentences"],
    vocabulary: ["study", "play", "live", "like"],
    explanation: "Students practice forming simple present tense sentences about daily routines.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonVerbos.id, type: "NARRATED_STORY", title: "Story: My daily routine", order: 1,
      content: { sentences: [
        "I live in Santo Domingo.",
        "I study English every day at school.",
        "My brother plays baseball on weekends.",
        "We like to eat mangoes in the summer.",
      ] },
    },
  });
  const quizVerbos = await prisma.activity.create({
    data: { lessonId: lessonVerbos.id, type: "QUIZ", title: "Practice", order: 2, content: {} },
  });
  const qVerbos1 = await prisma.question.create({
    data: { activityId: quizVerbos.id, prompt: "Complete: 'My brother ___ baseball.'", order: 1, explanation: "'Plays' is correct for third person singular." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qVerbos1.id, label: "plays", isCorrect: true, order: 1 },
      { questionId: qVerbos1.id, label: "play", isCorrect: false, order: 2 },
      { questionId: qVerbos1.id, label: "playing", isCorrect: false, order: 3 },
    ],
  });

  // 28) Secondary Learners — 3er Año Secundaria — Science: the cell
  const lessonCelula = await publishedLesson({
    subjectId: subjects.SCIENCE.id,
    gradeId: grades.S3.id,
    unitTitle: "Biología celular",
    lessonTitle: "La célula: unidad de la vida",
    recommendedAge: "14-15 años",
    objectives: ["Describir la célula como la unidad básica de todos los seres vivos"],
    vocabulary: ["célula", "núcleo", "membrana", "organismo"],
    explanation: "Los estudiantes exploran la célula como unidad estructural y funcional de todo ser vivo.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonCelula.id, type: "NARRATED_STORY", title: "Cuento: El mundo microscópico", order: 1,
      content: { sentences: [
        "Todos los seres vivos están formados por células.",
        "La membrana celular protege y controla lo que entra y sale de la célula.",
        "El núcleo guarda la información genética de la célula.",
        "Algunos organismos tienen una sola célula; otros, billones de ellas.",
      ] },
    },
  });
  const quizCelula = await prisma.activity.create({
    data: { lessonId: lessonCelula.id, type: "QUIZ", title: "Evaluación", order: 2, content: {} },
  });
  const qCelula1 = await prisma.question.create({
    data: { activityId: quizCelula.id, prompt: "¿Qué parte de la célula guarda la información genética?", order: 1, explanation: "El núcleo." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qCelula1.id, label: "El núcleo", isCorrect: true, order: 1 },
      { questionId: qCelula1.id, label: "La membrana", isCorrect: false, order: 2 },
      { questionId: qCelula1.id, label: "El citoplasma", isCorrect: false, order: 3 },
    ],
  });

  // 29) Secondary Learners — 3er Año Secundaria — Religious/values education
  const lessonValores = await publishedLesson({
    subjectId: subjects.RELIGIOUS.id,
    gradeId: grades.S3.id,
    unitTitle: "Valores y convivencia",
    lessonTitle: "Valores y convivencia",
    recommendedAge: "14-15 años",
    objectives: ["Reflexionar sobre el respeto y la convivencia pacífica en la comunidad"],
    vocabulary: ["respeto", "convivencia", "solidaridad"],
    explanation: "Los estudiantes reflexionan sobre valores como el respeto y la solidaridad para una sana convivencia.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonValores.id, type: "NARRATED_STORY", title: "Cuento: Vivir en comunidad", order: 1,
      content: { sentences: [
        "El respeto significa tratar a los demás como nos gustaría ser tratados.",
        "La solidaridad es ayudar a quien lo necesita, sin esperar nada a cambio.",
        "Una comunidad sana se construye con pequeños actos de bondad diarios.",
        "Cada persona puede aportar a una mejor convivencia.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonValores.id, type: "MATCHING", title: "Empareja el valor", order: 2,
      content: { pairs: [
        { left: "respeto", right: "🤝" },
        { left: "solidaridad", right: "❤️" },
        { left: "honestidad", right: "✅" },
      ] },
    },
  });

  // 30) Secondary Learners — 4to Año Secundaria — Social studies: government
  const lessonGobierno = await publishedLesson({
    subjectId: subjects.SOCIAL.id,
    gradeId: grades.S4.id,
    unitTitle: "Civismo y gobierno",
    lessonTitle: "El gobierno dominicano",
    recommendedAge: "15-16 años",
    objectives: ["Describir los tres poderes del Estado dominicano"],
    vocabulary: ["poder ejecutivo", "poder legislativo", "poder judicial"],
    explanation: "Los estudiantes conocen los tres poderes del Estado dominicano y su función principal.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonGobierno.id, type: "NARRATED_STORY", title: "Cuento: Tres poderes, un Estado", order: 1,
      content: { sentences: [
        "El poder ejecutivo lo dirige el presidente de la República.",
        "El poder legislativo lo forma el Congreso Nacional, que hace las leyes.",
        "El poder judicial se encarga de aplicar la justicia.",
        "Los tres poderes trabajan de forma independiente para el buen funcionamiento del Estado.",
      ] },
    },
  });
  const quizGobierno = await prisma.activity.create({
    data: { lessonId: lessonGobierno.id, type: "QUIZ", title: "Comprueba lo aprendido", order: 2, content: {} },
  });
  const qGobierno1 = await prisma.question.create({
    data: { activityId: quizGobierno.id, prompt: "¿Quién dirige el poder ejecutivo?", order: 1, explanation: "El presidente de la República." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qGobierno1.id, label: "El presidente de la República", isCorrect: true, order: 1 },
      { questionId: qGobierno1.id, label: "El Congreso Nacional", isCorrect: false, order: 2 },
      { questionId: qGobierno1.id, label: "La Suprema Corte", isCorrect: false, order: 3 },
    ],
  });

  // 31) Secondary Learners — 4to Año Secundaria — PE: health and wellness
  const lessonSaludFisica = await publishedLesson({
    subjectId: subjects.PE.id,
    gradeId: grades.S4.id,
    unitTitle: "Salud y bienestar",
    lessonTitle: "Salud y bienestar físico",
    recommendedAge: "15-16 años",
    objectives: ["Reconocer hábitos saludables para el cuerpo: ejercicio, alimentación e hidratación"],
    vocabulary: ["ejercicio", "hidratación", "alimentación balanceada"],
    explanation: "Los estudiantes exploran hábitos que mantienen el cuerpo sano: actividad física, buena alimentación e hidratación.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonSaludFisica.id, type: "NARRATED_STORY", title: "Cuento: Un cuerpo sano", order: 1,
      content: { sentences: [
        "Hacer ejercicio al menos 30 minutos al día fortalece el corazón.",
        "Tomar suficiente agua mantiene el cuerpo hidratado, sobre todo en el calor del trópico.",
        "Comer frutas y vegetales le da al cuerpo las vitaminas que necesita.",
        "Pequeños hábitos diarios hacen una gran diferencia en nuestra salud.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonSaludFisica.id, type: "MATCHING", title: "Empareja el hábito saludable", order: 2,
      content: { pairs: [
        { left: "ejercicio", right: "🏃" },
        { left: "agua", right: "💧" },
        { left: "frutas", right: "🍉" },
      ] },
    },
  });

  // 32) Secondary Learners — 5to Año Secundaria — Science: intro to chemistry
  const lessonQuimica = await publishedLesson({
    subjectId: subjects.SCIENCE.id,
    gradeId: grades.S5.id,
    unitTitle: "Química básica",
    lessonTitle: "Introducción a la química",
    recommendedAge: "16-17 años",
    objectives: ["Distinguir entre elementos, compuestos y mezclas con ejemplos cotidianos"],
    vocabulary: ["elemento", "compuesto", "mezcla", "átomo"],
    explanation: "Los estudiantes distinguen elementos, compuestos y mezclas usando ejemplos de la vida diaria, como el agua y el aire.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonQuimica.id, type: "NARRATED_STORY", title: "Cuento: De qué está hecho todo", order: 1,
      content: { sentences: [
        "Un elemento, como el oxígeno, está formado por un solo tipo de átomo.",
        "Un compuesto, como el agua (H2O), combina dos o más elementos.",
        "Una mezcla, como el agua de mar, combina sustancias sin unirse químicamente.",
        "Entender esta diferencia es la base de la química.",
      ] },
    },
  });
  const quizQuimica = await prisma.activity.create({
    data: { lessonId: lessonQuimica.id, type: "QUIZ", title: "Evaluación", order: 2, content: {} },
  });
  const qQuimica1 = await prisma.question.create({
    data: { activityId: quizQuimica.id, prompt: "¿Qué es el agua (H2O) desde el punto de vista químico?", order: 1, explanation: "Un compuesto, formado por hidrógeno y oxígeno." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qQuimica1.id, label: "Un compuesto", isCorrect: true, order: 1 },
      { questionId: qQuimica1.id, label: "Un elemento", isCorrect: false, order: 2 },
      { questionId: qQuimica1.id, label: "Una mezcla", isCorrect: false, order: 3 },
    ],
  });

  // 33) Secondary Learners — 5to Año Secundaria — English: reading comprehension
  const lessonReading2 = await publishedLesson({
    subjectId: subjects.ENGLISH.id,
    gradeId: grades.S5.id,
    unitTitle: "Reading comprehension",
    lessonTitle: "Reading comprehension: my country",
    recommendedAge: "16-17 años",
    objectives: ["Read a short passage in English and answer comprehension questions"],
    vocabulary: ["island", "capital", "Caribbean", "population"],
    explanation: "Students read a short passage about the Dominican Republic and answer comprehension questions in English.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonReading2.id, type: "READING_PASSAGE", title: "Read the passage", order: 1,
      content: {
        passage: "The Dominican Republic is an island nation in the Caribbean. Its capital is Santo Domingo. Many people visit its beautiful beaches every year.",
        words: ["The", "Dominican", "Republic", "is", "an", "island", "nation", "in", "the", "Caribbean.", "Its", "capital", "is", "Santo", "Domingo.", "Many", "people", "visit", "its", "beautiful", "beaches", "every", "year."],
      },
    },
  });
  const quizReading2 = await prisma.activity.create({
    data: { lessonId: lessonReading2.id, type: "QUIZ", title: "Comprehension check", order: 2, content: {} },
  });
  const qReading2_1 = await prisma.question.create({
    data: { activityId: quizReading2.id, prompt: "What is the capital of the Dominican Republic?", order: 1, explanation: "Santo Domingo." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qReading2_1.id, label: "Santo Domingo", isCorrect: true, order: 1 },
      { questionId: qReading2_1.id, label: "Santiago", isCorrect: false, order: 2 },
      { questionId: qReading2_1.id, label: "San Juan", isCorrect: false, order: 3 },
    ],
  });

  // 34) Secondary Learners — 6to Año Secundaria — Social studies: constitution
  const lessonConstitucion = await publishedLesson({
    subjectId: subjects.SOCIAL.id,
    gradeId: grades.S6.id,
    unitTitle: "Civismo y gobierno",
    lessonTitle: "La Constitución dominicana",
    recommendedAge: "17-18 años",
    objectives: ["Explicar el papel de la Constitución como norma suprema del Estado dominicano"],
    vocabulary: ["Constitución", "derechos", "deberes", "norma suprema"],
    explanation: "Los estudiantes analizan el papel de la Constitución dominicana como la norma suprema que rige el país.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonConstitucion.id, type: "NARRATED_STORY", title: "Cuento: La norma suprema", order: 1,
      content: { sentences: [
        "La Constitución es la ley más importante de la República Dominicana.",
        "Establece los derechos y deberes de todos los ciudadanos.",
        "Ninguna otra ley puede contradecir lo que dice la Constitución.",
        "Conocerla nos ayuda a ejercer nuestra ciudadanía de forma responsable.",
      ] },
    },
  });
  const quizConstitucion = await prisma.activity.create({
    data: { lessonId: lessonConstitucion.id, type: "QUIZ", title: "Comprueba lo aprendido", order: 2, content: {} },
  });
  const qConst1 = await prisma.question.create({
    data: { activityId: quizConstitucion.id, prompt: "¿Qué es la Constitución para un país?", order: 1, explanation: "Su norma suprema, la ley más importante." },
  });
  await prisma.answerOption.createMany({
    data: [
      { questionId: qConst1.id, label: "Su norma suprema", isCorrect: true, order: 1 },
      { questionId: qConst1.id, label: "Un tratado internacional", isCorrect: false, order: 2 },
      { questionId: qConst1.id, label: "Un reglamento escolar", isCorrect: false, order: 3 },
    ],
  });

  // 35) Secondary Learners — 6to Año Secundaria — SEL: emotional wellness
  const lessonBienestar = await publishedLesson({
    subjectId: subjects.SEL.id,
    gradeId: grades.S6.id,
    unitTitle: "Bienestar emocional",
    lessonTitle: "Bienestar emocional y resiliencia",
    recommendedAge: "17-18 años",
    objectives: ["Reconocer estrategias saludables para manejar el estrés y la presión académica"],
    vocabulary: ["resiliencia", "estrés", "autocuidado"],
    explanation: "Los estudiantes exploran estrategias de autocuidado y resiliencia para manejar el estrés, especialmente en la etapa final del bachillerato.",
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonBienestar.id, type: "NARRATED_STORY", title: "Cuento: Cuidar la mente también importa", order: 1,
      content: { sentences: [
        "La resiliencia es la capacidad de recuperarnos ante los retos.",
        "Hablar de lo que sentimos con alguien de confianza ayuda a manejar el estrés.",
        "Descansar y dormir bien también es parte del autocuidado.",
        "Pedir ayuda cuando la necesitamos es un signo de fortaleza, no de debilidad.",
      ] },
    },
  });
  await prisma.activity.create({
    data: {
      lessonId: lessonBienestar.id, type: "MATCHING", title: "Empareja la estrategia", order: 2,
      content: { pairs: [
        { left: "hablar con alguien de confianza", right: "🗣️" },
        { left: "dormir bien", right: "😴" },
        { left: "pedir ayuda", right: "🤝" },
      ] },
    },
  });

  // ---------------------------------------------------------------------
  // Technical demo lesson — VideoPlayer QA only, NOT curriculum content.
  //
  // Exercises checkpoint-pause/resume, captions, transcript, playback
  // speed, and the low-res toggle against a real video file. The clip
  // (CC0 / public domain, silent, no spoken narration) is a Scottish
  // countryside montage — unrelated to the Dominican Republic — so its
  // title, unit, disclaimer banner, and this comment all make unmistakably
  // clear it is not reviewed MINERD curriculum (spec §13, §20).
  // Source: Rose Abrams, "Nature montage around Aberfeldy", CC0 1.0,
  // https://commons.wikimedia.org/wiki/File:Nature_montage_around_Aberfeldy.webm
  // ---------------------------------------------------------------------
  console.log("Seeding VideoPlayer technical-demo lesson…");

  const videoDemoLesson = await publishedLesson({
    subjectId: subjects.SCIENCE.id,
    gradeId: grades.S4.id,
    unitTitle: "Demostración técnica (no es currículo)",
    lessonTitle: "Prueba del reproductor de video — contenido de muestra",
    recommendedAge: "N/A — solo para pruebas técnicas",
    objectives: ["Verificar el reproductor de video: pausa/reanudación, subtítulos, transcripción, velocidad y modo de datos bajos"],
    vocabulary: [],
    explanation:
      "Esta lección existe únicamente para probar el componente VideoPlayer. El video es un clip de dominio público sin relación con el currículo de la República Dominicana — ver el aviso dentro del reproductor.",
  });
  await prisma.activity.create({
    data: {
      lessonId: videoDemoLesson.id,
      type: "VIDEO",
      title: "Clip de muestra (CC0)",
      order: 1,
      content: {
        introText: "Este video prueba el reproductor: subtítulos, transcripción, velocidad y modo de datos bajos.",
        demoDisclaimer:
          "Contenido de muestra con licencia CC0, sin relación con el currículo dominicano. Usado solo para probar el reproductor de video.",
      },
      mediaAssets: {
        // The original upload is 4K (3840x2160) and stalls on playback in
        // some environments — using Commons' own 480p/360p transcodes
        // instead (smaller, reliably decodable, and lets the low-res
        // toggle demo something real).
        create: {
          kind: "VIDEO",
          url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/49/Nature_montage_around_Aberfeldy.webm/Nature_montage_around_Aberfeldy.webm.480p.vp9.webm",
          lowResUrl: "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/49/Nature_montage_around_Aberfeldy.webm/Nature_montage_around_Aberfeldy.webm.360p.vp9.webm",
          captionsUrl: "/demo/nature-captions-es.vtt",
          transcript:
            "Video de muestra sin narración, usado únicamente para probar el reproductor de video (subtítulos, transcripción, velocidad y modo de datos bajos). Muestra un paisaje natural con colinas, ovejas, ganado, bosque y un río. No representa contenido curricular revisado de la República Dominicana. Fuente: Rose Abrams, \"Nature montage around Aberfeldy\", licencia CC0 1.0, Wikimedia Commons.",
          durationSec: 36,
        },
      },
    },
  });

  // ---------------------------------------------------------------------
  // Sample progress so dashboards have something real to show
  // ---------------------------------------------------------------------
  console.log("Seeding sample progress…");

  await prisma.assignment.create({
    data: { classroomId: classroom.id, lessonId: lessonColmado.id },
  });

  const readingActivity = await prisma.activity.findFirstOrThrow({
    where: { lessonId: lessonColmado.id, order: 1 },
  });
  await prisma.progressCheckpoint.create({
    data: {
      studentProfileId: josue.id,
      lessonId: lessonColmado.id,
      lastActivityId: readingActivity.id,
      positionStep: 1, // resumes at the second activity (the quiz)
      completed: false,
    },
  });

  await prisma.progressCheckpoint.create({
    data: {
      studentProfileId: valentina.id,
      lessonId: lessonFracciones.id,
      positionStep: 3,
      completed: true,
      completedAt: new Date(),
    },
  });
  const fracCompetency = await prisma.competency.findFirstOrThrow({
    where: { subjectId: subjects.MATH.id, gradeId: grades.P4.id },
  });
  await prisma.skillMastery.create({
    data: { studentProfileId: valentina.id, competencyId: fracCompetency.id, level: "PROFICIENT" },
  });

  await prisma.diagnosticAssessment.create({
    data: {
      subjectId: subjects.SPANISH.id,
      title: "Diagnóstico inicial de lectura",
      gradeBand: "Exploradores Iniciales / Lectores Principiantes",
    },
  });

  // Full catalog checked at runtime by src/lib/achievements.ts — codes here
  // must match ACHIEVEMENT_CODES exactly.
  const achievementCatalog = await Promise.all(
    [
      { code: "FIRST_LESSON", title: "Primera lección completada", description: "¡Completaste tu primera lección en Estudia RD!", iconKey: "🏅" },
      { code: "FIVE_LESSONS", title: "5 lecciones completadas", description: "¡Ya completaste 5 lecciones! Sigue así.", iconKey: "⭐" },
      { code: "TEN_LESSONS", title: "10 lecciones completadas", description: "¡10 lecciones completadas! Eres un estudiante dedicado.", iconKey: "🌟" },
      { code: "TWENTY_LESSONS", title: "20 lecciones completadas", description: "¡20 lecciones! Tu esfuerzo es admirable.", iconKey: "🏆" },
      { code: "STREAK_3", title: "Racha de 3 días", description: "Estudiaste 3 días seguidos. ¡La constancia es clave!", iconKey: "🔥" },
      { code: "STREAK_7", title: "Racha de 7 días", description: "¡Una semana completa estudiando todos los días!", iconKey: "🔥" },
      { code: "PERFECT_QUIZ", title: "Cuestionario perfecto", description: "¡Respondiste todas las preguntas correctamente!", iconKey: "🎯" },
      { code: "MULTI_SUBJECT_3", title: "Explorador de materias", description: "Completaste lecciones en 3 materias diferentes.", iconKey: "🧭" },
    ].map((a) => prisma.achievement.create({ data: a }))
  );
  const firstLessonAchievement = achievementCatalog.find((a) => a.code === "FIRST_LESSON")!;
  await prisma.studentAchievement.create({
    data: { studentProfileId: valentina.id, achievementId: firstLessonAchievement.id },
  });

  await prisma.teacherFeedback.create({
    data: {
      teacherId: teacher.id,
      studentProfileId: josue.id,
      message: "¡Josué está progresando muy bien en lectura! Sigamos practicando en casa con cuentos cortos.",
    },
  });

  // ---------------------------------------------------------------------
  // Bulk curriculum expansion — fills every grade x subject combination
  // that had zero lessons for the four core subjects (Spanish, Math,
  // Science, Social Studies), plus at least 3 grades (one per education
  // level) for every other subject. All original content, one story or
  // reading passage plus a one-question quiz per lesson. Younger grades
  // (Pre-Kínder through Preprimario) get a short narrated story; everyone
  // else gets a reading passage, matching the existing content convention.
  // ---------------------------------------------------------------------
  console.log("Seeding curriculum expansion…");

  type BulkLesson = {
    subjectKey: string;
    gradeKey: string;
    unitTitle: string;
    lessonTitle: string;
    vocabulary: string[];
    explanation: string;
    sentences: string[];
    quizPrompt: string;
    options: { label: string; correct: boolean }[];
  };

  const STORY_GRADES = new Set(["PREKINDER", "KINDER", "PREPRIMARIO"]);
  const RECOMMENDED_AGE: Record<string, string> = {
    PREKINDER: "3-4 años", KINDER: "4-5 años", PREPRIMARIO: "5-6 años",
    P1: "6-7 años", P2: "7-8 años", P3: "8-9 años", P4: "9-10 años", P5: "10-11 años", P6: "11-12 años",
    S1: "12-13 años", S2: "13-14 años", S3: "14-15 años", S4: "15-16 años", S5: "16-17 años", S6: "17-18 años",
  };

  const bulkLessons: BulkLesson[] = [
    // --- Lengua Española y Alfabetización ---
    { subjectKey: "SPANISH", gradeKey: "P3", unitTitle: "Vocabulario", lessonTitle: "Los sinónimos", vocabulary: ["sinónimo", "feliz", "contento"], explanation: "Los estudiantes aprenden qué es un sinónimo con ejemplos cotidianos.", sentences: ["Un sinónimo es una palabra que significa casi lo mismo que otra.", "Por ejemplo, feliz y contento son sinónimos.", "Grande y enorme también son sinónimos.", "Usar sinónimos ayuda a que nuestros cuentos sean más interesantes."], quizPrompt: "¿Cuál palabra es sinónimo de 'feliz'?", options: [{ label: "Contento", correct: true }, { label: "Triste", correct: false }, { label: "Cansado", correct: false }] },
    { subjectKey: "SPANISH", gradeKey: "P4", unitTitle: "Gramática", lessonTitle: "Tipos de oraciones", vocabulary: ["afirmativa", "negativa", "interrogativa"], explanation: "Introducción a los tipos básicos de oraciones según su intención.", sentences: ["Una oración puede ser afirmativa, negativa o interrogativa.", "'El perro corre' es una oración afirmativa.", "'El perro no corre' es una oración negativa.", "'¿El perro corre?' es una oración interrogativa."], quizPrompt: "¿Qué tipo de oración es '¿Vienes a jugar?'?", options: [{ label: "Interrogativa", correct: true }, { label: "Negativa", correct: false }, { label: "Afirmativa", correct: false }] },
    { subjectKey: "SPANISH", gradeKey: "P5", unitTitle: "Narrativa", lessonTitle: "El cuento y sus partes", vocabulary: ["inicio", "desarrollo", "final"], explanation: "Estructura básica de un cuento: inicio, desarrollo y final.", sentences: ["Todo cuento tiene inicio, desarrollo y final.", "En el inicio conocemos a los personajes y el lugar.", "En el desarrollo ocurre el problema de la historia.", "En el final el problema se resuelve."], quizPrompt: "¿En qué parte del cuento se resuelve el problema?", options: [{ label: "El final", correct: true }, { label: "El inicio", correct: false }, { label: "El desarrollo", correct: false }] },
    { subjectKey: "SPANISH", gradeKey: "P6", unitTitle: "Géneros textuales", lessonTitle: "Biografías breves", vocabulary: ["biografía", "investigar"], explanation: "Qué es una biografía y para qué sirve.", sentences: ["Una biografía cuenta la vida de una persona real.", "Incluye dónde y cuándo nació, y lo que hizo de importante.", "Las biografías nos ayudan a conocer la historia a través de las personas.", "Escribir una biografía requiere investigar datos verdaderos."], quizPrompt: "¿Qué cuenta una biografía?", options: [{ label: "La vida de una persona real", correct: true }, { label: "Una historia inventada", correct: false }, { label: "Una receta de cocina", correct: false }] },
    { subjectKey: "SPANISH", gradeKey: "S1", unitTitle: "Literatura", lessonTitle: "Los géneros literarios", vocabulary: ["narrativa", "poesía", "teatro"], explanation: "Panorama de los tres grandes géneros literarios.", sentences: ["Los géneros literarios son formas de clasificar los textos según su estilo.", "La narrativa cuenta historias, como los cuentos y las novelas.", "La poesía usa el ritmo y las imágenes para expresar emociones.", "El teatro se escribe para ser representado por actores."], quizPrompt: "¿Qué género literario se escribe para ser representado por actores?", options: [{ label: "El teatro", correct: true }, { label: "La poesía", correct: false }, { label: "La narrativa", correct: false }] },
    { subjectKey: "SPANISH", gradeKey: "S2", unitTitle: "Redacción", lessonTitle: "El ensayo", vocabulary: ["ensayo", "argumento", "conclusión"], explanation: "Estructura y propósito del ensayo como género de opinión.", sentences: ["El ensayo es un texto donde el autor expresa su opinión sobre un tema.", "Un buen ensayo presenta una idea principal y la respalda con argumentos.", "El ensayo suele tener introducción, desarrollo y conclusión.", "Escribir ensayos ayuda a organizar y defender nuestras ideas."], quizPrompt: "¿Qué expresa principalmente un ensayo?", options: [{ label: "La opinión del autor sobre un tema", correct: true }, { label: "Solo datos sin opinión", correct: false }, { label: "Una lista de personajes", correct: false }] },
    { subjectKey: "SPANISH", gradeKey: "S3", unitTitle: "Literatura dominicana", lessonTitle: "La literatura dominicana", vocabulary: ["identidad", "tradición"], explanation: "Panorama general de la literatura dominicana y su relación con la identidad nacional.", sentences: ["La literatura dominicana incluye poesía, cuentos y novelas escritos por autores del país.", "A través de los años, muchos escritores dominicanos han contado historias sobre la identidad nacional.", "La literatura dominicana refleja la cultura, la historia y las tradiciones de la isla.", "Leer autores dominicanos nos ayuda a conocer mejor nuestra propia cultura."], quizPrompt: "¿Qué refleja la literatura dominicana?", options: [{ label: "La cultura y la historia del país", correct: true }, { label: "Solo cuentos de otros países", correct: false }, { label: "Únicamente temas de matemáticas", correct: false }] },
    { subjectKey: "SPANISH", gradeKey: "S4", unitTitle: "Redacción avanzada", lessonTitle: "Técnicas de redacción", vocabulary: ["párrafo", "conector", "claridad"], explanation: "Técnicas para organizar ideas y mejorar la claridad de un texto.", sentences: ["Una buena redacción organiza las ideas de forma clara y ordenada.", "Cada párrafo debe desarrollar una sola idea principal.", "Revisar y corregir el texto mejora la claridad del mensaje.", "Usar conectores como 'además' o 'sin embargo' ayuda a unir las ideas."], quizPrompt: "¿Qué debe desarrollar cada párrafo?", options: [{ label: "Una sola idea principal", correct: true }, { label: "Varias ideas sin orden", correct: false }, { label: "Ninguna idea concreta", correct: false }] },
    { subjectKey: "SPANISH", gradeKey: "S5", unitTitle: "Comprensión lectora", lessonTitle: "Análisis de textos", vocabulary: ["tema", "tono", "propósito"], explanation: "Cómo analizar el mensaje, la estructura y la intención de un texto.", sentences: ["Analizar un texto significa comprender su mensaje, estructura e intención.", "Se debe identificar el tema principal y los argumentos que lo sostienen.", "También es importante notar el tono y el propósito del autor.", "El análisis de textos mejora la comprensión lectora."], quizPrompt: "¿Qué se identifica al analizar un texto?", options: [{ label: "El tema principal y sus argumentos", correct: true }, { label: "Solo el número de páginas", correct: false }, { label: "El color de la portada", correct: false }] },
    { subjectKey: "SPANISH", gradeKey: "S6", unitTitle: "Comunicación", lessonTitle: "Comunicación oral y debate", vocabulary: ["debate", "postura", "argumento"], explanation: "Habilidades para comunicarse oralmente y participar en un debate con respeto.", sentences: ["La comunicación oral efectiva requiere hablar con claridad y escuchar con atención.", "En un debate, cada participante defiende su postura con argumentos y respeto.", "Es importante escuchar otros puntos de vista antes de responder.", "Practicar la comunicación oral prepara para la vida universitaria y laboral."], quizPrompt: "¿Qué se debe hacer antes de responder en un debate?", options: [{ label: "Escuchar el punto de vista del otro", correct: true }, { label: "Interrumpir de inmediato", correct: false }, { label: "Ignorar al otro participante", correct: false }] },

    // --- Matemática ---
    { subjectKey: "MATH", gradeKey: "KINDER", unitTitle: "Números", lessonTitle: "Contar hasta 10", vocabulary: ["contar", "número"], explanation: "Conteo del uno al diez usando los dedos como apoyo.", sentences: ["Podemos contar del uno al diez usando los dedos de las manos.", "Uno, dos, tres, cuatro, cinco…", "Seis, siete, ocho, nueve, diez.", "Contar nos ayuda a saber cuántas cosas tenemos."], quizPrompt: "¿Qué número viene después del 7?", options: [{ label: "8", correct: true }, { label: "6", correct: false }, { label: "10", correct: false }] },
    { subjectKey: "MATH", gradeKey: "P5", unitTitle: "Números decimales", lessonTitle: "Los números decimales", vocabulary: ["decimal", "punto decimal"], explanation: "Qué es un número decimal y cómo se identifica su parte entera y decimal.", sentences: ["Un número decimal tiene una parte entera y una parte decimal separadas por un punto.", "Por ejemplo, en 3.5 el 3 es la parte entera y el 5 es la parte decimal.", "Los decimales se usan para representar cantidades que no son números completos.", "Podemos sumar y restar decimales igual que los números enteros."], quizPrompt: "En el número 4.7, ¿cuál es la parte decimal?", options: [{ label: "7", correct: true }, { label: "4", correct: false }, { label: "47", correct: false }] },
    { subjectKey: "MATH", gradeKey: "P6", unitTitle: "Porcentajes", lessonTitle: "Los porcentajes", vocabulary: ["porcentaje", "por ciento"], explanation: "Introducción al concepto de porcentaje y su uso cotidiano.", sentences: ["Un porcentaje representa una parte de cien.", "El símbolo % significa 'por ciento'.", "Si 50 de 100 estudiantes tienen un lápiz, eso es el 50%.", "Los porcentajes se usan todos los días, como en descuentos de tiendas."], quizPrompt: "¿Qué significa el símbolo %?", options: [{ label: "Por ciento", correct: true }, { label: "Por mil", correct: false }, { label: "Por diez", correct: false }] },
    { subjectKey: "MATH", gradeKey: "S1", unitTitle: "Álgebra", lessonTitle: "Ecuaciones lineales simples", vocabulary: ["ecuación", "incógnita", "despejar"], explanation: "Resolución de ecuaciones lineales sencillas con una incógnita.", sentences: ["Una ecuación lineal tiene una incógnita, generalmente representada con la letra x.", "Para resolverla, despejamos x hasta dejarla sola en un lado de la igualdad.", "Por ejemplo, en x + 3 = 8, restamos 3 en ambos lados para obtener x = 5.", "Practicar ecuaciones ayuda a desarrollar el pensamiento lógico."], quizPrompt: "Si x + 4 = 10, ¿cuánto vale x?", options: [{ label: "6", correct: true }, { label: "14", correct: false }, { label: "4", correct: false }] },
    { subjectKey: "MATH", gradeKey: "S2", unitTitle: "Geometría", lessonTitle: "Perímetro y área", vocabulary: ["perímetro", "área"], explanation: "Diferencia entre perímetro y área, con el ejemplo del rectángulo.", sentences: ["El perímetro es la suma de todos los lados de una figura.", "El área mide el espacio que ocupa una figura en el plano.", "Para un rectángulo, el área se calcula multiplicando base por altura.", "Perímetro y área se usan para medir terrenos y construcciones."], quizPrompt: "¿Cómo se calcula el área de un rectángulo?", options: [{ label: "Base por altura", correct: true }, { label: "Base más altura", correct: false }, { label: "Base menos altura", correct: false }] },
    { subjectKey: "MATH", gradeKey: "S3", unitTitle: "Razones y proporciones", lessonTitle: "Razones y proporciones", vocabulary: ["razón", "proporción"], explanation: "Qué son las razones y proporciones y cómo se usan.", sentences: ["Una razón compara dos cantidades, como 2 a 3.", "Una proporción indica que dos razones son iguales.", "Las proporciones se usan para hacer recetas más grandes o pequeñas.", "Resolver proporciones ayuda a comparar cantidades de forma justa."], quizPrompt: "¿Qué indica una proporción?", options: [{ label: "Que dos razones son iguales", correct: true }, { label: "Que dos números son diferentes", correct: false }, { label: "Que un número es negativo", correct: false }] },
    { subjectKey: "MATH", gradeKey: "S4", unitTitle: "Funciones", lessonTitle: "Funciones básicas", vocabulary: ["función", "valor de entrada", "valor de salida"], explanation: "Introducción al concepto de función matemática.", sentences: ["Una función relaciona cada valor de entrada con un único valor de salida.", "Se puede representar con una fórmula, como y = 2x.", "Las funciones se usan para modelar situaciones de la vida real.", "Graficar una función ayuda a visualizar su comportamiento."], quizPrompt: "En la función y = 2x, si x = 3, ¿cuánto vale y?", options: [{ label: "6", correct: true }, { label: "5", correct: false }, { label: "9", correct: false }] },
    { subjectKey: "MATH", gradeKey: "S5", unitTitle: "Estadística", lessonTitle: "Estadística: el promedio", vocabulary: ["promedio", "media", "dato"], explanation: "Cómo calcular e interpretar el promedio de un conjunto de datos.", sentences: ["El promedio, o media, se calcula sumando todos los valores y dividiendo entre la cantidad de datos.", "Por ejemplo, el promedio de 4, 6 y 8 es 6.", "El promedio ayuda a resumir un conjunto de datos con un solo número.", "Se usa en calificaciones, deportes y muchas áreas de la vida diaria."], quizPrompt: "¿Cuál es el promedio de 2, 4 y 6?", options: [{ label: "4", correct: true }, { label: "6", correct: false }, { label: "2", correct: false }] },
    { subjectKey: "MATH", gradeKey: "S6", unitTitle: "Finanzas personales", lessonTitle: "Finanzas personales básicas", vocabulary: ["presupuesto", "ahorro"], explanation: "Conceptos básicos de presupuesto y ahorro para la vida adulta.", sentences: ["Un presupuesto es un plan para organizar los ingresos y los gastos.", "Ahorrar significa guardar una parte del dinero para el futuro.", "Comparar precios antes de comprar ayuda a gastar de forma inteligente.", "Entender las finanzas personales prepara para tomar buenas decisiones económicas."], quizPrompt: "¿Qué es un presupuesto?", options: [{ label: "Un plan para organizar ingresos y gastos", correct: true }, { label: "Un tipo de préstamo", correct: false }, { label: "Un impuesto obligatorio", correct: false }] },

    // --- Ciencias Naturales ---
    { subjectKey: "SCIENCE", gradeKey: "PREKINDER", unitTitle: "Mi cuerpo", lessonTitle: "Mis cinco sentidos", vocabulary: ["ver", "oír", "oler", "sentir"], explanation: "Los cinco sentidos y para qué sirve cada uno.", sentences: ["Con los ojos vemos los colores y las formas.", "Con los oídos escuchamos la música y las voces.", "Con la nariz olemos las flores y la comida.", "Con la piel sentimos si algo está frío o caliente."], quizPrompt: "¿Con qué parte del cuerpo escuchamos?", options: [{ label: "Los oídos", correct: true }, { label: "Los ojos", correct: false }, { label: "La nariz", correct: false }] },
    { subjectKey: "SCIENCE", gradeKey: "KINDER", unitTitle: "Los animales", lessonTitle: "Los animales de la granja", vocabulary: ["vaca", "gallina", "caballo"], explanation: "Animales comunes de la granja y los sonidos o productos que dan.", sentences: ["La vaca nos da leche y dice 'muu'.", "La gallina pone huevos y dice 'clo clo'.", "El caballo corre rápido por el campo.", "En la granja viven muchos animales que nos ayudan."], quizPrompt: "¿Qué animal nos da leche?", options: [{ label: "La vaca", correct: true }, { label: "La gallina", correct: false }, { label: "El caballo", correct: false }] },
    { subjectKey: "SCIENCE", gradeKey: "PREPRIMARIO", unitTitle: "El agua", lessonTitle: "El ciclo del agua", vocabulary: ["vapor", "nube", "lluvia"], explanation: "Las etapas básicas del ciclo del agua.", sentences: ["El sol calienta el agua del mar y la convierte en vapor.", "El vapor sube al cielo y forma las nubes.", "Cuando las nubes se llenan, cae la lluvia.", "El agua de lluvia vuelve a los ríos y al mar."], quizPrompt: "¿Qué forma las nubes en el cielo?", options: [{ label: "El vapor de agua", correct: true }, { label: "Las piedras", correct: false }, { label: "El viento solo", correct: false }] },
    { subjectKey: "SCIENCE", gradeKey: "P1", unitTitle: "Las plantas", lessonTitle: "Las partes de una planta", vocabulary: ["raíz", "tallo", "hoja", "flor"], explanation: "Las partes principales de una planta y su función.", sentences: ["La raíz sostiene la planta y absorbe agua del suelo.", "El tallo sostiene las hojas y las flores.", "Las hojas usan la luz del sol para producir alimento.", "Las flores producen las semillas de nuevas plantas."], quizPrompt: "¿Qué parte de la planta absorbe agua del suelo?", options: [{ label: "La raíz", correct: true }, { label: "La flor", correct: false }, { label: "La hoja", correct: false }] },
    { subjectKey: "SCIENCE", gradeKey: "P2", unitTitle: "El cuerpo humano", lessonTitle: "El cuerpo humano", vocabulary: ["corazón", "pulmones", "huesos"], explanation: "Órganos principales del cuerpo humano y su función básica.", sentences: ["El corazón bombea la sangre por todo el cuerpo.", "Los pulmones nos ayudan a respirar aire.", "Los huesos forman el esqueleto que sostiene el cuerpo.", "Los músculos nos permiten movernos."], quizPrompt: "¿Qué órgano bombea la sangre?", options: [{ label: "El corazón", correct: true }, { label: "Los pulmones", correct: false }, { label: "Los huesos", correct: false }] },
    { subjectKey: "SCIENCE", gradeKey: "P6", unitTitle: "El universo", lessonTitle: "El sistema solar", vocabulary: ["sistema solar", "planeta", "Tierra"], explanation: "Introducción al sistema solar y la posición de la Tierra.", sentences: ["El sistema solar está formado por el Sol y los planetas que giran a su alrededor.", "La Tierra es el tercer planeta desde el Sol.", "Cada planeta tarda un tiempo diferente en dar una vuelta completa al Sol.", "Los astronautas estudian el espacio para aprender más sobre el sistema solar."], quizPrompt: "¿Qué planeta es el tercero desde el Sol?", options: [{ label: "La Tierra", correct: true }, { label: "Marte", correct: false }, { label: "Júpiter", correct: false }] },

    // --- Ciencias Sociales ---
    { subjectKey: "SOCIAL", gradeKey: "PREKINDER", unitTitle: "Mi familia", lessonTitle: "Mi familia", vocabulary: ["familia", "cuidar"], explanation: "El concepto de familia y su importancia.", sentences: ["Mi familia está formada por las personas que me cuidan y me quieren.", "Cada familia es diferente y especial.", "En mi familia compartimos comidas y momentos felices.", "Es importante respetar y ayudar a nuestra familia."], quizPrompt: "¿Qué hacemos en familia?", options: [{ label: "Compartir momentos felices", correct: true }, { label: "Ignorarnos", correct: false }, { label: "Pelear siempre", correct: false }] },
    { subjectKey: "SOCIAL", gradeKey: "KINDER", unitTitle: "Mi comunidad", lessonTitle: "Mi comunidad", vocabulary: ["comunidad", "vecino"], explanation: "Qué es una comunidad y quiénes la conforman.", sentences: ["Mi comunidad es el lugar donde vivo junto a mis vecinos.", "En la comunidad hay escuelas, parques y tiendas.", "Todos debemos cuidar y respetar nuestra comunidad.", "Ayudar a los vecinos hace la comunidad más feliz."], quizPrompt: "¿Quiénes viven en mi comunidad?", options: [{ label: "Mis vecinos", correct: true }, { label: "Solo mi familia", correct: false }, { label: "Nadie", correct: false }] },
    { subjectKey: "SOCIAL", gradeKey: "PREPRIMARIO", unitTitle: "Símbolos patrios", lessonTitle: "Los símbolos patrios", vocabulary: ["bandera", "escudo", "himno"], explanation: "Los símbolos patrios dominicanos y su significado.", sentences: ["La bandera dominicana tiene los colores azul, rojo y blanco.", "El escudo nacional representa la historia y los valores del país.", "El himno nacional es la canción que representa a la República Dominicana.", "Debemos respetar nuestros símbolos patrios."], quizPrompt: "¿Qué colores tiene la bandera dominicana?", options: [{ label: "Azul, rojo y blanco", correct: true }, { label: "Verde y amarillo", correct: false }, { label: "Negro y gris", correct: false }] },
    { subjectKey: "SOCIAL", gradeKey: "P2", unitTitle: "Mi entorno", lessonTitle: "Mi barrio", vocabulary: ["barrio", "vecino"], explanation: "El barrio como espacio de convivencia cercana.", sentences: ["Mi barrio tiene calles, casas y lugares donde la gente se reúne.", "En mi barrio hay vecinos que se ayudan entre sí.", "Cuidar las calles y los parques mantiene el barrio limpio y agradable.", "Cada barrio tiene su propia historia y tradiciones."], quizPrompt: "¿Qué ayuda a mantener limpio un barrio?", options: [{ label: "Cuidar las calles y parques", correct: true }, { label: "Tirar basura en la calle", correct: false }, { label: "No hacer nada", correct: false }] },
    { subjectKey: "SOCIAL", gradeKey: "P3", unitTitle: "Historia local", lessonTitle: "La historia de mi pueblo", vocabulary: ["historia", "tradición", "raíces"], explanation: "Por qué es importante conocer la historia del propio pueblo o ciudad.", sentences: ["Cada pueblo o ciudad tiene una historia sobre cómo se fundó.", "Conocer la historia de nuestro pueblo nos ayuda a valorar nuestras raíces.", "Los pueblos cambian con el tiempo, pero conservan tradiciones importantes.", "Los abuelos son una buena fuente para aprender sobre la historia local."], quizPrompt: "¿Quiénes son una buena fuente para conocer la historia de un pueblo?", options: [{ label: "Los abuelos", correct: true }, { label: "Los extraterrestres", correct: false }, { label: "Nadie", correct: false }] },
    { subjectKey: "SOCIAL", gradeKey: "P5", unitTitle: "Geografía dominicana", lessonTitle: "La geografía de República Dominicana", vocabulary: ["isla", "montaña", "Pico Duarte"], explanation: "Rasgos geográficos principales de República Dominicana.", sentences: ["República Dominicana está ubicada en la isla La Española, en el mar Caribe.", "El país tiene montañas, valles, ríos y playas.", "El Pico Duarte es la montaña más alta del Caribe.", "La geografía influye en el clima y las actividades de cada región."], quizPrompt: "¿Cuál es la montaña más alta del Caribe?", options: [{ label: "El Pico Duarte", correct: true }, { label: "El Pico Isabel", correct: false }, { label: "El Monte Grande", correct: false }] },

    // --- Ciudadanía y Valores Dominicanos ---
    { subjectKey: "CITIZENSHIP", gradeKey: "PREPRIMARIO", unitTitle: "Convivencia", lessonTitle: "Ser buen compañero", vocabulary: ["compartir", "ayudar"], explanation: "Comportamientos básicos de un buen compañero.", sentences: ["Ser buen compañero significa compartir y ayudar a los demás.", "Cuando alguien se cae, un buen compañero lo ayuda a levantarse.", "Compartir los juguetes hace que todos se diviertan más.", "Tratar a los demás con respeto nos hace mejores amigos."], quizPrompt: "¿Qué hace un buen compañero cuando alguien se cae?", options: [{ label: "Lo ayuda a levantarse", correct: true }, { label: "Se ríe de él", correct: false }, { label: "Se va corriendo", correct: false }] },
    { subjectKey: "CITIZENSHIP", gradeKey: "P3", unitTitle: "Derechos y deberes", lessonTitle: "Los derechos y deberes del niño", vocabulary: ["derecho", "deber"], explanation: "Derechos y deberes básicos de los niños.", sentences: ["Todos los niños tienen derecho a la educación, la salud y el juego.", "Junto a los derechos, también existen deberes, como respetar a los demás.", "Cumplir nuestros deberes ayuda a que todos vivamos mejor juntos.", "Conocer nuestros derechos nos permite defenderlos cuando sea necesario."], quizPrompt: "¿Cuál es un derecho de todos los niños?", options: [{ label: "La educación", correct: true }, { label: "Trabajar todo el día", correct: false }, { label: "No jugar nunca", correct: false }] },
    { subjectKey: "CITIZENSHIP", gradeKey: "S2", unitTitle: "Democracia", lessonTitle: "La democracia y el voto", vocabulary: ["democracia", "voto", "ciudadano"], explanation: "Concepto de democracia y el papel del voto.", sentences: ["La democracia es un sistema donde los ciudadanos eligen a sus representantes por medio del voto.", "Votar es un derecho y también una responsabilidad ciudadana.", "En una democracia, se respetan las opiniones diferentes.", "Participar en la vida democrática fortalece a un país."], quizPrompt: "¿Cómo eligen los ciudadanos a sus representantes en una democracia?", options: [{ label: "Por medio del voto", correct: true }, { label: "Por sorteo", correct: false }, { label: "Por herencia familiar", correct: false }] },

    // --- Estudios Bíblicos (valores generales, sin citar textos religiosos específicos) ---
    { subjectKey: "BIBLE", gradeKey: "PREPRIMARIO", unitTitle: "Valores", lessonTitle: "Valores de bondad y compartir", vocabulary: ["bondad", "compartir"], explanation: "Valores de bondad y generosidad presentados de forma sencilla.", sentences: ["Ser bondadoso significa tratar a los demás con amabilidad.", "Compartir lo que tenemos con otros nos hace felices.", "Ayudar a quien lo necesita es un acto de bondad.", "Practicar la bondad todos los días hace del mundo un lugar mejor."], quizPrompt: "¿Qué significa ser bondadoso?", options: [{ label: "Tratar a los demás con amabilidad", correct: true }, { label: "Ignorar a los demás", correct: false }, { label: "Solo pensar en uno mismo", correct: false }] },
    { subjectKey: "BIBLE", gradeKey: "P3", unitTitle: "Valores", lessonTitle: "Historias de valentía y fe", vocabulary: ["valentía", "fe", "esperanza"], explanation: "Valores de valentía y esperanza presentados de forma general.", sentences: ["Muchas historias nos enseñan que la valentía significa hacer lo correcto aunque sea difícil.", "La fe nos ayuda a mantener la esperanza en momentos difíciles.", "Actuar con honestidad y valentía nos ayuda a crecer como personas.", "Estas enseñanzas se han transmitido de generación en generación."], quizPrompt: "¿Qué significa actuar con valentía?", options: [{ label: "Hacer lo correcto aunque sea difícil", correct: true }, { label: "Evitar siempre los retos", correct: false }, { label: "Mentir para evitar problemas", correct: false }] },
    { subjectKey: "BIBLE", gradeKey: "S2", unitTitle: "Ética", lessonTitle: "Ética y valores de vida", vocabulary: ["ética", "honestidad", "responsabilidad"], explanation: "Introducción a la ética y los valores que guían la conducta.", sentences: ["La ética estudia lo que consideramos correcto e incorrecto en nuestras acciones.", "Valores como la honestidad, el respeto y la responsabilidad guían nuestra conducta.", "Vivir según nuestros valores nos ayuda a construir relaciones de confianza.", "Reflexionar sobre nuestras decisiones fortalece nuestro carácter."], quizPrompt: "¿Qué estudia la ética?", options: [{ label: "Lo correcto e incorrecto de nuestras acciones", correct: true }, { label: "Solo las matemáticas", correct: false }, { label: "Los colores del arcoíris", correct: false }] },

    // --- Alfabetización Digital y Tecnología ---
    { subjectKey: "DIGITAL", gradeKey: "PREPRIMARIO", unitTitle: "Tecnología segura", lessonTitle: "Uso seguro de la tableta", vocabulary: ["tableta", "permiso"], explanation: "Reglas básicas de uso seguro de dispositivos con apoyo de un adulto.", sentences: ["Usamos la tableta solo con permiso de un adulto.", "Tocamos la pantalla con cuidado y suavidad.", "No compartimos información personal con desconocidos.", "Usar la tecnología con responsabilidad nos mantiene seguros."], quizPrompt: "¿Con quién debemos pedir permiso antes de usar la tableta?", options: [{ label: "Un adulto", correct: true }, { label: "Nadie", correct: false }, { label: "Un desconocido", correct: false }] },
    { subjectKey: "DIGITAL", gradeKey: "P3", unitTitle: "La computadora", lessonTitle: "Partes de la computadora", vocabulary: ["pantalla", "teclado", "ratón"], explanation: "Partes principales de una computadora y su función.", sentences: ["La pantalla muestra las imágenes y el texto de la computadora.", "El teclado se usa para escribir letras y números.", "El ratón nos ayuda a movernos y seleccionar cosas en la pantalla.", "Conocer las partes de la computadora nos ayuda a usarla mejor."], quizPrompt: "¿Qué parte de la computadora se usa para escribir?", options: [{ label: "El teclado", correct: true }, { label: "El ratón", correct: false }, { label: "La pantalla", correct: false }] },
    { subjectKey: "DIGITAL", gradeKey: "S3", unitTitle: "Seguridad digital", lessonTitle: "Seguridad en internet", vocabulary: ["contraseña", "seguridad"], explanation: "Buenas prácticas de seguridad al usar internet.", sentences: ["Nunca debemos compartir contraseñas ni datos personales con desconocidos en internet.", "Es importante verificar la fuente antes de creer o compartir información.", "Usar contraseñas seguras protege nuestras cuentas de intrusos.", "Pensar antes de publicar algo evita problemas futuros."], quizPrompt: "¿Qué no debemos compartir con desconocidos en internet?", options: [{ label: "Contraseñas y datos personales", correct: true }, { label: "Nuestra tarea de matemáticas", correct: false }, { label: "Fotos de paisajes", correct: false }] },

    // --- Educación Artística ---
    { subjectKey: "ART", gradeKey: "KINDER", unitTitle: "El color", lessonTitle: "Los colores primarios", vocabulary: ["rojo", "azul", "amarillo"], explanation: "Los colores primarios y cómo se combinan.", sentences: ["Los colores primarios son el rojo, el azul y el amarillo.", "Mezclando colores primarios podemos crear nuevos colores.", "Rojo y amarillo juntos forman el color naranja.", "Pintar con colores primarios es muy divertido."], quizPrompt: "¿Cuáles son los colores primarios?", options: [{ label: "Rojo, azul y amarillo", correct: true }, { label: "Verde, morado y gris", correct: false }, { label: "Negro y blanco", correct: false }] },
    { subjectKey: "ART", gradeKey: "P3", unitTitle: "Formas y figuras", lessonTitle: "Formas y figuras en el arte", vocabulary: ["círculo", "cuadrado", "triángulo"], explanation: "Formas geométricas básicas usadas en el arte.", sentences: ["Los artistas usan formas como círculos, cuadrados y triángulos en sus obras.", "Combinar formas diferentes puede crear dibujos interesantes.", "El color y la forma juntos dan vida a una obra de arte.", "Observar el arte a nuestro alrededor despierta la creatividad."], quizPrompt: "¿Qué forma tiene tres lados?", options: [{ label: "El triángulo", correct: true }, { label: "El círculo", correct: false }, { label: "El cuadrado", correct: false }] },
    { subjectKey: "ART", gradeKey: "S4", unitTitle: "Arte y cultura", lessonTitle: "El arte dominicano", vocabulary: ["artesanía", "identidad cultural"], explanation: "El arte dominicano como expresión de la cultura del país.", sentences: ["El arte dominicano incluye pintura, escultura y artesanía inspiradas en la cultura del país.", "Muchos artistas dominicanos representan el color y la vida cotidiana de la isla en sus obras.", "El arte popular, como las máscaras de carnaval, forma parte de la identidad cultural.", "Conocer el arte dominicano nos conecta con nuestra historia y tradiciones."], quizPrompt: "¿Qué representa el arte dominicano según el texto?", options: [{ label: "La cultura y vida cotidiana del país", correct: true }, { label: "Solo paisajes de otros continentes", correct: false }, { label: "Nada relacionado con la isla", correct: false }] },

    // --- Educación Física, Salud y Bienestar ---
    { subjectKey: "PE", gradeKey: "KINDER", unitTitle: "Movimiento", lessonTitle: "Movernos y jugar", vocabulary: ["correr", "saltar"], explanation: "El movimiento y el juego como parte de una vida activa.", sentences: ["Correr, saltar y bailar son formas de ejercitar nuestro cuerpo.", "Jugar afuera nos ayuda a estar fuertes y sanos.", "Es importante tomar agua después de movernos mucho.", "Moverse todos los días nos hace sentir contentos."], quizPrompt: "¿Qué debemos tomar después de movernos mucho?", options: [{ label: "Agua", correct: true }, { label: "Nada", correct: false }, { label: "Solo dulces", correct: false }] },
    { subjectKey: "PE", gradeKey: "P3", unitTitle: "Ejercicio seguro", lessonTitle: "El calentamiento antes de hacer ejercicio", vocabulary: ["calentamiento", "estirar"], explanation: "Por qué es importante calentar antes de hacer ejercicio.", sentences: ["Calentar el cuerpo antes de hacer ejercicio prepara los músculos para moverse.", "Estirar los brazos y las piernas ayuda a evitar lesiones.", "Un buen calentamiento dura unos minutos antes de la actividad principal.", "Cuidar nuestro cuerpo nos permite jugar y hacer deporte de forma segura."], quizPrompt: "¿Para qué sirve el calentamiento antes de hacer ejercicio?", options: [{ label: "Para preparar los músculos y evitar lesiones", correct: true }, { label: "Para cansarse más rápido", correct: false }, { label: "No sirve para nada", correct: false }] },
    { subjectKey: "PE", gradeKey: "S2", unitTitle: "Vida saludable", lessonTitle: "Hábitos de vida saludable", vocabulary: ["alimentación", "descanso"], explanation: "Hábitos que contribuyen a una vida saludable.", sentences: ["Una vida saludable incluye buena alimentación, ejercicio regular y suficiente descanso.", "Comer frutas y vegetales aporta vitaminas importantes para el cuerpo.", "Dormir lo suficiente ayuda a la concentración y al buen ánimo.", "Mantener hábitos saludables mejora nuestra calidad de vida a largo plazo."], quizPrompt: "¿Qué aportan las frutas y vegetales al cuerpo?", options: [{ label: "Vitaminas importantes", correct: true }, { label: "Solo azúcar", correct: false }, { label: "Nada beneficioso", correct: false }] },

    // --- Formación Humana y Religiosa Integral ---
    { subjectKey: "RELIGIOUS", gradeKey: "KINDER", unitTitle: "Valores humanos", lessonTitle: "Ser agradecido", vocabulary: ["gratitud", "gracias"], explanation: "El valor de la gratitud en la vida diaria.", sentences: ["Decir 'gracias' es una forma de mostrar aprecio por los demás.", "Ser agradecido nos ayuda a valorar lo que tenemos.", "Podemos agradecer a nuestra familia, amigos y maestros.", "La gratitud nos hace sentir más felices."], quizPrompt: "¿Qué palabra mostramos cuando somos agradecidos?", options: [{ label: "Gracias", correct: true }, { label: "Nunca", correct: false }, { label: "Después", correct: false }] },
    { subjectKey: "RELIGIOUS", gradeKey: "P3", unitTitle: "Convivencia", lessonTitle: "El respeto a los demás", vocabulary: ["respeto", "escuchar"], explanation: "El respeto como base de la buena convivencia.", sentences: ["Respetar a los demás significa tratarlos con consideración y buena actitud.", "Escuchar a otra persona sin interrumpir es una muestra de respeto.", "El respeto también incluye aceptar las diferencias entre las personas.", "Cuando nos respetamos, es más fácil convivir en paz."], quizPrompt: "¿Qué es una muestra de respeto hacia los demás?", options: [{ label: "Escuchar sin interrumpir", correct: true }, { label: "Gritar más fuerte", correct: false }, { label: "Ignorar a la persona", correct: false }] },
    { subjectKey: "RELIGIOUS", gradeKey: "S1", unitTitle: "Valores universales", lessonTitle: "Valores universales y convivencia", vocabulary: ["justicia", "solidaridad", "convivencia"], explanation: "Valores compartidos por muchas culturas y su papel en la convivencia.", sentences: ["Valores como la honestidad, la justicia y la solidaridad son reconocidos en muchas culturas del mundo.", "Estos valores ayudan a las personas a convivir de manera pacífica.", "Practicar estos valores en la vida diaria fortalece a la comunidad.", "La convivencia armoniosa se construye con respeto mutuo."], quizPrompt: "¿Qué ayuda a construir la convivencia armoniosa?", options: [{ label: "El respeto mutuo", correct: true }, { label: "La indiferencia", correct: false }, { label: "El egoísmo", correct: false }] },

    // --- Aprendizaje Socioemocional ---
    { subjectKey: "SEL", gradeKey: "PREPRIMARIO", unitTitle: "Mis emociones", lessonTitle: "Reconocer mis emociones", vocabulary: ["alegría", "tristeza", "emoción"], explanation: "Identificar y nombrar las emociones básicas.", sentences: ["A veces sentimos alegría, tristeza, miedo o enojo.", "Todas las emociones son normales y está bien sentirlas.", "Podemos hablar sobre cómo nos sentimos con un adulto de confianza.", "Reconocer nuestras emociones nos ayuda a entendernos mejor."], quizPrompt: "¿Qué podemos hacer cuando sentimos una emoción fuerte?", options: [{ label: "Hablar con un adulto de confianza", correct: true }, { label: "Guardarlo todo en silencio siempre", correct: false }, { label: "Ignorarlo por completo", correct: false }] },
    { subjectKey: "SEL", gradeKey: "P3", unitTitle: "Resolución de conflictos", lessonTitle: "Resolver conflictos con calma", vocabulary: ["conflicto", "calma", "solución"], explanation: "Pasos sencillos para resolver un desacuerdo con calma.", sentences: ["Cuando tenemos un desacuerdo con alguien, respirar profundo nos ayuda a calmarnos.", "Escuchar el punto de vista del otro es el primer paso para resolver un conflicto.", "Buscar una solución justa para ambas partes evita que el problema crezca.", "Pedir ayuda a un adulto es una buena opción si el conflicto es difícil de resolver."], quizPrompt: "¿Qué nos ayuda a calmarnos durante un desacuerdo?", options: [{ label: "Respirar profundo", correct: true }, { label: "Gritar más fuerte", correct: false }, { label: "Salir corriendo sin hablar", correct: false }] },
    { subjectKey: "SEL", gradeKey: "S3", unitTitle: "Bienestar emocional", lessonTitle: "El manejo del estrés", vocabulary: ["estrés", "respiración", "descanso"], explanation: "Estrategias sencillas para manejar el estrés cotidiano.", sentences: ["El estrés es una reacción natural del cuerpo ante situaciones difíciles.", "Técnicas como la respiración profunda y el ejercicio ayudan a reducir el estrés.", "Organizar el tiempo y descansar lo suficiente también disminuye la tensión.", "Hablar sobre lo que sentimos con alguien de confianza alivia el estrés."], quizPrompt: "¿Qué técnica ayuda a reducir el estrés?", options: [{ label: "La respiración profunda", correct: true }, { label: "Ignorar el problema para siempre", correct: false }, { label: "No dormir nunca", correct: false }] },

    // --- Inglés ---
    { subjectKey: "ENGLISH", gradeKey: "PREPRIMARIO", unitTitle: "Colors and numbers", lessonTitle: "Colors and numbers", vocabulary: ["red", "blue", "yellow"], explanation: "Basic color and number vocabulary in English.", sentences: ["Red, blue, and yellow are colors.", "One, two, three, four, five.", "I see a red apple.", "I can count to five."], quizPrompt: "What color is the apple?", options: [{ label: "Red", correct: true }, { label: "Blue", correct: false }, { label: "Green", correct: false }] },
    { subjectKey: "ENGLISH", gradeKey: "P3", unitTitle: "Daily routines", lessonTitle: "My daily routine", vocabulary: ["wake up", "breakfast", "school"], explanation: "Simple present tense vocabulary describing a daily routine.", sentences: ["I wake up every morning and brush my teeth.", "Then I eat breakfast with my family.", "After breakfast, I go to school.", "In the evening, I do my homework and go to sleep."], quizPrompt: "What does the person do after breakfast?", options: [{ label: "Go to school", correct: true }, { label: "Go to sleep", correct: false }, { label: "Brush teeth", correct: false }] },
    { subjectKey: "ENGLISH", gradeKey: "S4", unitTitle: "Future tense", lessonTitle: "Talking about the future", vocabulary: ["will", "going to", "plan"], explanation: "Using 'will' and 'going to' to talk about the future.", sentences: ["We use 'will' to talk about future plans and predictions.", "For example, 'I will study tomorrow' talks about a plan.", "We can also use 'going to' for plans we have already decided.", "Practicing future tense helps us talk about our goals."], quizPrompt: "Which word do we use to talk about future plans?", options: [{ label: "Will", correct: true }, { label: "Was", correct: false }, { label: "Did", correct: false }] },
  ];

  for (const bl of bulkLessons) {
    const lesson = await publishedLesson({
      subjectId: subjects[bl.subjectKey].id,
      gradeId: grades[bl.gradeKey].id,
      unitTitle: bl.unitTitle,
      lessonTitle: bl.lessonTitle,
      recommendedAge: RECOMMENDED_AGE[bl.gradeKey],
      objectives: [bl.explanation],
      vocabulary: bl.vocabulary,
      explanation: bl.explanation,
    });

    if (STORY_GRADES.has(bl.gradeKey)) {
      await prisma.activity.create({
        data: { lessonId: lesson.id, type: "NARRATED_STORY", title: "Cuento", order: 1, content: { sentences: bl.sentences } },
      });
    } else {
      const passage = bl.sentences.join(" ");
      await prisma.activity.create({
        data: {
          lessonId: lesson.id, type: "READING_PASSAGE", title: "Lee el texto", order: 1,
          content: { passage, words: passage.split(" ") },
        },
      });
    }

    const quiz = await prisma.activity.create({
      data: { lessonId: lesson.id, type: "QUIZ", title: "¿Qué aprendiste?", order: 2, content: {} },
    });
    const question = await prisma.question.create({
      data: { activityId: quiz.id, prompt: bl.quizPrompt, order: 1, explanation: null },
    });
    await prisma.answerOption.createMany({
      data: bl.options.map((o, i) => ({ questionId: question.id, label: o.label, isCorrect: o.correct, order: i + 1 })),
    });
  }

  console.log("Seed complete.");
  console.log("\nDemo accounts (password: Demo1234!):");
  console.log(`  Platform admin: ${platformAdmin.email}`);
  console.log(`  School admin:   ${schoolAdmin.email}`);
  console.log(`  Teacher:        ${teacher.email}`);
  console.log(`  Parent:         ${parent.email}`);
  console.log("  Student PIN for all demo profiles: 1234");
  console.log(`\nVideoPlayer technical-demo lesson: /student/lesson/${videoDemoLesson.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
