import re
from playwright.sync_api import Page, expect

def test_homepage(page: Page):
    page.goto("https://playwright.dev/")
    expect(page).to_have_title(re.compile("Playwright"))
    get_started = page.get_by_role("link", name="Get started")
    expect(get_started).to_have_attribute("href", "/docs/intro")
    get_started.click()
    expect(page).to_have_url(re.compile(".*intro"))
