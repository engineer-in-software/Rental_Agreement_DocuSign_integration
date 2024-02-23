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
  
  let result = ''
  let isError = false;
  let errorMsg = '';
  try {
    console.log('event',event);
    if(event.httpMethod === 'POST') {
          let token = await getToken();
    let envelopesApi = getEnvelopesApi(token.access_token);
      
    const reqBody = JSON.parse(event.body);
    // Make the envelope request body
    let envelope = makeEnvelope(reqBody.name,reqBody.email);
    
    // Call Envelopes::create API method
    // Exceptions will be caught by the calling function
    result = await envelopesApi.createEnvelope(
            process.env.ACCOUNT_ID, {envelopeDefinition: envelope});
    }


  } catch (e) {
    isError = true;
    errorMsg = e;
    
  }
  
 return {
   statusCode: isError ? 500 : 200,
   headers: {
            "Access-Control-Allow-Origin": "*", // Allow requests from any origin
            "Access-Control-Allow-Headers": "Content-Type", // Allow only Content-Type header
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET" // Allow only OPTIONS, POST, and GET methods
    },
 };
  
};
