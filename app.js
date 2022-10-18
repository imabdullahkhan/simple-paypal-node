const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': '',
  'client_secret': ''
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success?userId=1",
      "cancel_url": "http://localhost:3000/cancel?userId=1"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Red Sox Hat",
          "sku": "001",
          "price": "25.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "25.00"
      },
      "description": "Hat for the best team ever"
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });

});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const userId = req.query.userId;
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send('Success');
    }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));


app.get('/single-payout', (req, res) => {

  var sender_batch_id = Math.random().toString(36).substring(9);
  console.log("🚀 ~ file: app.js ~ line 91 ~ app.get ~ sender_batch_id", sender_batch_id)
  var create_payout_json = {
    "sender_batch_header": {
      "sender_batch_id": sender_batch_id,
      "email_subject": "You have a payment"
    },
    "items": [ // array of items mean batch of payments
      {
        "recipient_type": "EMAIL",
        "amount": {
          "value": "1.00",
          "currency": "USD"
        },
        "receiver": "doe.customer@gotocoordinator.com",
        "note": "Thank you.",
        "sender_item_id": "item_3"
      }
    ]
  };


  paypal.payout.create(create_payout_json, function (error, payout) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log("Create Single Payout Response");
      console.log(payout);
    }
  });
  res.send('PayOut DONE BRO!!!!!!! ')
})
getPayout = async (payoutId) => {
  return new Promise((resolve, reject) => {
    paypal.payout.get(payoutId, function (error, payout) {
      if (error) {
        console.log(error);
        reject(error)
      } else {
        console.log("Get Payout Response");
        console.log(JSON.stringify(payout));
        resolve(payout)
      }
    });   
  })
}

app.get('/get-payout-detail', async (req, res) => {
  var payoutId = 'DXBZAZ3TN36N6'
  console.log("PROMISE ~ file: app.js ~ line 123 ~ app.get ~ payoutId", payoutId)
  let resposne  = await getPayout(payoutId);

  res.send('Pay DETAILS DONE BRO!!!!!!! ')

})

app.listen(3000, () => console.log('Server Started'));