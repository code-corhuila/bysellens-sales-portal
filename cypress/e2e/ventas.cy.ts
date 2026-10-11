describe('Pantalla original de Ventas con datos MOCK', () => {
  beforeEach(() => {
    cy.intercept('http://localhost:8080/**', () => {
      throw new Error('Ventas MOCK no debe consultar el backend');
    });
    cy.visit('/login', { onBeforeLoad(ventana) { ventana.localStorage.clear(); ventana.sessionStorage.clear(); } });
    cy.get('#email').type('admin@bysellens.com');
    cy.get('#password').type('demo123');
    cy.get('button[type="submit"]').click();
    cy.location('pathname').should('eq', '/ventas');
    cy.contains('td', 'Ana Demo').should('be.visible');
  });

  it('registra una venta, actualiza importes, conserva el historial y descuenta stock', () => {
    cy.viewport(1200, 700);
    cy.contains('button', 'Nueva venta').click();
    cy.get('#venta-cliente').select('1');
    cy.get('#venta-producto-0').select('1');
    cy.get('#venta-cantidad-0').type('{selectall}2');
    cy.get('#venta-pago').select('NEQUI');
    cy.get('.venta-summary').should('contain.text', '36.000');
    cy.contains('button', 'Registrar venta').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('tbody tr').should('have.length', 2);
    cy.get('tbody tr').first().should('contain.text', '#2').and('contain.text', 'NEQUI');
    cy.get('.ventas-stats').should('contain.text', '54.000');
    cy.window().then(ventana => { expect(ventana.document.documentElement.scrollWidth).to.be.at.most(ventana.innerWidth); });
    cy.screenshot('ventas-escritorio', { capture: 'viewport' });
    cy.get('[aria-label="Buscar ventas"]').type('nequi');
    cy.get('tbody tr').should('have.length', 1);
    cy.get('[aria-label="Buscar ventas"]').clear().type('2');
    cy.get('tbody tr').should('have.length', 1);
    cy.reload();
    cy.get('tbody tr').should('have.length', 2);
    cy.contains('button', 'Nueva venta').click();
    cy.get('#venta-producto-0').find('option[value="1"]').should('contain.text', 'Stock: 18');
    cy.contains('button', 'Cancelar').click();
  });

  it('conserva validaciones de cliente, productos repetidos y cantidades enteras', () => {
    cy.contains('button', 'Nueva venta').click();
    cy.contains('button', 'Registrar venta').click();
    cy.get('[role="alert"]').should('contain.text', 'Selecciona un cliente');
    cy.get('#venta-cliente').select('1');
    cy.contains('button', 'Registrar venta').click();
    cy.get('[role="alert"]').should('contain.text', 'al menos un producto');
    cy.get('#venta-producto-0').select('1');
    cy.contains('button', 'Agregar otro producto').click();
    cy.get('#venta-producto-1').select('1');
    cy.contains('button', 'Registrar venta').click();
    cy.get('[role="alert"]').should('contain.text', 'mismo producto dos veces');
    cy.get('[title="Eliminar producto"]').last().click();
    cy.get('#venta-cantidad-0').type('.5');
    cy.contains('button', 'Registrar venta').click();
    cy.get('[role="alert"]').should('contain.text', 'entero');
    cy.get('tbody tr').should('have.length', 1);
  });

  it('muestra el error MOCK si el stock cambia mientras se registra', () => {
    cy.contains('button', 'Nueva venta').click();
    cy.get('#venta-cliente').select('1');
    cy.get('#venta-producto-0').select('1');
    cy.window().then(ventana => {
      const datos = {
        clientes: [{ id: 1, nombre: 'Ana Demo', activo: true }],
        productos: [{ id: 1, nombre: 'Labial rosa', activo: true, stock: 0 }],
        ventas: [],
      };
      ventana.localStorage.setItem('bysellens_mock_v1', JSON.stringify(datos));
    });
    cy.contains('button', 'Registrar venta').click();
    cy.get('[role="alert"]').should('contain.text', 'Stock insuficiente');
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('permite usar el panel y sus acciones en una pantalla móvil', () => {
    cy.viewport(390, 700);
    cy.contains('button', 'Nueva venta').click();
    cy.get('#venta-cliente').select('1');
    cy.get('#venta-producto-0').select('1');
    cy.get('#venta-cantidad-0').should('be.visible');
    cy.get('.venta-form-content').scrollTo('bottom');
    cy.contains('button', 'Registrar venta').should('be.visible');
    cy.contains('h3', 'M\u00e9todo de pago').should('be.visible');
    cy.screenshot('venta-movil', { capture: 'viewport' });
    cy.contains('button', 'Registrar venta').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('tbody tr').should('have.length', 2);
  });
});
