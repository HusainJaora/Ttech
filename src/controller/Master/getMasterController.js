const { model } = require("mongoose");
const db = require("../../db/database");

// Supplier
// Get all suppliers
const getAllSuppliers = async (req, res) => {
    const { signup_id } = req.user;

    try {
        const [suppliers] = await db.query(
            `SELECT supplier_id, supplier_Legal_name, created_date, created_time
         FROM suppliers 
         WHERE signup_id = ?
         ORDER BY supplier_id DESC`,
            [signup_id]
        );

        if (suppliers.length === 0) {
            return res.status(200).json({ message: "No suppliers found." });
        }

        res.status(200).json({ suppliers });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single supplier
const getSingleSupplier = async (req, res) => {
    const { supplier_id } = req.params;
    const { signup_id } = req.user;

    try {
        const [rows] = await db.query(
            `SELECT supplier_id, supplier_Legal_name, supplier_Ledger_name, 
                supplier_contact, supplier_address, supplier_contact_name, 
                supplier_other, created_date, created_time
         FROM suppliers 
         WHERE supplier_id = ? AND signup_id = ?`,
            [supplier_id, signup_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Supplier not found." });
        }

        const supplier = rows[0];

        // Format null/empty values as "NA"
        const formattedSupplier = {
            supplier_id: supplier.supplier_id,
            supplier_Legal_name: supplier.supplier_Legal_name,
            supplier_Ledger_name: supplier.supplier_Ledger_name || "NA",
            supplier_contact: supplier.supplier_contact,
            supplier_address: supplier.supplier_address || "NA",
            supplier_contact_name: supplier.supplier_contact_name || "NA",
            supplier_other: supplier.supplier_other || "NA",
            created_date: supplier.created_date,
            created_time: supplier.created_time
        };

        res.status(200).json({ supplier: formattedSupplier });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Technician
// get all technician
const getAllTechnician = async (req, res) => {
    const { signup_id } = req.user;

    try {
        const [technicians] = await db.query(
            `SELECT technician_id, technician_name, created_date, created_time
         FROM technicians 
         WHERE signup_id = ?
         ORDER BY technician_id DESC`,
            [signup_id]
        );

        if (technicians.length === 0) {
            return res.status(200).json({ message: "No technician found." });
        }

        res.status(200).json({ technicians });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single technician
const getSingleTechnician = async (req, res) => {
    const { technician_id } = req.params;
    const { signup_id } = req.user;

    try {
        const [rows] = await db.query(
            `SELECT  technician_id, technician_name, technician_phone
                created_date, created_time
         FROM technicians  
         WHERE technician_id = ? AND signup_id = ?`,
            [technician_id, signup_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Technician not found." });
        }

        const technician = rows[0];

        // Format null/empty values as "NA"
        const formattedTechnician = {
            technician_id: technician.technician_id,
            technician_name: technician.technician_name,
            technician_phone: technician.technician_phone,
            created_date: technician.created_date,
            created_time: technician.created_time
        };

        res.status(200).json({ technician: formattedTechnician });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
 
// ProductCategory
// Get all ProductCategory no need for single productcategory 
const getAllProductCategory = async (req, res) => {
    const { signup_id } = req.user;

    try {
        const [ProductCategory] = await db.query(
            `SELECT product_category_id, product_category_name, created_date, created_time
         FROM  product_categories
         WHERE signup_id = ?
         ORDER BY product_category_id DESC`,
            [signup_id]
        );

        if (ProductCategory.length === 0) {
            return res.status(200).json({ message: "No product category found." });
        }

        res.status(200).json({ ProductCategory });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllSuppliers,
    getSingleSupplier,
    getAllTechnician,
    getSingleTechnician,
    getAllProductCategory
}



