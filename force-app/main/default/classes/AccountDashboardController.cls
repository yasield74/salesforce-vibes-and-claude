public with sharing class AccountDashboardController {
  @AuraEnabled(cacheable=true)
  public static Account getAccount(Id recordId) {
    try {
      return [
        SELECT
          Id,
          Name,
          Industry,
          Type,
          Website,
          Phone,
          AnnualRevenue,
          NumberOfEmployees,
          NumberofLocations__c,
          Active__c,
          Rating,
          CustomerPriority__c,
          UpsellOpportunity__c,
          SLA__c,
          SLASerialNumber__c,
          SLAExpirationDate__c
        FROM Account
        WHERE Id = :recordId
        WITH SECURITY_ENFORCED
        LIMIT 1
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
