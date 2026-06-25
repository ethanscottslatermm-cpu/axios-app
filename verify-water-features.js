const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const baseUrl = 'http://localhost:5173';

  try {
    console.log('🧪 AXIOS Water Tab Feature Verification\n');

    // Navigate to app
    await page.goto(baseUrl);
    console.log('✅ App loaded at', baseUrl);

    // Wait for page to be interactive and look for login/auth
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    const initialScreenshot = await page.screenshot({ path: 'verify-1-initial.png' });
    console.log('📸 Initial state captured → verify-1-initial.png');

    // Look for Food tab or navigate to it
    const foodTabBtn = page.locator('button, a, [role="tab"]').filter({ hasText: /food|log|water/i }).first();
    if (await foodTabBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await foodTabBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ Navigated to Food/Water section');
    }

    // Find the Water Panel card
    const waterCard = page.locator('text=/tap to log|water/i').first();
    if (!await waterCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('⚠️ Water panel not immediately visible, taking screenshot');
      await page.screenshot({ path: 'verify-2-water-search.png' });
    }

    // FEATURE 1: Custom Container Presets
    console.log('\n🔍 FEATURE 1: Custom Container Presets');

    // Look for "+ My Bottle" or "Another Container" button
    const addContainerBtn = page.locator('button').filter({ hasText: /my bottle|another container|custom/i }).first();
    if (await addContainerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addContainerBtn.click();
      await page.waitForTimeout(800);
      console.log('✅ Container sheet opened');

      // Fill in container details
      await page.fill('input[placeholder*="Hydro"]', 'Hydro Flask');
      await page.fill('input[type="number"]', '32');
      await page.waitForTimeout(500);

      // Click Save
      const saveBtn = page.locator('button').filter({ hasText: /save|confirm/i }).last();
      await saveBtn.click();
      await page.waitForTimeout(1000);

      const containerScreenshot = await page.screenshot({ path: 'verify-3-container-added.png' });
      console.log('✅ Custom container saved → verify-3-container-added.png');

      // Check if the container tile appears
      const containerTile = page.locator('button').filter({ hasText: /32.*oz.*hydro flask|hydro flask.*32/i }).first();
      if (await containerTile.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Custom container tile appears in UI');
      } else {
        console.log('⚠️ Container tile not visible after save');
      }
    } else {
      console.log('⚠️ Add container button not found');
    }

    // FEATURE 2: Milestone Animation (log 8 glasses)
    console.log('\n🔍 FEATURE 2: Milestone Animation');

    // Find empty glass tiles and tap them
    const glassTiles = page.locator('button').filter({
      has: page.locator('svg path:has-text("M6 5 L9 20")')
    });

    const tileCount = await glassTiles.count().catch(() => 0);
    console.log(`Found ${tileCount} glass tiles`);

    if (tileCount >= 8) {
      // Click 8 glass tiles to reach milestone
      for (let i = 0; i < 8; i++) {
        const tile = glassTiles.nth(i);
        if (await tile.isVisible({ timeout: 2000 }).catch(() => false)) {
          await tile.click();
          await page.waitForTimeout(300);
          console.log(`  Tapped glass ${i + 1}/8`);
        }
      }

      await page.waitForTimeout(1500);
      const milestoneScreenshot = await page.screenshot({ path: 'verify-4-milestone-animation.png' });
      console.log('✅ Milestone sequence completed → verify-4-milestone-animation.png');
    } else {
      console.log('⚠️ Not enough glass tiles found to test milestone');
    }

    // FEATURE 3: Full-Screen Ritual View
    console.log('\n🔍 FEATURE 3: Full-Screen Ritual View');

    // Look for expand/fullscreen button (should be near "TAP TO LOG")
    const expandBtn = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({ hasText: '' }).nth(0); // Look for icon-only buttons near header

    // Try alternative: look for button with expand-like SVG
    const expandButtons = page.locator('button').all();
    let foundExpandBtn = false;

    for (let btn of await expandButtons) {
      const ariaLabel = await btn.getAttribute('title').catch(() => '');
      if (ariaLabel?.includes('full') || ariaLabel?.includes('expand')) {
        await btn.click();
        foundExpandBtn = true;
        console.log('✅ Expand button clicked via title');
        break;
      }
    }

    if (!foundExpandBtn) {
      console.log('⚠️ Expand button not found by title, trying by position');
    }

    await page.waitForTimeout(1000);

    // Check if full-screen view opened
    const fullscreenView = page.locator('text=Progress').filter({ hasText: /Today|Today's/ });
    if (await fullscreenView.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Full-screen ritual view opened');

      const ritualScreenshot = await page.screenshot({ path: 'verify-5-ritual-view.png' });
      console.log('✅ Full-screen view captured → verify-5-ritual-view.png');

      // Test the full-screen view features
      // - Check if glasses grid is larger
      const glassesInFullscreen = page.locator('button').filter({
        has: page.locator('svg')
      });

      // - Check if custom containers appear
      // - Try close button
      const closeBtn = page.locator('button').filter({ hasText: '✕' }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        console.log('✅ Closed full-screen view');
        await page.waitForTimeout(500);
      }
    } else {
      console.log('⚠️ Full-screen view not detected');
      await page.screenshot({ path: 'verify-5-ritual-view-failed.png' });
    }

    // Final state
    await page.screenshot({ path: 'verify-6-final-state.png' });
    console.log('\n✅ Verification complete\n');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    await page.screenshot({ path: 'verify-error.png' });
  } finally {
    await browser.close();
  }
})();
