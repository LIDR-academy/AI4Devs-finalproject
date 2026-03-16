#!/usr/bin/env python3
"""
Script para exportar los diagramas del canvas como imágenes PNG
Requiere: playwright o selenium instalado
"""

import os
import sys

def check_dependencies():
    """Verifica si las dependencias están instaladas"""
    try:
        import playwright
        return 'playwright'
    except ImportError:
        try:
            import selenium
            return 'selenium'
        except ImportError:
            return None

def export_with_playwright():
    """Exporta usando Playwright"""
    try:
        from playwright.sync_api import sync_playwright
        
        html_path = os.path.abspath('canvas-diagrama.html')
        output_dir = 'diagramas_exportados'
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"📄 Abriendo: {html_path}")
        print(f"📁 Guardando imágenes en: {output_dir}/")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(f'file://{html_path}')
            page.wait_for_timeout(3000)  # Esperar a que se rendericen los diagramas
            
            # Capturar cada diagrama
            diagrams = [
                ('diagrama-principal', 'h2:has-text("1. Diagrama Principal")'),
                ('canvas-matriz', 'h2:has-text("2. Canvas Visual")'),
                ('interaccion-areas', 'h2:has-text("3. Diagrama de Interacción")')
            ]
            
            for name, selector in diagrams:
                try:
                    element = page.query_selector(f'{selector} + .diagram-container')
                    if element:
                        screenshot_path = f'{output_dir}/{name}.png'
                        element.screenshot(path=screenshot_path, full_page=True)
                        print(f"✅ Exportado: {screenshot_path}")
                except Exception as e:
                    print(f"⚠️  Error al exportar {name}: {e}")
            
            # Captura completa de la página
            page.screenshot(path=f'{output_dir}/canvas-completo.png', full_page=True)
            print(f"✅ Exportado: {output_dir}/canvas-completo.png")
            
            browser.close()
        
        print(f"\n🎉 ¡Exportación completada! Revisa la carpeta '{output_dir}/'")
        return True
        
    except Exception as e:
        print(f"❌ Error con Playwright: {e}")
        return False

def export_with_selenium():
    """Exporta usando Selenium"""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        
        html_path = os.path.abspath('canvas-diagrama.html')
        output_dir = 'diagramas_exportados'
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"📄 Abriendo: {html_path}")
        print(f"📁 Guardando imágenes en: {output_dir}/")
        
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        driver = webdriver.Chrome(options=options)
        driver.get(f'file://{html_path}')
        
        import time
        time.sleep(3)  # Esperar renderizado
        
        # Captura completa
        screenshot_path = f'{output_dir}/canvas-completo.png'
        driver.save_screenshot(screenshot_path)
        print(f"✅ Exportado: {screenshot_path}")
        
        driver.quit()
        print(f"\n🎉 ¡Exportación completada! Revisa la carpeta '{output_dir}/'")
        return True
        
    except Exception as e:
        print(f"❌ Error con Selenium: {e}")
        print("💡 Asegúrate de tener ChromeDriver instalado")
        return False

def main():
    print("🎨 Exportador de Diagramas del Canvas Quirúrgico")
    print("=" * 50)
    
    if not os.path.exists('canvas-diagrama.html'):
        print("❌ Error: No se encuentra 'canvas-diagrama.html'")
        print("💡 Asegúrate de estar en el directorio correcto")
        sys.exit(1)
    
    tool = check_dependencies()
    
    if tool == 'playwright':
        print("✅ Playwright detectado")
        print("📦 Instalando navegadores si es necesario...")
        try:
            os.system('playwright install chromium')
        except:
            pass
        success = export_with_playwright()
    elif tool == 'selenium':
        print("✅ Selenium detectado")
        success = export_with_selenium()
    else:
        print("❌ No se encontraron herramientas de automatización")
        print("\n📦 Para instalar las dependencias:")
        print("   pip install playwright")
        print("   # o")
        print("   pip install selenium")
        print("\n💡 Alternativa: Abre 'canvas-diagrama.html' manualmente en tu navegador")
        sys.exit(1)
    
    if not success:
        print("\n💡 Alternativa manual:")
        print("   1. Abre 'canvas-diagrama.html' en tu navegador")
        print("   2. Haz captura de pantalla de los diagramas")
        sys.exit(1)

if __name__ == '__main__':
    main()
