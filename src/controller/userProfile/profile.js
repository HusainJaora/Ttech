const db = require("../../db/database");
const { uploader } = require("../../middleware/userProfile/cloudinaryUpload"); // make sure you already have this middleware


const addProfile = async (req, res) => {
  const { signup_id } = req.user;
  const connection = await db.getConnection();
  const {
    business_name,
    business_email,
    address,
    mobile_number,
    bank_name,
    account_number,
    ifsc_code,
    branch_name
  } = req.body;

  const logo_url = req.file ? req.file.path : null;

  try {
    await connection.beginTransaction();

    await connection.query(
      `
      INSERT INTO user_profiles 
        (signup_id, business_name, business_email, address, mobile_number, logo_url, bank_name, account_number, ifsc_code, branch_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        business_name = VALUES(business_name),
        business_email = VALUES(business_email),
        address = VALUES(address),
        mobile_number = VALUES(mobile_number),
        logo_url = VALUES(logo_url),
        bank_name = VALUES(bank_name),
        account_number = VALUES(account_number),
        ifsc_code = VALUES(ifsc_code),
        branch_name = VALUES(branch_name)
      `,
      [
        signup_id,
        business_name,
        business_email,
        address,
        mobile_number,
        logo_url,
        bank_name,
        account_number,
        ifsc_code,
        branch_name
      ]
    );

    await connection.commit();
    res.status(200).json({ message: "Profile saved successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error saving profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    connection.release();
  }
};


/**
 * Get Profile by Logged-in User
 */
const getProfile = async (req, res) => {
  const { signup_id } = req.user;

  try {
    const [rows] = await db.query("SELECT * FROM user_profiles WHERE signup_id = ?", [signup_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addProfile, getProfile };
