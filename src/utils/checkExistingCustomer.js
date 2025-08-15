const db = require("../db/database");
const { checkCustomer } = require("../utils/getOrCreateCustomer");

const checkCustomerByContact = async (req, res) => {
  const { customer_contact } = req.body;
  const { signup_id } = req.user;
  const connection = await db.getConnection();
  try {

    if (!customer_contact) {
      return res.status(400).json({ error: "Customer contact requied" });
    }

    const customer = await checkCustomer(connection, signup_id, customer_contact);

    if (!customer) {
      return res.status(200).json({ exists: false })
    }

    return res.status(200).json({
      exists: true,
      customer
    })


  } catch (error) {
    console.error("Error checking customer:", error);
    res.status(500).json({ error: "Internal Server Error" });

  } finally {
    connection.release();
  }
}

module.exports = checkCustomerByContact;