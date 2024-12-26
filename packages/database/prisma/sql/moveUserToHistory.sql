WITH moved_rows AS (
    DELETE FROM "AzureUsers"
    RETURNING *
)
INSERT INTO "AzureUserHistory" ("userId", "accountEnabled", "ageGroup", "businessPhones", "city", "createdDateTime", "department", "displayName", "givenName", "lastPasswordChangeDateTime", "mail", "mailNickname", "mobilePhone", "onPremisesDistinguishedName", "onPremisesSamAccountName", "onPremisesSyncEnabled", "postalCode", "streetAddress", "surname", "userType", "onPremisesLastSyncDateTime", "createdAt", "updatedAt")
SELECT id as "userId", "accountEnabled", "ageGroup", "businessPhones", "city", "createdDateTime", "department", "displayName", "givenName", "lastPasswordChangeDateTime", "mail", "mailNickname", "mobilePhone", "onPremisesDistinguishedName", "onPremisesSamAccountName", "onPremisesSyncEnabled", "postalCode", "streetAddress", "surname", "userType", "onPremisesLastSyncDateTime", "createdAt", "updatedAt"
FROM moved_rows;