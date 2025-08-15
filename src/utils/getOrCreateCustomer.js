const checkCustomer = async (connection, signup_id, customer_contact) => {
    const [row] = await connection.query(
        `SELECT customer_id, customer_name, customer_contact, customer_email,customer_address FROM customers WHERE customer_contact=? AND signup_id=? LIMIT 1`,
        [customer_contact, signup_id]
    );
    return row.length > 0 ? row[0] : null;
};

const createCustomer = async (connection, signup_id, customer_data) => {
    const { customer_name, customer_contact, customer_email = "NA", customer_address = "NA" } = customer_data;

    const [result] = await connection.query(`
        INSERT INTO customers(signup_id,customer_name, customer_contact, customer_email, customer_address)VALUES(?,?,?,?,?)`, [signup_id, customer_name, customer_contact, customer_email, customer_address]);

    return {
        customer_id: result.insertId,
        customer_name,
        customer_contact,
        customer_email,
        customer_address

    };
}
module.exports = { checkCustomer, createCustomer };