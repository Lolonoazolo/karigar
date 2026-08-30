INSERT INTO public.categories (name, slug, description)
VALUES
  ('Textiles & Weaving', 'textiles', 'Handwoven sarees, dupattas, and fabrics'),
  ('Pottery & Ceramics', 'pottery', 'Earthenware, terracotta, studio pottery'),
  ('Wood & Carving', 'woodwork', 'Hand-carved Kashmiri walnut and Sheesham items'),
  ('Jewelry & Ornaments', 'jewelry', 'Traditional silver, brass, and beaded jewelry'),
  ('Art & Folk Paintings', 'painting', 'Madhubani, Warli, and Pattachitra folk art'),
  ('Handicraft & Decor', 'handmade', 'Home decor and handmade craft items'),
  ('Other Crafts', 'other', 'Miscellaneous handmade items and tools')
ON CONFLICT (slug) DO NOTHING;
