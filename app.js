const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Nexmo = require('nexmo');
const nodemailer = require('nodemailer');

const User = require("./models/user");
const app = express();

const nexmo = new Nexmo({
 apiKey: 'apiKey',
 apiSecret: 'apiSecret'
});

mongoose
  .connect("mongodb://dbuser:dbpass@ds215338.mlab.com:15338/moneyu")
  .then(() => console.log("Connected to m labs"))
  .catch(err => console.log(err));

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/user", async function(req, res) {
  User.find({})
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => res.send("Something Went Wrong"));
});

app.post("/user", async function(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const mobile = req.body.mobile;
  const messages = [];

  const user = User({
    name,
    email,
    mobile,
    messages
  });
  user
    .save()
    .then(data => res.status(200).send(data))
    .catch(err => res.send("Error occured"));
});

app.get("/messages/sent/user/:id", async function(req, res) {
    const id = req.params.id
    User.findById({
        _id: id
    })
    .then(response => res.status(200).send(response.messages))
    .catch(error => res.status(500).send("requested user not available"))
});
  
app.post("/send", async function (req, res) {
  const message = req.body.message;

  User.find({})
    .then(users => {
        if(users.length > 0) {
            users.forEach(async (user)=> {
                const toSMS = user.mobile;
                const toMail = user.email;
                const emailSend = {
                    from: "get.mageshwaran@gmail.com",
                    to: toMail,
                    subject: "Lambda",
                    text: message
                };
                const messageObject = {
                    to: toSMS,
                    message
                };
                // send email
                let emailResponse = await wrapedSendMail(emailSend);
                // Send SMS
                let smsResponse = await wrapedSendSMS(messageObject);

                if (emailResponse && smsResponse) {
                    const messages = user.messages;
                    messages.push(message);

                    User.findByIdAndUpdate(
                        { _id: user.id },
                        {
                          $set: {
                            messages
                          }
                        },
                        { new: true }
                      )
                      .then(data => console.log(data))
                      .catch(error => console.log(error))
                }
            });
            res.status(200).send("Sent message successfully")
        } else {
            res.status(204).send('No users available')
        }
    })
    .catch(err => res.status(500).send("Something Went Wrong"));
});

async function wrapedSendMail(mailOptions) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "user",
        pass: "pass"
      }
    });
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        resolve(false); // or use rejcet(false) but then you will have to handle errors
      } else {
        resolve(true);
      }
    });
  });
}


async function wrapedSendSMS(message) {
  return new Promise((resolve, reject) => {
    nexmo.message.sendSms(
      "Nexmo",
      message.to,
      message.message,
      { type: "unicode" },
      (err, info) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

module.exports.handler = serverless(app);