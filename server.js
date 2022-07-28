const express = require("express");
const app = express();
const stripe = require("stripe")(
  "sk_test_51IfrSnFRZt7FtZ9TlFgFuHQ7paiQ3nHOakoDVGguBokhid4UOPAJhWRNxhFcUWbc7vVWYucdvRc6tqScKPcXsAKy00A0lbef98"
);
const nodemailer = require("nodemailer");

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  const fullCost = items * 100;
  return fullCost;
};

app.get("/", (req, res) => {
  res.send("Server working!");
});

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "pln",
    payment_method_types: ["card", "p24"],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.post("/mail-to-shop", async (req, res) => {
  const data = req.body;

  async function main() {
    let transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "fd052cb1d12057",
        pass: "c8a4c4b2246297",
      },
    });

    let message = {
      from: `${data.clientEmail}`,
      to: "caffe@office.pl",
      bcc: "caffe@office.pl",
      subject: `Order from ${data.nameAndSurname}`,
      text: "You have new order",
      html:
        `<p>Country: ${data.countrySelection}</p>` +
        `<p>Mr/Mrs: ${data.nameAndSurname}</p>` +
        `<p>e-mail: ${data.clientEmail}</p>` +
        `<p>tel. ${data.clientTelephone}</p>` +
        `<p>Address: ${data.clientCityPostcode} ${data.clientCity}, ${data.clientCityStreet} ${data.clientCityHome}</p>` +
        `<p>Flat: ${data.clientHomeFlat}</p>` +
        `<p>Delivery Method: ${data.DeliveryMethod}</p>` +
        `<p>Delivery Cost: ${data.DeliveryCost} zł</p>` +
        `<p>Order: ${data.Order} zł</p>` +
        `<p>Message: ${data.clientMessage}</p>` +
        `<p>Traditional payment ID: ${data.TraditionalPaymentNumber}</p>` +
        `<p>Total Cost: ${data.TotalCost} zł</p>`,
    };
    let info = await transporter.sendMail(message);
    console.log("Message sent successfully as %s", info.messageId);
  }
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
});

app.post("/mail-contact", async (req, res) => {
  const data = req.body;

  async function main() {
    let transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "fd052cb1d12057",
        pass: "c8a4c4b2246297",
      },
    });

    let message = {
      from: `${data.email}`,
      to: "caffe@office.pl",
      bcc: "caffe@office.pl",
      subject: `Contact from ${data.name}`,
      text: "You have new contact",
      html: `<p>Tel: ${data.tel}</p>` + `<p>Message: ${data.message}</p>`,
    };
    let info = await transporter.sendMail(message);
    console.log("Message sent successfully as %s", info.messageId);
    res.send({
      msg: "Done",
    });
  }
  main().catch((err) => {
    console.error(err.message);
    res.send({
      msg: "Something went wrong!",
    });
    process.exit(1);
  });
});

const port = process.env.PORT || 4242;

app.listen(port, () => console.log(`Node server listening on port ${port}!`));
