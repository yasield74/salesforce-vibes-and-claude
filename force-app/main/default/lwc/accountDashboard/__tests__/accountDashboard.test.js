import { createElement } from "lwc";
import AccountDashboard from "c/accountDashboard";
import getAccount from "@salesforce/apex/AccountDashboardController.getAccount";
import { registerApexTestWireAdapter } from "@salesforce/wire-service-jest-util";

const getAccountAdapter = registerApexTestWireAdapter(getAccount);

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

const BASE_ACCOUNT = {
  Id: "001000000000001AAA",
  Name: "Acme Corp",
  Industry: "Technology",
  Type: "Customer",
  Website: "https://acme.com",
  Phone: "555-1234",
  AnnualRevenue: 10000000,
  NumberOfEmployees: 500,
  NumberofLocations__c: 5,
  Active__c: "Yes",
  Rating: "Hot",
  CustomerPriority__c: "High",
  UpsellOpportunity__c: "Yes",
  SLA__c: "Gold",
  SLASerialNumber__c: "SLA-12345",
  SLAExpirationDate__c: futureDate(90)
};

describe("c-account-dashboard", () => {
  let element;

  beforeEach(() => {
    element = createElement("c-account-dashboard", { is: AccountDashboard });
    element.recordId = "001000000000001AAA";
    document.body.appendChild(element);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders with valid account data", async () => {
    getAccountAdapter.emit(BASE_ACCOUNT);
    await flushPromises();
    const card = element.shadowRoot.querySelector("lightning-card");
    expect(card).not.toBeNull();
    expect(card.title).toBe("Account Overview");
  });

  it("shows SLA expiration warning when within 30 days", async () => {
    getAccountAdapter.emit({
      ...BASE_ACCOUNT,
      SLAExpirationDate__c: futureDate(15)
    });
    await flushPromises();
    const expirationEl = element.shadowRoot.querySelector(".sla-expiring");
    expect(expirationEl).not.toBeNull();
  });

  it("does not show SLA expiration warning when more than 30 days away", async () => {
    getAccountAdapter.emit({
      ...BASE_ACCOUNT,
      SLAExpirationDate__c: futureDate(60)
    });
    await flushPromises();
    const expirationEl = element.shadowRoot.querySelector(".sla-expiring");
    expect(expirationEl).toBeNull();
  });

  it.each([
    ["High", "badge-priority-high"],
    ["Medium", "badge-priority-medium"],
    ["Low", "badge-priority-low"]
  ])(
    "applies correct priority badge for %s priority",
    async (priority, expectedClass) => {
      getAccountAdapter.emit({
        ...BASE_ACCOUNT,
        CustomerPriority__c: priority
      });
      await flushPromises();
      const badge = element.shadowRoot.querySelector(`.${expectedClass}`);
      expect(badge).not.toBeNull();
    }
  );

  it.each([
    ["Platinum", "badge-sla-platinum"],
    ["Gold", "badge-sla-gold"],
    ["Silver", "badge-sla-silver"],
    ["Bronze", "badge-sla-bronze"]
  ])(
    "applies correct SLA tier badge for %s tier",
    async (tier, expectedClass) => {
      getAccountAdapter.emit({ ...BASE_ACCOUNT, SLA__c: tier });
      await flushPromises();
      const badge = element.shadowRoot.querySelector(`.${expectedClass}`);
      expect(badge).not.toBeNull();
    }
  );

  it("renders inactive badge when Active__c is No", async () => {
    getAccountAdapter.emit({ ...BASE_ACCOUNT, Active__c: "No" });
    await flushPromises();
    const badge = element.shadowRoot.querySelector(".badge-inactive");
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe("No");
  });

  it("displays error message when wire returns an error", async () => {
    getAccountAdapter.emitError({
      status: 400,
      statusText: "Bad Request",
      body: { message: "Record not found" }
    });
    await flushPromises();
    const errorEl = element.shadowRoot.querySelector(".slds-text-color_error");
    expect(errorEl).not.toBeNull();
  });

  it("renders without crashing when optional fields are null", async () => {
    getAccountAdapter.emit({
      ...BASE_ACCOUNT,
      AnnualRevenue: null,
      CustomerPriority__c: null,
      SLA__c: null,
      SLAExpirationDate__c: null,
      UpsellOpportunity__c: null,
      Rating: null
    });
    await flushPromises();
    const card = element.shadowRoot.querySelector("lightning-card");
    expect(card).not.toBeNull();
  });
});
