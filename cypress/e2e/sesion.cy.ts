describe('Sesión independiente de Sales', () => {
  beforeEach(() => {
    cy.intercept('http://localhost:8080/**', () => {
      throw new Error('El modo MOCK no debe consultar el backend');
    });
    cy.visit('/ventas');
    cy.location('pathname').should('eq', '/login');
  });

  it('inicia sesión, conserva la sesión al recargar y protege la ruta al salir', () => {
    cy.get('#email').type('admin@bysellens.com');
    cy.get('#password').type('demo123');
    cy.get('button[type="submit"]').click();
    cy.location('pathname').should('eq', '/ventas');
    cy.contains('h1', 'Ventas').should('be.visible');
    cy.reload();
    cy.contains('h1', 'Ventas').should('be.visible');
    cy.contains('button', 'Cerrar sesión').click();
    cy.location('pathname').should('eq', '/login');
    cy.visit('/ventas');
    cy.location('pathname').should('eq', '/login');
  });

  it('muestra un error al rechazar credenciales incorrectas', () => {
    cy.get('#email').type('admin@bysellens.com');
    cy.get('#password').type('incorrecta');
    cy.get('button[type="submit"]').click();
    cy.get('.login-error').should('be.visible');
    cy.location('pathname').should('eq', '/login');
    cy.window().then(ventana => {
      expect(ventana.sessionStorage.getItem('bysellens_access_token')).to.eq(null);
    });
  });
});
