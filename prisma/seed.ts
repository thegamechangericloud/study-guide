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

  const achievement = await prisma.achievement.create({
    data: {
      code: "FIRST_LESSON",
      title: "Primera lección completada",
      description: "¡Completaste tu primera lección en Estudia RD!",
      iconKey: "🏅",
    },
  });
  await prisma.studentAchievement.create({
    data: { studentProfileId: valentina.id, achievementId: achievement.id },
  });

  await prisma.teacherFeedback.create({
    data: {
      teacherId: teacher.id,
      studentProfileId: josue.id,
      message: "¡Josué está progresando muy bien en lectura! Sigamos practicando en casa con cuentos cortos.",
    },
  });

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
