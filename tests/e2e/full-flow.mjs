/**
 * End-to-end smoke test covering the Phase 1 acceptance criteria (spec
 * section 20): student login without email, resume-at-checkpoint, an
 * interactive lesson (story/quiz/word-builder/matching), teacher and
 * parent visibility into progress, content-approval workflow, adult
 * registration, and accessibility settings.
 *
 * Requires the app running against a seeded database:
 *   npm run build && npm run start -- -p 3100   (in one terminal)
 *   BASE_URL=http://localhost:3100 node tests/e2e/full-flow.mjs
 */
import { chromium } from "playwright-core";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const CHROMIUM_PATH = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

function log(msg) {
  console.log("== " + msg);
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, headless: true });
  const context = await browser.newContext();
  await context.grantPermissions(["microphone"]);
  const page = await context.newPage();
  page.on("pageerror", (err) => {
    throw new Error("Uncaught client-side error: " + err.message);
  });

  const clickBtn = (name) => page.getByRole("button", { name, exact: true }).click();
  const clickLink = (name) => page.getByRole("link", { name }).click();

  // --- Parent login + PIN-based child login (no email for the child) ---
  log("Parent login");
  await page.goto(`${BASE}/login`);
  await page.fill("#email", "familia@estudiard.demo");
  await page.fill("#password", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/parent`);

  log("Select child profile and enter PIN");
  await page.goto(`${BASE}/profiles`);
  await page.getByRole("link", { name: /Josué/ }).click();
  await page.fill("#pin", "1234");
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/student`);

  const dashboard = await page.textContent("body");
  assert.match(dashboard, /Continuar aprendiendo/, "Continue Learning section must be present");

  // --- Resume exactly where a prior checkpoint left off ---
  log("Resume in-progress lesson at the saved checkpoint");
  await clickLink("▶ Continuar");
  await page.waitForURL(/\/student\/lesson\//);
  await page.waitForLoadState("networkidle");
  const resumed = await page.textContent("body");
  assert.match(resumed, /¿Qué recuerdas\?/, "Must resume at the quiz checkpoint, not activity 0");

  // --- Complete the remaining activities (quiz -> word builder -> matching) ---
  log("Complete quiz, word-builder, and matching activities");
  await clickBtn("Al colmado");
  await page.waitForTimeout(200);
  await clickBtn("Siguiente →");
  await clickBtn("Pan");
  await page.waitForTimeout(200);
  await clickBtn("Terminar");
  await page.waitForSelector("text=Ordena la oración");
  for (const word of ["Ana", "va", "al", "colmado."]) await clickBtn(word);
  await clickBtn("Comprobar");
  await page.waitForSelector("text=Empareja el vocabulario", { timeout: 5000 });
  for (const [l, r] of [["colmado", "🏪"], ["pan", "🍞"], ["peso", "💰"]]) {
    await clickBtn(l);
    await clickBtn(r);
  }
  await clickBtn("Continuar →");
  await page.waitForSelector("text=¡Lección completada!", { timeout: 5000 });
  log("Lesson completed end-to-end");

  await clickLink("Volver a mi panel");
  await clickBtn("Salir");
  await page.waitForURL(`${BASE}/profiles`);

  // --- Parent sees completion + teacher feedback ---
  log("Parent dashboard reflects completed lesson and teacher feedback");
  await page.goto(`${BASE}/parent`);
  await page.getByRole("link", { name: /Josué/ }).click();
  await page.waitForURL(/\/parent\/children\//);
  const parentView = await page.textContent("body");
  assert.match(parentView, /Completada/, "Parent must see the lesson marked complete");
  assert.match(parentView, /progresando/, "Parent must see teacher feedback");

  // --- Teacher sees classroom-level progress ---
  log("Teacher classroom view reflects student progress");
  await clickBtn("Cerrar sesión");
  await page.goto(`${BASE}/login`);
  await page.fill("#email", "maestra@estudiard.demo");
  await page.fill("#password", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/teacher`);
  await page.getByRole("link", { name: /1er Grado/ }).click();
  await page.waitForURL(/\/teacher\/classrooms\//);
  const teacherView = await page.textContent("body");
  assert.match(teacherView, /Josué/);
  assert.match(teacherView, /Completado/);
  assert.match(teacherView, /Sin comenzar/); // Diego has not started — unauthorized peeking is not exposed

  // --- Content approval workflow (admin) ---
  log("Admin curriculum workflow view");
  await clickBtn("Cerrar sesión");
  await page.goto(`${BASE}/login`);
  await page.fill("#email", "admin@estudiard.demo");
  await page.fill("#password", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/admin`);
  await page.goto(`${BASE}/admin/curriculum`);
  const curriculumView = await page.textContent("body");
  assert.match(curriculumView, /Publicado/, "Demo lessons must show as Published");

  // --- Adult self-registration ---
  log("New adult registration");
  await page.goto(`${BASE}/register`);
  await page.fill("#name", "Familia Prueba E2E");
  await page.fill("#email", `e2e-${Date.now()}@example.com`);
  await page.fill("#password", "PruebaSegura123!");
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/parent`, { timeout: 10000 });

  // --- Accessibility settings apply immediately ---
  log("Accessibility settings persist");
  await page.goto(`${BASE}/accessibility`);
  await page.check("input[name=contrast][value=high]");
  await page.click("button[type=submit]");
  await page.waitForTimeout(200);
  const contrast = await page.evaluate(() => document.documentElement.getAttribute("data-contrast"));
  assert.equal(contrast, "high");

  await browser.close();
  log("ALL E2E CHECKS PASSED");
}

main().catch((err) => {
  console.error("E2E FAILURE:", err);
  process.exit(1);
});
