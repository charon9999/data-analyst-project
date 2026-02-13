import requests
import json
import os
import time
import re
from urllib.parse import urljoin, urlparse
from pathlib import Path


class StaplesAdvantageScraperr:
    def __init__(self, output_dir="staples_products"):
        self.output_dir = output_dir
        self.images_dir = os.path.join(output_dir, "images")
        os.makedirs(self.images_dir, exist_ok=True)
        
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://www.staplesadvantage.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        }
        
    def download_image(self, image_url, product_id, image_index):
        """Download image and save locally"""
        try:
            # Clean the image URL
            if image_url.startswith('//'):
                image_url = 'https:' + image_url
            
            # Remove query parameters for filename
            clean_url = image_url.split('?')[0]
            extension = os.path.splitext(clean_url)[1] or '.jpg'
            
            filename = f"{product_id}_image_{image_index}{extension}"
            filepath = os.path.join(self.images_dir, filename)
            
            # Download image
            response = self.session.get(image_url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"  ✓ Downloaded image {image_index + 1}")
            return filepath
            
        except Exception as e:
            print(f"  ✗ Failed to download image {image_index + 1}: {str(e)}")
            return None
    
    def extract_product_data(self, api_response):
        """Extract and structure product data from API response"""
        try:
            sku_state = api_response.get('SBASkuState', {})
            sku_data = sku_state.get('skuData', {})
            items = sku_data.get('items', [])
            
            if not items:
                return None
            
            item = items[0]
            product = item.get('product', {})
            price_data = item.get('price', {})
            
            # Extract basic product info
            product_id = product.get('partNumber', '')
            
            # Extract specifications
            specifications = {}
            spec_list = product.get('productAttributes', [])
            for spec in spec_list:
                spec_name = spec.get('name', '')
                spec_value = spec.get('value', '')
                if spec_name and spec_value:
                    specifications[spec_name] = {
                        'value': spec_value,
                        'description': spec.get('dscr', '')
                    }
            
            # Extract description sections
            description_data = product.get('description', {})
            
            # Extract pricing
            price_info = {}
            if price_data:
                price_items = price_data.get('item', [])
                if price_items:
                    final_price = price_items[0].get('finalPrice')
                    price_info = {
                        'price': final_price,
                        'price_text': price_items[0].get('finalPriceText', ''),
                        'currency': price_data.get('currency', 'USD')
                    }
            
            # Extract images
            images_data = sku_data.get('images', [])
            image_urls = []
            for img in images_data:
                img_src = img.get('src', '')
                if img_src:
                    if img_src.startswith('//'):
                        img_src = 'https:' + img_src
                    image_urls.append({
                        'url': img_src,
                        'alt': img.get('alt', '')
                    })
            
            # Extract reviews
            review_data = product.get('review', {})
            
            # Structure the product data
            product_data = {
                'sku': product_id,
                'item_id': product.get('itemID', ''),
                'manufacturer_part_number': product.get('manufacturerPartNumber', ''),
                'upc': product.get('upcCode', ''),
                'name': product.get('name', ''),
                'brand': product.get('brandName', ''),
                'manufacturer': product.get('manufacturerName', ''),
                'description': {
                    'short': product.get('itemShortDescription', ''),
                    'headliner': description_data.get('headliner', []),
                    'paragraphs': description_data.get('paragraph', []),
                    'bullets': description_data.get('bullets', [])
                },
                'specifications': specifications,
                'pricing': price_info,
                'images': [],
                'reviews': {
                    'rating': review_data.get('rating', 0),
                    'count': review_data.get('count', 0),
                    'qa_count': review_data.get('qacount', 0),
                    'details': review_data.get('details', [])
                },
                'availability': {
                    'in_stock': not item.get('inventory', {}).get('items', [{}])[0].get('outofstock', True),
                    'bopis_eligible': product.get('flags', {}).get('bopisEligible', False),
                    'free_shipping': product.get('flags', {}).get('freeShipping', False),
                    'free_returns': product.get('flags', {}).get('freeReturns', False)
                },
                'product_url': 'https://www.staplesadvantage.com' + product.get('url', ''),
                'unit_of_measure': product.get('uom', ''),
                'unit_weight': product.get('unitWeight', ''),
                'made_in_america': product.get('madeInAmerica', False)
            }
            
            # Download images
            print(f"\nDownloading images for product {product_id}...")
            for idx, img_data in enumerate(image_urls):
                local_path = self.download_image(img_data['url'], product_id, idx)
                if local_path:
                    product_data['images'].append({
                        'url': img_data['url'],
                        'local_path': local_path,
                        'alt': img_data['alt']
                    })
            
            return product_data
            
        except Exception as e:
            print(f"Error extracting product data: {str(e)}")
            return None
    
    def scrape_product(self, product_url):
        """Main scraping method"""
        try:
            print(f"\n{'='*80}")
            print(f"Scraping: {product_url}")
            print(f"{'='*80}")
            
            # Extract product ID from URL
            match = re.search(r'product[_/](\d+)', product_url)
            if not match:
                print("Could not extract product ID from URL")
                return None
            
            product_id = match.group(1)
            
            # Construct API URL
            api_url = f"https://www.staplesadvantage.com/ele-lpd/api/sba-sku/product_{product_id}"
            
            print(f"API URL: {api_url}")
            
            # Make initial request
            response = self.session.get(api_url, headers=self.headers, timeout=30)
            
            # Handle redirect if necessary
            if response.status_code == 301 or 'RedirectHandler' in response.text:
                try:
                    redirect_data = response.json()
                    if redirect_data.get('status') == 301:
                        redirect_path = redirect_data.get('path', '')
                        if redirect_path:
                            # Construct new API URL with the redirect path
                            api_url = f"https://www.staplesadvantage.com/ele-lpd/api/sba-sku{redirect_path}"
                            print(f"Following redirect to: {api_url}")
                            response = self.session.get(api_url, headers=self.headers, timeout=30)
                except:
                    pass
            
            response.raise_for_status()
            
            # Parse response
            data = response.json()
            
            # Extract and structure product data
            product_data = self.extract_product_data(data)
            
            if product_data:
                # Save to JSON file
                output_file = os.path.join(self.output_dir, f"{product_id}.json")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(product_data, f, indent=2, ensure_ascii=False)
                
                print(f"\n✓ Product data saved to: {output_file}")
                print(f"✓ Downloaded {len(product_data['images'])} images")
                
                return product_data
            else:
                print("Failed to extract product data")
                return None
            
        except requests.exceptions.RequestException as e:
            print(f"Request error: {str(e)}")
            return None
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def scrape_multiple_products(self, product_urls):
        """Scrape multiple products"""
        results = []
        
        for i, url in enumerate(product_urls, 1):
            print(f"\n\nProcessing product {i}/{len(product_urls)}")
            product_data = self.scrape_product(url)
            
            if product_data:
                results.append(product_data)
            
            # Be polite with rate limiting
            if i < len(product_urls):
                time.sleep(2)
        
        # Save combined results
        combined_file = os.path.join(self.output_dir, "all_products.json")
        with open(combined_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n\n{'='*80}")
        print(f"Scraping complete!")
        print(f"Total products scraped: {len(results)}")
        print(f"Combined results saved to: {combined_file}")
        print(f"{'='*80}")
        
        return results


def main():
    # Initialize scraper
    scraper = StaplesAdvantageScraperr()
    
    # Example product URLs
    product_urls = [
        "https://www.staplesadvantage.com/tru-red-8482-8-5-x-11-copy-paper-20-lbs-92-brightness-500-sheets-ream-10-reams-carton-tr56958/product_135848",
        # Add more product URLs here
    ]
    
    # Scrape products
    scraper.scrape_multiple_products(product_urls)


if __name__ == "__main__":
    main()