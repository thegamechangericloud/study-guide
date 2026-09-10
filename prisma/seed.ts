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
