from PIL import Image

img_burgundy = Image.open('burgundy.webp')
img_ref = Image.open('black.webp')

bbox_b = img_burgundy.getbbox()
bbox_r = img_ref.getbbox()

height_b = bbox_b[3] - bbox_b[1]
height_r = bbox_r[3] - bbox_r[1]

scale = height_r / height_b

new_size = (int(img_burgundy.width * scale), int(img_burgundy.height * scale))
img_resized = img_burgundy.resize(new_size, Image.Resampling.LANCZOS)

canvas = Image.new('RGBA', (2000, 2000), (0, 0, 0, 0))

offset_y = int(bbox_r[3] - (bbox_b[3] * scale))
center_resized_x = ((bbox_b[0] + bbox_b[2]) / 2) * scale
offset_x = int(1000 - center_resized_x)

canvas.paste(img_resized, (offset_x, offset_y))
canvas.save('burgundy.webp', 'WEBP')
print("Image resized successfully")
