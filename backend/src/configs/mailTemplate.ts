export const mailTemplate: string = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmation - Mello Cloud</title>
    <style>
        /* to-do: add styles */
    </style>
</head>
<body>
    <div>
        <h1>Welcome to Mello Cloud!</h1>
        <p>Thank you for registering an account with us.</p>
        <p>Your account details:</p>
        <ul>
            <li><strong>Email:</strong> <%= email %></li>
            <li><strong>Username:</strong> <%= userName %></li>
        </ul>
        <p>Click the link below to confirm your email address and complete the registration process:</p>
        <a href="<%= activationToken %>">Confirm Email Address</a>
    </div>
</body>
</html>
`