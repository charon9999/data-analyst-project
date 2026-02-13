import requests
from bs4 import BeautifulSoup
import json
import os
import time
import re
import hashlib
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class OfficeDepotScraper:
    def __init__(self, use_selenium=True):
        self.use_selenium = use_selenium
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
        
    def setup_selenium_driver(self):
        """Setup Selenium WebDriver with Chrome"""
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')  # Run in background
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')
        
        driver = webdriver.Chrome(options=options)
        return driver
    
    def normalize_url(self, url):
        """Normalize URL by removing query parameters and converting to canonical form"""
        # Remove query parameters
        base_url = url.split('?')[0]
        # Remove fragments
        base_url = base_url.split('#')[0]
        return base_url
    
    def get_url_signature(self, url):
        """Create a unique signature for an image URL based on its meaningful parts"""
        # Extract the product ID and image variant from URL
        # Example: .../products/4852038/4852038_o01_072821/4852038
        normalized = self.normalize_url(url)
        
        # Extract key identifying parts
        parts = normalized.split('/')
        
        # Find the image identifier (usually contains product number and variant)
        signature_parts = []
        for part in parts:
            if 'products' in part:
                continue
            if '_o' in part or '_p' in part:  # Image variant identifier
                # Extract just the variant part (e.g., _o01_, _o51_)
                match = re.search(r'_[op]\d+_', part)
                if match:
                    signature_parts.append(match.group())
        
        return ''.join(signature_parts) if signature_parts else normalized
        
    def extract_all_images_selenium(self, url):
        """Extract all unique images using Selenium by clicking through carousel"""
        print("Using Selenium to extract all images from carousel...")
        
        driver = self.setup_selenium_driver()
        image_urls = []
        seen_signatures = set()
        
        try:
            driver.get(url)
            time.sleep(3)  # Wait for page to load
            
            # Find the total number of images
            try:
                thumbnails = driver.find_elements(By.CSS_SELECTOR, '.image-gallery-thumbnails-container .image-gallery-thumbnail')
                total_images = len(thumbnails) if thumbnails else 10
                print(f"Found approximately {total_images} images in gallery")
            except:
                total_images = 10
            
            # Extract current image
            try:
                current_image = driver.find_element(By.CSS_SELECTOR, '.image-gallery-slide.center img')
                if current_image:
                    src = current_image.get_attribute('src')
                    if src and 'products' in src:
                        signature = self.get_url_signature(src)
                        if signature not in seen_signatures:
                            image_urls.append(src)
                            seen_signatures.add(signature)
                            print(f"Extracted image 1: {src[:80]}...")
            except:
                print("Could not find initial image")
            
            # Click through the carousel to get all images
            consecutive_duplicates = 0
            max_consecutive_duplicates = 3
            
            for i in range(total_images + 5):  # Add buffer for safety
                try:
                    # Find and click the right arrow button
                    right_button = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-auid*="ImageGalleryScrollRightIcon"]'))
                    )
                    
                    # Scroll to button and click
                    driver.execute_script("arguments[0].scrollIntoView(true);", right_button)
                    time.sleep(0.5)
                    right_button.click()
                    time.sleep(1)  # Wait for transition
                    
                    # Get the new center image
                    current_image = driver.find_element(By.CSS_SELECTOR, '.image-gallery-slide.center img')
                    if current_image:
                        src = current_image.get_attribute('src')
                        if src and 'products' in src:
                            signature = self.get_url_signature(src)
                            
                            if signature not in seen_signatures:
                                image_urls.append(src)
                                seen_signatures.add(signature)
                                consecutive_duplicates = 0
                                print(f"Extracted image {len(image_urls)}: {src[:80]}...")
                            else:
                                consecutive_duplicates += 1
                                print(f"Skipping duplicate image (signature: {signature})")
                                
                                # If we've seen several duplicates in a row, we've looped back
                                if consecutive_duplicates >= max_consecutive_duplicates:
                                    print("Detected carousel loop - stopping extraction")
                                    break
                    
                except TimeoutException:
                    print("No more images or reached end of carousel")
                    break
                except NoSuchElementException:
                    print("Could not find next button or image")
                    break
                except Exception as e:
                    print(f"Error during carousel navigation: {e}")
                    break
            
            # Also try to get images from thumbnails if available
            try:
                thumbnail_images = driver.find_elements(By.CSS_SELECTOR, '.image-gallery-thumbnail img')
                print(f"Checking {len(thumbnail_images)} thumbnail images...")
                
                for thumb in thumbnail_images:
                    src = thumb.get_attribute('src')
                    if src and 'products' in src:
                        # Convert thumbnail to full size
                        full_size_src = re.sub(r'_p\d+_', lambda m: m.group().replace('_p', '_o'), src)
                        signature = self.get_url_signature(full_size_src)
                        
                        if signature not in seen_signatures:
                            image_urls.append(full_size_src)
                            seen_signatures.add(signature)
                            print(f"Extracted from thumbnail: {full_size_src[:80]}...")
            except Exception as e:
                print(f"Error extracting thumbnails: {e}")
            
        finally:
            driver.quit()
        
        # Convert to high quality and ensure uniqueness one more time
        final_unique_images = []
        final_seen = set()
        
        for url in image_urls:
            high_quality_url = self.get_high_quality_url(url)
            signature = self.get_url_signature(high_quality_url)
            
            if signature not in final_seen:
                final_unique_images.append(high_quality_url)
                final_seen.add(signature)
        
        print(f"\nTotal unique images found: {len(final_unique_images)}")
        return final_unique_images
    
    def get_high_quality_url(self, url):
        """Convert image URL to high quality version"""
        # Replace h_450 with h_1000 for higher quality
        url = re.sub(r'h_\d+', 'h_1000', url)
        # Ensure we have the original image version (not preview)
        url = re.sub(r'_p(\d+)_', r'_o\1_', url)
        return url
    
    def get_image_hash(self, image_content):
        """Generate hash of image content to detect duplicates"""
        return hashlib.md5(image_content).hexdigest()
        
    def extract_product_info(self, url):
        """Extract product information from Office Depot product page"""
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            product_data = {}
            
            # Extract breadcrumb/category
            breadcrumb = soup.find('nav', {'class': 'od-breadcrumb'})
            if breadcrumb:
                categories = []
                breadcrumb_items = breadcrumb.find_all('li', {'class': 'od-breadcrumb-item'})
                for item in breadcrumb_items:
                    span = item.find('span', itemprop='name')
                    if span:
                        text = span.get_text(strip=True)
                        # Clean up the text
                        text = re.sub(r'Item #\d+\s*', '', text)
                        text = re.sub(r'\s+', ' ', text).strip()
                        if text and text != 'Home':
                            categories.append(text)
                product_data['categories'] = categories
            
            # Extract product name
            product_name = soup.find('h1', {'class': 'sku-heading'})
            if product_name:
                product_data['product_name'] = product_name.get_text(strip=True)
            
            # Extract price
            price_span = soup.find('span', {'class': 'od-graphql-price-big-price'})
            if price_span:
                product_data['price'] = price_span.get_text(strip=True)
            
            uom_span = soup.find('span', {'class': 'od-graphql-price-big-uom'})
            if uom_span:
                product_data['unit_of_measure'] = uom_span.get_text(strip=True)
            
            # Extract description
            description_span = soup.find('span', itemprop='description')
            if description_span:
                desc_text = description_span.find('p')
                if desc_text:
                    product_data['description'] = desc_text.get_text(strip=True)
            
            # Extract bullet points
            bullets = soup.find('ul', {'class': 'sku-bullets'})
            if bullets:
                bullet_items = []
                for li in bullets.find_all('li', {'class': 'sku-bullet'}):
                    bullet_items.append(li.get_text(strip=True))
                product_data['features'] = bullet_items
            
            # Extract specifications
            specs_table = soup.find('table', {'class': 'sku-table'})
            if specs_table:
                specifications = {}
                for row in specs_table.find_all('tr', {'class': 'sku-row'}):
                    cells = row.find_all('td')
                    if len(cells) == 2:
                        key = cells[0].get_text(strip=True)
                        value = cells[1].get_text(strip=True)
                        specifications[key] = value
                product_data['specifications'] = specifications
            
            # Extract manufacturer number
            mfr_number = soup.find('span', {'class': 'sku-item-number-manufacturer'})
            if mfr_number:
                product_data['manufacturer_number'] = mfr_number.get_text(strip=True)
            
            product_data['product_url'] = url
            
            return product_data
            
        except requests.RequestException as e:
            print(f"Error fetching page: {e}")
            return None
        except Exception as e:
            print(f"Error parsing page: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def download_images(self, image_urls, item_number, output_dir='product_images'):
        """Download product images to a folder, avoiding duplicates by content"""
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        item_folder = os.path.join(output_dir, item_number)
        if not os.path.exists(item_folder):
            os.makedirs(item_folder)
        
        downloaded_images = []
        image_hashes = set()
        
        for idx, url in enumerate(image_urls, 1):
            try:
                print(f"Downloading image {idx}/{len(image_urls)}: {url[:80]}...")
                response = requests.get(url, headers=self.headers, timeout=30)
                response.raise_for_status()
                
                # Check if we've already downloaded this exact image by content
                image_hash = self.get_image_hash(response.content)
                
                if image_hash in image_hashes:
                    print(f"  ⊗ Skipping duplicate image (same content)")
                    continue
                
                image_hashes.add(image_hash)
                
                # Determine file extension
                extension = '.jpg'
                content_type = response.headers.get('content-type', '')
                
                if 'png' in content_type or 'png' in url.lower():
                    extension = '.png'
                elif 'webp' in content_type or 'webp' in url.lower():
                    extension = '.webp'
                elif 'gif' in content_type or 'gif' in url.lower():
                    extension = '.gif'
                
                filename = f"image_{len(downloaded_images) + 1:02d}{extension}"
                filepath = os.path.join(item_folder, filename)
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                downloaded_images.append(filename)
                print(f"  ✓ Saved as: {filename}")
                time.sleep(0.5)  # Be polite to the server
                
            except Exception as e:
                print(f"  ✗ Error downloading image: {e}")
        
        return downloaded_images
    
    def scrape_product(self, url, save_images=True):
        """Main method to scrape product and save data"""
        print(f"Scraping product from: {url}")
        print("="*60)
        
        # Extract product information
        product_data = self.extract_product_info(url)
        
        if not product_data:
            print("Failed to extract product data")
            return None
        
        # Get item number for folder naming
        item_number = product_data.get('specifications', {}).get('Item #', 'unknown')
        
        print(f"\nProduct: {product_data.get('product_name', 'N/A')}")
        
        # Extract images using Selenium
        if self.use_selenium:
            image_urls = self.extract_all_images_selenium(url)
            product_data['image_urls'] = image_urls
            product_data['total_images'] = len(image_urls)
            print(f"\nFound {len(image_urls)} distinct image URLs")
        
        # Download images if requested
        if save_images and product_data.get('image_urls'):
            print(f"\nDownloading images...")
            print("-"*60)
            downloaded_files = self.download_images(
                product_data['image_urls'], 
                item_number
            )
            product_data['downloaded_images'] = downloaded_files
            product_data['images_folder'] = f"product_images/{item_number}"
            product_data['actual_images_saved'] = len(downloaded_files)
            print("-"*60)
        
        # Save to JSON
        json_filename = f"product_{item_number}.json"
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(product_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Product data saved to: {json_filename}")
        print(f"✓ Images saved to: product_images/{item_number}/")
        print(f"✓ Distinct images downloaded: {len(downloaded_files)}")
        
        return product_data


def main():
    # Initialize scraper with Selenium enabled
    scraper = OfficeDepotScraper(use_selenium=True)
    
    # Product URL
    product_url = "https://www.odpbusiness.com/a/products/4852038/"
    
    # Scrape product
    product_data = scraper.scrape_product(product_url, save_images=True)
    
    if product_data:
        print("\n" + "="*60)
        print("SCRAPING COMPLETE")
        print("="*60)
        print(f"\nProduct: {product_data.get('product_name', 'N/A')}")
        print(f"Price: {product_data.get('price', 'N/A')}")
        print(f"Item #: {product_data.get('specifications', {}).get('Item #', 'N/A')}")
        print(f"Categories: {' > '.join(product_data.get('categories', []))}")
        print(f"Distinct URLs Found: {len(product_data.get('image_urls', []))}")
        print(f"Distinct Images Saved: {product_data.get('actual_images_saved', 0)}")
        print(f"\nImage URLs:")
        for i, url in enumerate(product_data.get('image_urls', []), 1):
            print(f"  {i}. {url}")
    else:
        print("\nFailed to scrape product")


if __name__ == "__main__":
    main()