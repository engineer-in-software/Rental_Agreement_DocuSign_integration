import * as session from 'express-session';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';

// Configure AWS SDK with your region
AWS.config.region = 'us-east-1';

const poolData = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: 'us-east-1_tEHio2qJs',
    ClientId: '61cvu9sac04qm97cdiqmm4ulue',
});

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

function authenticateUser(event) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const authenticationData = {
        Username: username,
        Password: password,
    };

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    const userData = {
        Username: username,
        Pool: userPool,
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
            console.log('Authentication successful');

            // Redirect to the home page or perform necessary actions
            window.location.href = 'home.html'; // Replace with the actual home page URL
            alert('Login successful!'); // Display a success message or perform other actions after successful login.
            document.getElementById('login-form').reset(); // Reset the form fields after successful login.
            console.log('Session:', session); // Log the session object for debugging purposes.
            console.log('CognitoUser:', cognitoUser); // Log the CognitoUser object for debugging purposes.
            console.log('AWS.config.credentials:', AWS.config.credentials); // Log the AWS.config.credentials object for debugging purposes.
            console.log('AWS.config.credentials.accessKeyId:', AWS.config.credentials.accessKeyId); // Log the AWS.config.credentials.accessKeyId for debugging purposes.
            console.log('AWS.config.credentials.secretAccessKey:', AWS.config.credentials.secretAccessKey); // Log the AWS.config.credentials.secretAccessKey for debugging purposes.
            console.log('AWS.config.credentials.sessionToken:', AWS.config.credentials.sessionToken); // Log the AWS.config.credentials.sessionToken for debugging purposes.
        },
        onFailure: (err) => {
            console.error('Authentication failed', err);
            // Handle authentication failure
            alert('Authentication failed. Please try again.');
            document.getElementById('login-form').reset(); // Reset the form fields after a failed login attempt.
            console.log('CognitoUser:', cognitoUser); // Log the CognitoUser object for debugging purposes.
            console.log('AWS.config.credentials:', AWS.config.credentials); // Log the AWS.config.credentials object for debugging purposes.
            console.log('AWS.config.credentials.accessKeyId:', AWS.config.credentials.accessKeyId); // Log the AWS.config.credentials.accessKeyId for debugging purposes.
            console.log('AWS.config.credentials.secretAccessKey:', AWS.config.credentials.secretAccessKey); // Log the AWS.config.credentials.secretAccessKey for debugging purposes.
            console.log('AWS.config.credentials.sessionToken:', AWS.config.credentials.sessionToken); // Log the AWS.config.credentials.sessionToken for debugging purposes.
            console.log('Session:', session); // Log the session object for debugging purposes.
            console.log('AuthenticationDetails:', authenticationDetails); // Log the AuthenticationDetails object for debugging purposes.
            console.log('AuthenticationData:', authenticationData); // Log the AuthenticationData object for debugging purposes.
            console.log('Username:', username); // Log the username for debugging purposes.
            
        },
    });
}

document.getElementById('login-form').addEventListener('submit', authenticateUser);
document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
});