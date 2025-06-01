-- Update existing tags with correct abbreviations and full names
UPDATE tags SET code = 'AP', name = 'Apparel' WHERE name = 'Apparel';
UPDATE tags SET code = 'PA', name = 'Patch Apply' WHERE name = 'Patch Apply';
UPDATE tags SET code = 'EM', name = 'Embroidery' WHERE name = 'Embroidery';
UPDATE tags SET code = 'HW', name = 'Headwear' WHERE name = 'Headwear';
UPDATE tags SET code = 'SW', name = 'Sew Down' WHERE name = 'Sew Down';
UPDATE tags SET code = 'CR', name = 'Crafter' WHERE name = 'Crafter';
UPDATE tags SET code = 'SC', name = 'Supacolor' WHERE name = 'Supacolor';
UPDATE tags SET code = 'DF', name = 'Direct to Film' WHERE name = 'Direct to Film';
UPDATE tags SET code = 'SEW', name = 'Sewing' WHERE name = 'Sewing';
UPDATE tags SET code = 'MISC', name = 'Miscellaneous' WHERE name = 'Miscellaneous';

-- Insert any missing tags
INSERT INTO tags (code, name, color, organization_id)
SELECT 'AP', 'Apparel', '#FF5733', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'AP');

INSERT INTO tags (code, name, color, organization_id)
SELECT 'PA', 'Patch Apply', '#33FF57', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'PA');

INSERT INTO tags (code, name, color, organization_id)
SELECT 'EM', 'Embroidery', '#3357FF', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'EM');

INSERT INTO tags (code, name, color, organization_id)
SELECT 'HW', 'Headwear', '#FF33F6', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'HW');

INSERT INTO tags (code, name, color, organization_id)
SELECT 'SW', 'Sew Down', '#F6FF33', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'SW');

INSERT INTO tags (code, name, color, organization_id)
SELECT 'CR', 'Crafter', '#33FFF6', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'CR');

INSERT INTO tags (code, name, color, organization_id)
SELECT 'SC', 'Supacolor', '#FF3333', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'SC');

INSERT INTO tags (code, name, color, organization_id)
SELECT 'DF', 'Direct to Film', '#33FF33', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'DF');

INSERT INTO tags (code, name, color, organization_id)
SELECT 'SEW', 'Sewing', '#3333FF', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'SEW');

INSERT INTO tags (code, name, color, organization_id)
SELECT 'MISC', 'Miscellaneous', '#808080', 1
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE code = 'MISC'); 