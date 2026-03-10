describe("Login Test", () => {
  it("should login successfully", () => {
    cy.visit("/login");

    cy.contains("Sign in to your account");

    cy.get('input[placeholder="student@university.edu"]').type("test@gmail.com");

    cy.get('input[type="password"]').type("123456");

    cy.contains("Sign In").click();
  });
});