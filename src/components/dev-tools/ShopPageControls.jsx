import React from 'react';
import { usePage } from '../../context/PageContext.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import TextEditor from './TextEditor.jsx';
import '../../styles/components/_pageControls.scss';

function ShopPageControls() {
  const { getPageControls, updatePageControl } = usePage();
  const { getCategoryFiles, getSelectedImage } = useContent();
  const controls = getPageControls('/shop');

  // Get available shop item images
  const shopItemImages = getCategoryFiles('/shop', 'Product Images');

  return (
    <div className="page-controls shop-page-controls">
      <h3>Shop Page Controls</h3>

      {/* Background Pattern Section */}
      <div className="control-section">
        <h4>Background Pattern</h4>

        <div className="control-group">
          <label>Pattern Type:</label>
          <select
            value={controls.backgroundPattern || 'none'}
            onChange={(e) => updatePageControl('/shop', 'backgroundPattern', e.target.value)}
          >
            <option value="none">None</option>
            <option value="dots">Dots</option>
            <option value="grid">Grid</option>
            <option value="diagonal">Diagonal</option>
          </select>
        </div>

        <div className="control-group">
          <label>Pattern Opacity: {controls.backgroundPatternOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.backgroundPatternOpacity || 1}
            onChange={(e) => updatePageControl('/shop', 'backgroundPatternOpacity', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Content Styling Section */}
      <div className="control-section">
        <h4>Content Styling</h4>

        <div className="control-group">
          <label>Content Opacity: {controls.contentOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.contentOpacity || 1}
            onChange={(e) => updatePageControl('/shop', 'contentOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Content Width: {controls.contentWidth || 80}%</label>
          <input
            type="range"
            min="60"
            max="100"
            step="5"
            value={controls.contentWidth || 80}
            onChange={(e) => updatePageControl('/shop', 'contentWidth', parseInt(e.target.value))}
          />
        </div>



        <div className="control-group">
          <label>Line Height: {controls.lineHeight || 1.6}</label>
          <input
            type="range"
            min="1.2"
            max="2"
            step="0.1"
            value={controls.lineHeight || 1.6}
            onChange={(e) => updatePageControl('/shop', 'lineHeight', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Animations Section */}
      <div className="control-section">
        <h4>Animations</h4>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showAnimations !== false}
              onChange={(e) => updatePageControl('/shop', 'showAnimations', e.target.checked)}
            />
            Show Animations
          </label>
        </div>
      </div>

      {/* Title Styling Section */}
      <div className="control-section">
        <h4>Title Styling</h4>

        <div className="control-group">
          <label>Title Font Size: {controls.titleSize || 2}rem</label>
          <input
            type="range"
            min="1.5"
            max="3"
            step="0.1"
            value={controls.titleSize || 2}
            onChange={(e) => updatePageControl('/shop', 'titleSize', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Shop Items Grid Section */}
      <div className="control-section">
        <h4>Shop Items Grid</h4>

        <div className="control-group">
          <label>Number of Columns: {controls.gridColumns || 3}</label>
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={controls.gridColumns || 3}
            onChange={(e) => updatePageControl('/shop', 'gridColumns', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Gap Between Items: {controls.gridGap || 20}px</label>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={controls.gridGap || 20}
            onChange={(e) => updatePageControl('/shop', 'gridGap', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Shop Items Section */}
      <div className="control-section">
        <h4>Shop Items</h4>

        <div className="control-group">
          <label>Image Scale: {controls.itemImageScale || 1}</label>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={controls.itemImageScale || 1}
            onChange={(e) => updatePageControl('/shop', 'itemImageScale', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Image Border Radius: {controls.itemBorderRadius || 8}px</label>
          <input
            type="range"
            min="0"
            max="20"
            step="2"
            value={controls.itemBorderRadius || 8}
            onChange={(e) => updatePageControl('/shop', 'itemBorderRadius', parseInt(e.target.value))}
          />
        </div>

        <TextEditor
          contentKey="shop.item1Title"
          label="Print Title"
          placeholder="Neon Horizon Art Print"
        />

        <TextEditor
          contentKey="shop.item1Price"
          label="Print Price"
          placeholder="$25.00"
        />

        <TextEditor
          contentKey="shop.item2Title"
          label="3D Model Pack Title"
          placeholder="Cyberpunk Asset Pack Vol. 1"
        />

        <TextEditor
          contentKey="shop.item2Price"
          label="3D Model Pack Price"
          placeholder="$49.99"
        />

        <TextEditor
          contentKey="shop.item3Title"
          label="Music Album Title"
          placeholder="Synthwave Odyssey Album"
        />

        <TextEditor
          contentKey="shop.item3Price"
          label="Music Album Price"
          placeholder="$9.99"
        />

        <TextEditor
          contentKey="shop.buttonText"
          label="Button Text"
          placeholder="Add to Cart"
        />

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showItem1 !== false}
              onChange={(e) => updatePageControl('/shop', 'showItem1', e.target.checked)}
            />
            Show Print Item
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showItem2 !== false}
              onChange={(e) => updatePageControl('/shop', 'showItem2', e.target.checked)}
            />
            Show 3D Model Pack Item
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showItem3 !== false}
              onChange={(e) => updatePageControl('/shop', 'showItem3', e.target.checked)}
            />
            Show Music Album Item
          </label>
        </div>
      </div>

      {/* Placeholder Management Section */}
      <div className="control-section">
        <h4>Placeholder Management</h4>

        <div className="control-group">
          <label>Item 1 Placeholder:</label>
          <select
            value={controls.item1Placeholder || 'default'}
            onChange={(e) => updatePageControl('/shop', 'item1Placeholder', e.target.value)}
          >
            <option value="default">Default Print</option>
            <option value="cyberpunk">Cyberpunk Art</option>
            <option value="neon">Neon Landscape</option>
            <option value="abstract">Abstract Digital</option>
          </select>
        </div>

        <div className="control-group">
          <label>Item 2 Placeholder:</label>
          <select
            value={controls.item2Placeholder || 'default'}
            onChange={(e) => updatePageControl('/shop', 'item2Placeholder', e.target.value)}
          >
            <option value="default">Default 3D Model</option>
            <option value="cyberpunk">Cyberpunk Assets</option>
            <option value="scifi">Sci-Fi Props</option>
            <option value="environment">Environment Pack</option>
          </select>
        </div>

        <div className="control-group">
          <label>Item 3 Placeholder:</label>
          <select
            value={controls.item3Placeholder || 'default'}
            onChange={(e) => updatePageControl('/shop', 'item3Placeholder', e.target.value)}
          >
            <option value="default">Default Album</option>
            <option value="synthwave">Synthwave Collection</option>
            <option value="electronic">Electronic Beats</option>
            <option value="ambient">Ambient Sounds</option>
          </select>
        </div>
      </div>

      {/* Shop Note Section */}
      <div className="control-section">
        <h4>Shop Note</h4>

        <TextEditor
          contentKey="shop.noteText"
          label="Shop Note Text"
          placeholder="This section is currently a placeholder..."
          multiline={true}
        />

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showShopNote !== false}
              onChange={(e) => updatePageControl('/shop', 'showShopNote', e.target.checked)}
            />
            Show Shop Note
          </label>
        </div>
      </div>
    </div>
  );
}

export default ShopPageControls;
