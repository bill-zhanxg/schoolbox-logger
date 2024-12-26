WITH moved_rows AS (
    DELETE FROM "AzureUsers"
    RETURNING *
)
INSERT INTO "AzureUserHistory"
SELECT * FROM moved_rows;