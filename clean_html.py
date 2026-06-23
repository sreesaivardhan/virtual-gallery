import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace filter buttons
content = re.sub(
    r'<!-- Category Filter Buttons -->\s*<div class="filter-buttons">.*?</div>',
    '<!-- Category Filter Buttons -->\n            <div class="filter-buttons" id="filter-container">\n                <button class="filter-btn active" data-filter="all">All Photos</button>\n            </div>',
    content,
    flags=re.DOTALL
)

# Replace gallery grid
content = re.sub(
    r'<!-- Gallery Grid -->\s*<div class="gallery-grid">.*?</div>\s*</div>\s*</section>',
    '<!-- Gallery Grid -->\n            <div class="gallery-grid" id="gallery-container">\n                <!-- Gallery items will be dynamically injected here -->\n            </div>\n        </div>\n    </section>',
    content,
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated index.html")
