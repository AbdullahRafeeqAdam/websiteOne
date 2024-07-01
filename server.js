const express = require('express');
const bodyParser = require('body-parser');
const braintree = require('braintree');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Braintree gateway
var gateway = new braintree.BraintreeGateway({
    environment:  braintree.Environment.Sandbox,
    merchantId:   'tztv9gt8364n2947',
    publicKey:    '6bj6w4csgbgkvk9n',
    privateKey:   '45321d1ebe5ffb6e39d06f544bf78df6'
});

// Generate client token
app.get('/client_token', (req, res) => {
    gateway.clientToken.generate({}, (err, response) => {
        if (err) {
            res.status(500).send({ error: err });
        } else {
            res.send({ clientToken: response.clientToken });
        }
    });
});

// Handle payment
app.post('/checkout', (req, res) => {
    const nonceFromTheClient = req.body.paymentMethodNonce;
    const amount = req.body.amount; // Get the amount from the request body
    const saleRequest = {
        amount: amount,
        paymentMethodNonce: nonceFromTheClient,
        options: {
            submitForSettlement: true
        }
    };

    gateway.transaction.sale(saleRequest, (err, result) => {
        if (err) {
            res.status(500).send({ error: err });
        } else if (result.success) {
            res.send({ success: true });
        } else {
            res.status(400).send({ error: result.message });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
