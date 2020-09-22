SELECT * FROM "notes" LIMIT 1000;
SELECT * FROM "folders" LIMIT 1000;

-- SELECT n.title AS note, f.title AS folder
--     FROM "notes" n
--     LEFT JOIN "folders" f
--     ON f.id = n.folder_id;