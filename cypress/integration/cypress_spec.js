describe('VeloViewer Activity Snapshotting', () => {
  it('Visits the Home page', () => {
    cy.visit('https://veloviewer.com')
	cy.get('a[href*="/update').first().click()

	cy.get('.btn-accept-cookie-banner').click()
	//cy.get('#email').type('torsten.schlieder@gmx.net')
	//cy.get('#password').type('55mouton89')
	//cy.get('#login-button').click()
  })

	/*
  it('Logs in to Strava', () => {
	const options = {
      method: 'GET',
      url: 'https://www.strava.com/oauth/authorize',
      qs: {
		client_id: '36',
		scope: 'read,read_all,profile:read_all,profile:write,activity:read,activity:read_all,activity:write',
		redirect_uri: 'https://veloviewer.com/update',
		response_type: 'code',
		approval_prompt: 'auto',
		state: 'private'
      }
    }
	cy.visit(options)
	cy.get('#login_form #email').should('be.visible')
	cy.get('#login_form #email').type('torsten.schlieder@gmx.net')
	cy.get('#login_form #password').type('55mouton89')
	cy.get('#login_form #login-button').click()
  })
  */
})
