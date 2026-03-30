public with sharing class AccountDashboardController {
  @AuraEnabled(cacheable=true)
  public static Account getAccount(Id recordId) {
    try {
      SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.READABLE,
        [
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
          LIMIT 1
        ]
      );
      List<Account> records = (List<Account>) decision.getRecords();
      return records.isEmpty() ? null : records[0];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
