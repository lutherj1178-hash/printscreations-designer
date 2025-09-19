'use client';

import { useState, useEffect } from 'react';

interface ProductData {
  id: string;
  title: string;
  type: string;
  price: string;
  image: string;
  storeUrl: string;
}

interface DesignData {
  text: string;
  textColor: string;
  textSize: number;
  textFont: string;
  image: string | null;
  backgroundColor: string;
}

export default function DesignCraft() {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [designData, setDesignData] = useState<DesignData>({
    text: '',
    textColor: '#000000',
    textSize: 24,
    textFont: 'Arial',
    image: null,
    backgroundColor: '#ffffff'
  });

  useEffect(() => {
    // Get product data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productInfo: ProductData = {
      id: urlParams.get('product_id') || '',
      title: urlParams.get('product_title') || 'Custom Product',
      type: urlParams.get('product_type') || 'Product',
      price: urlParams.get('product_price') || '25.00',
      image: urlParams.get('product_image') || '',
      storeUrl: urlParams.get('store_url') || 'https://printscreations.com'
    };
    
    setProductData(productInfo);
  }, []);

  const handleAddToCart = async () => {
    if (!productData) return;

    const customProduct = {
      variantId: productData.id,
      quantity: 1,
      designId: `design_${Date.now()}`,
      previewImage: generatePreviewImage(),
      customText: designData.text,
      printInstructions: `Font: ${designData.textFont}, Size: ${designData.textSize}px, Color: ${designData.textColor}`,
      designData: designData,
      price: productData.price
    };

    // Send message back to parent Shopify page (works for both popup and iframe)
    if (window.opener) {
      // For popup window
      window.opener.postMessage({
        type: 'DESIGNCRAFT_ADD_TO_CART',
        payload: customProduct
      }, productData.storeUrl || 'https://printscreations.com');
      
      // Close the popup after sending message
      setTimeout(() => {
        window.close();
      }, 500);
    } else if (window.parent !== window) {
      // For iframe
      window.parent.postMessage({
        type: 'DESIGNCRAFT_ADD_TO_CART',
        payload: customProduct
      }, productData.storeUrl || 'https://printscreations.com');
    } else {
      // Fallback - direct redirect to cart with URL parameters
      const cartUrl = `${productData.storeUrl || 'https://printscreations.com'}/cart/add?` +
        `id=${customProduct.variantId}&` +
        `quantity=${customProduct.quantity}&` +
        `properties[Design ID]=${encodeURIComponent(customProduct.designId)}&` +
        `properties[Customized Product]=Yes&` +
        `properties[Custom Text]=${encodeURIComponent(customProduct.customText)}`;
      
      window.location.href = cartUrl;
    }
  };

  const generatePreviewImage = () => {
    // Generate SVG preview
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="300" fill="${designData.backgroundColor}"/>
        <text x="150" y="150" text-anchor="middle" fill="${designData.textColor}" 
              font-family="${designData.textFont}" font-size="${designData.textSize}">
          ${designData.text || 'Your Design'}
        </text>
      </svg>
    `)}`;
  };

  if (!productData || !productData.id) {
    return (
      <div className="loading-screen">
        <h2>🎨 DesignCraft</h2>
        <p>Professional Product Customization Tool</p>
        <p>For Prints Creations</p>
        <div className="demo-note">
          <p>Demo Mode - Add product parameters to URL:</p>
          <code>?product_id=123&product_title=T-Shirt&product_type=Apparel</code>
        </div>
        <style jsx>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            text-align: center;
            padding: 20px;
          }
          .demo-note {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            max-width: 400px;
          }
          code {
            background: rgba(0,0,0,0.2);
            padding: 10px;
            border-radius: 5px;
            display: block;
            font-size: 12px;
            margin-top: 10px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="designcraft-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🎨 DesignCraft</h1>
          <div className="product-info">
            <h2>Customizing: {productData.title}</h2>
            <span className="product-type">{productData.type}</span>
          </div>
          <div className="header-actions">
            <button 
              className="btn-secondary"
              onClick={() => window.parent.postMessage({type: 'DESIGNCRAFT_CLOSE'}, '*')}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleAddToCart}
              disabled={!designData.text.trim()}
            >
              Add to Cart - ${productData.price}
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">
        {/* Design Canvas */}
        <div className="canvas-area">
          <div className="product-preview">
            {productData.image ? (
              <img 
                src={productData.image} 
                alt={productData.title}
                className="product-mockup"
              />
            ) : (
              <div className="product-placeholder">
                <div className="placeholder-icon">👕</div>
                <p>{productData.title}</p>
              </div>
            )}
            <div className="design-overlay">
              {designData.text && (
                <div 
                  className="text-preview"
                  style={{
                    color: designData.textColor,
                    fontSize: `${designData.textSize}px`,
                    fontFamily: designData.textFont
                  }}
                >
                  {designData.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Design Tools Panel */}
        <div className="tools-panel">
          <div className="tool-section">
            <h3>📝 Add Text</h3>
            <div className="form-group">
              <label>Your Text:</label>
              <textarea
                value={designData.text}
                onChange={(e) => setDesignData({...designData, text: e.target.value})}
                placeholder="Enter your custom text..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Font:</label>
                <select
                  value={designData.textFont}
                  onChange={(e) => setDesignData({...designData, textFont: e.target.value})}
                >
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>

              <div className="form-group">
                <label>Size:</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={designData.textSize}
                  onChange={(e) => setDesignData({...designData, textSize: parseInt(e.target.value)})}
                />
                <span>{designData.textSize}px</span>
              </div>
            </div>

            <div className="form-group">
              <label>Text Color:</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={designData.textColor}
                  onChange={(e) => setDesignData({...designData, textColor: e.target.value})}
                />
                <span>{designData.textColor}</span>
              </div>
            </div>
          </div>

          <div className="tool-section">
            <h3>🎨 Quick Designs</h3>
            
            <div className="preset-designs">
              <button 
                className="preset-btn"
                onClick={() => setDesignData({
                  ...designData,
                  text: 'Custom Design',
                  textColor: '#ffffff',
                  textFont: 'Arial',
                  textSize: 36
                })}
              >
                Bold White
              </button>
              <button 
                className="preset-btn"
                onClick={() => setDesignData({
                  ...designData,
                  text: 'Prints Creations',
                  textColor: '#000000',
                  textFont: 'Georgia',
                  textSize: 28
                })}
              >
                Classic Black
              </button>
              <button 
                className="preset-btn"
                onClick={() => setDesignData({
                  ...designData,
                  text: 'Made to Order',
                  textColor: '#007cba',
                  textFont: 'Helvetica',
                  textSize: 32
                })}
              >
                Brand Blue
              </button>
            </div>
          </div>

          <div className="tool-section">
            <h3>ℹ️ Print Information</h3>
            <div className="print-info">
              <p><strong>Print Area:</strong> 10" x 12"</p>
              <p><strong>Print Method:</strong> Heat Transfer Vinyl</p>
              <p><strong>Processing Time:</strong> 2-3 business days</p>
              <p><strong>Care Instructions:</strong> Machine wash cold, tumble dry low</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .designcraft-app {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          height: 100vh;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          background: #1e293b;
          color: white;
          padding: 16px 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-content h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .product-info h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }

        .product-type {
          background: #3b82f6;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          margin-left: 12px;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary, .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .btn-primary {
          background: #10b981;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #059669;
        }

        .btn-primary:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .app-content {
          flex: 1;
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          gap: 24px;
        }

        .canvas-area {
          flex: 2;
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .product-preview {
          position: relative;
          max-width: 400px;
          max-height: 400px;
        }

        .product-mockup {
          width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .product-placeholder {
          width: 300px;
          height: 300px;
          background: #f1f5f9;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #64748b;
        }

        .placeholder-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .design-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .text-preview {
          text-align: center;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          white-space: pre-wrap;
          max-width: 250px;
        }

        .tools-panel {
          flex: 1;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow-y: auto;
          max-height: calc(100vh - 140px);
        }

        .tool-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .tool-section:last-child {
          border-bottom: none;
        }

        .tool-section h3 {
          margin: 0 0 20px 0;
          color: #1e293b;
          font-size: 16px;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-group textarea,
        .form-group select,
        .form-group input[type="range"] {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .color-picker {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .color-picker input[type="color"] {
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .preset-designs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preset-btn {
          padding: 12px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .preset-btn:hover {
          background: #e2e8f0;
          border-color: #3b82f6;
        }

        .print-info {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.6;
          border-left: 4px solid #3b82f6;
        }

        .print-info p {
          margin: 8px 0;
        }

        @media (max-width: 768px) {
          .app-content {
            flex-direction: column;
            padding: 16px;
          }
          
          .header-content {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          
          .form-row {
            flex-direction: column;
          }
          
          .canvas-area {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
