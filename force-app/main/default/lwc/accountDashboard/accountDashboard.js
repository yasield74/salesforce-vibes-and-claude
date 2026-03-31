import { LightningElement, api, wire } from "lwc";
import getAccount from "@salesforce/apex/AccountDashboardController.getAccount";

const SLA_TIER_VARIANTS = {
  Platinum: "badge badge-sla-platinum",
  Gold: "badge badge-sla-gold",
  Silver: "badge badge-sla-silver",
  Bronze: "badge badge-sla-bronze"
};

const PRIORITY_VARIANTS = {
  High: "badge badge-priority-high",
  Medium: "badge badge-priority-medium",
  Low: "badge badge-priority-low"
};

const SLA_WARNING_DAYS = 30;

export default class AccountDashboard extends LightningElement {
  @api recordId;
  account;
  error;

  @wire(getAccount, { recordId: "$recordId" })
  wiredAccount({ data, error }) {
    if (data) {
      this.account = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.account = undefined;
    }
  }

  get errorMessage() {
    if (!this.error) return "";
    if (typeof this.error === "string") return this.error;
    // Handle common wire error shapes
    if (Array.isArray(this.error)) {
      const first = this.error.find((e) => e && (e.message || e.body?.message));
      if (first?.message) return first.message;
      if (first?.body?.message) return first.body.message;
    }
    if (this.error.body?.message) return this.error.body.message;
    return "An unexpected error occurred.";
  }

  get formattedRevenue() {
    if (this.account?.AnnualRevenue == null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(this.account.AnnualRevenue);
  }

  get activeVariant() {
    if (this.account?.Active__c === "Yes") return "badge badge-active";
    return "badge badge-inactive";
  }

  get priorityVariant() {
    return PRIORITY_VARIANTS[this.account?.CustomerPriority__c] ?? "badge";
  }

  get slaTierVariant() {
    return SLA_TIER_VARIANTS[this.account?.SLA__c] ?? "badge";
  }

  get slaExpiring() {
    if (!this.account?.SLAExpirationDate__c) return false;
    const expDate = new Date(this.account.SLAExpirationDate__c);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = (expDate - today) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= SLA_WARNING_DAYS;
  }

  get slaExpired() {
    if (!this.account?.SLAExpirationDate__c) return false;
    const expDate = new Date(this.account.SLAExpirationDate__c);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expDate < today;
  }

  get slaExpirationClass() {
    if (this.slaExpired) {
      return "sla-expiration sla-expiring";
    }
    return this.slaExpiring ? "sla-expiration sla-expiring" : "sla-expiration";
  }
}
