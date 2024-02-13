const express = require('express');
const path = require("path");
const docusign = require('docusign-esign');
const fs = require('fs');

const session = require('express-session');

const app = express();
const port = 8000;

const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "dfsf94835asadaf",
    resave: true,
    saveUninitialized: true
}));

app.post('/form', async (req, res) => {
    await checkToken(req);
    let envelopesApi = getEnvelopesApi(req);
        
    // Make the envelope request body
    let envelope = makeEnvelope(req.body.name,req.body.email);
    
    // Call Envelopes::create API method
    // Exceptions will be caught by the calling function
    let results = await envelopesApi.createEnvelope(
            process.env.ACCOUNT_ID, {envelopeDefinition: envelope});
    
    console.log("envelope results ", results);
    
    console.log("Received form data",req.body);
    res.send("Form data received");
});

function getEnvelopesApi(request){
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(process.env.BASE_PATH);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + request.session.access_token);
    return new docusign.EnvelopesApi(dsApiClient);
}

function makeEnvelope(name,email){

    // Create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.templateId = process.env.TEMPLATE_ID;

    // Create template role elements to connect the signer and cc recipients
    // to the template
    // We're setting the parameters via the object creation
    let signer1 = docusign.TemplateRole.constructFromObject({
        email: email,
        name: name ,
        roleName: 'ApplicantTest'});

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



async function checkToken(req){

    if(req.session.access_token && req.session.expires_at > Date.now()){
        console.log("re-using access token",req.session.access_token);
        
    }
    else{
    console.log("generating a new token");
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(process.env.BASE_PATH);
    const results = await dsApiClient.requestJWTUserToken
         (process.env.INTEGRATION_KEY, process.env.USER_ID, ["signature"], fs.readFileSync('private.key'), 3600);
    console.log("Got token",results.body);
    req.session.access_token = results.body.access_token;
    req.session.expires_at = Date.now() + (results.body.expires_in - 60) * 1000;
 
    }
}

app.get('/',async (req, res) => {
    
    await checkToken(req);
    res.sendFile(path.join(__dirname + '/main.html'));
    

})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`,process.env.USER_ID);
});



//ManageApplication

eg003ListEnvelopes.worker = async (args) => {
    
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient)
      , results = null;

    // List the envelopes
    // The Envelopes::listStatusChanges method has many options
    // See https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/listStatusChanges

    // The list status changes call requires at least a from_date OR
    // a set of envelopeIds. Here we filter using a from_date.
    // Here we set the from_date to filter envelopes for the last month
    // Use ISO 8601 date format
    let options = {fromDate: moment().subtract(30, 'days').format()};

    // Exceptions will be caught by the calling function
    results = await envelopesApi.listStatusChanges(args.accountId, options);
    return results;
}

//https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=86c68f8d-de70-4492-8361-8a0f5f467254&redirect_uri=http://localhost:8000/