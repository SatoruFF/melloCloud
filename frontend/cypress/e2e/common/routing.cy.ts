describe('Is routes up', () => {
  it('To main pages', () => {
    cy.visit('/');
    cy.get('[data-testid=MainPage]').should('exist');
  });
});
