/**
 * AWS Amplify configuration for authentication
 */

const amplifyConfig = {
  Auth: {
    // Amazon Cognito Region
    region: process.env.REACT_APP_AWS_REGION,
    
    // Amazon Cognito User Pool ID
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    
    // Amazon Cognito Web Client ID
    userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    
    // Amazon Cognito Identity Pool ID
    identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID,
    
    // Auth flow type
    authenticationFlowType: 'USER_SRP_AUTH',

    // OAuth configuration (if needed)
    oauth: {
      domain: 'auth.document-processor.com',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: process.env.REACT_APP_URL,
      redirectSignOut: `${process.env.REACT_APP_URL}/login`,
      responseType: 'code'
    }
  }
};

export default amplifyConfig;
