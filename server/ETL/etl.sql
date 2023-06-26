INSERT INTO prd.decision (
    ADA, 
    SUBJECT, 
    ORGANIZATION,
    AMOUNT,
    PUBLISH_DATE,
    KAE,
    THEMATIC_CATEGORY,
    DECISION_TYPE,
    PDF_URL,
    SIGNER,
    STATUS
)
SELECT ADA, 
    SUBJECT, 
    ORGANIZATION,
    AMOUNT,
    PUBLISH_DATE,
    KAE,
    SUBSTRING(thematic_category, 2, CHARINDEX('}', thematic_category) - 2),
    DECISION_TYPE,
    PDF_URL,
    SIGNER,
    STATUS
FROM stg.decision
