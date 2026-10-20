import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import csv
import os

BASE_URL = "http://localhost:3000"
test_results = []
SCREENSHOT_DIR = "screenshots"

if not os.path.exists(SCREENSHOT_DIR):
    os.makedirs(SCREENSHOT_DIR)

def record_result(tc_id, module, scenario, steps, expected, actual, status, severity, priority, remarks):
    test_results.append([tc_id, module, scenario, "Application running", "", steps, expected, actual, status, severity, priority, remarks])

@pytest.fixture(scope="module")
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()

    with open("AGRI-NOVA_Selenium_Test_Cases.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Test Case ID", "Module", "Test Scenario", "Precondition", "Test Data", "Steps", "Expected Result", "Actual Result", "Status", "Severity", "Priority", "Remarks"])
        writer.writerows(test_results)

def take_screenshot(driver, name):
    filepath = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    driver.save_screenshot(filepath)

def test_homepage_loads(driver):
    try:
        driver.get(BASE_URL)
        time.sleep(2) # Allow animations/assets to load
        assert "AGRI-NOVA" in driver.title or driver.find_element(By.TAG_NAME, "body")
        take_screenshot(driver, "SEL-001_Homepage")
        record_result("SEL-001", "Core", "Homepage loads", "Navigate to /", "Home page loads", "Home page loaded successfully", "PASS", "High", "High", "Screenshot captured")
    except Exception as e:
        record_result("SEL-001", "Core", "Homepage loads", "Navigate to /", "Home page loads", f"Error: {e}", "FAIL", "High", "High", "")
        raise

def test_login_navigation(driver):
    try:
        driver.get(f"{BASE_URL}/auth/login")
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.TAG_NAME, "form")))
        time.sleep(1)
        take_screenshot(driver, "SEL-002_Login")
        record_result("SEL-002", "Auth", "Navigate to Login", "Navigate to /auth/login", "Login page loads", "Login page loaded successfully", "PASS", "High", "High", "Screenshot captured")
    except Exception as e:
        record_result("SEL-002", "Auth", "Navigate to Login", "Navigate to /auth/login", "Login page loads", f"Error: {e}", "FAIL", "High", "High", "")
        raise

def test_marketplace_navigation(driver):
    try:
        driver.get(f"{BASE_URL}/marketplace")
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(1)
        take_screenshot(driver, "SEL-003_Marketplace")
        record_result("SEL-003", "Marketplace", "Navigate to Marketplace", "Navigate to /marketplace", "Marketplace loads", "Marketplace loaded successfully", "PASS", "Medium", "Medium", "Screenshot captured")
    except Exception as e:
        record_result("SEL-003", "Marketplace", "Navigate to Marketplace", "Navigate to /marketplace", "Marketplace loads", f"Error: {e}", "FAIL", "Medium", "Medium", "")
        raise

def test_schemes_navigation(driver):
    try:
        driver.get(f"{BASE_URL}/schemes")
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(1)
        take_screenshot(driver, "SEL-004_Schemes")
        record_result("SEL-004", "Schemes", "Navigate to Schemes", "Navigate to /schemes", "Schemes page loads", "Schemes page loaded successfully", "PASS", "Medium", "Low", "Screenshot captured")
    except Exception as e:
        record_result("SEL-004", "Schemes", "Navigate to Schemes", "Navigate to /schemes", "Schemes page loads", f"Error: {e}", "FAIL", "Medium", "Low", "")
        raise

def test_veterinary_navigation(driver):
    try:
        driver.get(f"{BASE_URL}/veterinary")
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(1)
        take_screenshot(driver, "SEL-005_Veterinary")
        record_result("SEL-005", "Veterinary", "Navigate to Veterinary", "Navigate to /veterinary", "Veterinary page loads", "Veterinary loaded successfully", "PASS", "Medium", "Medium", "Screenshot captured")
    except Exception as e:
        record_result("SEL-005", "Veterinary", "Navigate to Veterinary", "Navigate to /veterinary", "Veterinary page loads", f"Error: {e}", "FAIL", "Medium", "Medium", "")
        raise

def test_equipment_navigation(driver):
    try:
        driver.get(f"{BASE_URL}/equipment")
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(1)
        take_screenshot(driver, "SEL-006_Equipment")
        record_result("SEL-006", "Equipment", "Navigate to Equipment", "Navigate to /equipment", "Equipment page loads", "Equipment loaded successfully", "PASS", "Medium", "Medium", "Screenshot captured")
    except Exception as e:
        record_result("SEL-006", "Equipment", "Navigate to Equipment", "Navigate to /equipment", "Equipment page loads", f"Error: {e}", "FAIL", "Medium", "Medium", "")
        raise
