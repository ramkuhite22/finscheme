import { test, expect } from '@playwright/test';
import path from 'path';

// Helper to inject Meta Playable SDK bridge and collect events
async function setupPlayableBridge(page) {
  await page.addInitScript(() => {
    window.__capturedEvents = [];
    window._MetaPlayablesBridge = {
      postEvent: (eventName, payloadStr) => {
        window.__capturedEvents.push({
          eventName,
          payload: payloadStr ? JSON.parse(payloadStr) : {}
        });
      }
    };
  });
}

// Helper to get captured events from page context
async function getCapturedEvents(page) {
  return await page.evaluate(() => window.__capturedEvents || []);
}

test.describe('Meta Playables Verification (Local Files)', () => {

  test.beforeEach(async ({ page }) => {
    // Abort slow external assets (unsplash, fonts, tailwind cdn) to avoid test timeouts
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.includes('unsplash.com') ||
        url.includes('fonts.googleapis.com') ||
        url.includes('fonts.gstatic.com') ||
        url.includes('tailwindcss.com') ||
        url.endsWith('.png') ||
        url.endsWith('.jpg') ||
        url.endsWith('.jpeg')
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });
  });

  test('Nagpur Tour Playable Ad - Structure, Visuals and SDK Events', async ({ page }) => {
    // Setup SDK event listener
    await setupPlayableBridge(page);

    // 1. Visit the Local Nagpur Tour Page (wait only for DOM to be parsed)
    const filePath = path.resolve('pages/nagpur-tour.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded' });

    // 2. Verify Page Title
    await expect(page).toHaveTitle(/Nagpur Tour/i);

    // 3. Verify core structural elements
    const heroHeading = page.locator('h2:has-text("Welcome to Nagpur")');
    await expect(heroHeading).toBeVisible();

    const overviewHeading = page.locator('h2:has-text("Overview")');
    await expect(overviewHeading).toBeVisible();

    const fastFactsHeading = page.locator('h2:has-text("Fast Facts")');
    await expect(fastFactsHeading).toBeVisible();

    const attractionsHeading = page.locator('h2:has-text("Tourist Attractions")');
    await expect(attractionsHeading).toBeVisible();

    // 4. Verify game_ready SDK event is dispatched (rAF detection)
    // Wait a brief moment to ensure frame count threshold (3 frames) is hit
    await page.waitForTimeout(200);
    let events = await getCapturedEvents(page);
    const gameReadyEvent = events.find(e => e.eventName === 'game_ready');
    expect(gameReadyEvent).toBeDefined();
    expect(gameReadyEvent.payload.frame_count).toBeGreaterThanOrEqual(3);

    // 5. Verify first user interaction SDK event
    // Click on the "Explore Now" button to scroll to overview
    const exploreBtn = page.locator('a:has-text("Explore Now")');
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click({ force: true });

    // Verify interaction event was triggered
    events = await getCapturedEvents(page);
    const interactionEvent = events.find(e => e.eventName === 'user_interaction_start');
    expect(interactionEvent).toBeDefined();

    // 6. Verify that specific tourist attractions are rendered
    const deekshabhoomi = page.locator('h3:has-text("Deekshabhoomi")');
    await expect(deekshabhoomi).toBeVisible();

    const zeroMile = page.locator('h3:has-text("Zero Mile Stone")');
    await expect(zeroMile).toBeVisible();

    const dragonPalace = page.locator('h3:has-text("Dragon Palace Temple")');
    await expect(dragonPalace).toBeVisible();

    const orangeOrchards = page.locator('h3:has-text("Orange Orchards")');
    await expect(orangeOrchards).toBeVisible();
  });

  test('Digital Profile & Link Sharing Platforms Research - Structure, Matrix and SDK Events', async ({ page }) => {
    // Setup SDK event listener
    await setupPlayableBridge(page);

    // 1. Visit the Local Research Summary Page (wait only for DOM to be parsed)
    const filePath = path.resolve('pages/link-in-bio-research.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded' });

    // 2. Verify main header text
    const titleText = page.locator('text=Digital Link-in-Bio Platform Research');
    await expect(titleText).toBeVisible();

    // 3. Verify game_ready SDK event is dispatched
    await page.waitForTimeout(200);
    let events = await getCapturedEvents(page);
    const gameReadyEvent = events.find(e => e.eventName === 'game_ready');
    expect(gameReadyEvent).toBeDefined();

    // 4. Click somewhere to trigger user interaction event
    await page.click('body', { force: true });
    events = await getCapturedEvents(page);
    const interactionEvent = events.find(e => e.eventName === 'user_interaction_start');
    expect(interactionEvent).toBeDefined();

    // 5. Verify the existence of major players in the landscape diagram
    const linktree = page.locator('text=Linktree').first();
    await expect(linktree).toBeVisible();

    const beacons = page.locator('text=Beacons').first();
    await expect(beacons).toBeVisible();

    const taplink = page.locator('text=Taplink').first();
    await expect(taplink).toBeVisible();

    const hoppbypix = page.locator('text=Hopp by Wix');
    await expect(hoppbypix).toBeVisible();

    // 6. Verify feature matrix content
    const monetization = page.locator('text=Monetization').first();
    await expect(monetization).toBeVisible();

    const indiaGapAnalysis = page.locator('text=India Gap Analysis');
    await expect(indiaGapAnalysis).toBeVisible();

    const noUpi = page.locator('text=No UPI').first();
    await expect(noUpi).toBeVisible();

    // 7. Verify India-specific need items are rendered
    const upiIntegration = page.locator('text=UPI Integration');
    await expect(upiIntegration).toBeVisible();

    const whatsappCommerce = page.locator('text=WhatsApp Commerce');
    await expect(whatsappCommerce).toBeVisible();

    const lowDataUsage = page.locator('text=Low Data Usage');
    await expect(lowDataUsage).toBeVisible();

    // 8. Verify target user segments list
    const student = page.locator('text=Student').first();
    await expect(student).toBeVisible();

    const creator = page.locator('text=Creator').first();
    await expect(creator).toBeVisible();

    const smb = page.locator('text=SMB').first();
    await expect(smb).toBeVisible();
  });

  test('PraisonAI Research Playable Ad - Structure, Simulator and SDK Events', async ({ page }) => {
    // Setup SDK event listener
    await setupPlayableBridge(page);

    // 1. Visit the Local PraisonAI Research Page
    const filePath = path.resolve('pages/praisonai-research.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded' });

    // 2. Verify Page Title
    await expect(page).toHaveTitle(/PraisonAI Research/i);

    // 3. Verify core structural elements
    const mainHeading = page.locator('h1:has-text("24/7 AI Workforce")');
    await expect(mainHeading).toBeVisible();

    const simulatorHeading = page.locator('h2:has-text("1. Playable Agent Swarm Simulator")');
    await expect(simulatorHeading).toBeVisible();

    const architectureHeading = page.locator('h2:has-text("2. Interactive Swarm Architecture")');
    await expect(architectureHeading).toBeVisible();

    const featuresHeading = page.locator('h2:has-text("3. Features & Capabilities Matrix")');
    await expect(featuresHeading).toBeVisible();

    // 4. Verify game_ready SDK event is dispatched
    await page.waitForTimeout(200);
    let events = await getCapturedEvents(page);
    const gameReadyEvent = events.find(e => e.eventName === 'game_ready');
    expect(gameReadyEvent).toBeDefined();

    // 5. Verify user interaction SDK event
    await page.click('body');
    events = await getCapturedEvents(page);
    const interactionEvent = events.find(e => e.eventName === 'user_interaction_start');
    expect(interactionEvent).toBeDefined();

    // 6. Test Swarm Simulation Run
    const runBtn = page.locator('#run-btn');
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // Verify simulation logs are generated by checking text content with polling
    const logsArea = page.locator('#console-logs');
    await expect(logsArea).toContainText('Spawning', { timeout: 5000 });

    // 7. Verify comparative table content
    const comparisonHeader = page.locator('text=Comparative Framework Landscape');
    await expect(comparisonHeader).toBeVisible();
    const autoGenCell = page.locator('text=AutoGen').first();
    await expect(autoGenCell).toBeVisible();
  });

});
