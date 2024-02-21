const docusign = require('docusign-esign');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
module.exports.hello = async (event) => {

  const getToken = async () => {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(process.env.BASE_PATH);
    const results = await dsApiClient.requestJWTUserToken
      (process.env.INTEGRATION_KEY, process.env.USER_ID, ["signature"], fs.readFileSync('private.key'), 3600);
    console.log("Got token", results.body);
    return results.body;
  };

  const getEnvelopesApi = (access_token) => {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(process.env.BASE_PATH);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + access_token);
    return new docusign.EnvelopesApi(dsApiClient);
  }

  const makeEnvelope = (name, email) => {
    // Create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.templateId = process.env.TEMPLATE_ID;

    // Create template role elements to connect the signer and cc recipients
    // to the template
    // We're setting the parameters via the object creation
    let signer1 = docusign.TemplateRole.constructFromObject({
      email: email,
      name: name,
      roleName: 'ApplicantTest'
    });

    // Create a cc template role.
    // We're setting the parameters via setters
    //let cc1 = new docusign.TemplateRole();
    //cc1.email = args.ccEmail;
    //cc1.name = args.ccName;
    //cc1.roleName = 'cc';

    // Add the TemplateRole objects to the envelope object
    env.templateRoles = [signer1];
    env.status = "sent"; // We want the envelope to be sent

    return env;
  }

  try {
    let token = await getToken();
    let envelopesApi = getEnvelopesApi(token.access_token);
        
    // Make the envelope request body
    let envelope = makeEnvelope(req.body.name,req.body.email);
    
    // Call Envelopes::create API method
    // Exceptions will be caught by the calling function
    let results = await envelopesApi.createEnvelope(
            process.env.ACCOUNT_ID, {envelopeDefinition: envelope});
    return {
      statusCode: 200,
      body: results
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error'
      })
    };
  }

  
};
