require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = 8080;

app.use("/stripe", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(cors());

app.post("/pay", async (req, res) => {
  try {
    const { name, totalPrice, carName, pickupDate, returnDate } = req.body; // Extract additional data from the request body
    if (!name || !totalPrice || !carName || !pickupDate || !returnDate) {
      return res.status(400).json({ message: "Please provide all required data" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert totalPrice to the lowest currency unit (e.g., cents)
      currency: "eur",
      payment_method_types: ["card"],
      metadata: { name, carName, pickupDate, returnDate }, // Include additional data in the metadata
    });

    const clientSecret = paymentIntent.client_secret;
    res.json({ message: "Payment initiated", clientSecret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});




app.post("/transfer", async (req, res) => {
  const { name, totalPrice, pickupDate, returnDate, } = req.body;

  try {
    // Create a PaymentIntent to charge the customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Stripe accepts amounts in cents
      currency: "eur", // Change to your preferred currency
      payment_method_types: ["card"],
      metadata: {
        pickupDate,
        returnDate,
        name,
        swiftCode,
        iban,
      },
    });

    // Handle the payment (charge the customer's card)
    await stripe.paymentIntents.confirm(paymentIntent.id);

    // Initiating the transfer to the specified IBAN and Swift code account
    const transfer = await stripe.transfers.create({
      amount: totalPrice * 100, // Stripe accepts amounts in cents
      currency: "eur", // Change to your preferred currency
      destination: {
        type: "bank_account",
        account: iban,
      },
    });

    console.log("Transfer success:", transfer);
    res.status(200).json({ message: "Payment and transfer successful!" });
  } catch (error) {
    console.error("Error during payment and transfer:", error);
    res.status(500).json({ message: "Payment and transfer failed. Please try again later." });
  }
});











app.listen(PORT, () => console.log(`Server running on port ${PORT}`));







