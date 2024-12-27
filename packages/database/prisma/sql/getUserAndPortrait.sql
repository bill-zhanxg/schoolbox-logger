-- @param {Int} $1:take
-- @param {Int} $2:skip
-- @param {String} $3:search Search name field
SELECT
	a.id AS "userId",
	p.id AS "portraitId",
	a.*,
	p.*,
	t.total_count
FROM
	"AzureUsers" AS a
	FULL OUTER JOIN "Portraits" AS p ON LOWER(a.mail) = LOWER(p.mail)
	CROSS JOIN (
		SELECT COUNT(*) AS total_count
		FROM "AzureUsers" AS x
		FULL OUTER JOIN "Portraits" AS y ON LOWER(x.mail) = LOWER(y.mail)
	) AS t
WHERE
	a."displayName" % $3
	OR p."name" % $3
	OR $3 = ''
LIMIT $1 OFFSET $2;
